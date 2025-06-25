const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 23456;

// 通用 CORS 支持
app.use(cors());

// 显式处理预检请求 + 设置允许的 CORS 头
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // 预检请求快速返回
  }
  next();
});

// 设置 JSON 请求体限制（支持大图片）
app.use(bodyParser.json({ limit: '50mb' }));

// 构造串行处理的 Promise 队列（节流核心）
let queue = Promise.resolve();

// 接收前端图片请求并排队处理
app.post('/api/generate', async (req, res) => {
  queue = queue
    .then(() => handleGenerate(req, res))
    .catch(err => {
      console.error("队列中处理请求出错：", err);
    });
});

// 实际处理函数
async function handleGenerate(req, res) {
  const model = req.body.model || 'unknown';
  const imageSize = req.body.images?.[0]?.length || 0;

  console.log("🖼️ 收到 /api/generate 请求体，模型：", model);
  console.log("图片大小（bytes）：", imageSize);

  try {
    const ollamaResponse = await axios.post('http://127.0.0.1:11434/api/generate', req.body, {
      timeout: 600000
    });

    // ✅ 精简响应内容，只返回最核心字段，避免超大 JSON 被断开连接
    const content = ollamaResponse?.data?.response
      || ollamaResponse?.data?.message?.content
      || ollamaResponse?.data?.message
      || ollamaResponse?.data;

    res.json({ response: content });

  } catch (error) {
    const errorMessage = error.response ? error.response.data : error.message;
    console.error("❌ 转发 generate 请求失败:", errorMessage);
    res.status(500).json({
      error: "连接本地 Ollama /generate 接口失败",
      details: errorMessage
    });
  }
}

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 代理服务启动成功，监听地址：http://0.0.0.0:${PORT}`);
  console.log('📥 会将 /api/generate 请求顺序转发给本地 Ollama，避免并发炸掉。');
});
