# 🖼️ 上不上 AI 评分系统（本地版）

这是一个完全本地部署的 AI 图片分析系统，运行后你可以上传图片，让 AI 判断它“上不上”。

---

## ✅ 功能简介

- 全本地部署，**无需联网**
- 支持**图片上传** + AI 模型分析
- 使用本地 Ollama 模型，**无需注册账号**
- 提供三种分析模式：简短 / 详细 / 小说风格

---

## 📦 使用说明

### 1. 安装 Node.js

如果你的电脑没有安装 Node.js，请先去官网下载并安装：

👉 https://nodejs.org/

安装完成后，打开终端（命令提示符 / PowerShell），输入：

```bash
node -v
npm -v
```

看到版本号说明安装成功。

---

### 2. 启动后端服务

打开本项目文件夹，右键空白处 → 选择“在终端中打开”或“打开 PowerShell”。

运行：

```bash
npm install
npm start
```

看到以下提示表示成功：

```
✅ 代理服务启动成功，监听地址：http://0.0.0.0:23456
📥 会将 /api/generate 请求顺序转发给本地 Ollama，避免并发炸掉。
```

### 3. 启动前端页面

打开浏览器，访问：

```
http://127.0.0.1:1145/
```

选择模式，上传图片，即可获得 AI 分析结果。

---

## ⚙️ 前提条件（重要）

- ✅ 已安装 [Ollama](https://ollama.com/)
- ✅ 已下载模型（推荐模型：`mistral-small3.1`）
  ```bash
  ollama run mistral-small3.1
  ```

Ollama 默认运行在 `http://127.0.0.1:11434`，无需更改。

---

## 🧾 文件说明

```
├── server.js         后端服务主文件（端口 23456）
├── package.json      项目依赖定义
├── public/
│   ├── index.html    前端网页
│   ├── api.js        图片上传分析逻辑
│   └── styles.css    页面样式
```

---

## 💬 常见问题

### Q: 上传后没反应？

- 请确认是否 **启动了 Ollama**
- 请确认 `npm start` 正常运行中
- 请用 **Chrome** 打开页面

---

## 👤 作者

> 由 X@Yamada_Ryo4 制作，个人兴趣项目，仅供学习使用。
