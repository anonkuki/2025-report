# 函数参考手册

> 本文档列出成品页面中所有核心函数的签名、参数和作用。

## 1. 工具函数

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `isVideoUrl(str)` | `str: string` | `boolean` | 检测 URL 是否为视频（.mp4/.webm/.mov） |
| `getMediaHtml(url, alt, extraClass, onerrorFallback)` | 见下 | `string` | 根据 URL 生成 `<img>` 或 `<video>` HTML |
| `getSeniorityTitle(joinTimeRaw)` | `joinTimeRaw: string` | `string` | 根据加入时间返回资历称号 |
| `isMobileDevice()` | — | `boolean` | 检测是否为移动端 |

## 2. 页面流程函数

| 函数 | 参数 | 说明 |
|------|------|------|
| `init3D()` | — | 初始化 Three.js 场景、星球、飞船、流星 |
| `animate()` | — | 主渲染循环与交互更新（requestAnimationFrame） |
| `startMeteorShower()` | — | 首页流星雨姓名弹幕 |
| `verifyUser()` | — | 登录校验 → 票据渲染 → 状态切换 |
| `launchShip()` | — | 从船票阶段过渡到星系阶段（飞船动画） |
| `showReport()` | — | 检查探索进度（6/6）并进入报告页 |
| `backToSystem()` | — | 从报告返回星系 |

## 3. 部门渲染函数

| 函数 | 说明 |
|------|------|
| `showDeptPage(deptId)` | 进入部门页面，根据 deptId 分发到具体渲染函数 |
| `showDeptIntro(deptId, myData, myImages, onComplete)` | 部门介绍动画 |
| `backFromDept()` | 从部门页返回星系 |
| `renderCosDept(...)` | COS 部渲染（像素风格） |
| `renderTechDept(...)` | 技术部渲染（赛博朋克风格） |
| `renderMusicDept(...)` | 轻音部渲染（霓虹风格） |
| `renderDanceDept(...)` | 舞蹈部渲染（星空风格） |
| `renderArtDept(...)` | 原创部渲染（水彩风格） |
| `renderPrDept(...)` | 外宣部渲染（漫画风格） |

> 所有 `render*Dept` 函数参数一致：`(deptName, otherImages, isInDept, members, myImages)`

## 4. 个人报告函数

| 函数 | 参数 | 说明 |
|------|------|------|
| `renderSlides(user)` | `user: User` | 生成最终报告页全部 Swiper 卡片 |
| `renderWeeklyPhotos(deptName)` | `deptName: string` | 渲染周常照片集 |
| `renderInfluenceDashboard()` | — | 外宣影响力数据看板（微信+B站） |
| `calculateDeptAverage(deptName, members)` | 见参数 | 计算部门统计平均值 |
| `savePosterImage()` | — | html2canvas 截图保存为海报 |

## 5. Three.js / 特效函数

| 函数 | 说明 |
|------|------|
| `initCursorTrail()` | 初始化鼠标光标拖尾效果 |
| `checkMeteorCollision()` | 检测鼠标与流星的碰撞（抓取流星） |
| `triggerPunchAnimation()` | 船票打孔动画 |

## 6. TextureFactory（程序化贴图工厂）

| 方法 | 参数 | 说明 |
|------|------|------|
| `createBase(size)` | `size: number = 512` | 创建基础 Canvas |
| `dance_refined(c1, c2)` | 双色 | 舞蹈部星球纹理 |
| `cos_refined(c1, c2)` | 双色 | COS 部星球纹理 |
| `circuit(c1, c2)` | 双色 | 技术部电路板纹理 |
| `soundwave(c1, c2)` | 双色 | 轻音部声波纹理 |
| `ink(c1, c2)` | 双色 | 原创部墨水纹理 |
| `signal(c1, c2)` | 双色 | 外宣部信号纹理 |
| `sun(color)` | 单色 | 太阳纹理 |
| `glow(color)` | 单色 | 发光纹理 |
| `meteorHead()` / `meteorTrail()` / `dust()` | — | 流星/尘埃粒子纹理 |

## 7. 类定义

### Meteor 类

```javascript
class Meteor {
    constructor()         // 创建流星三维对象
    reset(initial=false)  // 重置位置和速度（initial 为首次创建标记）
    updatePos()           // 更新流星位置
    update()              // 每帧更新（含生命周期管理）
}
```

### Starship 类

```javascript
class Starship {
    constructor()               // 创建飞船三维模型
    goToPlanet(index)           // 飞向指定星球
    returnToOrbit()             // 返回默认轨道
    update(time, delta)         // 每帧位置更新
    updateTrail()               // 更新飞船尾焰效果
}
```
