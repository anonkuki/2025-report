# 数据结构与字段说明

> 本文档描述系统中所有核心数据结构的字段定义和类型。

## 1. DB（用户主数据）

`DB` 是页面核心数据源（由模板工具预注入）：

```typescript
type User = {
  id?: string;
  name: string;                  // 用户姓名
  joinTime: string;              // 加入时间（如 "2023-09"）
  depts: string[];               // 所属部门列表
  stats?: {
    activityRaw?: string;        // 原始活跃度文本
    activityLevel?: number;      // 活跃等级 1-4
    activityCount?: number;      // 活动参与次数
  };
  raw?: Record<string, unknown>; // 原始 Excel 行数据
  imgs?: Record<string, string>; // 用户图片映射
  deptData: Record<string, {
    stats1: number;              // 部门统计数据 1
    stats1Raw: string;
    stats1Name: string;
    stats2: number;              // 部门统计数据 2
    stats2Raw: string;
    stats2Name: string;
    images: Array<{ url: string; desc?: string }>;  // 部门相关图片
  }>;
  commonData: {
    keyword?: string;            // 年度关键词
    keywordReason?: string;      // 关键词理由
    memorableQuote?: string;     // 难忘语录
    ip?: string;                 // 安利 IP
    ipPhoto?: string;            // IP 照片
    ipReason?: string;           // 安利理由
    memoryPhoto?: string;        // 回忆照片
    memoryDesc?: string;         // 回忆描述
    groupPhoto?: string;         // 合照
    groupDesc?: string;          // 合照描述
    activityLevel?: number;      // 活跃度等级
  };
};
```

## 2. DEPARTMENTS（部门星球配置）

每个部门对应一颗3D星球，配置如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 部门ID（art/cos/pr/tech/music/dance） |
| `name` | string | 部门中文名 |
| `data` | string | 卡片文案 |
| `color` / `color2` | string | 主副配色（十六进制） |
| `scale` | number | 星球尺寸 |
| `angle` | number | 初始轨道角度 |
| `type` | string | 纹理类型（映射 TextureFactory 方法） |
| `hasRing` | boolean | 是否有行星环 |
| `ringType` | string | 环类型（可选） |
| `hasSatellites` | boolean | 是否有卫星 |
| `satCount` | number | 卫星数量（可选） |
| `satType` | string | 卫星类型（可选） |
| `hoverText` | string | 悬浮提示文本 |

## 3. CONFIG（3D 全局参数）

| 字段 | 说明 |
|------|------|
| `starCount` | 背景星点数量 |
| `brightStarCount` | 高亮星数量 |
| `dustCount` | 微尘粒子数量 |
| `tinyStarCount` | 微小星点数量 |
| `orbitRadius` | 行星轨道半径 |
| `orbitSpeed` | 轨道转速系数 |

## 4. WEIXIN_ARTICLES（微信公众号数据）

```typescript
type Article = {
  title: string;       // 文章标题
  readCount: number;   // 阅读量
  cover: string;       // 封面图 URL
  link: string;        // 文章链接
  publishDate: string; // 发布日期
};
```

## 5. BILIBILI_VIDEOS（B站视频数据）

```typescript
type Video = {
  title: string;     // 视频标题
  playCount: number; // 播放量
  cover: string;     // 封面图 URL
  link: string;      // 视频链接
  duration: string;  // 视频时长
};
```
