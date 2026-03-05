# 开发与维护指南

> 面向开发者的项目维护和二次开发指南。

## 运行方式

通过静态服务器启动（不能直接双击打开 HTML）：

```bash
cd output
python -m http.server 8080
```

在线部署地址：https://zymds2025.netlify.app/

## 项目两种形态

### 1. 成品单文件（部署用）
- 文件：`output/end.html`
- 所有 CSS + JS + 数据内嵌在一个 HTML 中
- base64 编码的图片和音频直接嵌入
- 文件约 50MB，可直接部署到 Netlify / Vercel

### 2. 模块化版本（开发参考）
- 目录：`output/modular/`
- CSS 主题、组件、配置独立拆分
- 便于理解各部分职责，快速定位修改点

## 数据生产流水线

```
原始 Excel → Python 工具处理 → JSON 数据 → 注入 HTML 模板 → 成品页面
```

主要工具脚本位于 `tools/` 目录：
- `excel_fill_sample.py` — Excel 数据填充示例
- `convert_images.py` — 图片转 base64 内嵌
- `generate_dashboard.py` — 生成数据看板

## 修改指引

### 新增部门
同时更新以下位置：
1. `DEPARTMENTS` 数组 — 添加新部门星球配置
2. `DEPT_ID_TO_NAME` / `DEPT_NAME_TO_ID` 映射
3. `DEPT_FULL_QUESTIONS` 问答配置
4. 新增 `render*Dept()` 渲染函数
5. 在 `showDeptPage()` 中添加分发逻辑

### 修改用户数据字段
同步检查：
1. `renderSlides()` — 个人报告渲染
2. `showDeptIntro()` — 部门介绍页
3. `showDeptPage()` — 部门页面

### 性能调优
修改 `CONFIG` 中的粒子参数：
- `starCount` — 减少可提升低端设备帧率
- `tinyStarCount` — 微小星点数量
- `dustCount` — 微尘粒子数量

## 外部依赖

以下符号由独立脚本段定义，主逻辑段依赖它们：
- `initDroneBackground` — 首页粒子背景
- `hasSecondMusic` / `getUserVolume` — 音频控制
- `fadeOutAudio` / `fadeInAudio` — 音乐淡入淡出
- `initImageLightbox` — 图片灯箱
- `initScrollAnimation` — 滚动动画

缺失这些脚本会导致相关功能降级，但不影响核心流程。
