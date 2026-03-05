/**
 * ============================================================
 * 佐佑动漫社 2025 年度总结 — 页面流程控制模块
 * ============================================================
 * 
 * 本模块管理整个页面的阶段（Phase）切换和核心业务流程。
 * 
 * Phase 状态机：
 *   login → ticket → flight → system ↔ dept → report
 * 
 * 主要函数：
 * - verifyUser()    用户登录验证
 * - launchShip()    起飞过渡动画
 * - showDeptPage()  进入部门页面
 * - showReport()    进入个人报告
 * - backToSystem()  返回星系
 * - backFromDept()  从部门页返回
 * 
 * 依赖：DB[], DEPARTMENTS[], currentUser, Three.js 场景对象
 * ============================================================
 */

// ==================== 状态变量 ====================

let currentUser = null;      // 当前已验证的用户对象
let visitedDepts = new Set(); // 已访问的部门集合
let currentVisitingDept = null; // 当前访问中的部门 ID

// ==================== 用户验证 ====================

/**
 * verifyUser() — 登录校验
 * 
 * 流程：
 * 1. 获取输入框中的用户名
 * 2. 在 DB[] 中查找匹配的用户
 * 3. 如果找到 → 构建 currentUser 对象
 * 4. 渲染船票信息（姓名/资历/部门）
 * 5. 触发打孔动画 triggerPunchAnimation()
 * 6. 切换 body 类名 → phase-ticket
 */
function verifyUser() {
    // 验证逻辑...
}

// ==================== 飞船起飞 ====================

/**
 * launchShip() — 从船票过渡到星系
 * 
 * 流程：
 * 1. 播放背景音乐
 * 2. 切换 body → phase-flight
 * 3. GSAP 飞船动画（加速 → 跃迁 → 到达）
 * 4. 延迟后切换 body → phase-system
 * 5. 初始化进度条交互
 */
function launchShip() {
    // 起飞动画逻辑...
}

// ==================== 部门页面 ====================

/**
 * showDeptPage(deptId) — 进入部门展示页
 * 
 * @param {string} deptId — 部门ID (art/cos/pr/tech/music/dance)
 * 
 * 流程：
 * 1. 根据 deptId 查找部门配置和用户数据
 * 2. 获取部门成员列表和图片
 * 3. 调用对应的 render*Dept() 渲染函数
 * 4. 将生成的 HTML 注入 #dept-content
 * 5. 标记该部门为已访问
 * 6. 更新进度条
 * 7. 切换显示到部门层
 */
function showDeptPage(deptId) {
    // 部门页面逻辑...
}

/**
 * backFromDept() — 从部门页返回星系
 */
function backFromDept() {
    // 返回逻辑...
}

// ==================== 个人报告 ====================

/**
 * showReport() — 进入个人年度报告
 * 
 * 前提条件：visitedDepts.size === 6 (全部探索完成)
 * 
 * 流程：
 * 1. 检查是否已探索全部 6 个部门
 * 2. 调用 renderSlides(currentUser) 生成报告卡片
 * 3. 初始化 Swiper 实例
 * 4. 切换 body → phase-report
 */
function showReport() {
    // 报告入口逻辑...
}

/**
 * backToSystem() — 从报告返回星系
 */
function backToSystem() {
    // 返回逻辑...
}
