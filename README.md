# 佐佑动漫社 2025 年度总结页面（end.html）文档

本项目是单文件前端页面（`end.html`）驱动的交互式年度总结系统，包含登录验权、船票动画、3D 星系探索、部门数据展示、报告生成等流程。

## 1. 文件与依赖

- 主文件：`code1/code/end.html`
- 文档：`code1/code/README.md`
- 外部库：
1. `Three.js`（3D 场景）
2. `GSAP`（时间线动画）
3. `Swiper`（报告页滑动）
4. `html2canvas`（海报截图导出）

## 2. 运行方式

通过静态服务器启动，避免直接双击 HTML：

```bash
cd code1/code
python -m http.server 8080
```

访问：`https://zymds2025.netlify.app/`

## 3. 主流程

1. 输入用户名并校验（`verifyUser`）
2. 展示船票并打孔动画（`triggerPunchAnimation`）
3. 进入飞船跃迁动画（`launchShip`）
4. 3D 星系探索 6 个部门（`showDeptPage`）
5. 完成后进入个人报告（`showReport` + `renderSlides`）

## 4. 数据结构与字段说明

### 4.1 `DB`（用户主数据）

`DB` 是页面核心数据源（由模板注入）：

```ts
type User = {
  id?: string;
  name: string;
  joinTime: string;
  depts: string[];
  stats?: {
    activityRaw?: string;
    activityLevel?: number;
    activityCount?: number;
  };
  raw?: Record<string, unknown>;
  imgs?: Record<string, string>;
  deptData: Record<string, {
    stats1: number;
    stats1Raw: string;
    stats1Name: string;
    stats2: number;
    stats2Raw: string;
    stats2Name: string;
    images: Array<{ url: string; desc?: string }>;
  }>;
  commonData: {
    keyword?: string;
    keywordReason?: string;
    memorableQuote?: string;
    ip?: string;
    ipPhoto?: string;
    ipReason?: string;
    memoryPhoto?: string;
    memoryDesc?: string;
    groupPhoto?: string;
    groupDesc?: string;
    activityLevel?: number;
  };
};
```

### 4.2 `DEPARTMENTS`（部门星球配置）

每项字段：

- `id`: 部门 ID（`art/cos/pr/tech/music/dance`）
- `name`: 部门中文名
- `data`: 卡片文案
- `color`/`color2`: 主副配色
- `scale`: 星球尺寸
- `angle`: 初始轨道角度
- `type`: 纹理类型（映射 `TextureFactory` 方法）
- `hasRing`: 是否有环
- `ringType`: 环类型（可选）
- `hasSatellites`: 是否有卫星
- `satCount`: 卫星数量（可选）
- `satType`: 卫星类型（可选）
- `hoverText`: 悬浮提示文本

### 4.3 `CONFIG`（3D 全局参数）

- `starCount`: 背景星点数量
- `brightStarCount`: 高亮星数量
- `dustCount`: 微尘粒子数量
- `tinyStarCount`: 微小星点数量
- `orbitRadius`: 行星轨道半径
- `orbitSpeed`: 轨道转速系数

## 5. 全局变量总表（end.html）

### 5.1 状态与数据

- `DB`
- `currentUser`
- `meteorInterval`
- `visitedDepts`
- `currentVisitingDept`
- `secretUnlocked`
- `WEEKLY_PHOTOS`
- `WEIXIN_ARTICLES`
- `BILIBILI_VIDEOS`
- `DEPARTMENTS`
- `DEPT_ID_TO_NAME`
- `DEPT_NAME_TO_ID`
- `DEPT_FULL_QUESTIONS`

### 5.2 3D 场景对象

- `scene`
- `camera`
- `renderer`
- `clock`
- `bgStars`
- `brightStars`
- `dustSystem`
- `dustVel`
- `starshipObj`
- `solarSystem`
- `hubMesh`
- `hubGlow`
- `objects`
- `interactables`
- `meteors`
- `isFlying`
- `glowTex`
- `meteorHeadTex`
- `meteorTrailTex`
- `dustTex`
- `raycaster`
- `mouse`

### 5.3 鼠标拖尾与交互

- `cursorComet`
- `cursorTails`
- `mouseX`
- `mouseY`
- `grabbedMeteor`

### 5.4 阅读模式兼容 stub（顶部脚本）

- `noop`
- `getDeptNamesFallback`
- `buildCleanYouziUser`
- `applyYouziTicketUI`
- `stub`
- `window.YouziReadingMode`
- `window._youziReadingModeActive`
- `window._youziCleanUser`
- `window._youziReadingModeInternalCall`

## 6. 所有函数与参数信息

### 6.1 工具函数

1. `isVideoUrl(str)`
- `str: string | any`
- 返回：`boolean`

2. `getMediaHtml(url, alt, extraClass, onerrorFallback)`
- `url: string`
- `alt: string`
- `extraClass: string`
- `onerrorFallback: string`
- 返回：`string`（`<img>` 或 `<video>` HTML）

3. `getSeniorityTitle(joinTimeRaw)`
- `joinTimeRaw: string`
- 返回：`string`（资历等级文案）

4. `isMobileDevice()`
- 无参数
- 返回：`boolean`

### 6.2 页面流程函数

1. `init3D()`
- 无参数
- 作用：初始化 Three.js 场景、星球、飞船、流星

2. `animate()`
- 无参数
- 作用：主渲染循环与交互更新

3. `startMeteorShower()`
- 无参数
- 作用：首页流星雨姓名弹幕

4. `verifyUser()`
- 无参数
- 作用：登录校验、票据渲染、状态切换

5. `launchShip()`
- 无参数
- 作用：从船票阶段切换到星系阶段

6. `showReport()`
- 无参数
- 作用：检查探索进度并进入报告页

7. `backToSystem()`
- 无参数
- 作用：从报告返回星系

### 6.3 部门与报告函数

1. `showDeptPage(deptId)`
- `deptId: string`

2. `renderDeptGrid(deptId, deptName, otherImages, isInDept, deptMembers, myImages)`
- `deptId: string`
- `deptName: string`
- `otherImages: Array<{url, desc, author}>`
- `isInDept: boolean`
- `deptMembers: User[]`
- `myImages: Array<{url, desc, author}>`

3. `showDeptIntro(deptId, myData, myImages, onComplete)`
- `deptId: string`
- `myData: object | undefined`
- `myImages: array`
- `onComplete: Function`

4. `backFromDept()`
- 无参数

5. `initProgressPlanetClicks()`
- 无参数

6. `updateProgressBar()`
- 无参数

7. `renderWeeklyPhotos(deptName)`
- `deptName: string`

8. `openPhotoModal(element)`
- `element: HTMLElement`

9. `closePhotoModal()`
- 无参数

10. `renderCosDept(deptName, otherImages, isInDept, members, myImages)`
11. `renderTechDept(deptName, otherImages, isInDept, members, myImages)`
12. `renderMusicDept(deptName, otherImages, isInDept, members, myImages)`
13. `renderDanceDept(deptName, otherImages, isInDept, members, myImages)`
14. `renderArtDept(deptName, otherImages, isInDept, members, myImages)`
15. `renderPrDept(deptName, otherImages, isInDept, members, myImages)`
- 参数一致：
- `deptName: string`
- `otherImages: array`
- `isInDept: boolean`
- `members: User[]`
- `myImages: array`
- 返回：`string`（HTML）

16. `initPrDeptNarrative()`
- 无参数

17. `renderInfluenceDashboard()`
- 无参数
- 返回：`string`（HTML）

18. `calculateDeptAverage(deptName, members)`
- `deptName: string`
- `members: User[]`
- 返回：`{ stats1Avg: number, stats2Avg: number }`

19. `initInfluenceDashboardAnimation()`
- 无参数

20. `renderSlides(user)`
- `user: User`
- 作用：生成最终报告页全部 slide

### 6.4 鼠标拖尾/特效函数

1. `initCursorTrail()`
- 无参数

2. `animateTails()`
- 无参数（`initCursorTrail` 内部函数）

3. `checkMeteorCollision()`
- 无参数

4. `triggerPunchAnimation()`
- 无参数

### 6.5 TextureFactory 方法参数

对象：`TextureFactory`

1. `createBase(size = 512)`
- `size: number`

2. `dance_refined(c1, c2)`
3. `cos_refined(c1, c2)`
4. `dual_layer(c1, c2)`
5. `ink(c1, c2)`
6. `signal(c1, c2)`
7. `circuit(c1, c2)`
8. `soundwave(c1, c2)`
- `c1: string`
- `c2: string`

9. `dance_trajectory(color)`
10. `sun(color)`
11. `glow(color)`
- `color: string`

12. `propIcon(type, color)`
13. `ring(type, color)`
14. `satellite(type, color)`
- `type: string`
- `color: string`

15. `meteorHead()`
16. `meteorTrail()`
17. `dust()`
- 无参数

### 6.6 类与方法参数

#### `class Meteor`

1. `constructor()`
- 无参数

2. `reset(initial = false)`
- `initial: boolean`

3. `updatePos()`
- 无参数

4. `update()`
- 无参数

#### `class Starship`

1. `constructor()`
- 无参数

2. `goToPlanet(index)`
- `index: number`

3. `returnToOrbit()`
- 无参数

4. `update(time, delta)`
- `time: number`
- `delta: number`

5. `updateTrail()`
- 无参数

## 7. 外部依赖但未在本段定义的函数/变量

下列符号在 `end.html` 中被调用，通常由页面其它脚本段定义：

- `initDroneBackground`
- `hasSecondMusic`
- `getUserVolume`
- `fadeOutAudio`
- `fadeInAudio`
- `bgMusic`
- `musicIcon`
- `_currentTrack`
- `isMusicPlaying`
- `initImageLightbox`
- `initScrollAnimation`

如果这些未加载，会影响音频切换、首页背景、灯箱与滚动动画。

## 8. 维护建议

1. 新增部门时同时更新：`DEPARTMENTS`、`DEPT_ID_TO_NAME`、`DEPT_NAME_TO_ID`、`DEPT_FULL_QUESTIONS`、`render*Dept` 分发逻辑。
2. 变更 `DB` 字段时，同步检查 `renderSlides`、`showDeptIntro`、`showDeptPage`。
3. 调整性能优先改 `CONFIG`：`starCount`、`tinyStarCount`、`dustCount`。
## 9. 全量清单附录

已生成自动提取附录：code1/code/VARIABLES_AND_PARAMS.md

- 覆盖：const/let/var 声明、function 声明、对象方法、类方法签名。
- 用途：当你需要逐行核对“所有变量和参数”时，直接查看该附录。
