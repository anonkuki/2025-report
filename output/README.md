# 🌌 佐佑动漫社 2025 年度总结 — 星际航行

## 协作者

- youminga1279

<p align="center">
  <strong>一份属于每位社员的交互式太空旅程年度报告</strong><br>
  <a href="https://zymds2025.netlify.app/">🚀 在线体验</a> · 
  <a href="https://b23.tv/cxfZxTe">🎬 演示视频</a>
</p>

---

## ✨ 项目简介

这是为**佐佑动漫社**打造的 **2025 年度交互式总结报告系统**。用户输入姓名后，将获得一张专属「星际航行船票」，驾驶飞船穿越 3D 星系，探索 6 个部门星球，最终解锁个人年度报告。

### 核心亮点

- 🎮 **游戏化体验** — 像素风登录、船票打孔、星球探索、烟花祝福
- 🌍 **Three.js 3D 星系** — 6 颗程序化纹理星球、飞船航行、流星雨
- 🎨 **6 种部门专属视觉** — 像素 / 赛博朋克 / 霓虹 / 水彩 / 漫画 / 星空
- 📊 **个人数据报告** — 15+ 页 Swiper 卡片，涵盖投稿、活跃度、回忆
- 🤖 **AI 助手「小佑」** — 深邃星空风格，基于 MiniMax-M2.7，支持流式回复

---

## 🤖 AI 助手「小佑」

浮动于页面左下角的看板娘助手，帮助社员查询信息、了解活动。

### 设计风格：深邃星空 2.0

- 面板：深海军蓝多层渐变背景 + 三层 box-shadow 蓝光晕呼吸动画
- 星空层：60 颗三色（白 / 青 / 紫）闪烁星 + 5 条青白流星 + 3 团星云
- 头部：极光扫光动画 + 青→薰衣草→紫渐变标题
- 按钮：双环旋转吉祥物光晕

### 技术实现

| 端 | 方案 |
|----|------|
| **生产（Netlify）** | Netlify Functions (`/api/chat/stream`) 代理 MiniMax API，API Key 存于环境变量 |
| **本地开发** | `local-ai-proxy.js`（纯 Node.js，无依赖，端口 8787） |

本地启动命令：
```bash
# 终端 1：AI 代理
$env:MINIMAX_API_KEY="<your_key>" ; node local-ai-proxy.js

# 终端 2：静态服务
python -m http.server 8081
# 浏览器访问 http://localhost:8081
```

---

## 🎬 用户体验流程

### Phase 1：登录

<p align="center">
  <img src="picture/首页.png" alt="登录页" width="400">
  <img src="picture/登录船票.png" alt="船票页" width="400">
</p>

输入社员姓名 → 系统匹配数据库 → 生成专属太空船票（含资历等级、所属部门）→ 激光打孔动画「2025」

### Phase 2：星系探索

<p align="center">
  <img src="picture/星系页.png" alt="3D 星系" width="600">
</p>

飞船跃迁到星系中心，**6 颗部门星球**围绕太阳公转。点击任意星球进入该部门的专属展示页面。

### Phase 3：部门页面

每个部门使用**独特的视觉风格**渲染：

<table>
<tr>
<td align="center"><img src="picture/cos%20intro.png" width="250"><br><b>COS 部</b><br>像素风</td>
<td align="center"><img src="picture/技术intro.png" width="250"><br><b>技术部</b><br>赛博朋克</td>
<td align="center"><img src="picture/轻音intro.png" width="250"><br><b>轻音部</b><br>霓虹</td>
</tr>
<tr>
<td align="center"><img src="picture/原创intro.png" width="250"><br><b>原创部</b><br>水彩</td>
<td align="center"><img src="picture/舞部intro.png" width="250"><br><b>舞蹈部</b><br>星空</td>
<td align="center"><img src="picture/外宣intro.png" width="250"><br><b>外宣部</b><br>漫画</td>
</tr>
</table>

#### 部门内容页

<table>
<tr>
<td align="center"><img src="picture/cos内容页.png" width="250"><br>COS 部内容页</td>
<td align="center"><img src="picture/技术内容页.png" width="250"><br>技术部内容页</td>
<td align="center"><img src="picture/原创内容页.png" width="250"><br>原创部内容页</td>
</tr>
<tr>
<td align="center"><img src="picture/外宣内容页.png" width="250"><br>外宣内容页</td>
<td align="center"><img src="picture/轻音内容页1.png" width="250"><br>轻音部内容页</td>
<td align="center"><img src="picture/轻音内容2.png" width="250"><br>轻音部（含视频）</td>
</tr>
</table>

#### 外宣数据看板

<p align="center">
  <img src="picture/外宣数据页.png" alt="外宣数据看板" width="400">
  <img src="picture/外宣公众号、B站爬虫页.png" alt="公众号 & B站数据" width="400">
</p>

外宣部还包含**数据看板**，展示微信公众号阅读量、B 站播放量等运营数据。

### Phase 4：个人年度报告

探索完 6 个部门后，太阳核心解锁，进入 **Swiper 滑动卡片式个人报告**（共 17 页）：

<table>
<tr>
<td align="center"><img src="picture/最终1_用户名称页.png" width="200"><br>1. 用户名称</td>
<td align="center"><img src="picture/最终2_收录总数据页.png" width="200"><br>2. 收录总数据</td>
<td align="center"><img src="picture/最终3_用户个人投稿数.png" width="200"><br>3. 个人投稿</td>
</tr>
<tr>
<td align="center"><img src="picture/最终4_部门参与信息页1.png" width="200"><br>4. 部门参与①</td>
<td align="center"><img src="picture/最终5_部门参与信息页2.png" width="200"><br>5. 部门参与②</td>
<td align="center"><img src="picture/最终6_活跃画像.png" width="200"><br>6. 活跃画像①</td>
</tr>
<tr>
<td align="center"><img src="picture/最终7_活跃画像2.png" width="200"><br>7. 活跃画像②</td>
<td align="center"><img src="picture/最终8_星图数据页.png" width="200"><br>8. 星图数据</td>
<td align="center"><img src="picture/最终9_星图页.png" width="200"><br>9. 3D 安利星图</td>
</tr>
<tr>
<td align="center"><img src="picture/最终10_弹幕数据页.png" width="200"><br>10. 弹幕数据</td>
<td align="center"><img src="picture/最终11_弹幕页.png" width="200"><br>11. 弹幕展示</td>
<td align="center"><img src="picture/最终12_回忆数据页.png" width="200"><br>12. 回忆数据</td>
</tr>
<tr>
<td align="center"><img src="picture/最终13_回忆页.png" width="200"><br>13. 回忆照片</td>
<td align="center"><img src="picture/最终14_烟花数据页.png" width="200"><br>14. 烟花数据</td>
<td align="center"><img src="picture/最终15_烟花祝福页.png" width="200"><br>15. 烟花祝福</td>
</tr>
<tr>
<td align="center"><img src="picture/最终16_报幕页.png" width="200"><br>16. 报幕页</td>
<td align="center"><img src="picture/最终17_分享页.png" width="200"><br>17. 分享海报</td>
<td></td>
</tr>
</table>

---

## 🏗 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Three.js** | r128 | 3D 星系场景、星球、飞船动画 |
| **GSAP** | 3.12.2 | 时间线动画、页面转场特效 |
| **Swiper** | 11 | 个人报告卡片滑动 |
| **html2canvas** | 1.4.1 | 海报截图导出 |
| **Animate.css** | 4.1.1 | CSS 动画预设 |
| **MiniMax-M2.7** | — | AI 助手「小佑」语言模型 |
| **Netlify Functions** | Node.js | 无服务器 AI 代理（生产） |

### 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                    index.html (纯静态)                    │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Phase 状态机: login→ticket→flight→system→dept→report ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ 登录层    │ │ 船票层    │ │ 星系层    │ │ 报告层      │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│  ┌──────────────────────────────────────────────────────┐│
│  │         Three.js 3D 引擎 + 粒子系统                   ││
│  └──────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────┐  │
│  │  AI 助手「小佑」(Netlify Functions / 本地代理)       │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
Excel 原始数据 → Python 工具链 → JSON 数据注入 → 动态渲染
                                      │
    ┌─────────────────────────────────┤
    ↓                                 ↓
用户输入姓名 → verifyUser() → currentUser 对象
    │
    ├─→ renderSlides()               → 个人报告（17 张卡片）
    ├─→ showDeptPage()               → 部门页面
    ├─→ renderInfluenceDashboard()   → 外宣数据看板
    ├─→ 烟花系统                      → 年度祝福
    └─→ 安利星图                      → IP 推荐 3D 展示
```

---

## 📁 项目结构

```
output/                         # 🚀 部署根目录（Netlify 直接托管此目录）
├── index.html                  # 主页面（含全部 HTML 结构）
├── script.js                   # 全部 JS 逻辑（打包合并）
├── style.css                   # 全部 CSS 样式（打包合并）
├── README.md                   # 📖 本文档
└── assets/                     # 🎵 音频 & 图片资源
```

---

## 🚀 运行方式

### 在线访问

直接访问：**https://zymds2025.netlify.app/**

### 本地运行（含 AI 助手）

```bash
# 克隆仓库
git clone https://github.com/anonkuki/Zuoyou-Anime-Club-2025-Annual-Summary.git
cd Zuoyou-Anime-Club-2025-Annual-Summary

# 启动 AI 代理（需要 Node.js，无需 npm install）
$env:MINIMAX_API_KEY="your_api_key" ; node local-ai-proxy.js

# 另开终端启动静态服务
python -m http.server 8081

# 浏览器访问
# http://localhost:8081
```

> ⚠️ 不能直接双击 HTML 文件打开，需通过 HTTP 服务器访问（跨域限制）。

---

## 🤝 贡献

本项目由**佐佑动漫社外宣部**维护。

---

<p align="center">
  <em>🌠 愿每一位社员都能在星际旅途中找到属于自己的光芒</em><br>
  <strong>佐佑动漫社 · 2025</strong>
</p>
