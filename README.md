# 卡塞尔学院 · 录取通知书生成器

> 源于江南《龙族》系列，生成专属的卡塞尔学院录取通知书，含言灵自动觉醒系统。

![示例](outputs/卡塞尔学院录取通知书_路明非.pdf)

## 功能

- 填写学员代号、星座、爱好，**言灵自动觉醒**（根据星座+兴趣关键词推算）
- 实时网页预览录取通知书样式
- 一键生成 LaTeX 排版的精美 PDF

---

## 部署方式

### 方案一：直接推送到 Railway（推荐，最简单）

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/...)

1. **创建 GitHub 仓库**
   ```bash
   # 在本项目目录下执行：
   git init
   git add .
   git commit -m "init: 卡塞尔学院录取通知书生成器"
   ```
   在 GitHub 新建仓库，然后推送：
   ```bash
   git remote add origin https://github.com/你的用户名/cassell-college.git
   git branch -M main
   git push -u origin main
   ```

2. **部署到 Railway**
   - 打开 https://railway.app 并登录（可用 GitHub 账号）
   - 点击 **New Project** → **Deploy from GitHub repo**
   - 选择你刚推送的仓库
   - Railway 自动检测 `Dockerfile`，开始构建部署
   - 几分钟后，会生成一个 `https://cassell-college.up.railway.app` 地址
   - 把这个地址发给你朋友，他们就能用了！

### 方案二：部署到 Render

1. 同上方步骤推送到 GitHub
2. 打开 https://render.com → **New Web Service**
3. 连接你的 GitHub 仓库
4. Runtime 选择 **Docker**
5. Render 会自动使用 `Dockerfile` 构建
6. 部署完成后会生成 `https://cassell-college.onrender.com` 地址

### 方案三：本地直接跑

```bash
cd work
python3 server.py
# 访问 http://localhost:3456
```

> macOS 需要 macOS 自带的中文字体（宋体等）。如果字体报错，模板会自动降级为 Noto 字体。

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端 | 纯 HTML + CSS + JS（无框架依赖） |
| 后端 | Python HTTP Server（标准库） |
| PDF 生成 | Tectonic (XeLaTeX) + xeCJK |
| 字体 | Noto Serif CJK SC / Liberation Serif |
| 部署 | Docker + Railway / Render |

## 项目结构

```
├── work/
│   ├── index.html           # 前端页面
│   ├── style.css            # 样式
│   ├── app.js               # 前端逻辑 + 言灵生成
│   ├── template.tex         # LaTeX 模板（自动检测字体）
│   ├── server.py            # 本地开发用（macOS 绝对路径）
│   ├── server.deploy.py     # 云端部署用（PATH 路径）
│   └── generate_pdf.py      # 命令行生成器
├── outputs/                 # 生成的 PDF
├── Dockerfile               # Docker 构建
├── render.yaml              # Render 配置
└── README.md                # 本文件
```

---

> 本工具仅供娱乐，卡塞尔学院、龙族、言灵等概念版权归江南所有。
