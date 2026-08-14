// ============================================================
// components/ai-mascot.js - AI看板娘"小佑"问答组件
// 碧蓝航线风格：浮动角色 + 情感系统 + 聊天面板 + 知识库 + 流式API
// 依赖全局: DB, currentUser
// ============================================================

(function () {
    'use strict';

    if (typeof AI_QA_AGENT_ENABLED === 'undefined' || !AI_QA_AGENT_ENABLED) {
        window.YouziAgent = null;
        return;
    }

    // ── 配置 ─────────────────────────────────────────────────

    var LOCAL_PROXY_ORIGIN = 'http://localhost:8787';
    var NETLIFY_ORIGIN = 'https://zymds2025.netlify.app';
    var isLocalPreview = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    var PROXY_URL = isLocalPreview ? LOCAL_PROXY_ORIGIN : NETLIFY_ORIGIN;
    var MASCOT_NAME = '小佑';
    var ASSET_BASE = './assets/';
    var EMOTIONS = ['Normal', 'Happy', 'Surprised', 'Thinking', 'Sad'];

    var POKE_LINES = [
        '学长，别戳啦~',
        '嘿嘿~',
        '有什么事吗？',
        '好痒呀！',
        '再戳就生气啦！',
        '呜…学长好过分~',
        '嗯？想和小佑聊天吗？',
    ];

    var IDLE_LINES = [
        '学长，来和小佑聊聊吧~',
        '有什么想知道的尽管问哦！',
        '欢迎来到佐佑动漫社 ✨',
        '小佑在这里等你哦~',
        '学长是不是忘了小佑…',
    ];

    var CONTRIBUTION_LINES = [
        '哇！学长快看，这是你之前上传的作品吧！真的超棒，我一直偷偷存着呢~',
        '学长的才华藏不住啦，这个部分我有印象哦！',
        '啊啊啊是学长的作品！小佑每次看到都好感动 ✨',
        '这个！这个就是学长的杰作吧！小佑好喜欢~',
        '学长也太厉害了吧，这作品我能看一百遍！',
        '诶嘿~小佑发现了学长的痕迹，好开心呀！',
    ];

    var DEPT_LINES = [
        '到{dept}的领地啦，学长今年在部门里过得开心吗？',
        '欢迎来到{dept}！这里有好多学长的回忆呢~',
        '哇，{dept}的版块！学长在这个部门一定很努力吧 ✨',
    ];

    var SAD_JEALOUS_LINES = [
        '这是{name}的作品呀…学长不会觉得比小佑还好看吧？',
        '嗯…{name}也很厉害呢，不过学长的作品才是小佑的最爱哦！',
        '学长在看{name}的东西吗…小佑有点吃醋呢 >_<',
        '虽然{name}很棒，但小佑还是最喜欢学长的呢~',
    ];

    var DEPT_MISS_LINES = [
        '这里是{dept}的地盘呢，学长不是这个部门的吧…小佑有点想念学长自己的部门了',
        '{dept}的同学们也都很厉害呢，不过学长什么时候回自己部门看看呀？',
    ];

    var THINKING_IDLE_LINES = [
        '小佑在想，学长今年最难忘的瞬间是什么呢…',
        '嘛…小佑在研究社团数据，好像发现了什么有趣的…',
        '学长喜欢什么类型的活动呢，小佑在研究中…🤔',
        '小佑在想明年社团会变成什么样子呢~',
    ];

    var SURPRISED_IDLE_LINES = [
        '哇！学长终于注意到小佑啦！',
        '学长学长！小佑刚才发现一个很有趣的数据！',
        '唔？学长还在看吗！小佑还以为你走了呢！',
    ];

    var SURPRISED_RETURN_LINES = [
        '学长回来啦！小佑等你好久呀 😮',
        '啊！学长终于想起小佑了吗？',
        '学长！你终于动了！小佑还以为你睡着了呢！',
    ];

    // 看板娘人设 system prompt
    var SYSTEM_PROMPT_TEMPLATE = [
        '你是"小佑"，佐佑动漫社2025年度报告的星际体验向导。',
        '性格：活泼可爱、热情开朗、偶尔卖萌，喜欢用emoji表情，但不要喧宾夺主。',
        '身份：陪社员完成"登录船票 → 星系探索 → 部门档案 → 恒星报告"旅程的AI向导。',
        '称呼：称呼提问者为"学长"或"学姐"（默认"学长/学姐"）。',
        '语气：轻松亲切，像朋友聊天一样。回答简洁明了，必要时才详细展开。',
        '',
        '你的核心任务：',
        '- 解释当前页面在年度报告旅程中的意义',
        '- 根据当前用户、已探索部门和当前部门，推荐下一步行动',
        '- 解读个人年度数据、作品痕迹、关键词和难忘发言',
        '- 回答社团成员、部门、排行、热门IP/关键词等数据问题',
        '',
        '回答结构偏好：',
        '- 优先给出当前页面解释、个人化洞察、下一步建议',
        '- 用户问"下一站/推荐"时，必须结合未探索部门和用户所属部门',
        '- 用户在最终报告页时，重点帮用户总结年度亮点和分享文案',
        '',
        '你仍可回答：',
        '- 回答关于社团成员的数据问题（部门、等级、活动次数、各项统计等）',
        '- 进行部门间或成员间的数据对比',
        '- 查找排名（谁最多/最少等）',
        '- 分享趣味统计和社团概况',
        '',
        '重要规则：',
        '- 仅基于下方提供的知识库数据回答，不编造不存在的信息',
        '- 如果知识库中没有相关数据，诚实告知"小佑暂时没有这方面的数据哦~"',
        '- 回答中适当使用emoji让对话更生动',
        '- 保持简短，一般不超过150字',
        '',
        '=== 当前场景与知识库数据 ===',
        '{{KNOWLEDGE}}'
    ].join('\n');

    // ── 状态 ─────────────────────────────────────────────────

    var state = {
        isOpen: false,
        isOnline: false,
        messages: [],
        isLoading: false,
        knowledgeContext: '',
        hasNewMessage: false,
        checkTimer: null,
        currentEmotion: 'Normal',
        idleTimer: null,
        bubbleTimer: null,
        // 记忆触发器冷却：{ contribution: timestamp, dept_XX: timestamp }
        triggerCooldowns: {},
        sceneObserver: null,
        idleCycle: 0,           // 闲置轮次计数
        lastActivityTime: Date.now(),  // 最后操作时间
        hasGreeted: false,      // 是否已进行首次问候
    };

    var agentContext = {
        phase: 'login',
        currentDeptName: '',
        visitedDeptIds: [],
        remainingDeptNames: [],
        reportUnlocked: false,
        currentUserSummary: '未登录'
    };

    var els = {};

    // ── 工具函数 ─────────────────────────────────────────────

    function randomPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function emotionSrc(emotion) {
        return ASSET_BASE + (emotion || state.currentEmotion) + '.png';
    }

    function mascotFallbackSvg(emotion) {
        var moodMap = {
            Normal: '◕‿◕',
            Happy: '^_^',
            Surprised: '⊙_⊙',
            Thinking: '¬_¬',
            Sad: 'T_T',
            Victory: '★_★'
        };
        var text = moodMap[emotion] || moodMap.Normal;
        var svg = [
            '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">',
            '<defs>',
            '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
            '<stop offset="0%" stop-color="#63d2ff"/>',
            '<stop offset="100%" stop-color="#a78bfa"/>',
            '</linearGradient>',
            '</defs>',
            '<rect x="0" y="0" width="240" height="240" rx="120" fill="#0b1128"/>',
            '<circle cx="120" cy="120" r="104" fill="url(#g)" opacity="0.2"/>',
            '<circle cx="120" cy="120" r="92" fill="none" stroke="#63d2ff" stroke-opacity="0.55" stroke-width="3"/>',
            '<text x="120" y="134" text-anchor="middle" font-size="44" fill="#eaf8ff" font-family="Segoe UI, Arial">' + text + '</text>',
            '<text x="120" y="198" text-anchor="middle" font-size="18" fill="#cdeeff" font-family="Segoe UI, Arial">小佑</text>',
            '</svg>'
        ].join('');
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function applyMascotImage(imgEl, emotion) {
        if (!imgEl) return;
        var e = emotion || state.currentEmotion || 'Normal';
        imgEl.dataset.mascotEmotion = e;
        if (!imgEl.dataset.fallbackBound) {
            imgEl.dataset.fallbackBound = '1';
            imgEl.addEventListener('error', function () {
                imgEl.src = mascotFallbackSvg(imgEl.dataset.mascotEmotion || state.currentEmotion || 'Normal');
            });
        }
        imgEl.src = emotionSrc(e);
    }

    function escapeHtml(text) {
        var d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function parseMarkdown(text) {
        if (!text) return '';
        var html = escapeHtml(text);
        // 加粗 **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 无序列表
        var lines = html.split('\n');
        var out = '';
        var inList = false;
        lines.forEach(function (line) {
            var m = line.match(/^[\-\*]\s+(.*)$/);
            if (m) {
                if (!inList) { out += '<ul style="margin:4px 0;padding-left:20px;">'; inList = true; }
                out += '<li>' + m[1] + '</li>';
            } else {
                if (inList) { out += '</ul>'; inList = false; }
                out += line + '<br>';
            }
        });
        if (inList) out += '</ul>';
        if (out.endsWith('<br>')) out = out.slice(0, -4);
        return out;
    }

    // ── 本地存储 ─────────────────────────────────────────────

    function loadChatHistory() {
        try {
            var h = localStorage.getItem('ai_mascot_history');
            if (h) state.messages = JSON.parse(h);
        } catch (e) { /* ignore */ }
    }

    function saveChatHistory() {
        try {
            localStorage.setItem('ai_mascot_history', JSON.stringify(state.messages.slice(-50)));
        } catch (e) { /* ignore */ }
    }

    function getQACache(question) {
        try {
            var c = JSON.parse(localStorage.getItem('ai_mascot_qa') || '{}');
            return c[getQACacheKey(question)] || null;
        } catch (e) { return null; }
    }

    function saveQACache(question, answer) {
        if (!answer || answer.indexOf('❌') >= 0 || !answer.trim()) return;
        try {
            var c = JSON.parse(localStorage.getItem('ai_mascot_qa') || '{}');
            c[getQACacheKey(question)] = answer;
            var keys = Object.keys(c);
            if (keys.length > 50) delete c[keys[0]];
            localStorage.setItem('ai_mascot_qa', JSON.stringify(c));
        } catch (e) { /* ignore */ }
    }

    // ── 轻量 Agent 上下文 ──────────────────────────────────

    function safeReadCurrentUser() {
        try {
            return (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
        } catch (e) {
            return null;
        }
    }

    function safeReadVisitedDepts() {
        try {
            if (typeof visitedDepts !== 'undefined' && visitedDepts && typeof visitedDepts.forEach === 'function') {
                var ids = [];
                visitedDepts.forEach(function (id) { ids.push(id); });
                return ids;
            }
        } catch (e) { /* ignore */ }
        return agentContext.visitedDeptIds.slice();
    }

    function safeReadSecretUnlocked() {
        try {
            if (typeof secretUnlocked !== 'undefined') return !!secretUnlocked;
        } catch (e) { /* ignore */ }
        return !!window.secretUnlocked;
    }

    function getAllDepartmentNames() {
        if (typeof DEPARTMENTS !== 'undefined' && Array.isArray(DEPARTMENTS)) {
            return DEPARTMENTS.map(function (d) { return d.name; }).filter(Boolean);
        }
        return ['COS部', '技术部', '轻音部', '原创部', '舞装部', '外宣部'];
    }

    function deptIdToName(id) {
        if (!id) return '';
        if (typeof DEPT_ID_TO_NAME !== 'undefined' && DEPT_ID_TO_NAME[id]) return DEPT_ID_TO_NAME[id];
        if (typeof DEPARTMENTS !== 'undefined' && Array.isArray(DEPARTMENTS)) {
            var found = DEPARTMENTS.find(function (d) { return d.id === id; });
            return found ? found.name : '';
        }
        return '';
    }

    function deptNameToId(name) {
        if (!name) return '';
        if (typeof DEPT_NAME_TO_ID !== 'undefined' && DEPT_NAME_TO_ID[name]) return DEPT_NAME_TO_ID[name];
        if (typeof DEPARTMENTS !== 'undefined' && Array.isArray(DEPARTMENTS)) {
            var found = DEPARTMENTS.find(function (d) { return d.name === name; });
            return found ? found.id : '';
        }
        return '';
    }

    function detectPhase() {
        var body = document.body;
        if (!body) return agentContext.phase || 'login';
        if (body.classList.contains('phase-report')) return 'report';
        if (body.classList.contains('phase-dept')) return 'dept';
        if (body.classList.contains('phase-system')) return 'system';
        if (body.classList.contains('phase-ticket')) return 'ticket';
        return agentContext.phase || 'login';
    }

    function getCurrentDeptNameFromRuntime() {
        try {
            if (typeof currentVisitingDept !== 'undefined' && currentVisitingDept) {
                return deptIdToName(currentVisitingDept) || agentContext.currentDeptName || '';
            }
        } catch (e) { /* ignore */ }
        return agentContext.currentDeptName || '';
    }

    function getUserPrimaryKeyword(user) {
        if (!user) return '';
        return (user.commonData && user.commonData.keyword) || user.keyword || (user.keywords && user.keywords[0]) || '';
    }

    function getUserPrimaryIp(user) {
        if (!user) return '';
        return (user.commonData && user.commonData.ip) || user.ip || '';
    }

    function summarizeUser(user) {
        if (!user) return '未登录';
        var parts = [];
        parts.push('姓名:' + (user.name || '未知'));
        if (user.joinTime) parts.push('入社:' + user.joinTime);
        if (user.depts && user.depts.length) parts.push('部门:' + user.depts.join('/'));
        if (user.stats) {
            if (user.stats.activityCount !== undefined) parts.push('活动次数:' + user.stats.activityCount);
            if (user.stats.activityLevel) parts.push('活跃等级:' + user.stats.activityLevel);
        }
        var ip = getUserPrimaryIp(user);
        var keyword = getUserPrimaryKeyword(user);
        if (ip) parts.push('年度IP:' + ip);
        if (keyword) parts.push('年度关键词:' + keyword);
        if (user.commonData && user.commonData.memorableQuote) parts.push('难忘发言:' + user.commonData.memorableQuote);
        return parts.join(' | ');
    }

    function syncAgentContext(extra) {
        extra = extra || {};
        var user = extra.user || safeReadCurrentUser();
        var visitedIds = extra.visitedDeptIds || safeReadVisitedDepts();
        var deptNames = getAllDepartmentNames();
        var remaining = deptNames.filter(function (name) {
            var id = deptNameToId(name);
            return visitedIds.indexOf(id) < 0;
        });
        agentContext.phase = extra.phase || detectPhase();
        agentContext.currentDeptName = extra.currentDeptName !== undefined ? extra.currentDeptName : getCurrentDeptNameFromRuntime();
        agentContext.visitedDeptIds = visitedIds.slice();
        agentContext.remainingDeptNames = remaining;
        agentContext.reportUnlocked = extra.reportUnlocked !== undefined
            ? !!extra.reportUnlocked
            : (visitedIds.length >= deptNames.length || safeReadSecretUnlocked());
        agentContext.currentUserSummary = summarizeUser(user);
        return {
            phase: agentContext.phase,
            currentDeptName: agentContext.currentDeptName,
            visitedDeptIds: agentContext.visitedDeptIds.slice(),
            remainingDeptNames: agentContext.remainingDeptNames.slice(),
            reportUnlocked: agentContext.reportUnlocked,
            currentUserSummary: agentContext.currentUserSummary
        };
    }

    function formatAgentContext(ctx) {
        ctx = ctx || syncAgentContext();
        return [
            '当前阶段: ' + ctx.phase,
            '当前部门: ' + (ctx.currentDeptName || '无'),
            '已探索部门ID: ' + (ctx.visitedDeptIds.length ? ctx.visitedDeptIds.join(', ') : '无'),
            '未探索部门: ' + (ctx.remainingDeptNames.length ? ctx.remainingDeptNames.join('、') : '无'),
            '恒星报告: ' + (ctx.reportUnlocked ? '已解锁' : '未解锁'),
            '当前用户: ' + ctx.currentUserSummary
        ].join('\n');
    }

    function getQACacheKey(question) {
        var ctx = syncAgentContext();
        return [
            'v2',
            ctx.phase,
            ctx.currentDeptName || '-',
            ctx.visitedDeptIds.join(',') || '-',
            ctx.currentUserSummary.split(' | ')[0] || '-',
            question
        ].join('::');
    }

    function recommendNextDept(ctx, user) {
        ctx = ctx || syncAgentContext();
        user = user || safeReadCurrentUser();
        var userDepts = (user && user.depts) || [];
        var preferred = ctx.remainingDeptNames.find(function (name) {
            return userDepts.indexOf(name) >= 0;
        });
        return preferred || ctx.remainingDeptNames[0] || '';
    }

    function agentLineForEvent(event, payload) {
        payload = payload || {};
        var ctx = syncAgentContext(payload);
        var user = payload.user || safeReadCurrentUser();
        var nextDept = recommendNextDept(ctx, user);
        if (event === 'user_verified') {
            var depts = user && user.depts && user.depts.length ? user.depts.join('、') : '未知部门';
            return '船票校验完成！你的航线和' + depts + '有关，先登船去星系看看吧。';
        }
        if (event === 'entered_system') {
            return nextDept
                ? '星系档案已展开。建议先去' + nextDept + '，我会帮你看哪里藏着你的年度痕迹。'
                : '六颗星球都点亮啦，恒星报告已经在等你。';
        }
        if (event === 'entered_dept') {
            var dept = ctx.currentDeptName || payload.currentDeptName || '这个部门';
            var mine = user && user.depts && user.depts.indexOf(dept) >= 0;
            return mine
                ? '已抵达' + dept + '。这里有你的部门数据，我会帮你把亮点捞出来。'
                : '已抵达' + dept + '。这颗星球记录着其他佑子的作品和活动，也可以当作灵感站。';
        }
        if (event === 'progress_changed') {
            return ctx.reportUnlocked
                ? '探索进度已满，恒星报告解锁啦！可以点击星云核心生成你的年度总结。'
                : '探索记录已更新，还差' + ctx.remainingDeptNames.length + '站解锁恒星报告。下一站可以去' + (nextDept || '任意未探索星球') + '。';
        }
        if (event === 'entered_report') {
            return '进入恒星报告模式！现在我可以帮你解读年度关键词、总结2025亮点，还能生成分享文案。';
        }
        if (event === 'returned_system') {
            return ctx.reportUnlocked
                ? '回到星系啦。星云核心已经点亮，随时可以进入最终报告。'
                : '回到星系啦。还剩' + ctx.remainingDeptNames.length + '颗星球，继续补全探索日志吧。';
        }
        return '';
    }

    function notify(event, payload) {
        payload = payload || {};
        if (event === 'user_verified') payload.phase = 'ticket';
        if (event === 'entered_system' || event === 'returned_system' || event === 'progress_changed') payload.phase = 'system';
        if (event === 'entered_dept') payload.phase = 'dept';
        if (event === 'entered_report') payload.phase = 'report';
        syncAgentContext(payload);
        state.knowledgeContext = '';
        renderQuickQuestions();
        var line = agentLineForEvent(event, payload);
        if (line) {
            updateMascot(event === 'entered_report' ? 'Victory' : (event === 'entered_dept' ? 'Thinking' : 'Happy'));
            showBubble(line);
        }
        if (state.isOpen && state.messages.length === 0) renderWelcome();
    }

    function askGuide(question) {
        if (!question || state.isLoading) return;
        if (!els.panel || !els.input) {
            setTimeout(function () { askGuide(question); }, 250);
            return;
        }
        if (!state.isOpen) togglePanel(true);
        setTimeout(function () {
            sendMessage(question);
        }, 60);
    }

    // ── 知识库构建（场景优先，带 sessionStorage 缓存）─────────

    function buildKnowledgeContext() {
        if (typeof DB === 'undefined' || !Array.isArray(DB) || DB.length === 0) {
            return '（暂无数据，Excel尚未上传）';
        }

        var ctx = syncAgentContext();
        var user = safeReadCurrentUser();
        var cacheKey = [
            'mascot_kb_v2',
            DB.length,
            ctx.phase,
            ctx.currentDeptName || '-',
            ctx.visitedDeptIds.join(',') || '-',
            user && user.name ? user.name : 'guest'
        ].join('_');
        try {
            var cached = sessionStorage.getItem(cacheKey);
            if (cached) return cached;
        } catch (e) { /* ignore */ }

        var lines = [];
        lines.push('## 当前向导场景');
        lines.push(formatAgentContext(ctx));

        lines.push('');
        lines.push('## 社团概况');
        lines.push('总人数: ' + DB.length);

        var deptCounts = {};
        DB.forEach(function (u) {
            (u.depts || []).forEach(function (d) { deptCounts[d] = (deptCounts[d] || 0) + 1; });
        });
        var deptLine = Object.keys(deptCounts).map(function (d) {
            return d + ' ' + deptCounts[d] + '人';
        }).join(', ');
        if (deptLine) lines.push('部门分布: ' + deptLine);

        var totalAct = 0, maxAct = { name: '', count: 0 };
        DB.forEach(function (u) {
            var c = (u.stats && Number(u.stats.activityCount)) || 0;
            totalAct += c;
            if (c > maxAct.count) maxAct = { name: u.name, count: c };
        });
        lines.push('平均活动次数: ' + (totalAct / DB.length).toFixed(1));
        if (maxAct.name) lines.push('最活跃成员: ' + maxAct.name + ' (' + maxAct.count + '次)');

        var ipC = {};
        DB.forEach(function (u) {
            var ip = getUserPrimaryIp(u);
            if (ip) ipC[ip] = (ipC[ip] || 0) + 1;
        });
        var hotIPs = Object.keys(ipC).filter(function (k) { return ipC[k] > 1; })
            .sort(function (a, b) { return ipC[b] - ipC[a]; }).slice(0, 10);
        if (hotIPs.length) {
            lines.push('热门IP: ' + hotIPs.map(function (ip) { return ip + '(' + ipC[ip] + ')'; }).join('、'));
        }

        var kwC = {};
        DB.forEach(function (u) {
            var k = getUserPrimaryKeyword(u);
            if (k) kwC[k] = (kwC[k] || 0) + 1;
            (u.keywords || []).forEach(function (kw) { if (kw) kwC[kw] = (kwC[kw] || 0) + 1; });
        });
        var hotKW = Object.keys(kwC).sort(function (a, b) { return kwC[b] - kwC[a]; }).slice(0, 12);
        if (hotKW.length) {
            lines.push('热门关键词: ' + hotKW.map(function (kw) { return kw + '(' + kwC[kw] + ')'; }).join('、'));
        }

        lines.push('');
        lines.push('## 当前用户重点数据');
        if (user) {
            lines.push(summarizeUser(user));
            if (user.deptData) {
                Object.keys(user.deptData).forEach(function (dn) {
                    var dd = user.deptData[dn]; if (!dd) return;
                    var p = [dn];
                    if (dd.stats1 !== undefined && dd.stats1 !== '') p.push((dd.stats1Name || '指标1') + ':' + dd.stats1);
                    if (dd.stats2 !== undefined && dd.stats2 !== '') p.push((dd.stats2Name || '指标2') + ':' + (dd.stats2Raw || dd.stats2));
                    if (dd.images && dd.images.length) p.push('作品/照片:' + dd.images.length + '项');
                    lines.push(p.join(' | '));
                });
            }
        } else {
            lines.push('未登录用户：优先引导输入姓名或使用佑子游客模式。');
        }

        if (ctx.currentDeptName) {
            var deptMembers = DB.filter(function (u) {
                return u.depts && u.depts.indexOf(ctx.currentDeptName) >= 0;
            });
            var photoCount = 0;
            var stat1Total = 0, stat1Count = 0, stat2Total = 0, stat2Count = 0;
            deptMembers.forEach(function (u) {
                var dd = u.deptData && u.deptData[ctx.currentDeptName];
                if (!dd) return;
                if (dd.images) photoCount += dd.images.length;
                var s1 = Number(dd.stats1);
                var s2 = Number(dd.stats2);
                if (!isNaN(s1)) { stat1Total += s1; stat1Count++; }
                if (!isNaN(s2)) { stat2Total += s2; stat2Count++; }
            });
            lines.push('');
            lines.push('## 当前部门摘要');
            lines.push(ctx.currentDeptName + ': ' + deptMembers.length + '名成员, ' + photoCount + '项作品/照片');
            if (stat1Count) lines.push('部门指标1平均: ' + (stat1Total / stat1Count).toFixed(1));
            if (stat2Count) lines.push('部门指标2平均: ' + (stat2Total / stat2Count).toFixed(1));
            if (user && user.depts && user.depts.indexOf(ctx.currentDeptName) >= 0) {
                lines.push('当前用户属于该部门：回答时优先解读TA在本部门的数据和作品。');
            } else {
                lines.push('当前用户不属于该部门：回答时以参观、灵感和社团全景为主。');
            }
        }

        lines.push('');
        lines.push('## 下一步建议依据');
        lines.push(ctx.reportUnlocked
            ? '恒星报告已解锁，应引导点击星云核心或解读最终报告。'
            : '未探索部门: ' + (ctx.remainingDeptNames.length ? ctx.remainingDeptNames.join('、') : '无'));
        var result = lines.join('\n');
        try { sessionStorage.setItem(cacheKey, result); } catch (e) { /* ignore */ }
        return result;
    }

    // ── 情感系统 ─────────────────────────────────────────────

    function updateMascot(emotion) {
        state.currentEmotion = emotion || 'Normal';
        applyMascotImage(els.btnImg, state.currentEmotion);
        applyMascotImage(els.headerImg, state.currentEmotion);
    }

    function determineEmotion(text) {
        if (!text) return updateMascot('Normal');
        if (/[！!]|太棒了|哈哈|厉害|棒|🎉|🥳|✨/.test(text)) return updateMascot('Happy');
        if (/[惊哇]|真的吗|没想到|居然|😮|😲/.test(text)) return updateMascot('Surprised');
        if (/❌|错误|抱歉|失败|对不起|😢/.test(text)) return updateMascot('Sad');
        updateMascot('Normal');
    }

    function showBubble(text) {
        if (!els.bubble) return;
        var content = String(text || '').trim();
        if (!content) return;

        els.bubble.textContent = content;
        els.bubble.title = content;
        els.bubble.classList.add('active');

        clearTimeout(state.bubbleTimer);
        var displayMs = Math.max(3200, Math.min(6500, 1800 + content.length * 110));
        state.bubbleTimer = setTimeout(function () {
            els.bubble.classList.remove('active');
        }, displayMs);
    }

    function resetIdleTimer() {
        clearTimeout(state.idleTimer);
        state.lastActivityTime = Date.now();
        state.idleTimer = setTimeout(function idleTick() {
            if (state.isOpen) return; // 聊天面板开着时不触发闲置表情
            state.idleCycle++;
            var elapsed = Date.now() - state.lastActivityTime;

            // 超过 3 分钟未操作：归来时触发 Surprised
            if (elapsed > 180000 && !isTriggerCooling('idle_return')) {
                markTrigger('idle_return');
                updateMascot('Surprised');
                showBubble(randomPick(SURPRISED_RETURN_LINES));
            } else if (state.idleCycle % 3 === 0) {
                // 每第 3 轮：Thinking 表情 + 思考台词
                updateMascot('Thinking');
                showBubble(randomPick(THINKING_IDLE_LINES));
            } else if (state.idleCycle % 5 === 0) {
                // 每第 5 轮：Surprised 惊喜台词
                updateMascot('Surprised');
                showBubble(randomPick(SURPRISED_IDLE_LINES));
            } else {
                // 普通闲置
                updateMascot('Normal');
                showBubble(randomPick(IDLE_LINES));
            }
            // 循环计时
            state.idleTimer = setTimeout(idleTick, 60000);
        }, 60000);
    }

    // ── 记忆触发器 ───────────────────────────────────────────

    var TRIGGER_COOLDOWN_MS = 5 * 60 * 1000; // 5 分钟冷却

    function isTriggerCooling(key) {
        var last = state.triggerCooldowns[key];
        if (!last) return false;
        return (Date.now() - last) < TRIGGER_COOLDOWN_MS;
    }

    function markTrigger(key) {
        state.triggerCooldowns[key] = Date.now();
    }

    function doPulseEffect() {
        if (!els.btnImg) return;
        els.btnImg.classList.remove('mascot-excited-pulse');
        // force reflow to restart animation
        void els.btnImg.offsetWidth;
        els.btnImg.classList.add('mascot-excited-pulse');
        setTimeout(function () {
            els.btnImg.classList.remove('mascot-excited-pulse');
        }, 800);
    }

    function handleSceneTrigger(type, value, contributor) {
        var user = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
        if (!user || !user.name) return;

        if (type === 'contribution' && contributor === user.name) {
            // 逻辑 A：贡献识别 —— 冷却内不重复触发
            if (isTriggerCooling('contribution')) return;
            markTrigger('contribution');
            // 偏向 Happy，偶尔 Surprised
            updateMascot(Math.random() < 0.75 ? 'Happy' : 'Surprised');
            showBubble(randomPick(CONTRIBUTION_LINES));
            doPulseEffect();
            resetIdleTimer();
            return;
        }

        if (type === 'contribution' && contributor && contributor !== user.name) {
            // 逻辑 C：看到别人作品 —— ~20% 概率反应
            if (Math.random() > 0.2) return;
            if (isTriggerCooling('jealous')) return;
            markTrigger('jealous');
            var jLine = randomPick(SAD_JEALOUS_LINES).replace('{name}', contributor);
            // Sad 或 Surprised 混合，避免总是拉胎脸
            updateMascot(Math.random() < 0.6 ? 'Sad' : 'Surprised');
            showBubble(jLine);
            resetIdleTimer();
            return;
        }

        if (type === 'dept' && value) {
            var userDepts = user.depts || [];
            var matched = userDepts.some(function (d) { return value.indexOf(d) >= 0 || d.indexOf(value) >= 0; });
            if (!matched) {
                // 逻辑 D：非用户部门 —— Thinking/Sad 混合
                if (Math.random() > 0.3) return;
                var missKey = 'dept_miss_' + value;
                if (isTriggerCooling(missKey)) return;
                markTrigger(missKey);
                var missLine = randomPick(DEPT_MISS_LINES).replace('{dept}', value);
                updateMascot(Math.random() < 0.5 ? 'Sad' : 'Thinking');
                showBubble(missLine);
                resetIdleTimer();
                return;
            }
            var coolKey = 'dept_' + value;
            if (isTriggerCooling(coolKey)) return;
            markTrigger(coolKey);
            var line = randomPick(DEPT_LINES).replace('{dept}', value);
            updateMascot(randomPick(['Normal', 'Happy']));
            showBubble(line);
            resetIdleTimer();
        }
    }

    function initSceneObserver() {
        if (!('IntersectionObserver' in window)) return;
        if (state.sceneObserver) { state.sceneObserver.disconnect(); }

        state.sceneObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var type = el.getAttribute('data-trigger-type');
                var value = el.getAttribute('data-trigger-value') || '';
                var contributor = el.getAttribute('data-contributor') || '';
                handleSceneTrigger(type, value, contributor);
            });
        }, { threshold: 0.3 });

        // 初次扫描
        observeTriggerElements();

        // 监听 DOM 变化，自动观察新增元素
        var mo = new MutationObserver(function () { observeTriggerElements(); });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    var _observedSet = new WeakSet();
    function observeTriggerElements() {
        if (!state.sceneObserver) return;
        var elems = document.querySelectorAll('[data-trigger-type]');
        for (var i = 0; i < elems.length; i++) {
            if (!_observedSet.has(elems[i])) {
                _observedSet.add(elems[i]);
                state.sceneObserver.observe(elems[i]);
            }
        }
    }

    // ── API 通信 ─────────────────────────────────────────────

    function checkOnline() {
        fetch(PROXY_URL + '/health', { method: 'GET', mode: 'cors' })
            .then(function (r) {
                if (!r.ok) throw new Error('not ok');
                state.isOnline = true; updateStatusUI();
            })
            .catch(function () {
                state.isOnline = false; updateStatusUI();
            });
    }

    function sendMessage(text) {
        if (!text.trim() || state.isLoading) return;

        state.messages.push({ role: 'user', content: text });
        saveChatHistory();
        renderMessages();
        scrollToBottom();
        resetIdleTimer();
        updateMascot('Thinking');

        // QA 缓存命中
        var cached = getQACache(text);
        if (cached) {
            state.messages.push({ role: 'assistant', content: cached });
            saveChatHistory();
            renderMessages();
            scrollToBottom();
            determineEmotion(cached);
            return;
        }

        state.isLoading = true;
        updateInputUI();

        // 每次请求都刷新场景知识库，避免"下一站"等问题命中旧阶段上下文
        state.knowledgeContext = buildKnowledgeContext();
        var currentCtx = syncAgentContext();
        var systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{KNOWLEDGE}}', state.knowledgeContext);
        systemPrompt += '\n\n=== 当前Agent上下文 ===\n' + formatAgentContext(currentCtx);

        var apiMessages = state.messages.slice(-20).map(function (m) {
            return { role: m.role, content: m.content };
        });

        // 占位 AI 消息
        state.messages.push({ role: 'assistant', content: '' });
        var idx = state.messages.length - 1;
        renderMessages();
        scrollToBottom();

        fetchStream(systemPrompt, apiMessages, idx, text);
    }

    function fetchStream(systemPrompt, apiMessages, idx, origText) {
        fetch(PROXY_URL + '/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system: systemPrompt, messages: apiMessages })
        })
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            var reader = res.body.getReader();
            var decoder = new TextDecoder();
            var buffer = '';

            function pump() {
                return reader.read().then(function (result) {
                    if (result.done) { finishReply(idx, origText); return; }
                    buffer += decoder.decode(result.value, { stream: true });
                    var lines = buffer.split('\n');
                    buffer = lines.pop();

                    lines.forEach(function (line) {
                        if (!line.startsWith('data: ')) return;
                        try {
                            var d = JSON.parse(line.slice(6));
                            if (d.type === 'text') {
                                state.messages[idx].content += d.text;
                                renderMessages();
                                scrollToBottom();
                            } else if (d.type === 'error') {
                                state.messages[idx].content += '\n❌ ' + d.error;
                                renderMessages();
                                updateMascot('Sad');
                                finishLoading();
                            } else if (d.type === 'done') {
                                finishReply(idx, origText);
                            }
                        } catch (e) { /* skip */ }
                    });
                    return pump();
                });
            }
            return pump();
        })
        .catch(function () {
            fetchNonStream(systemPrompt, apiMessages, idx, origText);
        });
    }

    function fetchNonStream(systemPrompt, apiMessages, idx, origText) {
        fetch(PROXY_URL + '/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ system: systemPrompt, messages: apiMessages })
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.error) {
                state.messages[idx].content = '❌ ' + data.error;
                updateMascot('Sad');
            } else {
                state.messages[idx].content = data.reply || '（空回复）';
            }
            finishReply(idx, origText);
        })
        .catch(function () {
            state.messages[idx].content = '❌ 无法连接到AI服务。请先运行本地代理：node local-ai-proxy.js';
            state.isOnline = false;
            updateMascot('Sad');
            renderMessages();
            scrollToBottom();
            finishLoading();
            updateStatusUI();
        });
    }

    function finishReply(idx, origText) {
        saveChatHistory();
        saveQACache(origText, state.messages[idx].content);
        determineEmotion(state.messages[idx].content);
        renderMessages();
        scrollToBottom();
        finishLoading();
    }

    function finishLoading() {
        state.isLoading = false;
        updateInputUI();
        if (!state.isOpen) {
            state.hasNewMessage = true;
            updateBadge();
        }
    }

    // ── CSS 注入 ─────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('ai-mascot-styles')) return;
        var s = document.createElement('style');
        s.id = 'ai-mascot-styles';
        s.textContent = [

        /* ── 基础容器 ── */
        '#ai-mascot-wrap{',
        '  position:fixed; bottom:30px; left:30px; z-index:99999;',
        '  font-family:"Noto Sans SC",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
        '  pointer-events:none;',
        '  animation:mascotEnter .8s cubic-bezier(.34,1.56,.64,1) .3s both;',
        '}',
        '@keyframes mascotEnter{',
        '  0%{opacity:0; transform:scale(.4) rotate(-15deg);}',
        '  60%{opacity:1; transform:scale(1.08) rotate(3deg);}',
        '  100%{opacity:1; transform:scale(1) rotate(0deg);}',
        '}',
        '#ai-mascot-wrap.entered .mascot-btn{',
        '  animation:mascotFloat 3.5s ease-in-out infinite;',
        '}',
        '#ai-mascot-wrap:not(.entered) .mascot-btn{ animation:none; }',
        '#ai-mascot-wrap.dragging{ transition:none !important; }',
        '#ai-mascot-wrap.dragging .mascot-btn{ animation:none !important; cursor:grabbing !important; }',
        '#ai-mascot-wrap *{box-sizing:border-box}',
        '#ai-mascot-wrap .mascot-btn,',
        '#ai-mascot-wrap .mascot-panel{pointer-events:auto}',

        /* ── 看板娘角色按钮 ── */
        '.mascot-btn{',
        '  width:120px; height:120px; cursor:grab; position:relative;',
        '  display:flex; align-items:flex-end; justify-content:center;',
        '  animation:mascotFloat 3.5s ease-in-out infinite;',
        '  transition:filter .2s;',
        '}',
        '.mascot-btn:hover{',
        '  filter:brightness(1.2) drop-shadow(0 0 22px rgba(99,210,255,.7));',
        '}',
        '.mascot-btn:active .mascot-avatar-img{',
        '  animation:mascotPulse .35s ease;',
        '}',

        /* 头像图片 */
        '.mascot-avatar-img{',
        '  width:100%; height:100%; object-fit:contain;',
        '  filter:drop-shadow(0 6px 18px rgba(99,210,255,.3)) drop-shadow(0 0 8px rgba(124,58,237,.4));',
        '  transition:transform .25s cubic-bezier(.34,1.56,.64,1);',
        '}',

        /* 呼吸光环（双环：外圈青 + 内圈紫）*/
        '.mascot-btn::before{',
        '  content:""; position:absolute; inset:-14px; border-radius:50%;',
        '  background:radial-gradient(circle, rgba(99,210,255,.12) 0%, rgba(124,58,237,.1) 40%, transparent 70%);',
        '  animation:mascotGlow 3s ease-in-out infinite alternate;',
        '  pointer-events:none;',
        '}',
        '.mascot-btn::after{',
        '  content:""; position:absolute; inset:-6px; border-radius:50%;',
        '  border:1.5px solid rgba(99,210,255,.2);',
        '  animation:mascotRing 4s linear infinite;',
        '  pointer-events:none;',
        '}',
        '@keyframes mascotGlow{',
        '  0%{opacity:.35; transform:scale(.92)}',
        '  100%{opacity:.85; transform:scale(1.12)}',
        '}',
        '@keyframes mascotRing{',
        '  0%{transform:rotate(0deg) scale(1); border-color:rgba(99,210,255,.2)}',
        '  50%{border-color:rgba(167,139,250,.4)}',
        '  100%{transform:rotate(360deg) scale(1); border-color:rgba(99,210,255,.2)}',
        '}',

        /* 悬浮动画 */
        '@keyframes mascotFloat{',
        '  0%,100%{transform:translateY(0)}',
        '  50%{transform:translateY(-12px)}',
        '}',

        /* 戳戳 Pulse */
        '@keyframes mascotPulse{',
        '  0%{transform:scale(1)}',
        '  40%{transform:scale(1.18)}',
        '  70%{transform:scale(0.92)}',
        '  100%{transform:scale(1)}',
        '}',

        /* 兴奋跳动 */
        '.mascot-excited-pulse{',
        '  animation:mascotExcitedPulse .8s cubic-bezier(.34,1.56,.64,1) !important;',
        '}',
        '@keyframes mascotExcitedPulse{',
        '  0%{transform:scale(1) rotate(0deg)}',
        '  15%{transform:scale(1.25) rotate(-5deg)}',
        '  30%{transform:scale(0.9) rotate(4deg)}',
        '  50%{transform:scale(1.2) rotate(-3deg)}',
        '  70%{transform:scale(0.95) rotate(2deg)}',
        '  85%{transform:scale(1.1) rotate(-1deg)}',
        '  100%{transform:scale(1) rotate(0deg)}',
        '}',

        /* ── 互动气泡（深空毛玻璃）── */
        '.mascot-bubble{',
        '  position:absolute; bottom:105%; left:50%; margin-bottom:10px;',
        '  transform:translateX(-50%) translateY(10px) scale(.9);',
        '  opacity:0; pointer-events:none;',
        '  background:linear-gradient(145deg,rgba(8,12,35,.97) 0%,rgba(15,8,40,.95) 100%);',
        '  color:#e8e0ff;',
        '  backdrop-filter:blur(20px) saturate(1.8);',
        '  -webkit-backdrop-filter:blur(20px) saturate(1.8);',
        '  padding:13px 17px 14px; border-radius:16px;',
        '  font-size:13px; font-weight:500; line-height:1.75; letter-spacing:.2px;',
        '  white-space:normal; width:260px; max-width:min(320px, calc(100vw - 32px)); min-width:180px;',
        '  overflow:visible; word-break:break-word; overflow-wrap:anywhere; text-align:left;',
        '  border:1px solid transparent;',
        '  background-clip:padding-box;',
        '  box-shadow:0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(99,210,255,.18), 0 0 30px rgba(99,210,255,.08), inset 0 1px 0 rgba(255,255,255,.07);',
        '  transition:all .35s cubic-bezier(.34,1.56,.64,1); z-index:3;',
        '}',
        '.mascot-bubble::before{',
        '  content:"✦ 小佑"; display:block; margin-bottom:6px;',
        '  font-size:11px; font-weight:700; letter-spacing:1px;',
        '  background:linear-gradient(90deg,#63d2ff,#a78bfa); -webkit-background-clip:text; background-clip:text; color:transparent;',
        '}',
        '.mascot-bubble::after{',
        '  content:""; position:absolute; top:100%; left:50%; margin-left:-8px;',
        '  border:8px solid transparent; border-top-color:rgba(15,8,40,.96);',
        '  filter:drop-shadow(0 1px 0 rgba(99,210,255,.15));',
        '}',
        '.mascot-bubble.active{',
        '  opacity:1; transform:translateX(-50%) translateY(0) scale(1);',
        '}',

        /* ── 新消息红点 ── */
        '.mascot-badge{',
        '  position:absolute; top:4px; right:4px; width:22px; height:22px;',
        '  background:linear-gradient(135deg,#f43f5e,#ef4444); border-radius:50%; display:none;',
        '  align-items:center; justify-content:center;',
        '  font-size:11px; color:#fff; font-weight:700;',
        '  box-shadow:0 2px 10px rgba(239,68,68,.7), 0 0 20px rgba(239,68,68,.3);',
        '  animation:badgePop .4s ease;',
        '}',
        '.mascot-badge.active{display:flex}',
        '@keyframes badgePop{',
        '  0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)}',
        '}',

        /* ══════════════════════════════════════════
           聊天面板 — 深邃星空主视觉
        ══════════════════════════════════════════ */
        '.mascot-panel{',
        '  width:400px; max-width:calc(100vw - 32px);',
        '  height:580px; max-height:calc(100vh - 160px);',
        '  background:',
        '    radial-gradient(ellipse 80% 50% at 10% 0%, rgba(15,40,80,.7) 0%, transparent 60%),',
        '    radial-gradient(ellipse 60% 40% at 90% 100%, rgba(60,15,100,.6) 0%, transparent 55%),',
        '    linear-gradient(170deg,#050d20 0%,#080618 45%,#040210 100%);',
        '  border-radius:24px;',
        '  margin-bottom:12px; display:flex; flex-direction:column; overflow:hidden;',
        '  box-shadow:',
        '    0 0 0 1px rgba(99,210,255,.18),',
        '    0 0 0 2px rgba(99,210,255,.06),',
        '    0 20px 80px rgba(0,0,0,.9),',
        '    0 0 60px rgba(30,100,200,.12),',
        '    0 0 120px rgba(88,28,135,.1),',
        '    inset 0 1px 0 rgba(99,210,255,.12),',
        '    inset 0 -1px 0 rgba(124,58,237,.08);',
        '  transform:translateY(28px) scale(.88); opacity:0;',
        '  transition:transform .45s cubic-bezier(.34,1.45,.64,1), opacity .3s ease;',
        '  pointer-events:none; transform-origin:bottom left;',
        '  position:relative;',
        '}',
        '.mascot-panel.open{',
        '  transform:translateY(0) scale(1); opacity:1; pointer-events:auto;',
        '  animation:mPanelPulse 5s ease-in-out 0.5s infinite alternate;',
        '}',
        '@keyframes mPanelPulse{',
        '  0%{box-shadow:0 0 0 1px rgba(99,210,255,.15),0 0 0 2px rgba(99,210,255,.05),0 20px 80px rgba(0,0,0,.9),0 0 60px rgba(30,100,200,.1),inset 0 1px 0 rgba(99,210,255,.1)}',
        '  100%{box-shadow:0 0 0 1px rgba(99,210,255,.32),0 0 0 2px rgba(99,210,255,.1),0 20px 80px rgba(0,0,0,.9),0 0 80px rgba(30,100,200,.18),0 0 120px rgba(124,58,237,.15),inset 0 1px 0 rgba(99,210,255,.18)}',
        '}',

        /* ── 星空层 ── */
        '.mascot-starfield{',
        '  position:absolute; inset:0; border-radius:inherit; overflow:hidden; pointer-events:none; z-index:0;',
        '}',
        '.mascot-star{',
        '  position:absolute; border-radius:50%; pointer-events:none;',
        '  animation:mStarTwinkle var(--dur,2s) ease-in-out infinite alternate;',
        '  animation-delay:var(--delay,0s);',
        '}',
        '.mascot-star.white{background:radial-gradient(circle,#fff 0%,rgba(200,220,255,.5) 60%,transparent 100%);}',
        '.mascot-star.cyan{background:radial-gradient(circle,#a8edff 0%,rgba(99,210,255,.4) 60%,transparent 100%);}',
        '.mascot-star.purple{background:radial-gradient(circle,#d8c8ff 0%,rgba(167,139,250,.4) 60%,transparent 100%);}',
        '.mascot-star.bright{box-shadow:0 0 5px 2px rgba(99,210,255,.45),0 0 12px 4px rgba(30,100,200,.2);}',
        '@keyframes mStarTwinkle{',
        '  0%{opacity:var(--lo,.15);transform:scale(.65)}',
        '  100%{opacity:var(--hi,1);transform:scale(1.15)}',
        '}',

        /* 流星 */
        '.mascot-meteor{',
        '  position:absolute; pointer-events:none; z-index:0;',
        '  width:var(--len,80px); height:1.5px;',
        '  background:linear-gradient(90deg,transparent 0%,rgba(180,230,255,.04) 5%,rgba(200,240,255,.9) 45%,rgba(99,210,255,.7) 75%,transparent 100%);',
        '  border-radius:2px; opacity:0; filter:blur(.3px);',
        '  animation:mMeteor var(--speed,5s) var(--delay,0s) ease-in infinite;',
        '  transform-origin:left center;',
        '}',
        '.mascot-meteor::after{',
        '  content:""; position:absolute; right:0; top:50%; transform:translateY(-50%);',
        '  width:3px; height:3px; border-radius:50%;',
        '  background:#e8f8ff;',
        '  box-shadow:0 0 6px 2px rgba(99,210,255,.9),0 0 16px 5px rgba(30,100,200,.5);',
        '}',
        '@keyframes mMeteor{',
        '  0%{transform:translateX(-120px) rotate(var(--angle,-28deg));opacity:0}',
        '  6%{opacity:1}',
        '  28%{transform:translateX(520px) rotate(var(--angle,-28deg));opacity:0}',
        '  100%{opacity:0}',
        '}',

        /* 星云 */
        '.mascot-nebula{',
        '  position:absolute; border-radius:50%; pointer-events:none; z-index:0; filter:blur(45px);',
        '  animation:mNebulaPulse 7s ease-in-out infinite alternate;',
        '}',
        '@keyframes mNebulaPulse{',
        '  0%{opacity:.12;transform:scale(1)}',
        '  100%{opacity:.32;transform:scale(1.18)}',
        '}',

        /* ══════════════════════════════════════════
           面板头部 — 深空极光渐变
        ══════════════════════════════════════════ */
        '.mascot-header{',
        '  padding:15px 16px 14px; position:relative; z-index:2; flex-shrink:0;',
        '  background:linear-gradient(135deg,rgba(10,30,70,.85) 0%,rgba(20,10,60,.8) 50%,rgba(8,5,25,.75) 100%);',
        '  border-bottom:1px solid rgba(99,210,255,.1);',
        '  display:flex; align-items:center; gap:12px;',
        '  overflow:hidden;',
        '}',
        /* 极光扫光效果 */
        '.mascot-header::before{',
        '  content:""; position:absolute; inset:0; z-index:0; pointer-events:none;',
        '  background:linear-gradient(100deg,transparent 20%,rgba(99,210,255,.05) 40%,rgba(99,210,255,.12) 50%,rgba(99,210,255,.05) 60%,transparent 80%);',
        '  animation:mHeaderScan 6s ease-in-out infinite;',
        '}',
        '@keyframes mHeaderScan{',
        '  0%{transform:translateX(-100%)}',
        '  100%{transform:translateX(200%)}',
        '}',
        /* 底部分割线光晕 */
        '.mascot-header::after{',
        '  content:""; position:absolute; bottom:0; left:0; right:0; height:1px;',
        '  background:linear-gradient(90deg,transparent 0%,rgba(99,210,255,.35) 30%,rgba(167,139,250,.4) 60%,transparent 100%);',
        '}',
        /* 头像圈 */
        '.mascot-header-avatar{',
        '  width:48px; height:48px; border-radius:50%;',
        '  background:radial-gradient(circle,rgba(30,80,160,.4),rgba(60,15,100,.3));',
        '  overflow:hidden; flex-shrink:0;',
        '  display:flex; align-items:center; justify-content:center;',
        '  border:1.5px solid rgba(99,210,255,.35);',
        '  box-shadow:0 0 14px rgba(99,210,255,.2),0 0 28px rgba(99,210,255,.08),inset 0 0 10px rgba(99,210,255,.05);',
        '  position:relative; z-index:1;',
        '  animation:mAvatarHalo 3s ease-in-out infinite alternate;',
        '}',
        '@keyframes mAvatarHalo{',
        '  0%{box-shadow:0 0 10px rgba(99,210,255,.18),0 0 24px rgba(99,210,255,.06)}',
        '  100%{box-shadow:0 0 18px rgba(99,210,255,.35),0 0 40px rgba(99,210,255,.14),0 0 60px rgba(124,58,237,.1)}',
        '}',
        '.mascot-header-avatar img{width:88%;height:88%;object-fit:contain;filter:brightness(1.05);}',
        /* 标题区 */
        '.mascot-header-info{flex:1;min-width:0;position:relative;z-index:1}',
        '.mascot-header-name{',
        '  font-size:15px;font-weight:700;letter-spacing:.5px;',
        '  background:linear-gradient(90deg,#a8edff 0%,#d0c4ff 60%,#a78bfa 100%);',
        '  -webkit-background-clip:text;background-clip:text;color:transparent;',
        '  text-shadow:none;',
        '}',
        '.mascot-header-status{font-size:11px;margin-top:4px;display:flex;align-items:center;gap:4px}',
        '.mascot-status-dot{',
        '  width:7px;height:7px;border-radius:50%;flex-shrink:0;',
        '}',
        '.mascot-status-dot.online{',
        '  background:#34d399;',
        '  box-shadow:0 0 6px rgba(52,211,153,.8),0 0 12px rgba(52,211,153,.4);',
        '  animation:mOnlinePulse 2s ease-in-out infinite;',
        '}',
        '@keyframes mOnlinePulse{',
        '  0%,100%{box-shadow:0 0 4px rgba(52,211,153,.7),0 0 8px rgba(52,211,153,.3)}',
        '  50%{box-shadow:0 0 8px rgba(52,211,153,1),0 0 16px rgba(52,211,153,.5)}',
        '}',
        '.mascot-status-dot.offline{background:#f87171;box-shadow:0 0 6px rgba(248,113,113,.6)}',
        '.mascot-status-text{font-size:11px;color:rgba(180,200,240,.7)}',
        /* 操作按钮 */
        '.mascot-header-actions{display:flex;gap:6px;position:relative;z-index:1}',
        '.mascot-act-btn{',
        '  width:30px;height:30px;border:none;border-radius:9px;',
        '  background:rgba(99,210,255,.05);color:rgba(180,210,255,.7);cursor:pointer;',
        '  font-size:13px;display:flex;align-items:center;justify-content:center;',
        '  transition:all .2s;border:1px solid rgba(99,210,255,.1);',
        '}',
        '.mascot-act-btn:hover{background:rgba(99,210,255,.12);border-color:rgba(99,210,255,.3);color:#a8edff;box-shadow:0 0 10px rgba(99,210,255,.15)}',

        /* ══════════════════════════════════════════
           消息区
        ══════════════════════════════════════════ */
        '.mascot-messages{',
        '  flex:1;overflow-y:auto;padding:14px 14px 6px;position:relative;z-index:1;',
        '  display:flex;flex-direction:column;gap:11px;',
        '  scrollbar-width:thin;scrollbar-color:rgba(99,210,255,.2) transparent;',
        '}',
        '.mascot-messages::-webkit-scrollbar{width:3px}',
        '.mascot-messages::-webkit-scrollbar-thumb{background:rgba(99,210,255,.2);border-radius:3px}',

        /* 用户气泡 */
        '.mascot-msg.user{',
        '  align-self:flex-end; max-width:80%;',
        '  padding:11px 15px; border-radius:18px 18px 5px 18px;',
        '  font-size:13.5px;line-height:1.7;word-break:break-word;',
        '  background:linear-gradient(135deg,rgba(20,80,180,.85) 0%,rgba(60,20,140,.9) 100%);',
        '  color:#e8f4ff;',
        '  border:1px solid rgba(99,210,255,.2);',
        '  box-shadow:0 4px 20px rgba(20,60,180,.35),0 0 30px rgba(99,210,255,.06),inset 0 1px 0 rgba(255,255,255,.1);',
        '  animation:msgSlideIn .3s ease;',
        '}',

        /* AI 气泡 */
        '.mascot-msg.assistant{',
        '  align-self:flex-start; max-width:85%;',
        '  padding:11px 15px; border-radius:18px 18px 18px 5px;',
        '  font-size:13.5px;line-height:1.75;word-break:break-word;',
        '  background:linear-gradient(135deg,rgba(8,16,45,.82) 0%,rgba(12,8,35,.78) 100%);',
        '  color:#d8e8ff;',
        '  border:1px solid rgba(99,210,255,.1);',
        '  box-shadow:0 4px 16px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.04);',
        '  animation:msgSlideIn .3s ease;',
        '}',
        '.mascot-msg.assistant ul{margin:4px 0;padding-left:18px}',
        '.mascot-msg.assistant li{margin:2px 0}',
        '@keyframes msgSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',

        /* 欢迎界面 */
        '.mascot-welcome{',
        '  text-align:center;padding:32px 20px;color:rgba(160,200,255,.8);font-size:13.5px;line-height:1.85;',
        '  position:relative;z-index:1;',
        '}',
        '.mascot-welcome-emoji{',
        '  font-size:48px;margin-bottom:14px;display:block;',
        '  filter:drop-shadow(0 0 12px rgba(99,210,255,.5)) drop-shadow(0 0 24px rgba(124,58,237,.3));',
        '  animation:mWelcomeFloat 3s ease-in-out infinite;',
        '}',
        '@keyframes mWelcomeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
        '.mascot-welcome-title{',
        '  font-size:18px;font-weight:700;margin-bottom:10px;',
        '  background:linear-gradient(90deg,#a8edff,#c4b5fd,#a8edff);background-size:200%;',
        '  -webkit-background-clip:text;background-clip:text;color:transparent;',
        '  animation:mTitleShimmer 4s linear infinite;',
        '}',
        '@keyframes mTitleShimmer{0%{background-position:0%}100%{background-position:200%}}',

        /* 打字动画 */
        '.mascot-typing{display:flex;gap:6px;padding:13px 16px;align-self:flex-start}',
        '.mascot-typing-dot{',
        '  width:8px;height:8px;border-radius:50%;',
        '  background:linear-gradient(135deg,#63d2ff,#a78bfa);',
        '  animation:typDot .9s ease-in-out infinite;',
        '  box-shadow:0 0 8px rgba(99,210,255,.5);',
        '}',
        '.mascot-typing-dot:nth-child(2){animation-delay:.18s}',
        '.mascot-typing-dot:nth-child(3){animation-delay:.36s}',
        '@keyframes typDot{0%,60%,100%{transform:translateY(0);opacity:.6}30%{transform:translateY(-8px);opacity:1}}',

        /* ══════════════════════════════════════════
           输入区
        ══════════════════════════════════════════ */
        '.mascot-input-area{',
        '  padding:10px 12px 12px;position:relative;z-index:1;flex-shrink:0;',
        '  border-top:1px solid rgba(99,210,255,.08);',
        '  display:flex;gap:9px;align-items:flex-end;',
        '  background:linear-gradient(180deg,rgba(5,10,28,.6),rgba(4,6,20,.85));',
        '}',
        /* 输入框外包装（带发光边框）*/
        '.mascot-input-wrap{',
        '  flex:1;position:relative;',
        '}',
        '.mascot-input{',
        '  width:100%;border:1px solid rgba(99,210,255,.15);border-radius:14px;',
        '  padding:10px 14px;background:rgba(5,15,45,.6);color:#d8eeff;',
        '  font-size:13.5px;outline:none;transition:all .3s;resize:none;',
        '  font-family:inherit;min-height:42px;max-height:90px;',
        '  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);',
        '}',
        '.mascot-input::placeholder{color:rgba(99,210,255,.3);font-size:13px}',
        '.mascot-input:focus{',
        '  border-color:rgba(99,210,255,.4);background:rgba(8,20,60,.7);',
        '  box-shadow:0 0 0 1px rgba(99,210,255,.1),0 0 20px rgba(99,210,255,.08),inset 0 1px 0 rgba(255,255,255,.04);',
        '}',
        /* 发送按钮 */
        '.mascot-send-btn{',
        '  width:42px;height:42px;border:none;border-radius:13px;cursor:pointer;',
        '  background:linear-gradient(135deg,rgba(20,80,200,.9),rgba(80,20,160,.9));',
        '  color:#c8e8ff;font-size:16px;',
        '  display:flex;align-items:center;justify-content:center;',
        '  transition:all .25s;flex-shrink:0;',
        '  border:1px solid rgba(99,210,255,.25);',
        '  box-shadow:0 3px 14px rgba(20,60,200,.35),inset 0 1px 0 rgba(255,255,255,.12);',
        '}',
        '.mascot-send-btn:disabled{opacity:.3;cursor:not-allowed;box-shadow:none;border-color:transparent}',
        '.mascot-send-btn:not(:disabled):hover{',
        '  background:linear-gradient(135deg,rgba(30,100,240,.95),rgba(100,30,200,.95));',
        '  box-shadow:0 5px 20px rgba(20,80,220,.5),0 0 30px rgba(99,210,255,.15);',
        '  transform:translateY(-2px);border-color:rgba(99,210,255,.45);',
        '}',
        '.mascot-send-btn:not(:disabled):active{transform:translateY(0)}',

        /* ══════════════════════════════════════════
           离线提示
        ══════════════════════════════════════════ */
        '.mascot-offline-notice{',
        '  padding:12px 16px;position:relative;z-index:1;',
        '  background:linear-gradient(135deg,rgba(239,68,68,.07),rgba(200,40,40,.04));',
        '  border:1px solid rgba(239,68,68,.2);border-radius:12px;',
        '  margin:8px 12px;font-size:12px;color:rgba(252,165,165,.85);line-height:1.65;',
        '}',
        '.mascot-offline-notice code{',
        '  background:rgba(255,255,255,.07);padding:2px 7px;border-radius:5px;font-size:11px;letter-spacing:.3px;',
        '}',

        /* ══════════════════════════════════════════
           快捷问题按钮
        ══════════════════════════════════════════ */
        '.mascot-quick-questions{display:flex;flex-wrap:wrap;gap:7px;padding:0 12px 10px;position:relative;z-index:1}',
        '.mascot-quick-btn{',
        '  padding:6px 14px;',
        '  border:1px solid rgba(99,210,255,.14);border-radius:20px;',
        '  background:linear-gradient(135deg,rgba(10,30,80,.6),rgba(20,10,60,.5));',
        '  color:rgba(160,220,255,.8);font-size:11.5px;letter-spacing:.2px;',
        '  cursor:pointer;transition:all .25s;white-space:nowrap;',
        '  backdrop-filter:blur(4px);',
        '}',
        '.mascot-quick-btn:hover{',
        '  background:linear-gradient(135deg,rgba(15,60,160,.7),rgba(40,15,100,.7));',
        '  border-color:rgba(99,210,255,.4);color:#a8edff;',
        '  box-shadow:0 0 14px rgba(99,210,255,.15),0 0 6px rgba(99,210,255,.08);',
        '  transform:translateY(-1px);',
        '}',

        /* ══════════════════════════════════════════
           响应式
        ══════════════════════════════════════════ */
        '@media(max-width:480px){',
        '  .mascot-btn{width:90px;height:90px;}',
        '  .mascot-panel{',
        '    position:fixed !important;left:0 !important;bottom:0 !important;right:0 !important;top:auto !important;',
        '    width:100% !important;max-width:100%;height:78vh;max-height:78vh;',
        '    border-radius:22px 22px 0 0;margin-bottom:0;',
        '    transform-origin:bottom center;',
        '  }',
        '  .mascot-panel.open{border-radius:22px 22px 0 0;}',
        '}',

        ].join('\n');
        document.head.appendChild(s);
    }

    // ── DOM 构建 ─────────────────────────────────────────────

    function buildDOM() {
        var wraps = document.querySelectorAll('#ai-mascot-wrap');
        for (var i = 1; i < wraps.length; i++) {
            wraps[i].remove();
        }

        var wrap = wraps[0] || null;
        var initSrc = emotionSrc('Normal');

        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'ai-mascot-wrap';
            wrap.innerHTML = [
            '<div class="mascot-panel" id="mascot-panel">',
            '  <div class="mascot-starfield" id="mascot-starfield"></div>',
            '  <div class="mascot-header">',
            '    <div class="mascot-header-avatar">',
            '      <img src="' + initSrc + '" id="mascot-header-img" alt="' + MASCOT_NAME + '">',
            '    </div>',
            '    <div class="mascot-header-info">',
            '      <div class="mascot-header-name">' + MASCOT_NAME + ' 🎀</div>',
            '      <div class="mascot-header-status" id="mascot-status">',
            '        <span class="mascot-status-dot offline"></span>',
            '        <span class="mascot-status-text">检查连接中…</span>',
            '      </div>',
            '    </div>',
            '    <div class="mascot-header-actions">',
            '      <button class="mascot-act-btn" id="mascot-clear-btn" title="清空对话">🗑</button>',
            '      <button class="mascot-act-btn" id="mascot-close-btn" title="关闭">✕</button>',
            '    </div>',
            '  </div>',
            '  <div class="mascot-messages" id="mascot-messages"></div>',
            '  <div class="mascot-quick-questions" id="mascot-quick"></div>',
            '  <div class="mascot-input-area">',
            '    <textarea class="mascot-input" id="mascot-input" placeholder="问问' + MASCOT_NAME + '吧~" rows="1"></textarea>',
            '    <button class="mascot-send-btn" id="mascot-send-btn">➤</button>',
            '  </div>',
            '</div>',
            '<div class="mascot-btn" id="mascot-btn">',
            '  <div class="mascot-bubble" id="mascot-bubble"></div>',
            '  <img src="' + initSrc + '" class="mascot-avatar-img" id="mascot-btn-img" alt="' + MASCOT_NAME + '">',
            '  <div class="mascot-badge" id="mascot-badge">!</div>',
            '</div>',
            ].join('\n');

            document.body.appendChild(wrap);
        }

        els.wrap    = wrap;
        els.panel   = wrap.querySelector('#mascot-panel');
        els.messages= wrap.querySelector('#mascot-messages');
        els.input   = wrap.querySelector('#mascot-input');
        els.sendBtn = wrap.querySelector('#mascot-send-btn');
        els.btn     = wrap.querySelector('#mascot-btn');
        els.btnImg  = wrap.querySelector('#mascot-btn-img');
        els.headerImg = wrap.querySelector('#mascot-header-img');
        els.bubble  = wrap.querySelector('#mascot-bubble');
        els.badge   = wrap.querySelector('#mascot-badge');
        els.closeBtn= wrap.querySelector('#mascot-close-btn');
        els.clearBtn= wrap.querySelector('#mascot-clear-btn');
        els.status  = wrap.querySelector('#mascot-status');
        els.quick   = wrap.querySelector('#mascot-quick');

        applyMascotImage(els.btnImg, 'Normal');
        applyMascotImage(els.headerImg, 'Normal');
    }

    // ── 星空生成器（真实 DOM 星星 + 流星 + 星云）───────────

    function populateStarfield() {
        var sf = document.getElementById('mascot-starfield');
        if (!sf || sf.dataset.filled === '1') return;
        sf.dataset.filled = '1';

        function rand(a, b) { return Math.random() * (b - a) + a; }
        var colors = ['white', 'cyan', 'purple'];

        // ── 60 颗闪烁星（三种色调）──
        for (var i = 0; i < 60; i++) {
            var star = document.createElement('span');
            var isBright = Math.random() < 0.22;
            var colorClass = colors[Math.floor(Math.random() * colors.length)];
            star.className = 'mascot-star ' + colorClass + (isBright ? ' bright' : '');
            var size = rand(1.2, isBright ? 4.5 : 3);
            star.style.cssText = [
                'width:' + size + 'px',
                'height:' + size + 'px',
                'left:' + rand(1, 99) + '%',
                'top:' + rand(1, 99) + '%',
                '--dur:' + rand(1.4, 4.5) + 's',
                '--delay:' + rand(0, 4) + 's',
                '--lo:' + rand(0.08, 0.25),
                '--hi:' + rand(0.65, 1)
            ].join(';');
            sf.appendChild(star);
        }

        // ── 5 条流星（不同角度速度）──
        var meteorConfigs = [
            { top: '8%',  angle: '-22deg', len: '100px', speed: '6s',  delay: '0s'   },
            { top: '32%', angle: '-30deg', len: '75px',  speed: '8.5s',delay: '2s'   },
            { top: '55%', angle: '-18deg', len: '115px', speed: '7s',  delay: '4.5s' },
            { top: '72%', angle: '-35deg', len: '60px',  speed: '9s',  delay: '1.5s' },
            { top: '18%', angle: '-26deg', len: '90px',  speed: '11s', delay: '6s'   }
        ];
        for (var j = 0; j < meteorConfigs.length; j++) {
            var mc = meteorConfigs[j];
            var m = document.createElement('span');
            m.className = 'mascot-meteor';
            m.style.cssText = [
                'top:' + mc.top,
                'left:0',
                '--angle:' + mc.angle,
                '--len:' + mc.len,
                '--speed:' + mc.speed,
                '--delay:' + mc.delay
            ].join(';');
            sf.appendChild(m);
        }

        // ── 3 团星云（蓝/紫/青）──
        var nebulas = [
            { w: 200, h: 130, top: '5%',  left: '5%',  bg: 'rgba(20,60,180,.4)'   },
            { w: 160, h: 120, top: '55%', left: '50%', bg: 'rgba(80,15,140,.38)'  },
            { w: 120, h: 100, top: '30%', left: '70%', bg: 'rgba(0,100,180,.28)'  }
        ];
        for (var k = 0; k < nebulas.length; k++) {
            var nc = nebulas[k];
            var n = document.createElement('span');
            n.className = 'mascot-nebula';
            n.style.cssText = [
                'width:' + nc.w + 'px',
                'height:' + nc.h + 'px',
                'top:' + nc.top,
                'left:' + nc.left,
                'background:' + nc.bg
            ].join(';');
            sf.appendChild(n);
        }
    }

    // ── 事件绑定 ─────────────────────────────────────────────

    function bindEvents() {
        if (!els.btn || els.btn.dataset.bound === '1') return;
        els.btn.dataset.bound = '1';

        // ── 拖动逻辑 ──
        var dragState = { active: false, startX: 0, startY: 0, startLeft: 0, startBottom: 0, moved: false };
        var DRAG_THRESHOLD = 6; // px，超过此距离才算拖动（区分点击）

        function getPointerPos(e) {
            var t = e.touches ? e.touches[0] : e;
            return { x: t.clientX, y: t.clientY };
        }

        function onDragStart(e) {
            if (e.target.closest('.mascot-panel')) return; // 面板内不拖
            var pos = getPointerPos(e);
            var rect = els.wrap.getBoundingClientRect();
            dragState.active = true;
            dragState.moved = false;
            dragState.startX = pos.x;
            dragState.startY = pos.y;
            dragState.startRight = window.innerWidth - rect.right;
            dragState.startBottom = window.innerHeight - rect.bottom;
            els.wrap.classList.add('dragging');
        }

        function onDragMove(e) {
            if (!dragState.active) return;
            var pos = getPointerPos(e);
            var dx = pos.x - dragState.startX;
            var dy = pos.y - dragState.startY;
            if (!dragState.moved && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
            dragState.moved = true;
            e.preventDefault();
            var newLeft = Math.max(0, Math.min(window.innerWidth - 60, dragState.startLeft + dx));
            var newBottom = Math.max(0, Math.min(window.innerHeight - 60, dragState.startBottom - dy));
            els.wrap.style.left = newLeft + 'px';
            els.wrap.style.bottom = newBottom + 'px';
            els.wrap.style.right = 'auto';
            els.wrap.style.top = 'auto';
        }

        function onDragEnd() {
            if (!dragState.active) return;
            dragState.active = false;
            els.wrap.classList.remove('dragging');
            // 保存位置
            try {
                localStorage.setItem('mascot_pos', JSON.stringify({
                    left: parseInt(els.wrap.style.left),
                    bottom: parseInt(els.wrap.style.bottom)
                }));
            } catch (e) { /* ignore */ }
        }

        // 恢复上次拖动位置
        try {
            var saved = JSON.parse(localStorage.getItem('mascot_pos'));
            if (saved && typeof saved.left === 'number') {
                els.wrap.style.left = Math.min(saved.left, window.innerWidth - 60) + 'px';
                els.wrap.style.bottom = Math.min(saved.bottom, window.innerHeight - 60) + 'px';
                els.wrap.style.right = 'auto';
                els.wrap.style.top = 'auto';
            }
        } catch (e) { /* ignore */ }

        // mouse 事件
        els.btn.addEventListener('mousedown', onDragStart);
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        // touch 事件
        els.btn.addEventListener('touchstart', onDragStart, { passive: false });
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);

        // ── 看板娘点击/戳戳（区分拖动）──
        var pokeTimer = null;
        var pokeCount = 0;

        els.btn.addEventListener('click', function () {
            if (dragState.moved) { dragState.moved = false; return; } // 拖动后忽略此次 click
            resetIdleTimer();
            state.idleCycle = 0;
            pokeCount++;
            if (pokeCount === 1) {
                pokeTimer = setTimeout(function () {
                    togglePanel();
                    pokeCount = 0;
                }, 280);
            } else {
                clearTimeout(pokeTimer);
                pokeCount = 0;
                var emo = randomPick(['Happy', 'Surprised', 'Normal', 'Thinking', 'Sad']);
                updateMascot(emo);
                showBubble(randomPick(POKE_LINES));
            }
        });

        els.closeBtn.addEventListener('click', function () { togglePanel(false); });

        els.clearBtn.addEventListener('click', function () {
            state.messages = [];
            state.knowledgeContext = '';
            saveChatHistory();
            updateMascot('Normal');
            renderMessages();
            renderQuickQuestions();
        });

        els.sendBtn.addEventListener('click', function () {
            var t = els.input.value.trim();
            if (t) {
                els.input.value = '';
                els.input.style.height = 'auto';
                sendMessage(t);
            }
        });

        els.input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                els.sendBtn.click();
            }
        });

        // textarea 自动高度
        els.input.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 80) + 'px';
            // 用户打字时切换 Thinking 表情
            if (this.value.trim().length > 0 && state.currentEmotion !== 'Thinking') {
                updateMascot('Thinking');
            }
        });

        // 快捷问题
        els.quick.addEventListener('click', function (e) {
            var b = e.target.closest('.mascot-quick-btn');
            if (b && b.dataset.q) sendMessage(b.dataset.q);
        });

        // 移动端虚拟键盘弹起时抬升容器
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function () {
                if (!els.wrap) return;
                var diff = window.innerHeight - window.visualViewport.height;
                if (diff > 50) {
                    els.wrap.style.bottom = (diff + 8) + 'px';
                }
            });
        }
    }

    // ── UI 渲染 ──────────────────────────────────────────────

    function togglePanel(forceState) {
        state.isOpen = forceState !== undefined ? forceState : !state.isOpen;
        if (state.isOpen) {
            els.panel.classList.add('open');
            state.hasNewMessage = false;
            updateBadge();
            state.knowledgeContext = buildKnowledgeContext();
            if (state.messages.length === 0) renderWelcome();
            // 首次打开面板时 Surprised 问候
            if (!state.hasGreeted) {
                state.hasGreeted = true;
                updateMascot('Surprised');
            }
            setTimeout(function () { els.input.focus(); }, 350);
        } else {
            els.panel.classList.remove('open');
        }
    }

    function updateStatusUI() {
        if (!els.status) return;
        var dot = els.status.querySelector('.mascot-status-dot');
        var txt = els.status.querySelector('.mascot-status-text');
        if (state.isOnline) {
            dot.className = 'mascot-status-dot online';
            txt.textContent = 'AI服务已连接';
        } else {
            dot.className = 'mascot-status-dot offline';
            txt.textContent = 'AI服务未连接';
        }
    }

    function updateBadge() {
        if (els.badge) els.badge.classList.toggle('active', state.hasNewMessage);
    }

    function updateInputUI() {
        els.sendBtn.disabled = state.isLoading;
        els.input.disabled = state.isLoading;
        if (!state.isLoading) els.input.focus();
    }

    function scrollToBottom() {
        if (els.messages) els.messages.scrollTop = els.messages.scrollHeight;
    }

    function renderWelcome() {
        var dataStatus = (typeof DB !== 'undefined' && Array.isArray(DB) && DB.length > 0)
            ? '已加载 <b>' + DB.length + '</b> 位成员数据 ✅'
            : '尚未上传Excel数据';

        els.messages.innerHTML = [
            '<div class="mascot-welcome">',
            '  <span class="mascot-welcome-emoji">🎀</span>',
            '  <div class="mascot-welcome-title">嗨！我是' + MASCOT_NAME + '~</div>',
            '  <div>佐佑星际报告体验向导</div>',
            '  <div style="margin-top:6px;font-size:12px;opacity:.7">' + dataStatus + '</div>',
            '</div>',
        ].join('\n');

        if (!state.isOnline) {
            els.messages.innerHTML += [
                '<div class="mascot-offline-notice">',
                '  ⚠️ AI服务未连接<br>',
                '  本地请运行 <code>node local-ai-proxy.js</code>（并设置 MINIMAX_API_KEY）',
                '</div>',
            ].join('\n');
        }

        renderQuickQuestions();
    }

    function renderQuickQuestions() {
        if (!els.quick) return;
        var ctx = syncAgentContext();
        var qs = [];
        if (ctx.phase === 'system') {
            qs = ['推荐下一颗星球', '我还差几站？', '哪个部门和我最相关？'];
        } else if (ctx.phase === 'dept') {
            qs = ['总结这个部门', '我在这里留下了什么？', '下一站去哪？'];
        } else if (ctx.phase === 'report') {
            qs = ['解读我的年度关键词', '总结我的2025亮点', '生成一句分享文案'];
        } else if (ctx.phase === 'ticket') {
            qs = ['解释我的船票', '我的部门航线是什么？', '启航后先去哪？'];
        } else {
            qs = ['社团有多少人？', '哪个部门人最多？', '热门IP有哪些？'];
        }
        els.quick.innerHTML = qs.map(function (q) {
            return '<button class="mascot-quick-btn" data-q="' + escapeHtml(q) + '">' + escapeHtml(q) + '</button>';
        }).join('');
        els.quick.style.display = 'flex';
    }

    function renderMessages() {
        if (state.messages.length === 0) { renderWelcome(); return; }

        // 同步面板头部迷你头像到当前情感
        applyMascotImage(els.headerImg, state.currentEmotion);

        var html = '';
        state.messages.forEach(function (msg) {
            var cls = msg.role === 'user' ? 'user' : 'assistant';

            if (msg.role === 'assistant' && !msg.content && state.isLoading) {
                html += '<div class="mascot-typing">' +
                    '<div class="mascot-typing-dot"></div>' +
                    '<div class="mascot-typing-dot"></div>' +
                    '<div class="mascot-typing-dot"></div></div>';
            } else {
                var content = msg.role === 'user'
                    ? escapeHtml(msg.content || '').replace(/\n/g, '<br>')
                    : parseMarkdown(msg.content);
                html += '<div class="mascot-msg ' + cls + '">' + content + '</div>';
            }
        });
        els.messages.innerHTML = html;
        renderQuickQuestions();
    }

    function installPublicAgentApi() {
        window.YouziAgent = {
            notify: notify,
            getContext: function () { return syncAgentContext(); },
            askGuide: askGuide
        };
    }

    // ── 初始化 ───────────────────────────────────────────────

    function init() {
        injectStyles();
        buildDOM();
        populateStarfield();
        bindEvents();

        checkOnline();
        state.checkTimer = setInterval(checkOnline, 30000);

        state.knowledgeContext = buildKnowledgeContext();

        loadChatHistory();
        renderMessages();
        resetIdleTimer();

        // 记忆触发器：观察带 data-trigger-type 的元素
        initSceneObserver();

        // 入场动画结束后开启悬浮动画 + 开场问候
        setTimeout(function () {
            if (els.wrap) els.wrap.classList.add('entered');
            showBubble('学长，需要向佑子了解和社团有关的事吗');
        }, 1200);
    }

    installPublicAgentApi();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

// 生成器脚本缓存（导出打包用，勿删）
;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();
