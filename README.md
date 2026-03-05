# 🌌 佐佑动漫社 2025 年度总结 — 星际航行

## 协作者

- youminga1279

<p align="center">
  <img src="picture/首页.png" alt="首页效果" width="600">
</p>

<p align="center">
  <strong>一份属于每位社员的交互式太空旅程年度报告</strong><br>
  <a href="https://zymds2025.netlify.app/">🚀 在线体验</a> · 
  <a href="https://b23.tv/cxfZxTe">🎬 演示视频</a> · 
  <a href="docs/architecture.md">📐 架构文档</a> · 
  <a href="docs/api-reference.md">📖 API 参考</a> · 
  <a href="docs/development-guide.md">🛠 开发指南</a>
</p>

---

## ✨ 项目简介

这是为**佐佑动漫社**打造的 **2025 年度交互式总结报告系统**。用户输入姓名后，将获得一张专属「星际航行船票」，驾驶飞船穿越 3D 星系，探索 6 个部门星球，最终解锁个人年度报告。

### 核心亮点

- 🎮 **游戏化体验** — 像素风登录、船票打孔、星球探索、烟花祝福
- 🌍 **Three.js 3D 星系** — 6 颗程序化纹理星球、飞船航行、流星雨
- 🎨 **6 种部门专属视觉** — 像素/赛博朋克/霓虹/水彩/漫画/星空
- 📊 **个人数据报告** — 15+ 页 Swiper 卡片，涵盖投稿、活跃度、回忆

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

#### 部门内容页展示

<table>
<tr>
<td align="center"><img src="picture/cos内容页.png" width="250"><br>COS 部内容页</td>
<td align="center"><img src="picture/技术内容页.png" width="250"><br>技术部内容页</td>
<td align="center"><img src="picture/原创内容页.png" width="250"><br>原创部内容页</td>
</tr>
<tr>
<td align="center"><img src="picture/外宣内容页.png" width="250"><br>外宣部内容页</td>
<td align="center"><img src="picture/轻音内容页1.png" width="250"><br>轻音部内容页</td>
<td align="center"><img src="picture/轻音内容2.png" width="250"><br>轻音部（含视频）</td>
</tr>
</table>

#### 外宣数据看板

<p align="center">
  <img src="picture/外宣数据页.png" alt="外宣数据看板" width="400">
  <img src="picture/外宣公众号、B站爬虫页.png" alt="公众号 & B站数据" width="400">
</p>

展示微信公众号文章阅读量、B站视频播放量等运营数据。

### Phase 4：个人年度报告

探索完 6 个部门后，太阳核心解锁，进入 **Swiper 滑动卡片式个人报告**：

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

## 🏗 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    成品页面 (end.html)                     │
│  ┌──────────────────────────────────────────────────────┐│
│  │  Phase 状态机: login→ticket→flight→system→dept→report ││
│  └──────────────────────────────────────────────────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ 登录层    │ │ 船票层    │ │ 星系层    │ │ 报告层      │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────────────────────────────────────────────────┐│
│  │           Three.js 3D 引擎 + 粒子系统                 ││
│  └──────────────────────────────────────────────────────┘│
│  ┌─────────┐ ┌─────────────┐ ┌────────────────────────┐ │
│  │ 烟花系统 │ │ 安利星图(3D) │ │ Swiper 报告卡片系统     │ │
│  └─────────┘ └─────────────┘ └────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Three.js** | r128 | 3D 星系场景、星球、飞船动画 |
| **GSAP** | 3.12.2 | 时间线动画、页面转场特效 |
| **Swiper** | 11 | 个人报告卡片滑动 |
| **html2canvas** | 1.4.1 | 海报截图导出 |
| **Animate.css** | 4.1.1 | CSS 动画预设 |

### 数据流

```
Excel 原始数据 → Python 工具链 → JSON 数据注入 → 动态渲染
                                      │
    ┌─────────────────────────────────┤
    ↓                                 ↓
用户输入姓名 → verifyUser() → currentUser 对象
    │
    ├─→ renderSlides()     → 个人报告
    ├─→ showDeptPage()     → 部门页面
    ├─→ renderInfluenceDashboard() → 外宣数据看板
    ├─→ 烟花系统            → 年度祝福
    └─→ 安利星图            → IP 推荐 3D 展示
```

---

## 📁 项目结构

```
output/
├── end.html                    # 🚀 成品页面（部署用，含所有代码和数据）
├── index.html                  # 成品页面副本
├── README.md                   # 📖 本文档
│
├── picture/                    # 📸 页面截图（用于文档展示）
│   ├── 首页.png
│   ├── 登录船票.png
│   ├── 星系页.png
│   ├── cos intro.png / cos内容页.png
│   ├── 技术intro.png / 技术内容页.png
│   ├── 轻音intro.png / 轻音内容页1.png / 轻音内容2.png
│   ├── 原创intro.png / 原创内容页.png
│   ├── 舞部intro.png
│   ├── 外宣intro.png / 外宣内容页.png / 外宣数据页.png
│   └── 最终1~17_*.png          # 个人报告各页截图
│
├── assets/                     # 🎵 音频和图片资源（base64 解码后的原始文件）
│
├── docs/                       # 📚 详细文档
│   ├── architecture.md         # 系统架构文档
│   ├── data-schema.md          # 数据结构定义
│   ├── api-reference.md        # 函数参考手册
│   ├── dept-themes.md          # 部门风格主题系统
│   └── development-guide.md    # 开发维护指南
│
└── modular/                    # 🧩 模块化拆分版（开发参考）
    ├── config.js               # 全局配置（部门列映射、资历、活跃度等级）
    ├── skeleton.html           # HTML 骨架 + 注释说明
    │
    ├── components/             # HTML 结构层
    │   ├── login-layer.html    # 登录层结构
    │   ├── ticket-layer.html   # 船票层结构
    │   ├── system-layer.html   # 星系探索层结构
    │   ├── report-layer.html   # 个人报告层结构
    │   ├── dept-layer.html     # 部门展示层结构
    │   ├── login.html          # 登录页完整组件
    │   ├── ticket.html         # 船票页完整组件
    │   └── galaxy.html         # 星系页完整组件
    │
    ├── scripts/                # JS 逻辑模块
    │   ├── galaxy-scene.js     # Three.js 3D 星系场景
    │   ├── phase-controller.js # Phase 状态机 & 流程控制
    │   ├── dept-renderers.js   # 6 个部门渲染函数
    │   ├── report-slides.js    # 个人报告卡片生成
    │   ├── effects-system.js   # 烟花/粒子背景/安利星图/音乐
    │   └── youzi-reading-mode.js # 柚子自动阅读模式
    │
    ├── styles/                 # CSS 主题
    │   ├── base.css            # 基础共享样式 & CSS 变量
    │   ├── cyber.css           # 赛博朋克主题（技术部）
    │   ├── neon.css            # 霓虹主题（轻音部）
    │   ├── pixel.css           # 像素主题（COS 部）
    │   ├── watercolor.css      # 水彩主题（原创部）
    │   └── comic.css           # 漫画主题（外宣部）
    │
    ├── depts/                  # 部门页面完整示例
    │   ├── cos.html            # COS 部完整页面
    │   ├── tech.html           # 技术部完整页面
    │   └── yiqin.html          # 轻音部完整页面
    │
    └── demo/
        └── index.html          # 模块化 Demo 入口
```

---

## 🎨 6 大部门视觉风格

每个部门拥有独立的设计语言，从配色、字体到动画效果完全不同：

| 部门 | 主题 | 配色 | 字体 | 特效 |
|------|------|------|------|------|
| **COS 部** | 像素 Pixel | 粉色 `#ff69b4` + 青色 `#00ffff` | Press Start 2P | 像素边框、拍立得照片卡 |
| **技术部** | 赛博朋克 Cyber | 青色 `#00ffff` | Orbitron | Glitch 错误、扫描线 |
| **轻音部** | 霓虹 Neon | 粉紫蓝渐变 | 默认 | 音频波形、脉冲动画 |
| **原创部** | 水彩 Watercolor | 柔和粉紫红 | 默认 | 模糊边框、画框、纸纹 |
| **舞蹈部** | 星空 Galaxy | 深蓝紫 | 默认 | 粒子效果、星云背景 |
| **外宣部** | 漫画 Comic | 明亮多彩 | Comic Neue | 分镜面板、气泡对话框 |

> 详细设计说明见 [docs/dept-themes.md](docs/dept-themes.md)

---

## 🚀 运行方式

### 在线访问
直接访问部署地址：**https://zymds2025.netlify.app/**

### 本地运行

```bash
# 进入输出目录
cd output

# 启动本地服务器
python -m http.server 8080

# 浏览器打开
# http://localhost:8080/end.html
```

> ⚠️ 不能直接双击 HTML 文件打开，需要通过 HTTP 服务器访问。

---

## 📚 详细文档

| 文档 | 内容 |
|------|------|
| [架构文档](docs/architecture.md) | 系统整体架构、Phase 状态机、数据流 |
| [数据结构](docs/data-schema.md) | DB/DEPARTMENTS/CONFIG 等核心数据类型定义 |
| [API 参考](docs/api-reference.md) | 全部函数签名、参数说明、类定义 |
| [部门风格](docs/dept-themes.md) | 6 种视觉主题详细设计说明 |
| [开发指南](docs/development-guide.md) | 维护、修改、数据生产流水线 |

---

## 🤝 贡献

本项目由**佐佑动漫社外宣部**维护。如需修改部门数据或新增页面，请参考 [开发指南](docs/development-guide.md)。

---

<p align="center">
  <em>🌠 愿每一位社员都能在星际旅途中找到属于自己的光芒</em><br>
  <strong>佐佑动漫社 · 2025</strong>
</p>
