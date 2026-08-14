// ============================================================
// components/report-slides.js - 年度报告幻灯片组件
// 从 generator.html 提取
// 包含: renderSlides, attachReportSwipeHints, initRevealLogic
// 依赖全局: DB, currentUser, DEPARTMENTS, WEIXIN_ARTICLES,
//          initImageLightbox, deptClickGuardUntil
// ============================================================

function escapeSlideText(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getUserPersonaTags(user) {
    const tags = [];
    if (user && user.commonData && user.commonData.isFreeSpirit) tags.push('神秘自由人');

    (user.depts || []).forEach(function(deptName) {
        const roleList = user.deptData && user.deptData[deptName] ? user.deptData[deptName].roles : [];
        (roleList || []).forEach(function(role) {
            const cleanRole = String(role || '').trim();
            if (!cleanRole) return;
            const tag = deptName + '·' + cleanRole;
            if (tags.indexOf(tag) === -1) tags.push(tag);
        });
    });

    return tags.slice(0, 8);
}

function renderPersonaTags(tags) {
    if (!Array.isArray(tags) || !tags.length) return '';
    return tags.map(function(tag) {
        return '<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;border:1px solid rgba(167,139,250,.28);background:rgba(124,58,237,.12);color:#efe7ff;font-size:12px;line-height:1.2;">' + escapeSlideText(tag) + '</span>';
    }).join('');
}

function renderSlides(user) {
    let html = '';
    const personaTags = getUserPersonaTags(user);
    const deptSummary = (user.depts && user.depts.length)
        ? user.depts.join(' & ')
        : ((user.commonData && user.commonData.isFreeSpirit) ? '神秘自由人' : '未标注');

    // [NEW] KINETIC WELCOME SLIDE
    html += `
    <div class="swiper-slide">
        <div class="netease-card">
            <div class="card-deco-grid">
                <div class="card-deco-dot"></div><div class="card-deco-dot"></div><div class="card-deco-dot"></div>
            </div>
            <div class="netease-label">IDENTITY VERIFIED</div>
            <div class="netease-number" style="font-size: clamp(40px, 8vw, 80px); white-space: nowrap; margin: 20px 0;">${user.name}</div>

            <div class="netease-desc" style="width: 100%; border:none; padding:0; margin-top:10px;">
                <div style="display:flex; align-items:center; gap:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px; margin-bottom:15px;">
                    <div style="background:var(--accent-blue); width:4px; height:4px; box-shadow:0 0 10px var(--accent-blue);"></div>
                    <span style="font-family:'Orbitron'; color:var(--accent-blue); font-size:12px; letter-spacing:2px;">${user.joinTime || 'UNKNOWN TIME'}</span>
                    <span style="opacity:0.4; font-size:10px; margin-left:auto;">[ LOGGED IN ]</span>
                </div>
                <div style="font-family:'Noto Sans SC'; font-size:14px; color:rgba(255,255,255,0.7);">
                    所属部门 // <span style="color:#fff;">${deptSummary}</span>
                </div>
                ${personaTags.length ? `
                <div style="margin-top:14px; display:flex; flex-wrap:wrap; gap:8px;">
                    ${renderPersonaTags(personaTags)}
                </div>` : ''}
            </div>
        </div>
    </div>`;

    if (personaTags.length > 0) {
        html += `
        <div class="swiper-slide">
            <div class="netease-card">
                <div class="card-deco-grid">
                    <div class="card-deco-dot"></div><div class="card-deco-dot"></div><div class="card-deco-dot"></div>
                </div>
                <div class="netease-label">PERSONA EXTRACT</div>
                <div class="netease-title" style="margin-bottom:14px;">你的社团角色画像</div>
                <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin:18px 0 20px;">
                    ${renderPersonaTags(personaTags)}
                </div>
                <div class="netease-desc" style="border:none; padding:0; max-width:100%; font-size:13px; opacity:.78;">
                    这些标签勾勒出你在佐佑留下的独特坐标，也拼出了属于你的社团侧写。
                </div>
            </div>
        </div>`;
    }

    // ===== 全屏文字转场页 (Refactored) =====
    // 1) 社团总投稿
    const clubTotalSubmissions = DB.reduce((sum, u) => {
        if (!u || !u.deptData) return sum;
        Object.keys(u.deptData).forEach(k => {
            const imgs = u.deptData[k] && u.deptData[k].images;
            if (Array.isArray(imgs)) sum += imgs.length;
        });
        return sum;
    }, 0);
    if (clubTotalSubmissions > 0) {
        html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">SYSTEM ARCHIVE</div>
                <div class="transition-title" data-reveal style="--d:0.35s">社团全域数据收录</div>
                <div class="transition-metric" data-val="${clubTotalSubmissions}" data-reveal style="--d:0.55s">${clubTotalSubmissions}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.75s">份时空坐标已归档<br>正在加载你的个人轨迹...</div>
            </div>
        </div>`;
    }

    // （外宣发布量与 COS 相关的转场已移出最终报告：外宣放回外宣星球档案顶部；COS 转场按需求移除）

    // 汇总页：部门投稿统计
    const deptStats = [];
    let totalSubmissions = 0;
    const userDepts = user.depts || [];

    userDepts.forEach(deptName => {
        const deptData = user.deptData[deptName];
        // 计算投稿/产出数量
        // 逻辑：尝试从deptData.images获取，如果没有则看stats1/2是否暗示数量
        // COS: stats1=出角数, stats2=返图
        // Tech: stats2=快门数
        // Music: stats1=排练时长
        // Art: stats1=产出数
        // Dance: stats1=舞数量
        // PR: stats2=活动次数
        // 这里统一使用 "部门痕迹" (图片数量)，或者根据不同部门取最有意义的 "数量型" 指标

        let count = 0;
        // 方法1: 优先使用图片数量 (最准确的"留下痕迹")
        if (deptData && deptData.images && deptData.images.length > 0) {
             count = deptData.images.length;
        } else if (deptData) {
            // 方法2: 降级到统计数据
            if (deptName === 'COS部') count = deptData.stats1 || 0;
            else if (deptName === '技术部') count = 0; // 技术部主要是幕后，图片可能不多，stats2是快门数往往很大，这里可能只用图片数更合适
            else if (deptName === '原创部') count = deptData.stats1 || 0;
            else if (deptName === '舞装部') count = deptData.stats1 || 0;
            // 其他部门没有明确的"作品数"在stats里
        }

        // 修正：根据用户需求 "在XX, YY部留下痕迹，分布投稿数为..."
        // 这暗示主要是指作品/图片投稿。
        // 重新检查数据源，images数组是在Excel解析阶段生成的。
        if (deptData && deptData.images) {
            count = deptData.images.length;
        }

        if (count > 0 || userDepts.includes(deptName)) {
             // 只要是部员，即使count0也显示？用户说"分布投稿数"， implied count.
             // 仅添加有数据的
             if (count > 0) {
                deptStats.push({ name: deptName, count: count });
                totalSubmissions += count;
             }
        }
    });

    // [TRANSITION] YOUR TRAIL
    if (userDepts.length > 0) {
        html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">TRAJECTORY LOCKED</div>
                <div class="transition-title" data-reveal style="--d:0.35s">你的航线已锁定</div>
                <div class="transition-metric" data-val="${totalSubmissions || 0}" data-reveal style="--d:0.55s">${totalSubmissions || 0}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.78s">份投稿痕迹 · 覆盖 ${userDepts.length} 个部门<br>下一页开始，读取你在各部门留下的坐标。</div>
            </div>
        </div>`;
    }

    if (deptStats.length > 0) {
        // [TRANSITION] DEPT DISTRIBUTION
        const topDept = deptStats.slice().sort((a, b) => b.count - a.count)[0];
        const topDeptLine = topDept ? ('最常抵达：<strong>' + topDept.name + '</strong>') : '';
        html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">SECTOR ANALYSIS</div>
                <div class="transition-title" data-reveal style="--d:0.35s">今年你把坐标投向了</div>
                <div class="transition-metric" data-val="${deptStats.length}" data-reveal style="--d:0.55s">${deptStats.length}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.78s">个部门 · 共 ${totalSubmissions} 份痕迹<br>${topDeptLine}</div>
            </div>
        </div>`;

        const deptNames = deptStats.map(d => `<span class="netease-highlight">${d.name}</span>`).join(' / ');
        const distributionHtml = deptStats.map(d => `
            <div class="dept-stats-info" style="display:flex; justify-content:space-between; width:100%; border-bottom:1px dashed rgba(255,255,255,0.1); padding: 10px 0;">
                <span>${d.name}</span>
                <span class="highlight">${d.count}</span>
            </div>
        `).join('');

        html += `
        <div class="swiper-slide">
            <div class="netease-card">
                 <div class="card-deco-grid">
                      <div class="card-deco-dot"></div><div class="card-deco-dot"></div><div class="card-deco-dot"></div>
                 </div>
                <div class="netease-label">EXPLORATION LOG</div>
                <div class="netease-desc" style="max-width:100%; border:none; padding:0; margin-bottom:20px;">
                    今年你在 ${deptNames} 留下了痕迹
                </div>

                <div style="width:100%; margin-bottom:20px;">
                    ${distributionHtml}
                </div>

                <div style="display:flex; align-items:baseline; gap:10px;">
                     <div class="netease-number" style="font-size: 60px; margin:0;" data-val="${totalSubmissions}">${totalSubmissions}</div>
                     <div class="netease-title" style="font-size: 14px; opacity:0.6;">TOTAL UPLOADS</div>
                </div>
            </div>
        </div>`;
    } else if (userDepts.length > 0) {
         html += `
        <div class="swiper-slide">
            <div class="netease-card">
                <div class="netease-label">EXPLORATION LOG</div>
                <div class="netease-desc">
                    今年你在 ${userDepts.join('、')} 默默耕耘
                </div>
                <div class="netease-title" style="margin-top:40px;">期待明年看到你的作品</div>
            </div>
        </div>`;
    }

    // [MOVED] ACTIVITY LOG
    if(user.commonData && user.commonData.activityLevel > 0) {
        const allLevels = DB.map(u => u.commonData?.activityLevel || 0).sort((a,b) => a-b);
        const myLevel = user.commonData.activityLevel;
        const betterThan = allLevels.filter(c => c < myLevel).length;
        const percent = Math.floor((betterThan / allLevels.length) * 100);

        // 根据活跃等级生成不同文案
        const activityLabels = {
            1: { tag: '神秘潜水员', emoji: '🫧', title: '低调守望者', desc: '虽然很少露面，但你的存在本身就是佐佑的一部分。也许来年，试试浮出水面？', card: '你是深藏不露的潜水员，默默关注着社团的一切', rank: 'STEALTH MODE' },
            2: { tag: '偶尔参加', emoji: '🌙', title: '星际旅行者', desc: '偶尔降落在佐佑星球，每次都带来不一样的惊喜。期待你下次的到访！', card: '你在佐佑的轨道上若即若离，但每次出现都让人印象深刻', rank: 'CASUAL VISITOR' },
            3: { tag: '积极分子', emoji: '⚡', title: '活力引擎', desc: '你是社团的能量核心之一，活动中总能看到你活跃的身影。这份热情，请继续保持！', card: '作为社团的积极分子，你的热情感染着身边每一个人', rank: 'ACTIVE CREW' },
            4: { tag: '社团就像我家', emoji: '🏠', title: '星球原住民', desc: '佐佑就是你的第二个家，一天不看浑身难受！这份归属感，就是最珍贵的东西。', card: '对你来说社团就像家一样，这份热爱无可替代', rank: 'CORE RESIDENT' }
        };
        const info = activityLabels[myLevel] || activityLabels[1];

        // [TRANSITION] ACTIVITY PROTOCOL
        html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">ACTIVITY PROTOCOL</div>
                <div class="transition-title" data-reveal style="--d:0.35s">你的社团活跃画像</div>
                <div class="transition-metric" style="font-size:clamp(48px,12vw,100px);" data-reveal style="--d:0.55s">${info.emoji}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.78s">${info.tag}<br>${info.desc}</div>
            </div>
        </div>`;

        html += `
        <div class="swiper-slide">
            <div class="netease-card">
                 <div class="card-deco-grid">
                      <div class="card-deco-dot"></div><div class="card-deco-dot"></div><div class="card-deco-dot"></div>
                 </div>
                <div class="netease-label">ACTIVITY STATUS</div>
                <div class="netease-number" style="font-size:clamp(60px,15vw,120px); background:linear-gradient(135deg,#00d2ff,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${info.tag}</div>
                <div class="netease-title" style="transform:translateY(-10px); opacity:0.8;">${info.title}</div>

                <div class="dept-stats-info" style="border-top:1px solid rgba(255,255,255,0.2); padding-top:15px; margin-top:10px;">
                     <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:12px; letter-spacing:2px; opacity:0.6;">${info.rank}</span>
                        <span class="highlight" style="color:var(--accent-blue); font-size:16px;">TOP ${Math.max(1, 100-percent)}%</span>
                     </div>
                </div>
                 <div class="netease-desc" style="border:none; padding:0; margin-top:10px; font-size:13px; opacity:0.6;">
                    ${info.card}
                </div>
            </div>
        </div>`;
    }

    // IP共鸣 - Soul Resonance
    const allIpData = DB.filter(u => u.commonData && u.commonData.ip).map(u => ({
        name: String(u.name || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'),
        ip: String(u.commonData.ip || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'),
        photo: u.commonData.ipPhoto ? String(u.commonData.ipPhoto).replace(/"/g, '&quot;') : ''
    }));

    if (allIpData.length > 0) {
         // [TRANSITION] SOUL MAP
         html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">RESONANCE FIELD</div>
                <div class="transition-title" data-reveal style="--d:0.35s">社团今年收录了</div>
                <div class="transition-metric" data-val="${allIpData.length}" data-reveal style="--d:0.55s">${allIpData.length}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.78s">颗共鸣信号源<br>下一页，进入星图探测模式。</div>
            </div>
        </div>`;

         const ipDataBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(allIpData))));

         html += `
        <div class="swiper-slide soul-nebula-slide" id="soul-nebula-slide" data-nebula-ip="${ipDataBase64}">
            <div class="nebula-ui-layer">
                 <!-- Updated font style -->
                <h2 data-reveal style="--d:0.2s; font-family:'Orbitron'; letter-spacing:4px; font-size:24px;">SOUL RESONANCE</h2>
                <p data-reveal="fade" style="--d:0.45s; font-size:12px; margin-top:10px; opacity:0.8;">漫天星辰，皆是安利</p>
                <div data-reveal="fade" style="--d:0.7s; font-size: 10px; opacity: 0.5; margin-top:20px; border:1px solid rgba(255,255,255,0.3); padding:5px 10px; display:inline-block;">DRAG TO NAVIGATE</div>
            </div>
            <div id="nebula-canvas-container" class="nebula-canvas-container swiper-no-swiping"></div>
            <!-- Detail Modal - Kept same structure but could style with CSS -->
            <div id="nebula-detail-modal" class="nebula-detail-modal" onclick="window.hideNebulaDetail()">
                <div class="nebula-detail-content" onclick="event.stopPropagation()" style="background: rgba(10,15,30,0.95); border:1px solid var(--accent-blue);">
                    <img id="nebula-detail-img" src="" alt="">
                    <div class="detail-ip" id="nebula-detail-ip" style="font-family:'Orbitron'; color:var(--accent-blue);"></div>
                    <div class="detail-author" id="nebula-detail-author"></div>
                    <button class="detail-close" onclick="event.stopPropagation(); window.hideNebulaDetail();">CLOSE</button>
                </div>
            </div>
        </div>`;
    }

    // [NEW] 61题 - 关键词中心展示 + 弹幕 (Redesigned: Digital Vortex)
    // 计算关键词频率
    const allKeywords = DB.filter(u => u.commonData && u.commonData.keyword).map(u => u.commonData.keyword);
    const myKeywordRaw = user.commonData && user.commonData.keyword ? String(user.commonData.keyword).trim() : '';
    const myKeywordSafe = myKeywordRaw ? myKeywordRaw.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    const keywordCounts = {};
    allKeywords.forEach(k => { keywordCounts[k] = (keywordCounts[k] || 0) + 1; });
    // 找出出现最多的关键词
    let topKeyword = "热爱"; // 默认
    let maxCount = 0;
    for(let k in keywordCounts) {
        if(keywordCounts[k] > maxCount) {
             maxCount = keywordCounts[k];
             topKeyword = k;
        }
    }

    if (allKeywords.length > 0) {
        // [TRANSITION] KEYWORD VORTEX
        const safeTopKeywordForTransition = String(topKeyword).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const myKeywordLine = myKeywordSafe ? ('你的关键词：<strong>' + myKeywordSafe + '</strong>') : '你的关键词：尚未提交';
        html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">KEYWORD VORTEX</div>
                <div class="transition-title" data-reveal style="--d:0.35s">关键词弹幕生成中</div>
                <div class="transition-metric" data-val="${allKeywords.length}" data-reveal style="--d:0.55s">${allKeywords.length}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.78s">条信号汇聚 · 核心频率 <strong>${safeTopKeywordForTransition}</strong><br>${myKeywordLine}</div>
            </div>
        </div>`;

        // 准备弹幕数据 (排除空值) - 预先转义 - 并添加样式属性
        const danmakuItems = DB.filter(u => {
            if (!(u.commonData && u.commonData.keyword)) return false;
            if (window._youziReadingModeActive === true && u.name === '佑子') return false;
            return true;
        }).map(u => ({
            content: String(u.commonData.keyword || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
            author: String(u.name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
            // 随机属性
            scale: 0.6 + Math.random() * 1.4,
            opacity: 0.3 + Math.random() * 0.7,
            duration: 15 + Math.random() * 25,
            top: Math.random() * 90,
            colorType: Math.random()
        }));
        // 确保至少有一些数据用于显示
        const safeDanmaku = danmakuItems.length > 0 ? danmakuItems : [{content:'热爱', author:'佐佑', scale:1, opacity:1, duration:20, top:50}];
        // 转义topKeyword
        const safeTopKeyword = String(topKeyword).replace(/</g, '&lt;').replace(/>/g, '&gt;');

        html += `
        <div class="swiper-slide danmaku-slide" id="q61-slide">
            <style>
                .danmaku-slide {
                    background: #020205;
                    overflow: hidden;
                    perspective: 1000px;
                    position: relative;
                }
                .digital-vortex {
                    position: absolute; inset: -50%; width: 200%; height: 200%;
                    background:
                        radial-gradient(circle at 50% 50%, rgba(20,0,50,0.4) 0%, #000 60%),
                        linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px);
                    background-size: 100% 100%, 60px 60px, 60px 60px;
                    transform: rotateX(60deg) translateY(-10%);
                    animation: gridMove 30s linear infinite;
                    pointer-events: none;
                }
                @keyframes gridMove { 0% { background-position: 50% 50%, 0 0, 0 0; } 100% { background-position: 50% 50%, 0 120px, 0 120px; } }

                .center-core {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 320px; height: 320px; z-index: 20;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .center-keyword {
                     font-size: clamp(40px, 6vw, 70px); font-weight: 900; color: #fff;
                     text-shadow: 0 0 20px var(--accent-blue), 0 0 40px var(--accent-purple);
                     animation: corePulse 4s ease-in-out infinite;
                     font-family: 'Orbitron', sans-serif; letter-spacing: 5px;
                     position: relative;
                }
                .center-keyword::after {
                    content: attr(data-text); position: absolute; left: 0; top: 0;
                    color: var(--accent-blue); opacity: 0.5; filter: blur(4px);
                    z-index: -1;
                }
                .center-label { font-size: 12px; color: var(--accent-blue); letter-spacing: 5px; margin-top: 15px; opacity: 0.7; font-family: 'Orbitron', sans-serif; }
                @keyframes corePulse {
                    0%, 100% { transform: scale(1); opacity: 0.9; text-shadow: 0 0 20px var(--accent-blue); }
                    50% { transform: scale(1.1); opacity: 1; text-shadow: 0 0 40px var(--accent-blue), 0 0 80px var(--accent-purple); }
                }

                .danmaku-container { position: absolute; inset: 0; pointer-events: none; }
                .danmaku-item {
                    position: absolute; white-space: nowrap; font-family: 'Noto Sans SC', sans-serif;
                    will-change: transform;
                    text-shadow: 0 0 5px rgba(0,0,0,0.8);
                    display: flex; align-items: baseline; gap: 8px;
                    left: 100vw; /* Start off-screen */
                }
                .dm-content { font-weight: bold; }
                .dm-author { font-size: 0.7em; opacity: 0.8; color: var(--accent-blue); font-family: 'Orbitron', sans-serif; letter-spacing: 1px; }
                @keyframes danmakuScroll { from { transform: translateX(0); } to { transform: translateX(-200vw); } }
    </style>
            <div class="digital-vortex"></div>
            <div style="position:absolute; top:40px; left:50%; transform:translateX(-50%); text-align:center; z-index:30; width:min(92vw,640px); pointer-events:none;">
                <div data-reveal style="--d:0.25s; font-family: 'Orbitron', sans-serif; letter-spacing: 4px; font-size: 12px; color: rgba(0,255,255,0.65);">KEYWORD VORTEX</div>
                <div data-reveal="fade" style="--d:0.45s; margin-top: 8px; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6;">社团把每个人的关键词写成弹幕。中心，是今年出现最多的那一个。</div>
                ${myKeywordSafe ? `<div data-reveal="fade" style="--d:0.65s; margin-top: 10px; font-size: 12px; color: rgba(255,255,255,0.65);">你的关键词：<span style="color: var(--accent-blue); font-weight: 700;">${myKeywordSafe}</span></div>` : ''}
            </div>
            <div class="danmaku-container">
                ${safeDanmaku.map((item, i) => `
                    <div class="danmaku-item" data-trigger-type="contribution" data-contributor="${item.author}" style="
                        top: ${item.top}%;
                        font-size: ${item.scale * 18}px;
                        opacity: ${item.opacity};
                        color: ${item.colorType > 0.7 ? '#fff' : (item.colorType > 0.3 ? '#00ffff' : '#ff00ff')};
                        z-index: ${Math.floor(item.scale * 10)};
                        filter: blur(${Math.max(0, (1 - item.scale) * 2)}px);
                        animation: danmakuScroll ${item.duration}s linear infinite;
                        animation-delay: -${Math.random() * 30}s;
                    ">
                        <span class="dm-content">${item.content}</span><span class="dm-author">@${item.author}</span>
                    </div>`).join('')}
            </div>
            <div class="center-core">
               <div class="center-keyword" data-text="${safeTopKeyword}">${safeTopKeyword}</div>
               <div class="center-label">CORE_VALUE</div>
            </div>
        </div>`;
    }

    // [NEW] 整合回忆页 (年度回忆 + 社团共同回忆) - Masonry (Redesigned: Floating Gallery)
    // 筛选其他人的回忆 - 预先转义
    const otherMemories = [];
    DB.forEach(u => {
        if(u.commonData) {
            if(u.commonData.memoryPhoto) otherMemories.push({
                url: String(u.commonData.memoryPhoto || '').replace(/"/g, '&quot;'),
                desc: String(u.commonData.memoryDesc || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'),
                author: String(u.name || '').replace(/"/g, '&quot;').replace(/</g, '&lt;')
            });
            if(u.commonData.groupPhoto) otherMemories.push({
                url: String(u.commonData.groupPhoto || '').replace(/"/g, '&quot;'),
                desc: String(u.commonData.groupDesc || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'),
                author: String(u.name || '').replace(/"/g, '&quot;').replace(/</g, '&lt;')
            });
        }
    });
    // 用户自己的回忆 - 预先转义
    const userMemoriesSafe = [];
    if (user.commonData && user.commonData.memoryPhoto) userMemoriesSafe.push({
        url: String(user.commonData.memoryPhoto || '').replace(/"/g, '&quot;'),
        desc: String(user.commonData.memoryDesc || '我的独家记忆').replace(/"/g, '&quot;').replace(/</g, '&lt;'),
        author: 'ME',
        isMine: true
    });
    if (user.commonData && user.commonData.groupPhoto) userMemoriesSafe.push({
        url: String(user.commonData.groupPhoto || '').replace(/"/g, '&quot;'),
        desc: String(user.commonData.groupDesc || '最喜欢的合照').replace(/"/g, '&quot;').replace(/</g, '&lt;'),

        author: 'ME',
        isMine: true
    });
    // 打乱
    const shuffledMemories = otherMemories.sort(() => 0.5 - Math.random());
    let displayMemories = [...userMemoriesSafe, ...shuffledMemories];
    // 复制一份以实现无缝滚动
    if(displayMemories.length > 5) {
         // [TRANSITION] ARCHIVE UNLOCKED
         html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">ARCHIVE UNLOCKED</div>
                <div class="transition-title" data-reveal style="--d:0.35s">回忆已装订成册</div>
                <div class="transition-metric" data-val="${displayMemories.length}" data-reveal style="--d:0.55s">${displayMemories.length}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.78s">个瞬间正在回放<br>你的独家：${userMemoriesSafe.length} · 共同回忆：${otherMemories.length}</div>
            </div>
        </div>`;

        displayMemories = [...displayMemories, ...displayMemories];
    }

    if (displayMemories.length > 0) {
         html += `
        <div class="swiper-slide memory-combined-slide" id="memory-slide">
            <style>
                /* Redesigned Shared Memories - Dynamic Carousel Style */
                .memory-combined-slide {
                    background: #020205;
                    overflow: hidden;
                }
                .memory-redesign-header {
                    position: absolute; top: 40px; left: 50%; transform: translateX(-50%);
                    text-align: center; z-index: 10;
                }
                .memory-redesign-title {
                    font-family: 'Orbitron', sans-serif; font-size: 24px; letter-spacing: 12px;
                    color: #fff;
                    text-shadow: 0 0 20px var(--accent-blue);
                }
                .memory-redesign-count {
                    font-size: 10px; color: var(--accent-blue); letter-spacing: 3px;
                    margin-top: 15px; text-transform: uppercase;
                    border-top: 1px solid rgba(255,255,255,0.2);
                    padding-top: 5px; display: inline-block;
                }

                /* Carousel Track */
                .memory-carousel-track {
                    position: absolute; top: 50%; left: 0; transform: translateY(-50%);
                    display: flex; gap: 30px; padding: 0 50px;
                    animation: scrollCarousel 180s linear infinite;
                    will-change: transform;
                }
                .memory-carousel-track:hover { animation-play-state: paused; }
                @keyframes scrollCarousel {
                    0% { transform: translateY(-50%) translateX(0); }
                    100% { transform: translateY(-50%) translateX(-50%); }
                }

                /* Memory Cards */
                .memory-carousel-card {
                    flex-shrink: 0; width: 320px; height: 450px;
                    background: rgba(10,10,20,0.7); border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.15);
                    overflow: hidden; position: relative; cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                }
                .memory-carousel-card:hover {
                    transform: translateY(-15px) scale(1.05);
                    border-color: var(--accent-gold);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.3);
                    z-index: 10;
                }
                .memory-carousel-card.mine {
                    border: 2px solid var(--accent-gold);
                    box-shadow: 0 10px 40px rgba(255,215,0,0.2);
                }
                .memory-carousel-img {
                    width: 100%; height: 70%; object-fit: cover;
                    transition: transform 0.6s ease;
                }
                .memory-carousel-card:hover .memory-carousel-img {
                    transform: scale(1.1);
                }
                .memory-carousel-info {
                    padding: 20px; height: 30%;
                    background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.7));
                    display: flex; flex-direction: column; justify-content: center;
                }
                .memory-carousel-author {
                    font-size: 16px; font-weight: 700; color: var(--accent-gold);
                    letter-spacing: 2px; margin-bottom: 8px;
                    text-shadow: 0 0 10px rgba(255,215,0,0.4);
                }
                .memory-carousel-desc {
                    font-size: 13px; color: rgba(255,255,255,0.8);
                    line-height: 1.5; display: -webkit-box;
                    -webkit-line-clamp: 3; -webkit-box-orient: vertical;
                    overflow: hidden; text-overflow: ellipsis;
                }
                .memory-hint {
                    position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
                    font-size: 11px; color: rgba(255,255,255,0.4);
                    letter-spacing: 2px; animation: hintBlink 2s ease-in-out infinite;
                }
                @keyframes hintBlink {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
    </style>
            <div class="memory-redesign-header">
                <div class="memory-redesign-title">SHARED MEMORIES</div>
                <div class="memory-redesign-count">${displayMemories.length} MOMENTS</div>
                <div data-reveal="fade" style="--d:0.55s; margin-top: 10px; font-size: 12px; color: rgba(255,255,255,0.55); letter-spacing: 2px;">悬停暂停 · 点击放大 · 把这一年装进走马灯</div>
            </div>
            <div class="memory-carousel-track">
                ${displayMemories.concat(displayMemories).map((m, idx) => `
                    <div class="memory-carousel-card ${m.isMine?'mine':''} clickable-img" data-url="${m.url}" data-author="${m.author}" data-desc="${m.desc}" data-trigger-type="contribution" data-contributor="${m.author}">
                        <img src="${m.url}" class="memory-carousel-img" loading="lazy" onerror="this.src='https://picsum.photos/320/400?random='+Math.random()">
                        <div class="memory-carousel-info">
                            <div class="memory-carousel-author">${m.author}</div>
                            <div class="memory-carousel-desc">${m.desc || 'Best Memory 2025'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="memory-hint">HOVER TO PAUSE · CLICK TO VIEW</div>
        </div>`;
    }

    // [NEW] 62题 - 难忘的话 (原烟花效果迁移至此)
    // 准备数据 - 过滤掉空字符串
    const allQuotes = DB.filter(u => {
        if (!(u.commonData && u.commonData.memorableQuote && u.commonData.memorableQuote.trim() !== '')) return false;
        if ((window._youziReadingModeActive === true || window._youziGuestModeActive === true) && u.name === '佑子') return false;
        return true;
    }).map(u => ({
        name: u.name,
        keyword: u.commonData.memorableQuote // 复用 'keyword' 字段名以匹配现有烟花JS
    }));

    // 调试日志
    console.log('[Fireworks] Total quotes collected:', allQuotes.length);
    if (allQuotes.length > 0) {
        console.log('[Fireworks] Sample quotes:', allQuotes.slice(0, 3));
    }

     // 用户自己的
    const hideYouziQuote = (window._youziReadingModeActive === true || window._youziGuestModeActive === true) && user && user.name === '佑子';
    const myQuote = (!hideYouziQuote && user.commonData && user.commonData.memorableQuote && user.commonData.memorableQuote.trim() !== '') ?
        { name: user.name, keyword: user.commonData.memorableQuote } :
        (hideYouziQuote ? null : (allQuotes.length > 0 ? allQuotes[0] : {name: 'Club', keyword: 'Happy New Year'}));

    if (allQuotes.length > 0) {
         // [TRANSITION] 难忘的话（进入烟花页前）
         const myQuoteTextSafe = myQuote && myQuote.keyword ? String(myQuote.keyword).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
         const myQuoteLine = myQuoteTextSafe ? ('你的那句：<strong>' + myQuoteTextSafe + '</strong>') : '下一页点燃烟花，听见它们。';
         html += `
        <div class="swiper-slide transition-slide">
            <div class="transition-inner">
                <div class="transition-kicker" data-reveal style="--d:0.2s">UNFORGETTABLE WORDS</div>
                <div class="transition-title" data-reveal style="--d:0.35s">社团今年留下了</div>
                <div class="transition-metric" data-reveal style="--d:0.55s">${allQuotes.length}</div>
                <div class="transition-sub" data-reveal="fade" style="--d:0.78s">句难忘的话<br>${myQuoteLine}</div>
            </div>
        </div>`;

         html += `
        <div class="swiper-slide firework-slide" id="firework-keyword-slide">



<div class="firework-header-container" style="position:absolute; top:8%; left:0; width:100%; z-index:1000; display:none; flex-direction:column; align-items:center; transform:scale(0.8); pointer-events:none;">
    <div class="logo-container">
        <img src="" alt="佐佑动漫社" class="main-logo" style="display:none">
        <div class="logo-glow"></div>
    </div>
    <div class="year-badge">2025 NEBULA</div>
</div>
<div class="firework-star-bg"></div>
<div class="firework-star-bg-2"></div>
<!-- Logo和NEBULA容器 - 完全居中在顶部 -->
<div id="fireworkLogoContainer" style="position:absolute; top:20px; left:50%; transform:translateX(-50%); z-index:1001; pointer-events:none; display:flex; flex-direction:column; align-items:center; opacity:0; transition:opacity 1.5s ease-in-out;">
    <canvas id="fireworkLogoCanvas" style="width:200px; height:120px;"></canvas>
    <div id="fireworkLogoText" style="margin-top:8px; font-family: 'Press Start 2P', 'Courier New', monospace; font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.8); text-shadow: 0 0 6px rgba(255,255,255,0.5);">2025 ANNUAL REPORT</div>
</div>
            <style>
                .year-badge {
                    font-family: 'PingFang SC', sans-serif;
                    font-size: 10px;
                    letter-spacing: 3px;
                    color: rgba(255,255,255,0.7);
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 4px 12px;
                    display: inline-block;
                    border-radius: 2px;
                    white-space: nowrap;
                }
                .firework-slide {
                    background: radial-gradient(ellipse at bottom, #0d121b 0%, #000000 100%);
                    position: relative; overflow: hidden;
                }
                .firework-star-bg, .firework-star-bg-2 {
                    position: absolute; inset: 0; z-index: 5;
                    background-repeat: repeat;
                    pointer-events: none;
                }
                .firework-star-bg {
                    background-image:
                        radial-gradient(1px 1px at 10px 10px, white, rgba(0,0,0,0)),
                        radial-gradient(1px 1px at 20px 50px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
                        radial-gradient(1px 1px at 30px 100px, white, rgba(0,0,0,0)),
                        radial-gradient(1.5px 1.5px at 100px 50px, rgba(200,200,255,0.9), rgba(0,0,0,0)),
                        radial-gradient(1.5px 1.5px at 150px 120px, white, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 200px 200px, rgba(255,255,255,0.9), rgba(0,0,0,0));
                    background-size: 250px 250px;
                    opacity: 0.7;
                    animation: twinkle 5s infinite alternate;
                }
                .firework-star-bg-2 {
                    background-image:
                        radial-gradient(1.5px 1.5px at 50px 150px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
                        radial-gradient(1px 1px at 120px 200px, white, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 220px 80px, rgba(220,220,255,1), rgba(0,0,0,0));
                    background-size: 300px 300px;
                    opacity: 0.5;
                    animation: twinkle 7s infinite alternate-reverse;
                }
                @keyframes twinkle {
                    0% { opacity: 0.4; transform: scale(1); }
                    100% { opacity: 0.9; transform: scale(1.05); }
                }
                .firework-canvas-container { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 10; }
                #firework-trails-canvas, #firework-main-canvas { display: block; position: absolute; inset: 0; width: 100%; height: 100%; }

                .firework-text-overlay {
                    position: absolute; inset: 0; pointer-events: none; z-index: 999;
                    overflow: hidden;
                }
                .firework-text-item {
                    position: absolute; color: #fff; font-size: 16px; font-weight: bold;
                    text-shadow: 0 0 4px #000, 0 0 8px #000, 1px 1px 2px rgba(0,0,0,1);
                    white-space: nowrap; pointer-events: none;
                    animation: floatText 5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    background: rgba(0,0,0,0.4); padding: 5px 12px; border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.3);
                    transform: translate(-50%, -50%); /* Center on coordinate */
                    backdrop-filter: blur(2px);
                    font-family: var(--font-body);
                }
                .firework-text-item.current-user {
                     font-size: 24px; border-color: #ffd700; color: #ffd700; z-index: 60;
                     background: rgba(0,0,0,0.7);
                     box-shadow: 0 0 25px rgba(255,215,0,0.5);
                     text-shadow: 0 0 10px rgba(255,215,0,0.5);
                }
                @keyframes floatText {
                    0% { opacity: 0; transform: translate(-50%, 0) scale(0.5); }
                    15% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); }
                    30% { transform: translate(-50%, -25px) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -80px); }
                }
    </style>
            <div class="firework-canvas-container">
                <canvas id="firework-trails-canvas"></canvas>
                <canvas id="firework-main-canvas"></canvas>
            </div>
            <div class="firework-text-overlay" id="firework-text-overlay"></div>
            <div style="position:absolute; bottom:50px; width:100%; text-align:center; color:rgba(255,255,255,0.5); font-size:12px; pointer-events:none; z-index:60;">
               - 点击屏幕燃放烟花 -
            </div>

        </div>`;
    }

    // [TRANSITION] 最终传输（星球大战报幕）
    const contributorNames = (typeof DB !== 'undefined' && Array.isArray(DB))
        ? DB.map(u => u.name || user.name || 'Unknown').filter((v, i, a) => a.indexOf(v) === i).join('  ')
        : '所有社员';

    // Try to extract logo from previously generated HTML string
    let logoSrc = 'logo.png';
    const logoMatch = html.match(/src="(data:image[^"]+)"[^>]*class="main-logo"/);
    if (logoMatch && logoMatch[1]) {
        logoSrc = logoMatch[1];
    }
    // Use transparent PNG logo for the ending page
    // Extract from the already-embedded PNG in final-logo-container (star wars crawl page)
    let logoPngSrc = logoSrc; // fallback to JPEG
    var _pngIdx = html.indexOf('final-logo-container');
    if (_pngIdx !== -1) {
        var _srcPrefix = 'src="data:image/png;base64,';
        var _srcStart = html.indexOf(_srcPrefix, _pngIdx);
        if (_srcStart !== -1) {
            var _dataStart = _srcStart + 5; // skip 'src="'
            var _dataEnd = html.indexOf('"', _dataStart);
            if (_dataEnd !== -1) {
                logoPngSrc = html.substring(_dataStart, _dataEnd);
                console.log('[Logo] Transparent PNG extracted from final-logo-container, length=' + logoPngSrc.length);
            }
        }
    }
    // 优先使用生成器预加载的透明PNG logo（无白底）
    // 利用外层模板在生成时直接嵌入透明logo到最终HTML中
    const _embeddedTransparentLogo = '';
    if (_embeddedTransparentLogo.length > 100) {
        logoPngSrc = _embeddedTransparentLogo;
        console.log('[Logo] Using embedded transparent PNG logo for ending page, length=' + _embeddedTransparentLogo.length);
    }

    const finalTransmissionEscapeAttr = function(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    };
    const finalTransmissionEscapeText = function(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    const isRenderableImageUrl = function(url) {
        const value = String(url || '').trim();
        if (!value) return false;
        if (/^data:image\//i.test(value)) return true;
        if (/^blob:/i.test(value)) return true;
        if (/^https?:\/\//i.test(value)) return !isVideoUrl(value);
        return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(value);
    };
    const finalTransmissionImages = [];
    const finalTransmissionImageKeys = new Set();
    const pushFinalTransmissionImage = function(url) {
        const value = String(url || '').trim();
        if (!isRenderableImageUrl(value)) return;
        if (finalTransmissionImageKeys.has(value)) return;
        finalTransmissionImageKeys.add(value);
        finalTransmissionImages.push(value);
    };
    if (Array.isArray(DB)) {
        DB.forEach(function(member) {
            if (!member || typeof member !== 'object') return;
            if (member.commonData) {
                pushFinalTransmissionImage(member.commonData.memoryPhoto);
                pushFinalTransmissionImage(member.commonData.groupPhoto);
                pushFinalTransmissionImage(member.commonData.ipPhoto);
            }
            if (member.deptData && typeof member.deptData === 'object') {
                Object.keys(member.deptData).forEach(function(deptName) {
                    const deptImages = member.deptData[deptName] && Array.isArray(member.deptData[deptName].images)
                        ? member.deptData[deptName].images
                        : [];
                    deptImages.forEach(function(img) {
                        pushFinalTransmissionImage(img && img.url);
                    });
                });
            }
        });
    }
    const sidePhotoPool = finalTransmissionImages.slice(0, 10);
    const buildSidePhotosHtml = function(delayOffset) {
        if (sidePhotoPool.length === 0) {
            return '<div class="side-photo side-photo-fallback" style="animation-delay:' + delayOffset + 's"></div>';
        }
        return sidePhotoPool.map(function(url, index) {
            const delay = (20 + delayOffset + index * 5).toFixed(1);
            return '<img src="' + finalTransmissionEscapeAttr(url) + '" class="side-photo" style="animation-delay: ' + delay + 's" />';
        }).join('');
    };
    const makerProfiles = [
        { name: '板子', image: finalTransmissionImages[10] || finalTransmissionImages[0] || '', accent: '#ffd166' },
        { name: '阿德克丝', image: finalTransmissionImages[11] || finalTransmissionImages[1] || '', accent: '#8ecae6' }
    ];
    const buildMakerCardHtml = function(profile) {
        const safeName = finalTransmissionEscapeText(profile.name);
        const safeAccent = finalTransmissionEscapeAttr(profile.accent);
        let visualHtml = '';
        if (profile.image) {
            visualHtml = '<img src="' + finalTransmissionEscapeAttr(profile.image) + '" loading="eager" decoding="async" fetchpriority="high" style="width: 100%; height: 100%; object-fit: cover;" alt="' + safeName + '">';
        } else {
            visualHtml = '<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background: radial-gradient(circle at 30% 30%, ' + safeAccent + ', rgba(12,20,36,0.95)); color:#fff5cf; font-size:180px; font-weight:800; letter-spacing:8px;">' + safeName.slice(0, 1) + '</div>';
        }
        return '<div style="text-align: center; flex: 0 0 45%;">'
            + '<div style="width: 100%; aspect-ratio: 1/1; border-radius: 24px; overflow: hidden; border: 3px solid rgba(255,215,0,0.3); box-shadow: 0 0 40px rgba(255,215,0,0.15); margin: 0 auto 30px;">'
            + visualHtml
            + '</div>'
            + '<div style="font-size: 160px; color: #FFD700; letter-spacing: 6px; font-weight: bold;">' + safeName + '</div>'
            + '</div>';
    };
    const finalLogoSrc = logoPngSrc || logoSrc;

    html += `
    <div class="swiper-slide swiper-no-swiping" style="background:#000;">
        <div class="star-wars-container">
            <div class="side-image-container side-images-left">
                ${buildSidePhotosHtml(0)}
            </div>
            <div class="side-image-container side-images-right">
                ${buildSidePhotosHtml(2.5)}
            </div>

            <div class="star-wars-fade"></div>
            <section class="star-wars-section">
                <div class="crawl">
                    <div class="title final-transmission-title">
                        <p>Episode XXVII</p>
                        <h1>The Final Transmission</h1>
                    </div>

                    <p class="crawl-opening-message">今年是佐佑动漫社的第27年，阅读到这里的社友，想必你的大学生活已与或开始与社团有了深度链结，欢笑与热闹之间，会有无所适从、偶尔无法厘清，但始终如这些行星般在黑暗中紧紧围绕在一起。</p>
                    <p class="crawl-opening-message">在新的一年，衷心期望保持热忱、以年轻的视角去采撷、去创造，集合团体的光辉，于共鸣中，折射出属于佐佑七彩的底色。</p>

                    <div class="final-logo-container" style="display: block; margin: 30px auto; text-align: center; width: 100%;">
                        ${finalLogoSrc ? '<img src="' + finalTransmissionEscapeAttr(finalLogoSrc) + '" loading="eager" decoding="async" fetchpriority="high" style="width:100%; max-width: 100%; display: inline-block; filter: drop-shadow(0 0 10px rgba(255,215,0,0.5));" />' : '<div style="display:inline-block; padding:24px 56px; border:2px solid rgba(255,215,0,0.35); border-radius:18px; color:#FFD700; font-size:84px; letter-spacing:8px;">佐佑动漫社</div>'}
                    </div>


                    <div class="crawl-makers" style="margin: 120px auto 80px; text-align: center; width: 100%;">
                        <h2 style="font-size: 180px; color: #FFD700; margin-bottom: 70px; letter-spacing: 12px;">制 作</h2>
                        <div style="display: flex; justify-content: center; gap: 5%; align-items: flex-start; width: 100%;">
                            ${makerProfiles.map(buildMakerCardHtml).join('')}
                        </div>
                    </div>
                    <div class="credits">
                        <h2>鸣谢</h2>
                        <div class="credits-row">社长 泽诺</div>
                        <div class="credits-row">副社长 瑶瑶山药 尤歈 岛儿飞 @@@</div>
                        <div class="credits-row">外宣部长 轩轩 副部 铸币 咪啪 鸽子</div>
                        <div class="credits-row">原创部长 Peppeptone 副部 奥德赛</div>
                        <div class="credits-row">轻音部长 冰河寒风 麻布 rwtewr 鸽子</div>
                        <div class="credits-row">技术部长 片翼之白 副部 海胆 小企鹅</div>
                        <div class="credits-row">COS部长 长歌 副部 睦亭</div>
                        <div class="credits-row credits-dance-row">舞装部长 九蔻 副部 椿岄熠熠 霖音千咲 灵活的胖子</div>
                    </div>

                    <div class="contributors">
                        <h3>投稿人</h3>
                        ${contributorNames}
                    </div>

                    <p style="margin-top: 60px; font-size: 120%; text-align: center;">2026，伴你佐佑</p>
                </div>
            </section>
        </div>
    </div>`;

    // 结尾页 - 投稿人专属总结海报
    const summaryImageUrls = [];
    const pushSummaryImage = (url) => {
        if (url && /^https?:\/\//.test(String(url).trim())) summaryImageUrls.push(String(url).trim());
    };
    if (user.commonData) {
        pushSummaryImage(user.commonData.memoryPhoto);
        pushSummaryImage(user.commonData.groupPhoto);
        pushSummaryImage(user.commonData.ipPhoto);
    }
    (user.depts || []).forEach(deptName => {
        const deptImages = (user.deptData && user.deptData[deptName] && user.deptData[deptName].images) || [];
        deptImages.forEach(img => pushSummaryImage(img.url));
    });
    const summaryUnique = [...new Set(summaryImageUrls)];
    const summaryPhotos = summaryUnique.slice(0, 4);
    while (summaryPhotos.length < 4) summaryPhotos.push('');
    const summaryPhotosHtml = summaryPhotos.map(url => url
        ? `<div class="summary-photo">${window.getMediaHtml(url, 'summary')}</div>`
        : `<div class="summary-photo"><div class="summary-placeholder">暂无投稿图片</div></div>`
    ).join('');

    const submissionCount = (user.depts || []).reduce((sum, deptName) => {
        const deptImages = (user.deptData && user.deptData[deptName] && user.deptData[deptName].images) || [];
        return sum + deptImages.length;
    }, 0);
    const activityLevel = (user.commonData && user.commonData.activityLevel) || (user.stats && user.stats.activityLevel) || 0;
    const activityTagMap = { 1: '潜水员', 2: '偶尔参加', 3: '积极分子', 4: '常驻居民' };
    const activityTag = activityTagMap[activityLevel] || '未填写';
    const keywordText = (user.commonData && user.commonData.keyword) || (user.keywords && user.keywords[0]) || '未填写';
    const deptText = (user.depts && user.depts.length > 0) ? user.depts.join(' / ') : '未填写';
    const shareUrl = 'https://anonkuki.github.io/2025-report/';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

    html += `
    <div class="swiper-slide">
        <div class="netease-card netease-ending" id="ending-card">
            <div class="ending-inner">
                <div class="ending-top-bar">
                    <div class="ending-header">
                        <div class="ending-greeting">
                            <div class="greeting-hi">Hi,</div>
                            <div class="greeting-name">${user.name || '佑子'}</div>
                        </div>
                    </div>
                    <canvas id="endingLogoCanvas" class="ending-logo-canvas" width="340" height="264"></canvas>
                </div>
                <div class="message">
                    这一年你留下的痕迹，已经被宇宙收录。
                </div>
                <div class="ending-poster" data-reveal style="--d:0.4s">
                    <div class="poster-header">
                        <div class="poster-title">Personal Summary</div>
                        <div class="poster-sub">2025</div>
                    </div>
                    <div class="poster-body">
                        <div class="poster-photos">
                            ${summaryPhotosHtml}
                        </div>
                        <div class="poster-info">
                            <div class="poster-metrics">
                                <div class="metric">
                                    <div class="label">Activities</div>
                                    <div class="value text">${activityTag}</div>
                                </div>
                                <div class="metric">
                                    <div class="label">Submissions</div>
                                    <div class="value">${submissionCount}<span>张</span></div>
                                </div>
                                <div class="metric">
                                    <div class="label">Keyword</div>
                                    <div class="value text">${keywordText}</div>
                                </div>
                                <div class="metric">
                                    <div class="label">Department</div>
                                    <div class="value text">${deptText}</div>
                                </div>
                            </div>
                            <div class="poster-qr">
                                <img src="${qrUrl}" alt="QR">
                                <div class="qr-caption">扫码查看完整报告<br>并分享给朋友</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ending-bottom-bar">
                    <div class="poster-watermark">Sayuu Anime Club</div>
                    <button class="save-poster-btn" onclick="savePosterImage()">
                        <svg class="save-icon" viewBox="0 0 24 24"><path d="M12 16l-6-6h4V4h4v6h4l-6 6z"/><path d="M4 18h16v2H4z"/></svg>
                        保存海报
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    document.getElementById('slides-container').innerHTML = html;
    attachReportSwipeHints();

    // ===== 结尾页粒子Logo系统 =====
    (function initEndingLogo() {
        const canvas = document.getElementById('endingLogoCanvas');
        if (!canvas || !window.DRONE_DATA || !window.DRONE_DATA.logo) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const particles = window.DRONE_DATA.logo;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const scale = 0.52;
        particles.forEach(function(p) {
            const px = cx + p.x * scale;
            const py = cy + p.y * scale;
            ctx.fillStyle = p.c;
            ctx.beginPath();
            ctx.arc(px, py, 2.4, 0, Math.PI * 2);
            ctx.fill();
        });
    })();

    // 烟花数据注入（必须在innerHTML之后，因为innerHTML内的script不会执行）
    if (allQuotes && allQuotes.length > 0) {
        window.FIREWORK_KEYWORD_DATA = allQuotes;
        window.FIREWORK_CURRENT_USER = myQuote;
        console.log('[Data Injection] FIREWORK_KEYWORD_DATA loaded:', window.FIREWORK_KEYWORD_DATA.length);
        console.log('[Data Injection] FIREWORK_CURRENT_USER:', window.FIREWORK_CURRENT_USER);
    }

    // 初始化图片点击放大功能
    initImageLightbox();
    initRevealLogic();
}

function attachReportSwipeHints() {
    const container = document.getElementById('slides-container');
    if (!container) return;
    const slides = container.querySelectorAll('.swiper-slide');
    slides.forEach((slide, idx) => {
        if (slide.querySelector('.report-swipe-hint')) return;
        const hint = document.createElement('div');
        hint.className = 'report-swipe-hint' + (idx === 0 ? ' first-slide' : '');
        hint.innerHTML = '<div class="report-swipe-hint-line"></div>' +
            (idx === 0 ? '<div class="report-swipe-hint-text">上下滑动翻页</div>' : '');
        slide.appendChild(hint);
    });
}

// 揭示动画逻辑 (Disabled by request)
function initRevealLogic() {
    // Overlay removed.
}

;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();