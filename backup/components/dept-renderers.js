// ============================================================
// components/dept-renderers.js - 部门页面渲染组件
// 从 generator.html 提取
// 包含: renderDeptGrid, showDeptIntro, renderWeeklyPhotos,
//       openPhotoModal, closePhotoModal,
//       renderCosDept, renderTechDept, renderMusicDept,
//       renderDanceDept, renderArtDept, renderPrDept
// 依赖全局: DB, currentUser, DEPARTMENTS, WEEKLY_PHOTOS,
//           DEPT_ID_TO_NAME, deptClickGuardUntil,
//           calculateDeptAverage, renderWeeklyPhotos,
//           initScrollAnimation, initInfluenceDashboardAnimation,
//           initPrDeptNarrative, renderInfluenceDashboard
// ============================================================
function renderDeptGrid(deptId, deptName, otherImages, isInDept, deptMembers, myImages) {
    try {
    let html = '';
    switch(deptId) {
        case 'cos': html = renderCosDept(deptName, otherImages, isInDept, deptMembers, myImages); break;
        case 'tech': html = renderTechDept(deptName, otherImages, isInDept, deptMembers, myImages); break;
        case 'music': html = renderMusicDept(deptName, otherImages, isInDept, deptMembers, myImages); break;
        case 'dance': html = renderDanceDept(deptName, otherImages, isInDept, deptMembers, myImages); break;
        case 'art': html = renderArtDept(deptName, otherImages, isInDept, deptMembers, myImages); break;
        case 'pr': html = renderPrDept(deptName, otherImages, isInDept, deptMembers, myImages); break;
    }
    document.getElementById('dept-content').innerHTML = html;

    // 启动滚动动画 (所有部门通用)
    requestAnimationFrame(() => {
        if (window.initScrollAnimation) window.initScrollAnimation();

        if (deptId === 'pr') {
            // 如果是外宣部，启动影响力看板动画
            initInfluenceDashboardAnimation();
            // 外宣顶部叙事：随滚动复现 + 点击跳转
            initPrDeptNarrative();
        }
    });
    } catch(e) {
        console.error('[renderDeptGrid ERROR]', e);
        alert('渲染部门内容时出错: ' + e.message);
    }
}

// New Intro Slide Logic
// New Intro Slide Logic - Swiper Version
function showDeptIntro(deptId, myData, myImages, onComplete) {
    // Create container
    let modal = document.querySelector('.dept-intro-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.className = 'dept-intro-modal active';
    modal.setAttribute('data-dept', deptId);
    document.body.appendChild(modal);

    // Build Slides Data
    const slides = [];

    // Helper to add slide
    const addSlide = (content) => {
        slides.push('<div class="swiper-slide"><div class="intro-slide-content" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">' + content + '</div></div>');
    };

    // Slide 1: Welcome / Title
    // 使用 Netease 风格的卡片布局
    addSlide(`
        <div class="netease-card">
            <div class="netease-label" style="color:var(--accent-blue)">ENTERING SYSTEM</div>
            <div class="netease-number" style="font-size: clamp(32px, 8vw, 48px);">${DEPT_ID_TO_NAME[deptId]}</div>
            <div class="netease-desc">从这里开始，逐步查看你的年度画像</div>
            <div class="netease-scroll-hint">向下滑动查看更多</div>
        </div>
    `);

    const deptFullName = DEPT_ID_TO_NAME[deptId];
    const isYouziGuestMode = window._youziGuestModeActive === true;
    const titles = {
        cos: { dim1: '平行人生', dim2: '高光瞬间' },
        tech: { dim1: '时光捕手', dim2: '星夜兼程' },
        music: { dim1: '心流时刻', dim2: '灵魂共振' },
        dance: { dim1: '身体记忆', dim2: '挥洒热忱' },
        art: { dim1: '绘梦记录', dim2: '在此诞生' },
        pr: { dim1: '异世界漫游', dim2: '奔赴热爱' }
    };
    const copyStyleNetease = {
        cos: {
            1: (d) => `这一年，你一共走进了 ${d.value} 个角色的世界。每一次变身，都是一次与二次元的久别重逢。`,
            2: (d) => `镜头捕捉了你的光芒，${d.value}${d.keywordSuffix}返图，定格了那些闪闪发光的瞬间。`
        },
        tech: {
            1: (d) => `你习惯躲在取景器后，用 ${d.value}${d.keywordSuffix}的记录，默默守护着大家的珍贵回忆。`,
            2: (d) => `那个 ${d.value} 的深夜，屏幕的光映在脸上，你还在为心中完美的画面修修补补。`
        },
        music: {
            1: (d) => `排练室的墙壁听过你的心跳。这 ${d.value}${d.keywordSuffix}的沉浸，终将变成舞台上的惊艳。`,
            2: (d) => `「${d.value}」是你今年的年度羁绊。无论开心还是难过，只有这首歌最懂你的心事。`
        },
        dance: {
            1: (d) => `身体比语言更诚实。${d.value}${d.keywordSuffix}新动作的背后，是无数次摔倒又站起的坚持。`,
            2: (d) => `为了那几分钟的绽放，你挥洒了 ${d.value}${d.keywordSuffix}的汗水。地板记得你所有的努力。`
        },
        art: {
            1: (d) => `这一年，你笔下诞生了 ${d.value}${d.keywordSuffix}绚丽的世界。是你让想象力有了具体的形状。`,
            2: (d) => `你赋予了 ${d.value}${d.keywordSuffix}原创角色灵魂。对他们来说，你就是创造宇宙的神明。`
        },
        pr: {
            1: (d) => `你在 ${d.value} 部番剧里流连忘返。那些热血与感动，一定也温暖了现实中的你。`,
            2: (d) => `热爱就是要见面。${d.value}${d.keywordSuffix}线下奔赴，让“同好”这个词有了真实的温度。`
        },
        default: {
            1: (d) => `时光流转，你在 ${d.deptName} 留下了 ${d.value}${d.keywordSuffix}足迹。`,
            2: (d) => `回望过去，这是属于你在 ${d.deptName} 的 ${d.value}${d.keywordSuffix}独家记忆。`
        }
    };
    const titleSet = titles[deptId] || { dim1: '年度片段', dim2: '独家记忆' };
    const makeKeywordSuffix = (keywordText) => keywordText ? ('（' + keywordText + '）') : '';
    const buildDeptIntroDesc = (dimension, mode, valueText, topName, keywordText) => {
        if (mode === 'guest') {
            const topText = topName ? ('，最高记录来自' + topName + '。') : '。';
            const section = dimension === 1 ? titleSet.dim1 : titleSet.dim2;
            return '今年' + deptFullName + '在「' + section + '」里累计留下了' + String(valueText) + '份记录' + topText;
        }
        const deptCopy = copyStyleNetease[deptId] || copyStyleNetease.default;
        const renderer = deptCopy[dimension] || copyStyleNetease.default[dimension];
        return renderer({
            deptName: deptFullName,
            value: String(valueText),
            keywordSuffix: makeKeywordSuffix(keywordText || '')
        });
    };

    // 收集该部门所有成员的数据用于统计
    const deptMembers = DB.filter(u => u.deptData && u.deptData[deptFullName]);

    // 计算stats1的统计数据（平均值、最大值）
    const stats1Data = deptMembers
        .map(u => ({ name: u.name, value: u.deptData[deptFullName].stats1 || 0 }))
        .filter(item => item.value > 0);
    const stats1Avg = stats1Data.length > 0 ? Math.round(stats1Data.reduce((sum, item) => sum + item.value, 0) / stats1Data.length) : 0;
    const stats1Max = stats1Data.length > 0 ? stats1Data.reduce((max, item) => item.value > max.value ? item : max, stats1Data[0]) : null;

    // 计算stats2的统计数据（平均值、最大值）- 轻音部除外（因为是文本）
    const stats2Data = deptId !== 'music' ? deptMembers
        .map(u => ({ name: u.name, value: u.deptData[deptFullName].stats2 || 0 }))
        .filter(item => item.value > 0) : [];
    const stats2Avg = stats2Data.length > 0 ? Math.round(stats2Data.reduce((sum, item) => sum + item.value, 0) / stats2Data.length) : 0;
    const stats2Max = stats2Data.length > 0 ? stats2Data.reduce((max, item) => item.value > max.value ? item : max, stats2Data[0]) : null;
    const stats1Total = stats1Data.length > 0 ? stats1Data.reduce((sum, item) => sum + item.value, 0) : 0;
    const stats2Total = stats2Data.length > 0 ? stats2Data.reduce((sum, item) => sum + item.value, 0) : 0;
    const musicSongItems = deptId === 'music'
        ? DB.filter(u => u.deptData && u.deptData['轻音部'] && u.deptData['轻音部'].stats2Raw)
            .map(u => ({ name: u.name, song: u.deptData['轻音部'].stats2Raw }))
            .filter(item => item.song && item.song.trim() !== '' && item.song.trim() !== '0')
        : [];
    let musicTopAuthor = '';
    if (musicSongItems.length > 0) {
        const authorCount = {};
        musicSongItems.forEach(function(item) {
            authorCount[item.name] = (authorCount[item.name] || 0) + 1;
        });
        musicTopAuthor = Object.keys(authorCount).sort(function(a, b) {
            return authorCount[b] - authorCount[a];
        })[0] || '';
    }

    // 辅助函数：判断是否有有效数据（数字>0 或 非空文本）
    const hasValidData = (numVal, rawVal) => {
        if (numVal > 0) return true;
        if (rawVal && String(rawVal).trim() !== '' && String(rawVal).trim() !== '0') return true;
        return false;
    };

    // 辅助函数：获取显示值（优先数字，否则显示原始文本）
    const getDisplayValue = (numVal, rawVal) => {
        if (numVal > 0) return numVal;
        if (rawVal && String(rawVal).trim() !== '') return String(rawVal).trim();
        return '';
    };

    // Slide 2: Question 1
    const stats1Display = isYouziGuestMode
        ? (stats1Total > 0 ? stats1Total : '')
        : getDisplayValue(myData?.stats1, myData?.stats1Raw);
    if (stats1Display) {
        const isNum = typeof stats1Display === 'number';
        // 构建部门统计信息
        let stats1Info = '';
        if (!isYouziGuestMode && stats1Avg > 0 && stats1Max) {
            stats1Info = `<div class="dept-stats-info">部门成员平均: <span class="highlight">${stats1Avg}</span> | 最高: <span class="highlight">${stats1Max.name}</span> (${stats1Max.value})</div>`;
        }
        const stats1Desc = buildDeptIntroDesc(
            1,
            isYouziGuestMode ? 'guest' : 'self',
            stats1Display,
            isYouziGuestMode && stats1Max ? stats1Max.name : '',
            !isYouziGuestMode ? (myData?.stats1Name || '') : ''
        );
        const stats1Label = isYouziGuestMode ? ('今年' + deptFullName + ' · ' + titleSet.dim1) : ('你的年度故事 · ' + titleSet.dim1);
        addSlide(`
            <div class="netease-card">
                <div class="netease-label">${stats1Label}</div>
                <div class="${isNum ? 'netease-number' : 'netease-title'}" style="${!isNum ? 'font-size:clamp(28px, 6vw, 48px); margin:30px 0;' : ''}">${stats1Display}</div>
                <div class="netease-desc">${stats1Desc}</div>
                ${stats1Info}
            </div>
        `);
    }

    // Slide 3: Question 2 - 轻音部特殊处理（显示弹幕）
    const stats2Display = isYouziGuestMode
        ? (deptId === 'music' ? (musicSongItems.length > 0 ? musicSongItems.length : '') : (stats2Total > 0 ? stats2Total : ''))
        : getDisplayValue(myData?.stats2, myData?.stats2Raw);
    if (stats2Display) {
        const isNum = typeof stats2Display === 'number';

        // 轻音部：显示所有人喜欢的歌曲弹幕
        if (deptId === 'music') {
            const allSongs = musicSongItems;
            const musicDesc = buildDeptIntroDesc(
                2,
                isYouziGuestMode ? 'guest' : 'self',
                stats2Display,
                isYouziGuestMode ? (musicTopAuthor || '') : '',
                ''
            );
            const stats2Label = isYouziGuestMode ? ('今年' + deptFullName + ' · ' + titleSet.dim2) : ('你的年度故事 · ' + titleSet.dim2);

            slides.push(`<div class="swiper-slide danmaku-slide"><div class="intro-slide-content" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <div class="danmaku-bg-container">
                    ${allSongs.map((item, i) => `
                        <div class="danmaku-bg-item" data-trigger-type="contribution" data-contributor="${item.name}" style="animation-delay: ${(i * 0.7) % 9}s; top: ${5 + (i * 12) % 85}%; right: -300px;">
                            <span class="danmaku-name">${item.name}</span>：${item.song}
                        </div>
                    `).join('')}
                </div>
                <div class="netease-card">
                    <div class="netease-label">${stats2Label}</div>
                    <div class="netease-title" style="font-size:clamp(28px, 6vw, 48px); margin:30px 0;">${stats2Display}</div>
                    <div class="netease-desc">${musicDesc}</div>
                </div>
            </div></div>`);
        } else {
            // 构建部门统计信息（非轻音部）
            let stats2Info = '';
            if (!isYouziGuestMode && stats2Avg > 0 && stats2Max) {
                stats2Info = `<div class="dept-stats-info">部门成员平均: <span class="highlight">${stats2Avg}</span> | 最高: <span class="highlight">${stats2Max.name}</span> (${stats2Max.value})</div>`;
            }
            const stats2Desc = buildDeptIntroDesc(
                2,
                isYouziGuestMode ? 'guest' : 'self',
                stats2Display,
                isYouziGuestMode && stats2Max ? stats2Max.name : '',
                !isYouziGuestMode ? (myData?.stats2Name || '') : ''
            );
            const stats2Label = isYouziGuestMode ? ('今年' + deptFullName + ' · ' + titleSet.dim2) : ('你的年度故事 · ' + titleSet.dim2);
            addSlide(`
                <div class="netease-card">
                    <div class="netease-label">${stats2Label}</div>
                    <div class="netease-number" style="${!isNum ? 'font-size:clamp(28px, 6vw, 48px); margin:30px 0;' : ''}">${stats2Display}</div>
                    <div class="netease-desc">${stats2Desc}</div>
                    ${stats2Info}
                </div>
            `);
        }
    }

    // Slides: Photos
    if (myImages && myImages.length > 0) {
        myImages.slice(0, 3).forEach(img => {
            // 根据URL判断是视频还是图片，并转义URL防止破坏HTML
            const safeUrl = String(img.url || '').replace(/"/g, '&quot;');
            let mediaHtml;
            if (isVideoUrl(img.url)) {
                mediaHtml = '<video src="' + safeUrl + '" style="max-width:90vw; max-height:60vh; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.5); object-fit:contain;" controls muted playsinline preload="metadata"></video>';
            } else {
                mediaHtml = '<img src="' + safeUrl + '" style="max-width:90vw; max-height:60vh; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.5); object-fit:contain;">';
            }
            addSlide(`
                <div class="netease-card" style="padding:0; overflow:hidden; background:none; max-width:800px;" data-trigger-type="contribution" data-contributor="${String(img.author || '').replace(/"/g, '&quot;')}">
                    <div style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center;">
                        ${mediaHtml}
                        <div class="netease-desc" style="margin-top:20px;">${img.desc || '精彩瞬间'}</div>
                    </div>
                </div>
            `);
        });
    }

    // 如果没有任何数据，显示提示
    const hasAnyStats = stats1Display || stats2Display;
    if (!hasAnyStats && (!myImages || myImages.length === 0)) {
        addSlide(`
            <div class="netease-card">
                <div class="netease-label" style="color: rgba(255,255,255,0.5)">暂无个人数据</div>
                <div class="netease-title" style="font-size: 24px; margin: 20px 0;">你还没有在问卷中填写此部门的数据</div>
                <div class="netease-desc" style="opacity: 0.6;">但你依然可以浏览部门空间~</div>
            </div>
        `);
    }

    // Final Slide: Enter
    addSlide(`
        <div class="netease-card">
            <div class="netease-title" style="font-size:32px; margin-bottom:30px;">ACCESS GRANTED</div>
            <button class="glass-btn" id="enter-dept-btn" style="pointer-events:auto; font-size:18px; padding:15px 40px;">进入部门空间 <span class="btn-arrow">→</span></button>
        </div>
    `);

    // Inject HTML
    modal.innerHTML = `
        <div class="swiper dept-swiper" style="width:100%; height:100%;">
            <div class="swiper-wrapper">
                ${slides.join('')}
            </div>
            <div class="swiper-pagination"></div>
        </div>
    `;

    // Init Swiper
    const swiper = new Swiper('.dept-swiper', {
        direction: 'vertical',
        mousewheel: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        effect: 'fade',
        fadeEffect: { crossFade: true },
        speed: 600,
    });

    // Bind Enter Button
    setTimeout(() => {
        const btn = document.getElementById('enter-dept-btn');
        if(btn) {
            btn.onclick = () => {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.remove();
                    if (onComplete) onComplete();
                }, 500);
            };
        }
    }, 100);
}


function backFromDept() {
    // Remove intro modal if exists
    const modal = document.querySelector('.dept-intro-modal');
    if (modal) modal.remove();

    // 标记当前部门已访问
    let completedDeptId = currentVisitingDept;
    if (currentVisitingDept) {
        visitedDepts.add(currentVisitingDept);
        updateProgressBar();
        if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
            window.YouziAgent.notify('progress_changed', {
                currentDeptName: '',
                completedDeptId: completedDeptId,
                visitedDeptIds: Array.from(visitedDepts)
            });
        }
        // Check if this was the PR dept and if there was a dynamically added overlay
        if (currentVisitingDept === 'pr') {
           const prOverlay = document.querySelector('.dept-summary-overlay');
           if (prOverlay && prOverlay.parentNode) {
               // Ensure clean removal if needed, though innerHTML overwrite does this
           }
        }
        currentVisitingDept = null;
    }
    document.body.classList.remove('phase-dept');
    document.body.classList.remove('phase-report'); // Ensure report mode is off
    document.getElementById('dept-content').innerHTML = ''; // Clean up DOM
    starshipObj.returnToOrbit();
    if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
        window.YouziAgent.notify('returned_system', {
            currentDeptName: '',
            completedDeptId: completedDeptId,
            visitedDeptIds: Array.from(visitedDepts)
        });
    }
}

// 初始化进度条星球点击事件
function initProgressPlanetClicks() {
    document.querySelectorAll('.planet-dot').forEach(dot => {
        if (dot.dataset.youziBound === '1') return;
        dot.dataset.youziBound = '1';
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const deptId = dot.dataset.dept;
            const index = parseInt(dot.dataset.index);
            if (!isNaN(index) && starshipObj) {
                // 飞向对应星球
                starshipObj.goToPlanet(index);
            }
        });
    });
}

function goToPlanetByIndex(index) {
    if (typeof index !== 'number' || isNaN(index) || index < 0) return false;
    if (!starshipObj || typeof starshipObj.goToPlanet !== 'function') return false;
    if (index >= DEPARTMENTS.length) return false;
    const now = Date.now();
    if (index === lastPlanetNavIndex && (now - lastPlanetNavAt) < 900) return true;
    lastPlanetNavIndex = index;
    lastPlanetNavAt = now;
    starshipObj.goToPlanet(index);
    return true;
}
if (typeof window !== 'undefined') window.goToPlanetByIndex = goToPlanetByIndex;

function ensureSystemInteractionFallback() {
    const systemLayer = document.getElementById('system-layer');
    if (systemLayer) systemLayer.style.pointerEvents = 'auto';
    const progressPanel = document.getElementById('progress-panel');
    if (progressPanel) progressPanel.style.pointerEvents = 'auto';
    const labelsContainer = document.getElementById('labels-container');
    if (labelsContainer) labelsContainer.style.pointerEvents = 'auto';

    const sunCard = document.getElementById('sun-card');
    if (sunCard) sunCard.style.cursor = 'pointer';

    document.querySelectorAll('.planet-dot').forEach(dot => {
        dot.style.pointerEvents = 'auto';
        dot.style.cursor = 'pointer';
        if (dot.dataset.fallbackBound === '1') return;
        dot.dataset.fallbackBound = '1';
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            const idx = parseInt(this.dataset.index, 10);
            goToPlanetByIndex(idx);
        }, true);
    });

    document.querySelectorAll('#labels-container .star-card').forEach(card => {
        card.style.pointerEvents = 'auto';
        card.style.cursor = 'pointer';
        if (card.dataset.fallbackBound === '1') return;
        card.dataset.fallbackBound = '1';
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            const idx = parseInt(this.dataset.deptIndex, 10);
            if (!goToPlanetByIndex(idx)) {
                const deptId = this.dataset.deptId || '';
                const resolved = DEPARTMENTS.findIndex(function(d) { return d.id === deptId; });
                goToPlanetByIndex(resolved);
            }
        }, true);
    });

    if (window.__systemGlobalFallbackBound) return;
    window.__systemGlobalFallbackBound = true;

    window.addEventListener('click', function(e) {
        if (!document.body.classList.contains('phase-system')) return;
        if (document.body.classList.contains('phase-dept') || document.body.classList.contains('phase-report')) return;

        const dotTarget = e.target.closest('.planet-dot');
        if (dotTarget) {
            const idx = parseInt(dotTarget.dataset.index, 10);
            goToPlanetByIndex(idx);
            return;
        }

        const cardTarget = e.target.closest('.star-card');
        if (cardTarget) {
            const idx = parseInt(cardTarget.dataset.deptIndex, 10);
            if (!goToPlanetByIndex(idx)) {
                const deptId = cardTarget.dataset.deptId || '';
                const resolved = DEPARTMENTS.findIndex(function(d) { return d.id === deptId; });
                goToPlanetByIndex(resolved);
            }
            return;
        }

        if (e.target.closest('#sun-card')) {
            showReport();
            return;
        }

        if (!raycaster || !camera || !interactables || interactables.length === 0) return;
        if (!mouse && typeof THREE !== 'undefined') mouse = new THREE.Vector2();
        if (!mouse) return;

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (hubMesh) {
            const sunHits = raycaster.intersectObject(hubMesh);
            if (sunHits.length > 0) {
                showReport();
                return;
            }
        }

        const planetHits = raycaster.intersectObjects(interactables);
        if (planetHits.length > 0) {
            const hit = planetHits[0].object;
            const deptId = hit && hit.userData ? hit.userData.id : '';
            const idx = DEPARTMENTS.findIndex(function(d) { return d.id === deptId; });
            goToPlanetByIndex(idx);
        }
    }, true);
}

// 更新进度条
function updateProgressBar() {
    const count = visitedDepts.size;

    // 更新计数
    const countEl = document.getElementById('progress-count');
    if (countEl) countEl.textContent = count;

    // 更新星球点状态
    visitedDepts.forEach(deptId => {
        const dot = document.querySelector(`.planet-dot[data-dept="${deptId}"]`);
        if (dot) dot.classList.add('visited');
    });

    // 更新提示文字
    const hint = document.getElementById('progress-hint');
    const sunCard = document.getElementById('sun-card');
    if (hint) {
        if (count >= 6) {
            hint.textContent = '探索完成 · 恒星已点亮';
            hint.classList.add('complete');
            // 解锁太阳卡片
            if (sunCard) {
                sunCard.classList.remove('locked');
                sunCard.querySelector('.card-data').textContent = '点击进入恒星报告';
                sunCard.querySelector('.card-body').style.animation = 'sunCardPulse 1.5s ease-in-out infinite';
            }
        } else {
            hint.textContent = '你还差 ' + (6 - count) + ' 颗星球 · 恒星报告待解锁';
            hint.classList.remove('complete');
        }
    }
}

// 生成周常照片展示区HTML（照片数据为Base64格式）
function renderWeeklyPhotos(deptName) {
    const photos = WEEKLY_PHOTOS[deptName];
    if (!photos || photos.length === 0) return '';

    let photosHtml = '';

    if (deptName === '技术部') {
         photos.forEach((photoSrc, index) => {
            photosHtml += '<div class="weekly-photo-item scroll-animate-item tech-item" onclick="openPhotoModal(this)" data-src="' + photoSrc + '">' +
                '<div class="tech-border-corner top-left"></div>' +
                '<div class="tech-border-corner top-right"></div>' +
                '<div class="tech-border-corner bottom-left"></div>' +
                '<div class="tech-border-corner bottom-right"></div>' +
                '<img src="' + photoSrc + '" alt="TECH_LOG_' + index + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
            '</div>';
        });
    } else if (deptName === 'COS部') {
        photos.forEach((photoSrc, index) => {
            const rotate = (Math.random() * 6 - 3).toFixed(1);
            photosHtml += '<div class="weekly-photo-item scroll-animate-item cos-item" onclick="openPhotoModal(this)" data-src="' + photoSrc + '" style="--rotate:' + rotate + 'deg">' +
                '<div class="cos-frame-inner">' +
                    '<img src="' + photoSrc + '" alt="COS_' + index + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
                '</div>' +
                '<div class="photo-overlay" style="color:#333; background:rgba(255,255,255,0.8); font-family:cursive;">Memories...</div>' +
            '</div>';
        });
    } else if (deptName === '轻音部') {
        photos.forEach((photoSrc, index) => {
            photosHtml += '<div class="weekly-photo-item scroll-animate-item music-item" onclick="openPhotoModal(this)" data-src="' + photoSrc + '">' +
                '<div class="music-disc">' +
                     '<img src="' + photoSrc + '" alt="MUSIC_' + index + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
                     '<div class="disc-hole"></div>' +
                '</div>' +
                '<div class="photo-overlay">▶ PLAY</div>' +
            '</div>';
        });
    } else if (deptName === '原创部') {
         photos.forEach((photoSrc, index) => {
            const rotate = (Math.random() * 4 - 2).toFixed(1);
            photosHtml += '<div class="weekly-photo-item scroll-animate-item art-item" onclick="openPhotoModal(this)" data-src="' + photoSrc + '" style="--rotate:' + rotate + 'deg">' +
                '<img src="' + photoSrc + '" alt="ART_' + index + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
                '<div class="art-tape"></div>' +
                '<div class="photo-overlay" style="color:#000; background:rgba(255,255,255,0.8);">Untitled ' + (index+1) + '</div>' +
            '</div>';
        });
    } else if (deptName === '舞装部') {
         photos.forEach((photoSrc, index) => {
            photosHtml += '<div class="weekly-photo-item scroll-animate-item dance-item" onclick="openPhotoModal(this)" data-src="' + photoSrc + '">' +
                '<img src="' + photoSrc + '" alt="DANCE_' + index + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
                '<div class="dance-spotlight"></div>' +
                '<div class="photo-overlay">Stage On!</div>' +
            '</div>';
        });
    } else if (deptName === '外宣部') {
         photos.forEach((photoSrc, index) => {
            photosHtml += '<div class="weekly-photo-item scroll-animate-item pr-item" onclick="openPhotoModal(this)" data-src="' + photoSrc + '">' +
                '<div class="pr-header">' +
                    '<div class="pr-avatar"></div>' +
                    '<div class="pr-name">ZUOYOU_official</div>' +
                '</div>' +
                '<img src="' + photoSrc + '" alt="PR_' + index + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
                '<div class="pr-actions">♥ ⚡ ➢</div>' +
            '</div>';
        });
    } else {
        photos.forEach((photoSrc, index) => {
            photosHtml += '<div class="weekly-photo-item scroll-animate-item" onclick="openPhotoModal(this)" data-src="' + photoSrc + '">' +
                '<img src="' + photoSrc + '" alt="活动照片' + (index + 1) + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'">' +
                '<div class="photo-overlay">点击查看大图</div>' +
            '</div>';
        });
    }

    const typeClass = deptName === '技术部' ? 'tech' :
                      deptName === 'COS部' ? 'cos' :
                      deptName === '轻音部' ? 'music' :
                      deptName === '原创部' ? 'art' :
                      deptName === '舞装部' ? 'dance' :
                      deptName === '外宣部' ? 'pr' : 'normal';

    return '<div class="weekly-photos-section">' +
        '<h2 class="weekly-photos-title">周常活动精彩瞬间</h2>' +
        '<div class="weekly-photos-grid type-' + typeClass + '">' + photosHtml + '</div>' +
    '</div>';
}

// 照片查看模态框
function openPhotoModal(element) {
    if (Date.now() < deptClickGuardUntil) return;
    const src = element.dataset.src || element.querySelector('img').src;
    let modal = document.getElementById('photo-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'photo-modal';
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <button class="photo-modal-close" onclick="closePhotoModal()">✕</button>
            <img src="" alt="大图预览">
        `;
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePhotoModal();
        });
        document.body.appendChild(modal);
    }
    modal.querySelector('img').src = src;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePhotoModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// COS部渲染 (figure8 + cos风格)
function renderCosDept(deptName, otherImages, isInDept, members, myImages) {
    let compareHtml = '';
    if (isInDept && currentUser.deptData && currentUser.deptData[deptName]) {
        const myData = currentUser.deptData[deptName];
        const avgStats = calculateDeptAverage(deptName, members);
        compareHtml = `
        <!-- Modified: Redesigned COS Dept Performance Panel -->
        <style>
            .cos-stats-panel {
                margin: 40px auto;
                max-width: 90%;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 10px 30px rgba(255, 105, 180, 0.2);
                overflow: hidden;
                position: relative;
                color: #fff;
                font-family: 'Noto Sans SC', sans-serif;
            }
            .cos-stats-panel::before {
                content: '';
                position: absolute;
                top: -50px; left: -50px;
                width: 150px; height: 150px;
                background: radial-gradient(circle, rgba(255,105,180,0.4) 0%, transparent 70%);
                z-index: 0;
            }
            .cos-stats-header {
                padding: 15px 20px;
                background: rgba(255, 105, 180, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cos-stats-title {
                font-weight: 700;
                letter-spacing: 2px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .cos-badge {
                background: #ff69b4;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: bold;
            }
            .cos-stats-body {
                padding: 30px 20px;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: relative;
                z-index: 1;
            }
            .stat-group {
                text-align: center;
                flex: 1;
            }
            .stat-value-big {
                font-size: 48px;
                font-weight: 800;
                line-height: 1;
                margin-bottom: 5px;
                color: #ffffff;
                text-shadow: 0 0 15px rgba(255,105,180,0.6), 0 0 30px rgba(255,105,180,0.3);
                /* Removed gradient text fill to improve readability */
            }
            .stat-label-modern {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            .stat-divider-vertical {
                width: 1px;
                height: 60px;
                background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.5), transparent);
            }
            .cos-progress-mini {
                margin-top: 10px;
                height: 6px;
                background: rgba(0,0,0,0.3);
                border-radius: 3px;
                width: 80%;
                margin-left: auto;
                margin-right: auto;
                overflow: hidden;
            }
            .cos-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff69b4, #ff1493);
                border-radius: 3px;
            }
            .cos-footer {
                padding: 10px 20px;
                background: rgba(0, 0, 0, 0.2);
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                text-align: right;
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 15px;
            }
            .avg-tag {
                background: rgba(255,255,255,0.1);
                padding: 2px 6px;
                border-radius: 4px;
            }
    </style>
        <div class="cos-stats-panel scroll-animate-item">
            <div class="cos-stats-header">
                <div class="cos-stats-title">
                    <span>YOUR PERFORMANCE</span>
                    <span class="cos-badge">2025</span>
                </div>
                <div style="font-size: 20px;">🌸</div>
            </div>
            <div class="cos-stats-body">
                <div class="stat-group">
                    <div class="stat-value-big">${myData.stats1 || 0}</div>
                    <div class="stat-label-modern">${myData.stats1Name || 'COS次数'}</div>
                    <div class="cos-progress-mini">
                        <div class="cos-progress-fill" style="width:${Math.min(100, (myData.stats1/Math.max(1,avgStats.stats1)*100))}%;"></div>
                    </div>
                </div>
                <div class="stat-divider-vertical"></div>
                <div class="stat-group">
                    <div class="stat-value-big">${myData.stats2 || 0}</div>
                    <div class="stat-label-modern">${myData.stats2Name || '返图数量'}</div>
                    <div class="cos-progress-mini">
                        <div class="cos-progress-fill" style="width:${Math.min(100, (myData.stats2/Math.max(1,avgStats.stats2)*100))}%; background: linear-gradient(90deg, #e91e63, #ff69b4);"></div>
                    </div>
                </div>
            </div>
            <div class="cos-footer">
                <span>DEPT AVERAGE:</span>
                <span class="avg-tag">${myData.stats1Name} ${avgStats.stats1.toFixed(1)}</span>
                <span class="avg-tag">${myData.stats2Name} ${avgStats.stats2.toFixed(1)}</span>
            </div>
        </div>`;
    }

    // Build Featured Images HTML (Standard "cos-item" style + Hidden State)
    let featuredHtml = '';
    let safeMyImages = myImages || [];
    if (safeMyImages.length > 0) {
        let featuredItems = '';
        for (let i = 0; i < safeMyImages.length; i++) {
            const img = safeMyImages[i];
            /* 使用 cos-item 标准样式，附加 featured-hidden 和 featured-highlight */
            featuredItems += '<div class="photo-item scroll-animate-item featured-highlight clickable-img" data-featured="true" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
            featuredItems += '<span class="featured-badge">YOUR TRACE</span>';
            featuredItems += '<img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/300/200?random=\'+Math.random()">';
            featuredItems += '<div class="desc" style="width:100%"><strong>' + img.author + '</strong>: ' + (img.desc || 'Featured') + '</div>';
            featuredItems += '</div>';
        }
        featuredHtml = featuredItems;
    }

    return `<div class="dept-cos" data-trigger-type="dept" data-trigger-value="COS部">
        <div class="cos-container">
            <div class="header-bar">
                <div style="font-size:1.5rem;">♥ COS_ARCHIVE // 2025</div>
                <div>成员: ${members.length}人</div>
            </div>
            <h1 class="hero-title">COSPLAY MEMORIES</h1>
            ${renderWeeklyPhotos('COS部')}
            ${compareHtml}
            <div class="window-card">
                <div class="window-header">📁 Photo_Gallery</div>
                <div class="window-content">
                    ${featuredHtml}
                    ${otherImages.length > 0 ? (() => {
                        let html = '';
                        for (let i = 0; i < otherImages.length; i++) {
                            const img = otherImages[i];
                            html += '<div class="photo-item scroll-animate-item clickable-img" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '精彩瞬间') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
                            html += '<img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/300/200?random=\'+Math.random()">';
                            html += '<div class="desc"><strong>' + img.author + '</strong>: ' + (img.desc || '精彩瞬间') + '</div>';
                            html += '</div>';
                        }
                        return html;
                    })() : (featuredHtml ? '' : '<p style="padding:20px; color:#5c0f28;">暂无照片分享</p>')}
                </div>
            </div>
        </div>
    </div>`;
}

// 技术部渲染 (figure1 + tech风格)
function renderTechDept(deptName, otherImages, isInDept, members, myImages) {
    let compareHtml = '';
    if (isInDept && currentUser.deptData && currentUser.deptData[deptName]) {
        const myData = currentUser.deptData[deptName];
        compareHtml = `
        <div class="typo-box scroll-animate-item">
            <h2 style="color:#0000ff; margin-bottom:15px;">// YOUR_STATS</h2>
            <p>${myData.stats1Name}: <strong>${myData.stats1 || 0}</strong></p>
            <p>${myData.stats2Name}: <strong>${myData.stats2 || 0}</strong></p>
        </div>`;
    }

    // Build Featured (Standard "gallery-item" style)
    let featuredHtml = '';
    let safeMyImages = myImages || [];
    if (safeMyImages.length > 0) {
        let featuredItems = '';
        for (let i = 0; i < safeMyImages.length; i++) {
            const img = safeMyImages[i];
            featuredItems += '<div class="gallery-item scroll-animate-item featured-highlight clickable-img" data-featured="true" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
            featuredItems += '<span class="featured-badge">DATA_TRACE</span>';
            featuredItems += '<img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/400/300?random=\'+Math.random()">';
            featuredItems += '<div class="overlay">FEATURED // ' + img.author + '</div>';
            featuredItems += '</div>';
        }
        featuredHtml = featuredItems;
    }

    let otherItemsHtml = '';
    for (let i = 0; i < otherImages.length; i++) {
        const img = otherImages[i];
        otherItemsHtml += '<div class="gallery-item scroll-animate-item clickable-img" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || 'ASSET') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
        otherItemsHtml += '<img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/400/300?random=\'+Math.random()">';
        otherItemsHtml += '<div class="overlay">' + img.author + ': ' + (img.desc || 'ASSET') + '</div>';
        otherItemsHtml += '</div>';
    }

    return `<div class="dept-tech" data-trigger-type="dept" data-trigger-value="技术部">
        <div class="bg-grid"></div>
        <div class="container">
            <h1>TECH</h1>
            ${renderWeeklyPhotos('技术部')}
            ${compareHtml}
            <div class="gallery">
                ${featuredHtml}
                ${otherItemsHtml}
                ${(otherImages.length === 0 && !featuredHtml) ? '<div class="typo-box scroll-animate-item" style="break-inside: avoid;">// NO_DATA_FOUND</div>' : ''}
            </div>
        </div>
    </div>`;
}

// 轻音部渲染 (figure7 + K-on风格)
function renderMusicDept(deptName, otherImages, isInDept, members, myImages) {
    let compareHtml = '';
    if (isInDept && currentUser.deptData && currentUser.deptData[deptName]) {
        const myData = currentUser.deptData[deptName];
        compareHtml = `
        <div class="grid-item scroll-animate-item" style="background:#fff;">
            <span class="badge">YOUR STATS</span>
            <div style="font-size:3rem; font-weight:900; margin-top:20px;">${myData.stats1 || 0}h</div>
            <p style="font-weight:600; border-top:3px solid #000; padding-top:10px;">${myData.stats1Name}</p>
            <p style="margin-top:10px; font-size:14px;">${myData.stats2Name}: ${myData.stats2 || '暂无'}</p>
        </div>`;
    }

    // Build Featured (Standard "grid-item" style)
    let featuredHtml = '';
    let safeMyImages = myImages || [];
    if (safeMyImages.length > 0) {
        let featuredItems = '';
        for (let i = 0; i < safeMyImages.length; i++) {
            const img = safeMyImages[i];
            featuredItems += '<div class="grid-item scroll-animate-item featured-highlight clickable-img" data-featured="true" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
            featuredItems += '<span class="badge">YOUR TRACK</span>';
            /* Match structure of other items */
            featuredItems += '<div class="poster-image"><img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/400/300?random=\'+Math.random()"></div>';
            featuredItems += '<div style="margin-top:10px; padding:5px; border-radius:4px; font-weight:bold; color:#d4af37;">📀 ' + img.author + '</div>';
            featuredItems += '</div>';
        }
        featuredHtml = featuredItems;
    }

    return `<div class="dept-music" data-trigger-type="dept" data-trigger-value="轻音部">
        <div class="container">
            <h1><span class="highlight-text">LIVE</span> STAGE</h1>
            <div class="marquee-container">
                <div class="marquee-content">/// ZUOYOU MUSIC CLUB /// KEEP ROCKING /// HIGH VOLTAGE /// </div>
                <div class="marquee-content">/// ZUOYOU MUSIC CLUB /// KEEP ROCKING /// HIGH VOLTAGE /// </div>
            </div>
            <div style="position:relative;">
                ${renderWeeklyPhotos('轻音部')}
                <!-- 墨绿色向下箭头提示 - 位于周常区域右下角 -->
                <div style="position:absolute; right:-80px; bottom:20px; display:flex; flex-direction:column; align-items:center; animation:bounceArrow 1.5s ease-in-out infinite;">
                    <svg width="70" height="90" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 0 L25 45 M10 35 L25 50 L40 35" stroke="#2F4F4F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            <style>
                @keyframes bounceArrow { 0%, 100% { transform: translateY(0); opacity: 0.8; } 50% { transform: translateY(15px); opacity: 1; } }
    </style>
            <div class="grid-container">
                ${compareHtml}
                ${featuredHtml}
                ${otherImages.length > 0 ? (() => {
                    let html = '';
                    for (let i = 0; i < otherImages.length; i++) {
                        const img = otherImages[i];
                        html += '<div class="grid-item scroll-animate-item clickable-img" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || 'Live moment') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
                        html += '<span class="badge">MEMORY</span>';
                        html += '<div class="poster-image"><img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/400/300?random=\'+Math.random()"></div>';
                        html += '<p style="margin-top:10px; font-weight:600;">' + img.author + ': ' + (img.desc || 'Live moment') + '</p>';
                        html += '</div>';
                    }
                    return html;
                })() : (featuredHtml ? '' : '<div style="color:#fff">暂无照片</div>')}
            </div>
        </div>
    </div>`;
}

// 舞装部渲染 (figure6 + dance风格)
function renderDanceDept(deptName, otherImages, isInDept, members, myImages) {
    let compareHtml = '';
    if (isInDept && currentUser.deptData && currentUser.deptData[deptName]) {
        const myData = currentUser.deptData[deptName];
        compareHtml = `
        <div class="glass-card scroll-animate-item">
            <h2 style="font-size:2rem; margin-bottom:15px;">Your Performance</h2>
            <p style="color:#aaa;">${myData.stats1Name}: <strong style="color:#fff; font-size:2rem;">${myData.stats1 || 0}</strong></p>
            <p style="color:#aaa;">${myData.stats2Name}: <strong style="color:#fff; font-size:2rem;">${myData.stats2 || 0}</strong></p>
        </div>`;
    }

    // Build Featured (Standard "dance-card" style)
    let featuredHtml = '';
    let safeMyImages = myImages || [];
    if (safeMyImages.length > 0) {
        let featuredItems = '';
        for (let i = 0; i < safeMyImages.length; i++) {
            const img = safeMyImages[i];
            // 转义所有属性值防止破坏HTML结构
            const safeUrl = String(img.url || '').replace(/"/g, '&quot;');
            const safeAuthor = String(img.author || '').replace(/"/g, '&quot;');
            const safeDesc = String(img.desc || '').replace(/"/g, '&quot;');
            featuredItems += '<div class="dance-card scroll-animate-item featured-highlight clickable-img" data-featured="true" data-url="' + safeUrl + '" data-author="' + safeAuthor + '" data-desc="' + safeDesc + '" data-trigger-type="contribution" data-contributor="' + safeAuthor + '" style="cursor:pointer;">';
            featuredItems += '<div style="position:absolute; top:10px; right:10px; background:#ffd700; color:#000; padding:2px 8px; border-radius:4px; z-index:10; font-weight:bold; box-shadow:0 0 10px rgba(0,0,0,0.5);">Star</div>';
            if (window.isVideoUrl(img.url)) {
                featuredItems += '<div style="position:absolute; top:10px; left:10px; background:rgba(0, 0, 0, 0.6); color:#fff; border: 1px solid rgba(255,255,255,0.7); padding:2px 8px; border-radius:4px; z-index:10; font-weight:bold; box-shadow:0 0 10px rgba(0,0,0,0.5);">VIDEO</div>';
            }
            featuredItems += window.getMediaHtml(img.url, '', '', "this.src='https://picsum.photos/600/800?random='+Math.random()");
            featuredItems += '<div class="text"><h2>' + safeAuthor + '</h2><p>' + safeDesc + '</p></div>';
            featuredItems += '</div>';
        }
        featuredHtml = featuredItems;
    }

    let otherItemsHtml = '';
    for (let i = 0; i < otherImages.length; i++) {
        const img = otherImages[i];
        // 转义所有属性值防止破坏HTML结构
        const safeUrl = String(img.url || '').replace(/"/g, '&quot;');
        const safeAuthor = String(img.author || '').replace(/"/g, '&quot;');
        const safeDesc = String(img.desc || '').replace(/"/g, '&quot;');
        otherItemsHtml += '<div class="dance-card scroll-animate-item clickable-img" data-url="' + safeUrl + '" data-author="' + safeAuthor + '" data-desc="' + safeDesc + '" data-trigger-type="contribution" data-contributor="' + safeAuthor + '" style="cursor:pointer;">';
        if (window.isVideoUrl(img.url)) {
            otherItemsHtml += '<div style="position:absolute; top:10px; right:10px; background:rgba(0, 0, 0, 0.6); color:#fff; border: 1px solid rgba(255,255,255,0.7); padding:2px 8px; border-radius:4px; z-index:10; font-weight:bold; box-shadow:0 0 10px rgba(0,0,0,0.5);">VIDEO</div>';
        }
        otherItemsHtml += window.getMediaHtml(img.url, '', '', "this.src='https://picsum.photos/600/800?random='+Math.random()");
        otherItemsHtml += '<div class="text"><h2>' + safeAuthor + '</h2><p>' + safeDesc + '</p></div>';
        otherItemsHtml += '</div>';
    }

    return `<div class="dept-dance" data-trigger-type="dept" data-trigger-value="舞装部">
        <div class="ambient-light">
            <div class="light-orb orb-1"></div>
            <div class="light-orb orb-2"></div>
        </div>
        <div class="container">
            <h1 class="hero-text">Dance</h1>
            ${renderWeeklyPhotos('舞装部')}
            ${compareHtml}
            <div class="gallery">
                ${featuredHtml}
                ${otherItemsHtml}
                ${(otherImages.length === 0 && !featuredHtml) ? '<div class="glass-card scroll-animate-item" style="flex:1; text-align:center;"><p>暂无照片</p></div>' : ''}
            </div>
        </div>
    </div>`;
}

// 原创部渲染 (figure4 + ori风格)
function renderArtDept(deptName, otherImages, isInDept, members, myImages) {
    let compareHtml = '';
    if (isInDept && currentUser.deptData && currentUser.deptData[deptName]) {
        const myData = currentUser.deptData[deptName];
        compareHtml = `
        <div class="sticker scroll-animate-item" style="top:100px; right:50px;">
            ${myData.stats1Name}: ${myData.stats1 || 0} / ${myData.stats2Name}: ${myData.stats2 || 0}
        </div>`;
    }

    // Build Featured (Standard "art-piece" style)
    let featuredHtml = '';
    let safeMyImages = myImages || [];
    if (safeMyImages.length > 0) {
        let featuredItems = '';
        for (let i = 0; i < safeMyImages.length; i++) {
            const img = safeMyImages[i];
            featuredItems += '<div class="art-piece scroll-animate-item featured-highlight clickable-img" data-featured="true" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
            featuredItems += '<div class="sticker" style="top:-10px; right:-10px; background:gold; color:black; border:1px solid #000;">★ MASTERPIECE</div>';
            featuredItems += '<img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/600/800?random=\'+Math.random()">';
            featuredItems += '<div class="art-info"><div class="art-title">' + img.author + '</div><div class="art-desc">' + (img.desc || 'Featured Work') + '</div></div>';
            featuredItems += '</div>';
        }
        featuredHtml = featuredItems;
    }

    let otherItemsHtml = '';
    for (let i = 0; i < otherImages.length; i++) {
        const img = otherImages[i];
        otherItemsHtml += '<div class="art-piece scroll-animate-item clickable-img" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '无题') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
        otherItemsHtml += '<img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/400/300?random=\'+Math.random()">';
        otherItemsHtml += '<div class="art-info"><div class="art-title">' + (img.desc || '无题') + '</div><div class="art-desc">by ' + img.author + ' / 2025</div></div>';
        otherItemsHtml += '</div>';
    }

    return `<div class="dept-art" data-trigger-type="dept" data-trigger-value="原创部">
        <div class="container">
            <h1 class="glitch-text">ORIGINAL ARTWORKS</h1>
            ${renderWeeklyPhotos('原创部')}
            ${compareHtml}
            <div class="gallery-container">
                ${featuredHtml}
                ${otherItemsHtml}
                ${(otherImages.length === 0 && !featuredHtml) ? '<div class="art-piece scroll-animate-item"><div class="art-info"><div class="art-title">敬请期待</div></div></div>' : ''}
            </div>
        </div>
    </div>`;
}

// 外宣部渲染 (figure3 + fantasy漫画风格)
function renderPrDept(deptName, otherImages, isInDept, members, myImages) {
    let overlayHtml = '';
   /* Overlay removed */
    // 移除compareHtml，因为白色字体在漫画页面上不可见
    let compareHtml = '';

    // 外宣顶部叙事气泡（随滚动切换：公众号 / B站；点击跳转最热视频/文章）
    const wxCount = (typeof WEIXIN_ARTICLES !== 'undefined' && Array.isArray(WEIXIN_ARTICLES)) ? WEIXIN_ARTICLES.length : 0;
    const biliCount = (typeof BILIBILI_VIDEOS !== 'undefined' && Array.isArray(BILIBILI_VIDEOS)) ? BILIBILI_VIDEOS.length : 0;
    const prStoryHtml = (wxCount > 0 || biliCount > 0) ? (
        '<div class="pr-story" data-pr-story>' +
            '<div class="pr-story-bubble" data-pr-story-bubble role="group" aria-label="外宣叙事">' +
                '<div class="pr-story-kicker">YEAR 2025 · OUTREACH LOG</div>' +
                '<div class="pr-story-text" data-pr-story-text>外宣部年度回响已生成。</div>' +
                '<div class="pr-story-hint" data-pr-story-hint>向下滑动，开始阅读</div>' +
            '</div>' +
        '</div>'
    ) : '';

    // Build Featured
    let featuredHtml = '';
    let safeMyImages = myImages || [];
    if (safeMyImages.length > 0) {
        let featuredItems = '';
        for (let i = 0; i < safeMyImages.length; i++) {
            const img = safeMyImages[i];
            featuredItems += '<div class="panel scroll-animate-item dept-pr clickable-img featured-highlight" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer; border: 4px solid gold;">';
            featuredItems += '<div class="bubble" style="top:5px; bottom:auto; background:gold; color:black; font-weight:bold; border:2px solid black;">HEADLINE NEWS!</div>';
            featuredItems += '<img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/400/300?random=\'+Math.random()">';
            featuredItems += '<div class="bubble"><strong>' + img.author + '</strong>: ' + (img.desc || '') + '</div>';
            featuredItems += '<div class="sfx">WOW!</div>';
            featuredItems += '</div>';
        }
        featuredHtml = featuredItems;
    }

    const panels = otherImages;
    let otherPanelsHtml = '';
    for (let i = 1; i < panels.length; i++) {
        const img = panels[i];
        const panelClass = (i === 3) ? 'panel-half' : '';
        const sfx = ['BOOM', 'SNAP', 'CLICK'][i % 3];
        const sfxTop = (Math.random() * 50).toFixed(0);
        const sfxLeft = (Math.random() * 50).toFixed(0);
        otherPanelsHtml += '<div class="panel scroll-animate-item clickable-img ' + panelClass + '" data-url="' + img.url + '" data-author="' + img.author + '" data-desc="' + (img.desc || '精彩瞬间') + '" data-trigger-type="contribution" data-contributor="' + img.author + '" style="cursor:pointer;">';
        otherPanelsHtml += '<div class="panel-img-wrapper"><img src="' + img.url + '" alt="" onerror="this.src=\'https://picsum.photos/300/200?random=\'+Math.random()"></div>';
        otherPanelsHtml += '<div class="panel-caption"><strong>' + img.author + '</strong>: ' + (img.desc || '精彩瞬间') + '</div>';
        otherPanelsHtml += '<div class="sfx" style="top:' + sfxTop + '%; left:' + sfxLeft + '%">' + sfx + '</div>';
        otherPanelsHtml += '</div>';
    }

    // 生成影响力看板HTML
    const influenceDashboardHtml = renderInfluenceDashboard();

    return `<div class="dept-pr" data-trigger-type="dept" data-trigger-value="外宣部" style="position:relative;">
        ${overlayHtml}
        <div class="comic-page">
            <div class="comic-nav">
                <div>OUTREACH DEPT. LOGS</div>
                <div>VOL.2025</div>
            </div>
            ${prStoryHtml}
            ${influenceDashboardHtml}
            ${renderWeeklyPhotos('外宣部')}
            ${featuredHtml}
            ${panels.length > 0 ? `
                <div class="panel scroll-animate-item panel-full clickable-img" data-url="${panels[0].url}" data-author="${panels[0].author}" data-desc="${panels[0].desc || '精彩瞬间!'}" data-trigger-type="contribution" data-contributor="${panels[0].author}" style="cursor:pointer;">
                    <img src="${panels[0].url}" alt="" onerror="this.style.background='#eee'">
                    <div class="bubble"><strong>${panels[0].author}</strong>: ${panels[0].desc || '精彩瞬间!'}</div>
                </div>
            ` : ''}
            ${compareHtml}
            ${otherPanelsHtml}
            ${panels.length === 0 && !featuredHtml ? '<div class="panel scroll-animate-item panel-full" style="display:flex;align-items:center;justify-content:center;">To Be Continued...</div>' : ''}
        </div>
    </div>`;
}

// 外宣星球顶部叙事初始化：随滚动切换网易云风格引导文案（无跳转）
;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();
