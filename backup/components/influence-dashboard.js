// ============================================================
// components/influence-dashboard.js - 外宣影响力看板组件
// 从 generator.html 提取
// 包含: initPrDeptNarrative, renderInfluenceDashboard,
//       initInfluenceDashboardAnimation
// 依赖全局: WEIXIN_ARTICLES, BILIBILI_VIDEOS
// ============================================================

function initPrDeptNarrative() {
    try {
        if (window.__prNarrativeCleanup) {
            try { window.__prNarrativeCleanup(); } catch(e) {}
            window.__prNarrativeCleanup = null;
        }

        const deptRoot = document.querySelector('.dept-pr');
        if (!deptRoot) return;
        const story = deptRoot.querySelector('[data-pr-story]');
        if (!story) return;

        const bubble = story.querySelector('[data-pr-story-bubble]');
        const textEl = story.querySelector('[data-pr-story-text]');
        const hintEl = story.querySelector('[data-pr-story-hint]');
        if (!bubble || !textEl || !hintEl) return;

        const hasWx = (typeof WEIXIN_ARTICLES !== 'undefined' && Array.isArray(WEIXIN_ARTICLES) && WEIXIN_ARTICLES.length > 0);
        const hasBili = (typeof BILIBILI_VIDEOS !== 'undefined' && Array.isArray(BILIBILI_VIDEOS) && BILIBILI_VIDEOS.length > 0);
        if (!hasWx && !hasBili) {
            story.style.display = 'none';
            return;
        }

        const wxCount = hasWx ? WEIXIN_ARTICLES.length : 0;
        const biliCount = hasBili ? BILIBILI_VIDEOS.length : 0;
        const wxTotal = hasWx ? WEIXIN_ARTICLES.reduce((acc, curr) => acc + (curr.value || 0), 0) : 0;
        const biliTotal = hasBili ? BILIBILI_VIDEOS.reduce((acc, curr) => acc + (curr.value || 0), 0) : 0;
        const totalViews = wxTotal + biliTotal;

        const pickTop = (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return null;
            let best = arr[0];
            for (let i = 1; i < arr.length; i++) {
                if ((arr[i].value || 0) > (best.value || 0)) best = arr[i];
            }
            return best;
        };
        const wxTop = hasWx ? pickTop(WEIXIN_ARTICLES) : null;
        const biliTop = hasBili ? pickTop(BILIBILI_VIDEOS) : null;

        const clampTitle = (s, maxLen) => {
            const str = String(s || '');
            if (str.length <= maxLen) return str;
            return str.slice(0, maxLen - 1) + '…';
        };

        const escapeHtml = (s) => String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const buildLinesHtml = (lines) => {
            if (!Array.isArray(lines)) return '';
            let out = '';
            for (let i = 0; i < lines.length; i++) {
                out += '<span class="pr-line" style="--i:' + i + '">' + lines[i] + '</span>';
            }
            return out;
        };

        const wxTopLine = wxTop
            ? ('阅读最高：『' + escapeHtml(clampTitle(wxTop.title, 24)) + '』 · <strong>' + (wxTop.value || 0).toLocaleString() + '</strong>')
            : '阅读最高：正在加载更多记录…';
        const biliTopLine = biliTop
            ? ('播放最高：『' + escapeHtml(clampTitle(biliTop.title, 24)) + '』 · <strong>' + (biliTop.value || 0).toLocaleString() + '</strong>')
            : '播放最高：正在加载更多片段…';

        const steps = {
            full: {
                lines: [
                    '这一年，外宣部把日常写成了可被看见的记录。',
                    '公众号发布 <strong>' + wxCount.toLocaleString() + '</strong> 篇 · 累计阅读 <strong>' + wxTotal.toLocaleString() + '</strong>。',
                    'B站发布 <strong>' + biliCount.toLocaleString() + '</strong> 条 · 累计播放 <strong>' + biliTotal.toLocaleString() + '</strong>。',
                    '合计触达 <strong>' + totalViews.toLocaleString() + '</strong> 次观看。',
                    '——',
                    '第一站：公众号。',
                    '我们发布了 <strong>' + wxCount.toLocaleString() + '</strong> 篇推送，留下 <strong>' + wxTotal.toLocaleString() + '</strong> 次阅读回声。',
                    '每一次选题、每一次排版，都是外宣部的"现场记录"。',
                    wxTopLine,
                    '——',
                    '下一站：B站。',
                    '我们发布了 <strong>' + biliCount.toLocaleString() + '</strong> 条视频，收获 <strong>' + biliTotal.toLocaleString() + '</strong> 次播放驻足。',
                    '镜头对准舞台，也对准你们的热爱。',
                    biliTopLine,
                    '——',
                    '你正在看到的，不只是数字。',
                    '它们是每一次"发声"、每一次"被看见"的证据。',
                    '外宣部年度回响，仍在继续。'
                ],
                hint: '继续下滑，进入影响力看板'
            }
        };

        let currentKey = '';
        const setStep = (key) => {
            if (!steps[key] || key === currentKey) return;
            currentKey = key;

            textEl.classList.remove('anim');
            textEl.innerHTML = buildLinesHtml(steps[key].lines);
            hintEl.textContent = steps[key].hint || '';

            // 延后一帧触发动画，避免首次进入时"已渲染完看不到动效"
            requestAnimationFrame(() => {
                try {
                    textEl.classList.remove('anim');
                    void textEl.offsetWidth;
                    requestAnimationFrame(() => textEl.classList.add('anim'));
                } catch(e) {
                    textEl.classList.add('anim');
                }
            });

            bubble.setAttribute('role', 'group');
            bubble.setAttribute('tabindex', '-1');
            bubble.setAttribute('aria-label', '外宣叙事');
        };

        // 进入外宣星球报告后：一次性动态显示完整引导文案（公众号 + B站）
        // 注意：如果该用户属于该部门，会先展示 intro 弹层；此时页面内容不可见，动画会"播完看不到"。
        // 因此这里等待外宣页面真正可见后再触发。
        let started = false;
        let startTimer = null;

        const isStoryVisible = () => {
            if (!document.body.classList.contains('phase-dept')) return false;
            const intro = document.querySelector('.dept-intro-modal.active');
            if (intro) return false;
            if (!story.isConnected) return false;
            const rect = story.getBoundingClientRect();
            if (!rect || rect.height <= 0 || rect.width <= 0) return false;
            const style = window.getComputedStyle(story);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
            return true;
        };

        const tryStart = () => {
            if (started) return;
            if (isStoryVisible()) {
                started = true;
                setStep('full');
                return;
            }
            startTimer = setTimeout(tryStart, 200);
        };

        tryStart();

        window.__prNarrativeCleanup = () => {
            try { if (startTimer) clearTimeout(startTimer); } catch(e) {}
            startTimer = null;
        };
    } catch(e) {
        console.warn('[initPrDeptNarrative] failed:', e);
    }
}

// 影响力看板渲染函数
function renderInfluenceDashboard() {
    const wxTotal = WEIXIN_ARTICLES.reduce((acc, curr) => acc + curr.value, 0);
    const biliTotal = BILIBILI_VIDEOS.reduce((acc, curr) => acc + curr.value, 0);
    const totalViews = wxTotal + biliTotal;

    // 生成微信文章列表
    let wxListHtml = '';
    WEIXIN_ARTICLES.forEach((item, index) => {
        wxListHtml += `
            <div class="influence-item wx-type" onclick="window.open('${item.link}', '_blank')">
                <div class="influence-item-cover">
                    <img src="${item.cover}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://picsum.photos/200/150?random='+Math.random()">
                </div>
                <div class="influence-item-info">
                    <div class="influence-item-title">${item.title}</div>
                    <div class="influence-item-meta">
                        <div>
                            <span class="influence-item-date">${item.date}</span>
                        </div>
                        <span class="influence-value-badge influence-wx-text">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M10,16c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S10.6,16,10,16z M14,12c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S14.6,12,14,12z"/></svg>
                            ${item.value.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>`;
    });

    // 生成B站视频列表
    let biliListHtml = '';
    BILIBILI_VIDEOS.forEach((item, index) => {
        biliListHtml += `
            <div class="influence-item bili-type" onclick="window.open('${item.link}', '_blank')">
                <div class="influence-item-cover">
                    <img src="${item.cover}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='https://picsum.photos/200/150?random='+Math.random()">
                    <div class="influence-play-overlay">
                        <div class="influence-play-icon">▶</div>
                    </div>
                </div>
                <div class="influence-item-info">
                    <div class="influence-item-title">${item.title}</div>
                    <div class="influence-item-meta">
                        <div>
                            <span class="influence-item-date">${item.date}</span>
                            ${item.extra ? `<span class="influence-item-extra"> · ⏱ ${item.extra}</span>` : ''}
                        </div>
                        <span class="influence-value-badge influence-bili-text">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8,5v14l11-7L8,5z"/></svg>
                            ${item.value.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>`;
    });

    return `
        <div class="influence-dashboard" id="influence-dashboard">
            <div class="influence-hero">
                <div class="influence-hero-title">ANNUAL INFLUENCE REPORT</div>
                <div class="influence-number-big" id="influence-total-num">${totalViews.toLocaleString()}</div>
                <div class="influence-label-badge">Total Views</div>
            </div>

            <div class="influence-stats-row">
                <div class="influence-stat-card wx">
                    <div class="influence-stat-label">WeChat Reads</div>
                    <div class="influence-stat-value" id="influence-wx-total">${wxTotal.toLocaleString()}</div>
                </div>
                <div class="influence-stat-card bili">
                    <div class="influence-stat-label">Bilibili Views</div>
                    <div class="influence-stat-value" id="influence-bili-total">${biliTotal.toLocaleString()}</div>
                </div>
            </div>

            <div class="influence-columns">
                <div class="influence-column influence-col-wx">
                    <div class="influence-col-header">
                        <div class="influence-col-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5,15c-4.1,0-7.5-3-7.5-6.8S4.3,1.5,8.5,1.5s7.5,3,7.5,6.8S12.6,15,8.5,15z M17,14h-1.1c0.1,0.5,0.1,1,0.1,1.5c0,3.5-3.5,6.5-7.5,6.5c-0.8,0-1.6-0.1-2.4-0.3l-4,2.3l1-3.3C1.9,19.6,1,18.1,1,16.5C1,16,1.1,15.5,1.2,15H17z"/></svg>
                        </div>
                        <div>
                            <div class="influence-col-title">WeChat Articles</div>
                            <div class="influence-col-sub">${WEIXIN_ARTICLES.length} Items</div>
                        </div>
                    </div>
                    <div class="influence-list" id="influence-wx-list">
                        ${wxListHtml}
                    </div>
                </div>

                <div class="influence-column influence-col-bili">
                    <div class="influence-col-header">
                        <div class="influence-col-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.7,6.2l2.3-2.6l-1.3-1.2L17,5.5h-0.2c-0.4,0-0.7,0.3-0.7,0.7v0.4H7.9V6.2c0-0.4-0.3-0.7-0.7-0.7H7L4.3,2.4L3,3.6l2.3,2.6C2.3,7.2,0,9.7,0,12.7v5.6C0,20.3,1.7,22,3.8,22h16.4c2.1,0,3.8-1.7,3.8-3.7v-5.6C24,9.7,21.7,7.2,18.7,6.2z M8,16.5c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S8.8,16.5,8,16.5z M16,16.5c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S16.8,16.5,16,16.5z"/></svg>
                        </div>
                        <div>
                            <div class="influence-col-title">Bilibili Videos</div>
                            <div class="influence-col-sub">${BILIBILI_VIDEOS.length} Items</div>
                        </div>
                    </div>
                    <div class="influence-list" id="influence-bili-list">
                        ${biliListHtml}
                    </div>
                </div>
            </div>
        </div>`;
}

function initInfluenceDashboardAnimation() {
    // 1. 数字滚动动画
    const animateValue = (id, endValue) => {
        const obj = document.getElementById(id);
        if (!obj) return;
        // Reset to 0 before animating
        obj.innerHTML = "0";

        const duration = 2000;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(ease * endValue);
            obj.innerHTML = current.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = endValue.toLocaleString();
            }
        };
        window.requestAnimationFrame(step);
    };

    const wxTotal = WEIXIN_ARTICLES.reduce((acc, curr) => acc + curr.value, 0);
    const biliTotal = BILIBILI_VIDEOS.reduce((acc, curr) => acc + curr.value, 0);
    const totalViews = wxTotal + biliTotal;

    // Observer for Numbers
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue("influence-total-num", totalViews);
                animateValue("influence-wx-total", wxTotal);
                animateValue("influence-bili-total", biliTotal);
                statsObserver.disconnect(); // Run once
            }
        });
    }, { threshold: 0.1 });

    const dashboard = document.getElementById('influence-dashboard');
    if (dashboard) statsObserver.observe(dashboard);

    // 2. 卡片滚动弹出动画
    const items = document.querySelectorAll('.influence-item');
    const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                itemObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    items.forEach(item => {
        itemObserver.observe(item);
    });
}

;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();