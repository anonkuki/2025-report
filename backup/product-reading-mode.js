// ============================================================
// product-reading-mode.js - 佑子阅读模式 v3.0
// ============================================================

/**
 * 佑子阅读模式 v3.0 - 自动浏览模式
 * 核心原则：完全复用原有的交互逻辑，只是自动触发点击/滑动事件
 * 修正版：
 * 1. 修正部门星球和报告对应关系
 * 2. 进入部门报告后自动下滑展示美术风格
 * 3. 署名使用"佑子"，部门intro展示社团总数据和突出数据
 * 4. 烟花页/弹幕页完整展示所有人数据后翻页
 * 5. 安利星云页自动旋转并展示所有图片
 * 6. 每张图片0.8秒
 */
const YouziReadingMode = (function() {
    'use strict';

    // ==================== 配置参数 ====================
    const CONFIG = {
        imageDisplayTime: 800,       // 图片放大展示时间(毫秒) - 改为0.8秒
        introSlideInterval: 2000,    // intro页面滑动间隔(毫秒)
        deptPageStayTime: 1500,      // 部门页面停留时间(毫秒)
        reportSlideInterval: 2000,   // 最终报告滑动间隔(毫秒)
        waitForAnimation: 3500,      // 等待飞船/动画完成的时间(毫秒)
        deptScrollSpeed: 50,         // 部门页面滚动速度(px/s) - 与外宣部顶部文字播放速度相同
        // 修正对应关系: DEPARTMENTS数组顺序是 art, cos, pr, tech, music, dance
        planetOrder: [0, 1, 2, 3, 4, 5]
    };

    // 正确的部门ID和名称映射（按DEPARTMENTS数组顺序）
    const DEPT_MAP = [
        { id: 'art', name: '原创部' },
        { id: 'cos', name: 'COS部' },
        { id: 'pr', name: '外宣部' },
        { id: 'tech', name: '技术部' },
        { id: 'music', name: '轻音部' },
        { id: 'dance', name: '舞装部' }
    ];

    // ==================== 状态变量 ====================
    let isActive = false;
    let isPaused = false;
    let currentPlanetIndex = 0;
    let currentPhase = 'idle';
    let timeoutIds = [];
    let controlPanel = null;
    let progressBar = null;
    let statusText = null;

    function getYouziDeptNames() {
        if (typeof DEPARTMENTS !== 'undefined' && Array.isArray(DEPARTMENTS) && DEPARTMENTS.length > 0) {
            return DEPARTMENTS.map(d => d.name);
        }
        return DEPT_MAP.map(d => d.name);
    }

    function buildCleanYouziUser() {
        const deptNames = getYouziDeptNames();
        const deptData = {};
        deptNames.forEach(name => {
            deptData[name] = {
                stats1: 0,
                stats1Raw: '',
                stats1Name: '',
                stats2: 0,
                stats2Raw: '',
                stats2Name: '',
                images: []
            };
        });

        return {
            id: 'YOUZI',
            name: '佑子',
            joinTime: '',
            depts: deptNames,
            stats: { activityRaw: '0', activityLevel: 0, activityCount: 0 },
            raw: {},
            imgs: {},
            deptData,
            commonData: {
                keyword: '',
                keywordReason: '',
                memorableQuote: '',
                ip: '',
                ipPhoto: '',
                ipReason: '',
                memoryPhoto: '',
                memoryDesc: '',
                groupPhoto: '',
                groupDesc: ''
            }
        };
    }

    function applyYouziTicketUI(user) {
        const ticketNameEl = document.getElementById('ticket-name');
        if (ticketNameEl) ticketNameEl.innerText = '佑子';

        const ticketNumEl = document.getElementById('ticket-number');
        if (ticketNumEl) ticketNumEl.innerText = 'NO.0000';

        const rankEl = document.getElementById('ticket-rank');
        if (rankEl) rankEl.innerText = getSeniorityTitle(user.joinTime);

        const deptsContainer = document.getElementById('ticket-depts');
        if (deptsContainer) {
            deptsContainer.innerHTML = (user.depts || []).map(d => '<span class="dept-chip">' + d + '</span>').join('');
        }
    }

    // ==================== 工具函数 ====================
    function delay(ms) {
        return new Promise(resolve => {
            const id = setTimeout(resolve, ms);
            timeoutIds.push(id);
        });
    }

    function clearAllTimeouts() {
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
    }

    function updateStatus(text) {
        if (statusText) statusText.textContent = text;
        console.log('[YouziReadingMode]', text);
    }

    function updateProgress(percent) {
        if (progressBar) progressBar.style.width = percent + '%';
    }

    async function waitFor(conditionFn, timeout = 10000, interval = 100) {
        const startTime = Date.now();
        while (!conditionFn()) {
            if (Date.now() - startTime > timeout) return false;
            await delay(interval);
            if (!isActive) return false;
        }
        return true;
    }

    // ==================== 控制面板UI（隐藏模式，无可见UI） ====================
    function createControlPanel() {
        const existing = document.getElementById('youzi-reading-control');
        if (existing) existing.remove();

        // 只注入隐藏返回按钮的CSS，不显示任何UI
        controlPanel = document.createElement('style');
        controlPanel.id = 'youzi-reading-control';
        controlPanel.textContent = `
            /* 阅读模式下隐藏返回按钮 */
            body.youzi-reading-active .dept-back-btn,
            body.youzi-reading-active #back-btn { display: none !important; }
        `;
        document.head.appendChild(controlPanel);
    }

    function removeControlPanel() {
        if (controlPanel) { controlPanel.remove(); controlPanel = null; }
    }

    function togglePause() {
        isPaused = !isPaused;
        const btn = document.getElementById('youzi-pause-btn');
        if (btn) btn.textContent = isPaused ? '继续' : '暂停';
        updateStatus(isPaused ? '已暂停' : '继续播放');
    }

    // ==================== 图片展示动画 ====================
    function createImageOverlay() {
        let overlay = document.getElementById('youzi-image-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'youzi-image-overlay';
            overlay.innerHTML = `
                <style>
                    #youzi-image-overlay {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        background: rgba(0, 0, 0, 0.9); z-index: 99998;
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
                    }
                    #youzi-image-overlay.active { opacity: 1; pointer-events: auto; }
                    #youzi-image-overlay .image-container { max-width: 90vw; max-height: 75vh; }
                    #youzi-image-overlay img, #youzi-image-overlay video {
                        max-width: 100%; max-height: 100%; object-fit: contain;
                        border-radius: 10px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                        animation: youzi-zoom-in 0.3s ease forwards;
                    }
                    #youzi-image-overlay .image-info { margin-top: 20px; text-align: center; color: #fff; }
                    #youzi-image-overlay .image-author { font-size: 18px; color: #ffd700; margin-bottom: 8px; font-weight: bold; }
                    #youzi-image-overlay .image-desc { font-size: 14px; color: rgba(255, 255, 255, 0.8); max-width: 600px; }
                    @keyframes youzi-zoom-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    </style>
                <div class="image-container"></div>
                <div class="image-info"><div class="image-author"></div><div class="image-desc"></div></div>
            `;
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    async function showImage(url, author, desc) {
        if (!url) {
            console.log('[YouziReadingMode] showImage: no url provided');
            return;
        }

        console.log('[YouziReadingMode] showImage:', url, author, desc);

        const overlay = createImageOverlay();
        const container = overlay.querySelector('.image-container');
        const authorEl = overlay.querySelector('.image-author');
        const descEl = overlay.querySelector('.image-desc');

        const isVideo = url && url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
        container.innerHTML = isVideo
            ? '<video src="' + url + '" muted autoplay loop style="max-width:90vw; max-height:75vh; object-fit:contain;"></video>'
            : '<img src="' + url + '" alt="" style="max-width:90vw; max-height:75vh; object-fit:contain;">';

        // 使用原投稿人署名
        authorEl.textContent = author ? '@' + author : '';
        descEl.textContent = desc || '';
        overlay.classList.add('active');

        await delay(CONFIG.imageDisplayTime);
        overlay.classList.remove('active');
        await delay(300);
    }

    async function showImagesSequentially(images) {
        for (let i = 0; i < images.length; i++) {
            if (!isActive || isPaused) {
                while (isPaused && isActive) await delay(100);
                if (!isActive) return;
            }
            updateStatus('展示图片 ' + (i + 1) + '/' + images.length);
            await showImage(images[i].url, images[i].author, images[i].desc);
        }
    }

    // ==================== 收集部门图片 ====================
    function collectDeptImages(deptName) {
        if (typeof DB === 'undefined' || !Array.isArray(DB)) return [];
        const allImages = [];
        DB.forEach(u => {
            if (u.deptData && u.deptData[deptName]) {
                const deptImages = u.deptData[deptName].images || [];
                deptImages.forEach(img => {
                    if (img && img.url) allImages.push({ url: img.url, desc: img.desc || '', author: u.name });
                });
            }
        });
        return allImages;
    }

    // ==================== 主流程控制 v2.0 ====================
    // 完全复用原有的交互逻辑，只是自动触发点击/滑动事件

    async function enterGalaxyView() {
        updateStatus('准备登录...');
        currentPhase = 'login';
        const body = document.body;

        // 如果已经在星系视图，跳过
        if (body.classList.contains('phase-system')) {
            updateStatus('已在星系视图');
            updateProgress(10);
            return;
        }

        // 1. 登录阶段 - 使用"佑子"作为用户名
        if (!body.classList.contains('phase-ticket') && !body.classList.contains('phase-flight')) {
            // 阅读模式使用"佑子"作为用户名（船票和报告显示的名字）
            // 先找DB中是否有"佑子"用户，没有的话使用一个稳定的数据源用户，但避免与特定ID混淆
            let targetUser = null;
            if (typeof DB !== 'undefined' && DB.length > 0) {
                const bannedNames = new Set(['佑子', '起个破名想半年']);
                // 优先找名为"佑子"的用户
                targetUser = DB.find(u => u.name === '佑子');
                // 如果没有"佑子"，找投稿了所有6个部门的用户（排除混淆ID）
                if (!targetUser) targetUser = DB.find(u => !bannedNames.has(u.name) && u.depts && u.depts.length >= 6);
                // 最后fallback到第一个非混淆ID用户
                if (!targetUser) targetUser = DB.find(u => !bannedNames.has(u.name));
                // 兜底fallback
                if (!targetUser) targetUser = DB[0];
            }

            if (targetUser) {
                const input = document.getElementById('username');
                if (input) {
                    // 输入实际存在的用户名以通过验证
                    input.value = targetUser.name;
                    updateStatus('登录用户: 佑子');
                    await delay(500);

                    // 设置标志，防止verifyUser再次触发阅读模式
                    window._youziReadingModeInternalCall = true;

                    // 调用原有的验证函数
                    if (typeof verifyUser === 'function') {
                        verifyUser();
                    }

                    // 清除标志
                    window._youziReadingModeInternalCall = false;

                    // 验证后立即覆盖所有显示为"佑子"，并使用干净数据
                    input.value = '佑子';

                    const cleanUser = buildCleanYouziUser();
                    cleanUser._originalName = targetUser && targetUser.name ? targetUser.name : '';
                    if (typeof currentUser !== 'undefined') currentUser = cleanUser;
                    window._youziCleanUser = cleanUser;

                    applyYouziTicketUI(cleanUser);

                    await delay(300);
                }
            }
        }

        // 2. 等待进入船票阶段
        updateStatus('等待船票...');
        await waitFor(() => body.classList.contains('phase-ticket'), 5000);

        // 确保船票为"佑子"且有6个部门
        if (window._youziCleanUser) {
            applyYouziTicketUI(window._youziCleanUser);
        } else {
            const ticketNameEl = document.getElementById('ticket-name');
            if (ticketNameEl) ticketNameEl.innerText = '佑子';
        }

        updateProgress(5);
        await delay(2000); // 让用户看到船票动画

        // 3. 自动点击启航
        updateStatus('准备启航...');
        currentPhase = 'flight';

        // 模拟点击启航按钮，或直接调用 launchShip
        const launchBtn = document.querySelector('.flight-btn') || document.querySelector('[onclick*="launchShip"]');
        if (launchBtn) {
            launchBtn.click();
        } else if (typeof launchShip === 'function') {
            launchShip();
        }

        // 4. 等待飞行动画完成，进入星系视图
        updateStatus('飞船启航中...');
        await waitFor(() => body.classList.contains('phase-system'), 15000);
        updateStatus('已进入星系');
        updateProgress(10);
        await delay(1500); // 让用户欣赏星系视图
    }

    async function processPlanet(planetIndex) {
        // 使用正确的部门映射（按DEPARTMENTS数组顺序）
        const deptInfo = DEPT_MAP[planetIndex];
        const deptId = deptInfo.id;
        const deptName = deptInfo.name;

        updateStatus('飞向 ' + deptName + '...');
        currentPhase = 'travelling';

        // 1. 调用原有的 goToPlanet 让飞船飞向星球
        // 这会自动设置 onArrival 回调，到达后触发 showDeptPage
        if (typeof starshipObj !== 'undefined' && starshipObj && typeof starshipObj.goToPlanet === 'function') {
            starshipObj.goToPlanet(planetIndex);
        }

        // 2. 等待飞船到达并触发部门intro弹窗
        updateStatus('飞船移动中...');
        await waitFor(() => {
            return document.querySelector('.dept-intro-modal.active') ||
                   document.body.classList.contains('phase-dept');
        }, CONFIG.waitForAnimation + 3000);

        // 3. 处理 dept-intro-modal 中的 Swiper (如果存在)
        const introModal = document.querySelector('.dept-intro-modal.active');
        if (introModal) {
            updateStatus(deptName + ' - 浏览社团数据...');
            currentPhase = 'dept-intro';

            // 在intro中显示社团整体数据
            await showDeptSummaryData(deptName);

            // 找到intro中的Swiper
            const introSwiper = introModal.querySelector('.dept-swiper');
            if (introSwiper && introSwiper.swiper) {
                const swiper = introSwiper.swiper;
                const totalSlides = swiper.slides.length;

                // 自动翻页浏览intro
                for (let i = 0; i < totalSlides - 1; i++) {
                    if (!isActive) return;
                    while (isPaused && isActive) await delay(100);

                    await delay(CONFIG.introSlideInterval);
                    swiper.slideNext();
                }

                // 停留在最后一页（进入按钮页）
                await delay(CONFIG.introSlideInterval);
            } else {
                // 如果没有swiper，等待一会
                await delay(CONFIG.introSlideInterval * 2);
            }

            // 4. 点击"进入部门空间"按钮
            const enterBtn = document.getElementById('enter-dept-btn');
            if (enterBtn) {
                updateStatus('进入 ' + deptName + ' 空间...');
                enterBtn.click();
                await delay(800); // 等待modal关闭动画
            }
        }

        // 5. 等待进入部门页面
        await waitFor(() => document.body.classList.contains('phase-dept'), 3000);

        // 6. 在部门页面先自动滚动到底部，再展示图片
        if (document.body.classList.contains('phase-dept')) {
            currentPhase = 'dept-report';
            updateStatus(deptName + ' - 浏览美术风格...');

            // 先自动滚动到底部展示部门页面
            await autoScrollDeptPage();

            // 滚动完成后再收集并展示部门投稿图片
            updateStatus(deptName + ' - 展示投稿照片...');
            const images = collectDeptImages(deptName);
            if (images.length > 0) {
                await showImagesSequentially(images);
            }

            await delay(CONFIG.deptPageStayTime);

            // 7. 点击返回按钮，调用原有的 backFromDept
            updateStatus('返回星系...');
            const backBtn = document.querySelector('.back-btn') || document.querySelector('[onclick*="backFromDept"]');
            if (backBtn) {
                backBtn.click();
            } else if (typeof backFromDept === 'function') {
                backFromDept();
            }

            await delay(1000); // 等待返回动画
        }

        // 8. 等待返回星系视图
        await waitFor(() => document.body.classList.contains('phase-system') && !document.body.classList.contains('phase-dept'), 3000);

        const progress = 10 + (planetIndex + 1) * 13;
        updateProgress(Math.min(progress, 90));
        await delay(800);
    }

    // 修改intro页面数据为社团整体数据（总和与突出数据）
    async function showDeptSummaryData(deptName) {
        if (typeof DB === 'undefined' || !Array.isArray(DB)) return;

        const deptMembers = DB.filter(u => u.deptData && u.deptData[deptName]);
        if (deptMembers.length === 0) return;

        // 计算统计数据
        const stats1Data = deptMembers.map(u => ({ name: u.name, value: u.deptData[deptName].stats1 || 0 })).filter(v => v.value > 0);
        const stats2Data = deptMembers.map(u => ({ name: u.name, value: u.deptData[deptName].stats2 || 0 })).filter(v => v.value > 0);

        const stats1Total = stats1Data.reduce((sum, item) => sum + item.value, 0);
        const stats2Total = stats2Data.reduce((sum, item) => sum + item.value, 0);
        const stats1TopUser = stats1Data.length > 0 ? stats1Data.reduce((max, item) => item.value > max.value ? item : max, stats1Data[0]) : null;
        const stats2TopUser = stats2Data.length > 0 ? stats2Data.reduce((max, item) => item.value > max.value ? item : max, stats2Data[0]) : null;

        console.log('[YouziReadingMode] Dept summary data:', {
            deptName, stats1Total, stats2Total,
            stats1TopUser: stats1TopUser ? stats1TopUser.name + '(' + stats1TopUser.value + ')' : 'none',
            stats2TopUser: stats2TopUser ? stats2TopUser.name + '(' + stats2TopUser.value + ')' : 'none'
        });

        // 修改intro modal中的数据
        const introModal = document.querySelector('.dept-intro-modal.active');
        if (!introModal) return;

        // 找到所有netease-card卡片
        const cards = introModal.querySelectorAll('.netease-card');
        let cardIndex = 0;

        cards.forEach(card => {
            // 找到数字显示元素
            const numberEl = card.querySelector('.netease-number');
            const titleEl = card.querySelector('.netease-title');
            const descEl = card.querySelector('.netease-desc');
            const labelEl = card.querySelector('.netease-label');
            const statsInfoEl = card.querySelector('.dept-stats-info');

            // 跳过欢迎页和进入按钮页
            if (labelEl && labelEl.textContent.includes('ENTERING')) return;
            if (card.querySelector('#enter-dept-btn')) return;

            // 第一个数据卡片 - 显示stats1总和
            if (numberEl && cardIndex === 0 && stats1Total > 0) {
                numberEl.textContent = stats1Total;
                if (descEl) descEl.textContent = '部门总计';
                // 更新或添加统计信息
                if (statsInfoEl && stats1TopUser) {
                    statsInfoEl.innerHTML = '突出贡献: <span class="highlight">' + stats1TopUser.name + '</span> (' + stats1TopUser.value + ')';
                } else if (stats1TopUser) {
                    const newInfo = document.createElement('div');
                    newInfo.className = 'dept-stats-info';
                    newInfo.innerHTML = '突出贡献: <span class="highlight">' + stats1TopUser.name + '</span> (' + stats1TopUser.value + ')';
                    card.appendChild(newInfo);
                }
                cardIndex++;
            }
            // 第二个数据卡片 - 显示stats2总和
            else if ((numberEl || titleEl) && cardIndex === 1 && stats2Total > 0) {
                if (numberEl) numberEl.textContent = stats2Total;
                if (titleEl && !numberEl) titleEl.textContent = stats2Total;
                if (descEl) descEl.textContent = '部门总计';
                // 更新或添加统计信息
                if (statsInfoEl && stats2TopUser) {
                    statsInfoEl.innerHTML = '突出贡献: <span class="highlight">' + stats2TopUser.name + '</span> (' + stats2TopUser.value + ')';
                } else if (stats2TopUser) {
                    const newInfo = document.createElement('div');
                    newInfo.className = 'dept-stats-info';
                    newInfo.innerHTML = '突出贡献: <span class="highlight">' + stats2TopUser.name + '</span> (' + stats2TopUser.value + ')';
                    card.appendChild(newInfo);
                }
                cardIndex++;
            }
        });
    }

    // 自动滚动部门页面
    async function autoScrollDeptPage() {
        console.log('[YouziReadingMode] autoScrollDeptPage started');

        // 等待页面内容加载
        await delay(1500);

        // 滚动容器是 #dept-layer，不是 #dept-content
        // #dept-layer 有 overflow-y: auto，是实际可滚动的元素
        const scrollContainer = document.getElementById('dept-layer');
        if (!scrollContainer) {
            console.log('[YouziReadingMode] dept-layer not found!');
            return;
        }

        // 等待内容渲染完成
        await delay(1000);

        // 先重置滚动位置到顶部
        scrollContainer.scrollTop = 0;

        // 触发重排确保布局计算正确
        void scrollContainer.offsetHeight;

        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const scrollDistance = scrollHeight - clientHeight;

        console.log('[YouziReadingMode] Scroll info - scrollHeight:', scrollHeight, 'clientHeight:', clientHeight, 'scrollDistance:', scrollDistance);

        if (scrollDistance <= 10) {
            // 如果没什么可滚动的，等一会就返回
            console.log('[YouziReadingMode] Nothing to scroll, waiting...');
            await delay(3000);
            return;
        }

        // 计算滚动时间，速度约75px/s（快速滚动）
        const scrollSpeed = 100; // px/s
        const scrollDuration = Math.max(scrollDistance / scrollSpeed * 1000, 3000);
        const startTime = Date.now();

        updateStatus('自动滚动浏览部门内容...');
        console.log('[YouziReadingMode] Starting scroll animation, duration:', scrollDuration, 'ms, distance:', scrollDistance);

        // 使用 easeInOutQuad 缓动函数实现更自然的滚动
        const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // 滚动动画循环
        const animateScroll = () => {
            return new Promise(resolve => {
                const scrollFrame = async () => {
                    if (!isActive) {
                        resolve();
                        return;
                    }
                    if (isPaused) {
                        setTimeout(scrollFrame, 100);
                        return;
                    }

                    const elapsed = Date.now() - startTime;
                    if (elapsed >= scrollDuration) {
                        scrollContainer.scrollTop = scrollDistance;
                        resolve();
                        return;
                    }

                    const progress = elapsed / scrollDuration;
                    const easedProgress = easeInOutQuad(progress);
                    scrollContainer.scrollTop = Math.round(scrollDistance * easedProgress);

                    requestAnimationFrame(scrollFrame);
                };
                scrollFrame();
            });
        };

        await animateScroll();

        // 确保滚动到底部
        scrollContainer.scrollTop = scrollDistance;
        console.log('[YouziReadingMode] Scroll complete, final scrollTop:', scrollContainer.scrollTop);

        // 在底部停留一会
        await delay(2000);

        console.log('[YouziReadingMode] autoScrollDeptPage complete');
    }

    async function enterFinalReport() {
        updateStatus('进入最终报告...');
        currentPhase = 'final-report';

        // 点击太阳卡片进入最终报告
        const sunCard = document.getElementById('sun-card');
        if (sunCard) {
            sunCard.click();
        } else if (typeof showReport === 'function') {
            // 确保已解锁
            if (typeof window !== 'undefined') window.secretUnlocked = true;
            showReport();
        }

        // 等待报告Swiper初始化
        await waitFor(() => typeof window.reportSwiper !== 'undefined' && window.reportSwiper, 5000);
        if (!window.reportSwiper) {
            updateStatus('报告加载失败');
            return;
        }

        await delay(1000);

        const swiper = window.reportSwiper;
        const totalSlides = swiper.slides.length;

        // 阅读模式下只展示：引导页(transition-slide)、烟花页、弹幕页、星云页、memories页
        // 跳过个人数据页面
        for (let i = 0; i < totalSlides; i++) {
            if (!isActive) return;
            while (isPaused && isActive) await delay(100);

            const currentSlide = swiper.slides[i];
            if (!currentSlide) continue;

            // 判断页面类型
            const isTransitionSlide = currentSlide.classList.contains('transition-slide');
            const isFireworkSlide = currentSlide.classList.contains('firework-slide');
            const isDanmakuSlide = currentSlide.classList.contains('danmaku-slide');
            const isNebulaSlide = currentSlide.classList.contains('soul-nebula-slide');
            const hasMemoryCarousel = currentSlide.querySelector('.memory-carousel-track') !== null;
            const isStarWarsSlide = currentSlide.querySelector('.star-wars-container') !== null;

            // 只处理引导页和特殊页面
            if (isTransitionSlide) {
                updateStatus('引导页 ' + (i + 1) + '/' + totalSlides);
                // 引导页停留一段时间让用户阅读
                await delay(3000);
            }
            else if (isFireworkSlide) {
                updateStatus('烟花页 - 展示难忘的话...');
                await handleFireworkSlide(currentSlide);
            }
            else if (isDanmakuSlide) {
                updateStatus('弹幕页 - 展示关键词...');
                await handleDanmakuSlide(currentSlide);
            }
            else if (isNebulaSlide) {
                updateStatus('安利星云 - 展示所有IP...');
                await handleNebulaSlide(currentSlide);
            }
            else if (hasMemoryCarousel) {
                updateStatus('共同回忆页...');
                // memories页面展示图片（去重）
                const images = currentSlide.querySelectorAll('.memory-carousel-card');
                if (images.length > 0) {
                    const imageData = [];
                    const seenUrls = new Set();
                    images.forEach(img => {
                        const url = img.dataset.url || (img.querySelector('img') ? img.querySelector('img').src : null);
                        const author = img.dataset.author || '';
                        const desc = img.dataset.desc || '';
                        if (url && !seenUrls.has(url)) {
                            seenUrls.add(url);
                            imageData.push({ url, author, desc });
                        }
                    });
                    if (imageData.length > 0) {
                        updateStatus('展示共同回忆 (' + imageData.length + '张)...');
                        await showImagesSequentially(imageData);
                    }
                }
            }
            else if (isStarWarsSlide) {
                // 星球大战报幕页 - CSS动画持续104秒，等待动画播放完成
                updateStatus('星球大战报幕 - 播放年度总结...');
                // 等待104秒让动画完整播放
                console.log('[YouziReadingMode] Star Wars crawl page, waiting 104 seconds');
                await delay(104000);
            }
            else {
                // 其他个人数据页面，直接跳过不停留
                // 静默跳过，不更新状态
            }

            // 翻到下一页
            if (i < totalSlides - 1) {
                swiper.slideNext();
                await delay(500);
            }

            updateProgress(90 + (i / totalSlides) * 10);
        }

        updateProgress(100);
        updateStatus('阅读完成！');
    }

    // 处理烟花页 - 等待所有投稿人名字出现，同时自动发射装饰烟花
    async function handleFireworkSlide(slide) {
        // 烟花页的文字会按顺序弹出
        // 获取所有投稿人数据数量
        let totalQuotes = 10;
        if (typeof DB !== 'undefined' && Array.isArray(DB)) {
            const hideYouzi = window._youziReadingModeActive === true;
            totalQuotes = DB.filter(u => {
                if (!(u.commonData && u.commonData.memorableQuote && u.commonData.memorableQuote.trim() !== '')) return false;
                if (hideYouzi && u.name === '佑子') return false;
                return true;
            }).length;
        }

        updateStatus('烟花页 - 展示 ' + totalQuotes + ' 条难忘的话...');

        // 烟花JS每隔约1-2秒显示一个文字，动画持续8秒（已调整）
        // 总等待时间 = 所有文字出现时间 + 最后一个文字的动画时间
        const displayInterval = 1500; // 每条显示间隔
        const animationDuration = 8000; // 单条动画时长（与CSS同步）
        const totalWaitTime = (totalQuotes * displayInterval) + animationDuration;

        // 最少等35秒，最多等2分钟
        const waitTime = Math.max(35000, Math.min(totalWaitTime, 120000));

        console.log('[YouziReadingMode] Firework page: waiting', waitTime/1000, 'seconds for', totalQuotes, 'quotes');

        // 在等待期间，每隔3-5秒自动发射一个无文字装饰烟花
        const decorationInterval = setInterval(() => {
            if (!isActive || isPaused) return;
            if (typeof window.launchDecorationFirework === 'function') {
                window.launchDecorationFirework();
            }
        }, 3500);

        await delay(waitTime);

        // 停止装饰烟花发射
        clearInterval(decorationInterval);
    }

    // 处理弹幕页 - 等待弹幕滚动显示
    async function handleDanmakuSlide(slide) {
        // 弹幕是CSS动画自动滚动的，动画时长15-40秒不等
        const danmakuItems = slide.querySelectorAll('.danmaku-item');
        const itemCount = danmakuItems.length;

        if (itemCount === 0) {
            await delay(5000);
            return;
        }

        updateStatus('弹幕页 - 展示 ' + itemCount + ' 条关键词...');

        // 弹幕动画时长在15-40秒之间，等待最长的弹幕滚动完成
        // 保守估计等待45秒让所有弹幕都滚动一遍
        const waitTime = 45000;

        console.log('[YouziReadingMode] Danmaku page: waiting', waitTime/1000, 'seconds for', itemCount, 'items');
        await delay(waitTime);
    }

    // 处理安利星云页 - 自动旋转并展示所有IP
    async function handleNebulaSlide(slide) {
        // 从data属性获取IP数据
        const ipDataBase64 = slide.dataset.nebulaIp;
        let ipData = [];

        try {
            if (ipDataBase64) {
                // base64数据的字段名是: name, ip, photo
                const rawData = JSON.parse(decodeURIComponent(escape(atob(ipDataBase64))));
                ipData = rawData.map(item => ({
                    ipName: item.ip,
                    ipPhoto: item.photo,
                    author: item.name
                }));
                console.log('[YouziReadingMode] Parsed nebula IP data:', ipData.length, 'items');
            }
        } catch (e) {
            console.warn('[YouziReadingMode] Failed to parse nebula IP data:', e);
        }

        if (ipData.length === 0) {
            // 尝试从DB获取
            if (typeof DB !== 'undefined') {
                ipData = DB.filter(u => u.commonData && u.commonData.ip && u.commonData.ipPhoto)
                    .map(u => ({
                        ipName: u.commonData.ip,
                        ipPhoto: u.commonData.ipPhoto,
                        author: u.name
                    }));
                console.log('[YouziReadingMode] Got nebula IP data from DB:', ipData.length, 'items');
            }
        }

        if (ipData.length === 0) {
            console.log('[YouziReadingMode] No nebula IP data found');
            await delay(5000);
            return;
        }

        updateStatus('安利星云 - 展示 ' + ipData.length + ' 个IP...');

        // 自动左右旋转canvas
        const canvasContainer = slide.querySelector('#nebula-canvas-container');
        let rotationInterval = null;
        if (canvasContainer) {
            // 触发自动左右旋转（rotateY）
            let rotationY = 0;
            rotationInterval = setInterval(() => {
                if (!isActive || isPaused) return;
                rotationY += 1;
                // 尝试找到canvas并左右旋转
                const canvas = canvasContainer.querySelector('canvas');
                if (canvas) {
                    canvas.style.transform = 'rotateY(' + rotationY + 'deg)';
                }
            }, 50);
        }

        // 依次放大展示每个IP图片
        for (let i = 0; i < ipData.length && isActive; i++) {
            while (isPaused && isActive) await delay(100);

            const ip = ipData[i];
            const displayName = ip.ipName || '未知IP';
            updateStatus('安利星云 (' + (i + 1) + '/' + ipData.length + '): ' + displayName);

            // 使用放大展示图片（和其他图片一样的效果）
            if (ip.ipPhoto) {
                await showImage(ip.ipPhoto, ip.author, displayName);
            }
        }

        // 停止旋转
        if (rotationInterval) clearInterval(rotationInterval);

        // 关闭详情弹窗
        if (typeof window.hideNebulaDetail === 'function') {
            window.hideNebulaDetail();
        }
    }

    // 显示星云IP详情（备用，不再使用）
    async function showNebulaIPDetail(ip) {
        const modal = document.getElementById('nebula-detail-modal');
        const img = document.getElementById('nebula-detail-img');
        const ipEl = document.getElementById('nebula-detail-ip');
        const authorEl = document.getElementById('nebula-detail-author');

        if (!modal || !img) return;

        img.src = ip.ipPhoto || '';
        if (ipEl) ipEl.textContent = ip.ipName || '';
        if (authorEl) authorEl.textContent = '@' + (ip.author || '佑子') + (ip.ipReason ? ' - ' + ip.ipReason : '');

        modal.classList.add('active');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
    }

    // ==================== 公共API ====================
    async function start() {
        if (isActive) {
            console.warn('[YouziReadingMode] Already running');
            return;
        }

        console.log('[YouziReadingMode v2.0] Starting...');
        isActive = true;
        isPaused = false;
        window._youziReadingModeActive = true;
        document.body.classList.add('youzi-reading-active');
        currentPlanetIndex = 0;
        currentPhase = 'idle';

        createControlPanel();
        updateStatus('正在启动阅读模式...');
        updateProgress(0);

        try {
            // 1. 进入星系视图
            await enterGalaxyView();
            if (!isActive) return;

            // 2. 依次访问6个星球
            for (let i = 0; i < CONFIG.planetOrder.length; i++) {
                if (!isActive) break;
                while (isPaused && isActive) await delay(100);

                currentPlanetIndex = i;
                await processPlanet(CONFIG.planetOrder[i]);
            }

            // 3. 进入最终报告
            if (isActive) {
                await enterFinalReport();
            }

        } catch (error) {
            console.error('[YouziReadingMode] Error:', error);
            updateStatus('发生错误: ' + error.message);
        }

        // 完成
        if (isActive) {
            updateStatus('🎉 阅读模式已完成');
            await delay(3000);
            stop();
        }
    }

    function stop() {
        console.log('[YouziReadingMode] Stopping...');
        isActive = false;
        isPaused = false;
        currentPhase = 'idle';
        window._youziReadingModeActive = false;
        document.body.classList.remove('youzi-reading-active');
        clearAllTimeouts();

        // 清理overlay
        const imageOverlay = document.getElementById('youzi-image-overlay');
        if (imageOverlay) imageOverlay.remove();

        removeControlPanel();
    }

    function pause() { togglePause(); }
    function getStatus() { return { isActive, isPaused, currentPhase, currentPlanetIndex }; }

    return { start, stop, pause, getStatus, CONFIG };
})();

if (typeof window !== 'undefined') window.YouziReadingMode = YouziReadingMode;

console.log('[YouziReadingMode] Module loaded. Enter "佑子" in login to start.');

;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();