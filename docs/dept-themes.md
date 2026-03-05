# 部门风格主题系统

> 佐佑动漫社 6 个部门各有独特的视觉风格，每个风格都通过独立 CSS 主题实现。

## 风格一览

| 部门 | 主题名称 | 主色调 | 核心特征 | CSS 类前缀 |
|------|---------|--------|---------|-----------|
| COS 部 | 像素 Pixel | 粉色 + 青色 | 像素边框、拍立得照片卡、Press Start 2P 字体 | `.pixel-` |
| 技术部 | 赛博朋克 Cyber | 青色 (#00ffff) | Glitch 扫描线、代码块、Orbitron 字体 | `.cyber-` |
| 轻音部 | 霓虹 Neon | 粉紫蓝渐变 | 音频波形、脉冲动画、霓虹发光 | `.neon-` |
| 原创部 | 水彩 Watercolor | 柔和粉紫 | 模糊边框、画框效果、纸纹背景 | `.watercolor-` |
| 舞蹈部 | 星空 Galaxy | 深蓝紫 | 粒子效果、星云背景 | `.galaxy-` |
| 外宣部 | 漫画 Comic | 明亮多彩 | 分镜面板、气泡对话框、网点效果 | `.comic-` |

## CSS 文件结构

```
output/modular/styles/
├── base.css        # 基础共享样式（CSS 变量、重置、通用组件）
├── cyber.css       # 赛博朋克主题（技术部）
├── neon.css        # 霓虹主题（轻音部）
├── pixel.css       # 像素主题（COS 部）
├── watercolor.css  # 水彩主题（原创部）
└── comic.css       # 漫画主题（外宣部）
```

## 共享 CSS 变量（base.css）

```css
:root {
    --bg-primary: #0a0a1a;        /* 页面背景 */
    --text-primary: #ffffff;       /* 主文字颜色 */
    --text-secondary: #a0a0b0;    /* 次要文字 */
    --glass-bg: rgba(255,255,255,0.05); /* 毛玻璃背景 */
    --border-glow: rgba(255,255,255,0.1); /* 边框发光 */
    --card-radius: 16px;          /* 卡片圆角 */
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 各部门渲染函数

每个部门有独立的渲染函数，生成该部门专属风格的 HTML：

```javascript
renderCosDept(deptName, otherImages, isInDept, members, myImages)   // COS 部
renderTechDept(deptName, otherImages, isInDept, members, myImages)  // 技术部
renderMusicDept(deptName, otherImages, isInDept, members, myImages) // 轻音部
renderDanceDept(deptName, otherImages, isInDept, members, myImages) // 舞蹈部
renderArtDept(deptName, otherImages, isInDept, members, myImages)   // 原创部
renderPrDept(deptName, otherImages, isInDept, members, myImages)    // 外宣部
```

所有渲染函数参数一致：
- `deptName` — 部门中文名
- `otherImages` — 该部门其他成员的图片
- `isInDept` — 当前用户是否属于该部门
- `members` — 部门全部成员列表
- `myImages` — 当前用户在该部门的图片
