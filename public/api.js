import { systemPrompts } from './config.js';

export async function analyzeImage(imageDataUrl, aiType) {
    const systemPrompt = systemPrompts[aiType];
    if (!systemPrompt) {
        throw new Error(`Invalid AI type: ${aiType}`);
    }

    const base64Image = imageDataUrl.split(',')[1];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10分钟超时

    let response;
    try {
        response = await fetch("http://127.0.0.1:23456/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistral-small3.1:latest",
                prompt: `${systemPrompt}\n请分析这张图片并决定：上还是不上？`,
                images: [base64Image],
                stream: false
            }),
            signal: controller.signal,
			
			keepalive: false,
			mode: "cors"
        });
    } catch (err) {
        clearTimeout(timeoutId);
        console.error("❌ fetch 失败:", err.name, err.message);
        return {
            verdict: "FAIL",
            rating: 0,
            explanation: `连接 AI 服务失败（${err.name}: ${err.message}）`
        };
    }

    clearTimeout(timeoutId);

    let data;
    try {
        data = await response.json();
    } catch (err) {
        console.warn("⚠️ JSON解析失败，原始响应内容：", await response.text());
        return {
            verdict: "FAIL",
            rating: 0,
            explanation: `AI 响应无法解析为 JSON`
        };
    }

    let raw = data.response || data.content || data.message?.content || data.message || data;
    console.log("Ollama 返回原始响应：", JSON.stringify(data, null, 2));

    // 🧹 去除 markdown 包裹（```json\n{...}\n```）
    if (typeof raw === "string" && raw.trim().startsWith("```json")) {
        raw = raw.trim().replace(/^```json\s*([\s\S]*?)\s*```$/, "$1");
    }

    try {
        if (typeof raw === "string") {
            return JSON.parse(raw);
        } else {
            return raw;
        }
    } catch (err) {
        console.warn("⚠️ 模型返回格式异常，尝试正则提取：", raw);
        const text = typeof raw === "string" ? raw : JSON.stringify(raw);

        const verdictMatch = text.match(/"verdict"\s*:\s*"(.+?)"/i);
        const ratingMatch = text.match(/"rating"\s*:\s*(\d+)/i);
        const explanationMatch = text.match(/"explanation"\s*:\s*"([\s\S]+?)"/i);

        return {
            verdict: verdictMatch?.[1] || "PASS",
            rating: ratingMatch ? parseInt(ratingMatch[1]) : 0,
            explanation: explanationMatch?.[1] || text
        };
    }
}
