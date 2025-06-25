import { systemPrompts } from './config.js';

export async function analyzeImage(imageDataUrl, aiType) {
    const systemPrompt = systemPrompts[aiType];

    if (!systemPrompt) {
        throw new Error(`Invalid AI type: ${aiType}`);
    }

    if (typeof websim === 'undefined' || !websim || !websim.chat) {
        throw new Error('AI service is not available');
    }

    let completion;
    try {
        completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "请分析这张图片并决定的：上还是不上？",
                        },
                        {
                            type: "image_url",
                            image_url: { url: imageDataUrl },
                        },
                    ],
                },
            ],
            json: true,
        });

        return JSON.parse(completion.content);
    } catch (error) {
        if (completion && completion.content) {
            console.error("Failed to parse AI response. Raw content:", completion.content);
        }
        // Re-throw the original error to be handled by the caller
        throw error;
    }
}