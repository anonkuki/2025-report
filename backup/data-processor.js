// ============================================================
// data-processor.js - 数据处理模块 (DataProcessor)
// Excel 解析、数据规范化、统计计算、数据注入
// ============================================================

function normalizeWeeklyPhotos(input) {
    const normalized = createEmptyWeeklyPhotos();
    if (!input || typeof input !== 'object') return normalized;
    Object.keys(normalized).forEach(function(key) {
        if (Array.isArray(input[key])) normalized[key] = input[key].slice();
    });
    return normalized;
}

function hasLoadedReportData() {
    return Array.isArray(DB) && DB.length > 0;
}

function genSmartParseInt(text) {
    if (text === null || text === undefined) return 0;
    const match = String(text).trim().match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
}


function normalizeCellText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
    if (typeof value === 'object') {
        if (typeof value.text === 'string') return value.text.trim();
        if (typeof value.w === 'string') return value.w.trim();
        if (value.v !== undefined && value.v !== null) return String(value.v).trim();
    }
    return String(value).trim();
}

function normalizeAssetKey(input) {
    let s = normalizeCellText(input);
    if (!s) return '';
    s = s.replace(/^file:\/*/i, '');
    s = s.replace(/\\/g, '/');
    s = s.split('#')[0].split('?')[0];
    s = s.replace(/^[A-Za-z]:\//, '');
    s = s.replace(/^\.\/+/, '');
    s = s.replace(/^\/+/, '');
    try { s = decodeURIComponent(s); } catch (e) {}
    return s.toLowerCase();
}

function getFileNameFromPath(path) {
    const normalized = normalizeAssetKey(path);
    if (!normalized) return '';
    const parts = normalized.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : normalized;
}

function getFileStem(name) {
    const fileName = normalizeCellText(name);
    if (!fileName) return '';
    const idx = fileName.lastIndexOf('.');
    return idx > 0 ? fileName.slice(0, idx) : fileName;
}

function buildAssetLookupKeys(input) {
    const keys = [];
    const normalized = normalizeAssetKey(input);
    if (normalized) keys.push(normalized);
    const fileName = getFileNameFromPath(normalized);
    if (fileName) keys.push(fileName);
    const stem = getFileStem(fileName);
    if (stem) keys.push(stem);
    if (normalized) {
        const parts = normalized.split('/').filter(Boolean);
        if (parts.length >= 2) keys.push(parts.slice(-2).join('/'));
    }
    return Array.from(new Set(keys.filter(Boolean)));
}

function addUploadedImageToMap(imageMap, refPath, dataUrl) {
    const keys = buildAssetLookupKeys(refPath);
    keys.forEach(function(key) {
        if (!imageMap.has(key)) imageMap.set(key, dataUrl);
    });
}

function getHyperlinkTarget(sheet, excelRow, colIndex) {
    if (!sheet || !window.XLSX) return '';
    const addr = XLSX.utils.encode_cell({ r: excelRow - 1, c: colIndex - 1 });
    const cell = sheet[addr];
    if (cell && cell.l && typeof cell.l.Target === 'string') {
        return cell.l.Target.trim();
    }
    return '';
}

function getCellMediaRef(sheet, excelRow, colIndex, fallbackValue) {
    const link = getHyperlinkTarget(sheet, excelRow, colIndex);
    if (link) return link;
    return normalizeCellText(fallbackValue);
}

function resolveMediaRefFromUploads(ref, counters) {
    const val = normalizeCellText(ref);
    if (!val) return '';
    if (/^data:(image|video|audio)\//i.test(val)) return val;
    const map = GENERATOR_STATE.uploadedImageMap;
    if (map && typeof map.get === 'function') {
        const keys = buildAssetLookupKeys(val);
        for (let i = 0; i < keys.length; i++) {
            const mapped = map.get(keys[i]);
            if (mapped) {
                if (mapped !== val) counters.replaced++;
                return mapped;
            }
        }
    }
    const isHttp = /^https?:\/\//i.test(val);
    if (!isHttp && genIsUrl(val)) counters.unresolved++;
    return val;
}

function hydrateDbMediaFromUploadedImages(dbData) {
    const counters = { replaced: 0, unresolved: 0 };
    if (!Array.isArray(dbData) || dbData.length === 0) return counters;

    dbData.forEach(function(user) {
        if (!user || typeof user !== 'object') return;

        if (user.imgs && typeof user.imgs === 'object') {
            Object.keys(user.imgs).forEach(function(k) {
                user.imgs[k] = resolveMediaRefFromUploads(user.imgs[k], counters);
            });
        }

        if (user.commonData && typeof user.commonData === 'object') {
            ['ipPhoto', 'memoryPhoto', 'groupPhoto'].forEach(function(field) {
                if (user.commonData[field]) {
                    user.commonData[field] = resolveMediaRefFromUploads(user.commonData[field], counters);
                }
            });
        }

        if (user.deptData && typeof user.deptData === 'object') {
            Object.keys(user.deptData).forEach(function(deptName) {
                const dept = user.deptData[deptName];
                if (!dept || !Array.isArray(dept.images)) return;
                dept.images.forEach(function(img) {
                    if (!img || !img.url) return;
                    img.url = resolveMediaRefFromUploads(img.url, counters);
                });
            });
        }
    });

    return counters;
}


function detectDeptByPath(path) {
    const normalized = String(path || '').replace(/\\/g, '/').toLowerCase();
    for (let i = 0; i < PHOTO_DEPT_RULES.length; i++) {
        const key = PHOTO_DEPT_RULES[i].keyword.toLowerCase();
        if (
            normalized.includes('/' + key + '/') ||
            normalized.includes(key + '/') ||
            normalized.endsWith('/' + key) ||
            normalized.includes('/' + key + '_')
        ) {
            return PHOTO_DEPT_RULES[i].dept;
        }
    }
    return null;
}

function calculateGlobalStats(rawData) {
    const deptStatsDist = {};
    Object.keys(DEPT_CONTENT_CONFIG).forEach(function(deptName) {
        deptStatsDist[deptName] = {
            stats1: rawData.map(function(u) { return (u.deptData[deptName] && u.deptData[deptName].stats1) || 0; }).sort(function(a, b) { return a - b; }),
            stats2: rawData.map(function(u) {
                const val = u.deptData[deptName] && u.deptData[deptName].stats2;
                return typeof val === 'number' ? val : 0;
            }).sort(function(a, b) { return a - b; })
        };
    });

    const activityDist = rawData.map(function(u) { return (u.stats && u.stats.activityCount) || 0; }).sort(function(a, b) { return a - b; });
    const ipMap = {};
    const kwMap = {};

    rawData.forEach(function(u) {
        if (u.ip) {
            const ipKey = String(u.ip).trim();
            if (!ipMap[ipKey]) ipMap[ipKey] = [];
            ipMap[ipKey].push(u.name);
        }
        (u.keywords || []).forEach(function(k) {
            const key = String(k).trim();
            if (!key) return;
            if (!kwMap[key]) kwMap[key] = [];
            kwMap[key].push(u.name);
        });
    });

    return rawData.map(function(u) {
        const finalU = Object.assign({}, u, { analysis: {} });
        const actVal = (u.stats && u.stats.activityCount) || 0;
        const actLess = activityDist.filter(function(v) { return v < actVal; }).length;
        finalU.analysis.activityPercent = activityDist.length > 1 ? Math.floor((actLess / activityDist.length) * 100) : 100;
        finalU.analysis.deptStats = {};

        Object.keys(DEPT_CONTENT_CONFIG).forEach(function(deptName) {
            const s1 = (u.deptData[deptName] && u.deptData[deptName].stats1) || 0;
            const s2 = (u.deptData[deptName] && u.deptData[deptName].stats2) || 0;
            const dist1 = deptStatsDist[deptName].stats1;
            const dist2 = deptStatsDist[deptName].stats2;
            finalU.analysis.deptStats[deptName] = {
                stats1Percent: dist1.length > 1 ? Math.floor((dist1.filter(function(v) { return v < s1; }).length / dist1.length) * 100) : 100,
                stats2Percent: dist2.length > 1 ? Math.floor((dist2.filter(function(v) { return v < s2; }).length / dist2.length) * 100) : 100
            };
        });

        finalU.analysis.sameIp = (ipMap[String(u.ip || '').trim()] || []).filter(function(name) { return name !== u.name; });
        finalU.analysis.sameKw = {};
        (u.keywords || []).forEach(function(k) {
            const key = String(k).trim();
            finalU.analysis.sameKw[key] = (kwMap[key] || []).filter(function(name) { return name !== u.name; }).length;
        });
        return finalU;
    });
}

function isMarkedChoice(value) {
    const v = normalizeCellText(value).toLowerCase();
    return !!v && ['0', 'false', 'no', '否', '未选', 'null', 'undefined', 'nan', '(空)', '空'].indexOf(v) === -1;
}

async function parseExcelFile(file) {
    if (!window.XLSX) throw new Error('SheetJS 未加载');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) throw new Error('Excel 不包含工作表');
    const sheet = workbook.Sheets[firstSheet];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const rawData = [];

    for (let idx = 1; idx < rows.length; idx++) {
        const excelRow = idx + 1;
        const rowArray = rows[idx] || [];
        const rowData = {};
        for (let col = 0; col < rowArray.length; col++) rowData[col + 1] = normalizeCellText(rowArray[col]);

        const name = normalizeCellText(rowData[7]);
        if (!name) continue;

        const seniorityNum = normalizeCellText(rowData[8]);
        const joinTime = SENIORITY_MAP[seniorityNum] || ('未知 (' + (seniorityNum || '空') + ')');
        const depts = [];
        Object.keys(DEPT_COL_MAP).forEach(function(colNum) {
            const val = normalizeCellText(rowData[parseInt(colNum, 10)]);
            if (val === '1') depts.push(DEPT_COL_MAP[colNum]);
        });

        const activityRaw = normalizeCellText(rowData[COMMON_CONFIG.activityCol]);
        const activityCountNum = genSmartParseInt(activityRaw);
        // 根据活动次数计算活跃等级 (1-4级)
        let activityLevel = 0;
        if (activityCountNum > 0) {
            if (activityCountNum <= 2) activityLevel = 1;
            else if (activityCountNum <= 5) activityLevel = 2;
            else if (activityCountNum <= 10) activityLevel = 3;
            else activityLevel = 4;
        }
        const activityCount = activityCountNum;

        const user = {
            id: idx + 1,
            name: name,
            joinTime: joinTime,
            depts: depts,
            stats: {
                activityRaw: activityRaw,
                activityLevel: activityLevel,
                activityCount: activityCount
            },
            raw: {},
            imgs: {},
            deptData: {},
            commonData: {},
            ip: '',
            keywords: [],
            keywordReason: ''
        };

        Object.keys(rowData).forEach(function(colNum) {
            const colIdx = parseInt(colNum, 10);
            if (!colIdx) return;
            const mediaRef = getCellMediaRef(sheet, excelRow, colIdx, rowData[colIdx]);
            if (genIsUrl(mediaRef)) user.imgs[colNum] = mediaRef;
        });

        Object.keys(DEPT_CONTENT_CONFIG).forEach(function(deptName) {
            const cfg = DEPT_CONTENT_CONFIG[deptName];
            const images = [];
            cfg.images.forEach(function(imgCfg) {
                const imgUrl = getCellMediaRef(sheet, excelRow, imgCfg.img, rowData[imgCfg.img]);
                const imgDesc = normalizeCellText(rowData[imgCfg.desc]);
                if (genIsUrl(imgUrl)) {
                    images.push({
                        url: imgUrl,
                        desc: imgDesc,
                        col: imgCfg.img
                    });
                }
            });

            const rawStats1 = normalizeCellText(rowData[cfg.statsCol1]);
            const rawStats2 = normalizeCellText(rowData[cfg.statsCol2]);
            const stats1 = genSmartParseInt(rawStats1);
            const stats2 = cfg.statsCol2Name === '最爱的歌' ? 0 : genSmartParseInt(rawStats2);
            const roleTags = [];

            (cfg.roleOptionCols || []).forEach(function(roleCfg) {
                if (isMarkedChoice(rowData[roleCfg.col])) roleTags.push(roleCfg.label);
            });

            const customRole = normalizeCellText(rowData[cfg.customRoleCol]);
            if (customRole && !['0', '1'].includes(customRole)) roleTags.push(customRole);

            user.deptData[deptName] = {
                stats1: stats1,
                stats1Raw: rawStats1,
                stats1Name: cfg.statsCol1Name,
                stats2: stats2,
                stats2Raw: rawStats2,
                stats2Name: cfg.statsCol2Name,
                images: images,
                roles: roleTags,
                primaryRole: roleTags[0] || ''
            };
        });

        const ipPhoto = getCellMediaRef(sheet, excelRow, COMMON_CONFIG.ipPhotoCol, rowData[COMMON_CONFIG.ipPhotoCol]);
        const memoryPhoto = getCellMediaRef(sheet, excelRow, COMMON_CONFIG.memoryPhotoCol, rowData[COMMON_CONFIG.memoryPhotoCol]);
        const groupPhoto = getCellMediaRef(sheet, excelRow, COMMON_CONFIG.groupPhotoCol, rowData[COMMON_CONFIG.groupPhotoCol]);
        user.commonData = {
            isFreeSpirit: isMarkedChoice(rowData[COMMON_CONFIG.freeSpiritCol]),
            activityCount: activityCount,
            activityLevel: activityLevel,
            activityRaw: activityRaw,
            ip: normalizeCellText(rowData[COMMON_CONFIG.ipCol]),
            ipPhoto: genIsUrl(ipPhoto) ? ipPhoto : '',
            keyword: normalizeCellText(rowData[COMMON_CONFIG.keywordCol]),
            memorableQuote: normalizeCellText(rowData[COMMON_CONFIG.memorableQuoteCol]),
            memoryPhoto: genIsUrl(memoryPhoto) ? memoryPhoto : '',
            memoryDesc: normalizeCellText(rowData[COMMON_CONFIG.memoryDescCol]),
            groupPhoto: genIsUrl(groupPhoto) ? groupPhoto : '',
            groupDesc: normalizeCellText(rowData[COMMON_CONFIG.groupDescCol])
        };

        user.keywords = (user.commonData.keyword || '').split(/[,，、\s]+/).filter(function(k) { return k.trim(); });
        user.keywordReason = user.commonData.memorableQuote;
        user.ip = user.commonData.ip;

        rawData.push(user);
    }
    const cleanData = calculateGlobalStats(rawData);
    GENERATOR_STATE.lastMediaSummary = hydrateDbMediaFromUploadedImages(cleanData);
    return cleanData;
}

function applyReportData(payload) {
    if (!payload || !Array.isArray(payload.db)) return false;
    DB = payload.db;
    WEEKLY_PHOTOS = normalizeWeeklyPhotos(payload.weeklyPhotos);
    GENERATOR_STATE.cleanData = payload.db;
    GENERATOR_STATE.weeklyPhotos = normalizeWeeklyPhotos(payload.weeklyPhotos);

    if (payload.bgm1) {
        GENERATOR_STATE.bgm1 = payload.bgm1;
        applyAudioSource('bgMusic', payload.bgm1);
    }
    if (payload.bgm2) {
        GENERATOR_STATE.bgm2 = payload.bgm2;
        applyAudioSource('fireworkMusic', payload.bgm2);
    }

    const totalEl = document.getElementById('total-counts');
    if (totalEl) totalEl.innerText = DB.length;
    if (!GENERATOR_STATE.parsedName && DB.length > 0) GENERATOR_STATE.parsedName = DB[0].name || '';
    return true;
}

function initializeDataFromUserPayload(payload) {
    if (!payload) return;
    if (Array.isArray(payload)) {
        applyReportData({ db: payload, weeklyPhotos: createEmptyWeeklyPhotos() });
        return;
    }
    if (typeof payload === 'object' && Array.isArray(payload.db)) {
        applyReportData(payload);
    }
}

function sanitizeFileName(name) {
    return String(name || '未命名').replace(/[\\/:*?"<>|]/g, '_').trim() || '未命名';
}



// === 客座模式部门数据处理 ===

function applyGuestDeptSummaryData(deptName) {
    if (!window._youziGuestModeActive) return false;
    if (typeof DB === 'undefined' || !Array.isArray(DB)) return false;

    const deptMembers = DB.filter(function(u) { return u.deptData && u.deptData[deptName]; });
    if (deptMembers.length === 0) return false;

    const stats1Data = deptMembers
        .map(function(u) { return { name: u.name, value: u.deptData[deptName].stats1 || 0 }; })
        .filter(function(v) { return v.value > 0; });
    const stats2Data = deptMembers
        .map(function(u) { return { name: u.name, value: u.deptData[deptName].stats2 || 0 }; })
        .filter(function(v) { return v.value > 0; });

    const stats1Total = stats1Data.reduce(function(sum, item) { return sum + item.value; }, 0);
    const stats2Total = stats2Data.reduce(function(sum, item) { return sum + item.value; }, 0);
    const stats1TopUser = stats1Data.length > 0 ? stats1Data.reduce(function(max, item) { return item.value > max.value ? item : max; }, stats1Data[0]) : null;
    const stats2TopUser = stats2Data.length > 0 ? stats2Data.reduce(function(max, item) { return item.value > max.value ? item : max; }, stats2Data[0]) : null;

    const introModal = document.querySelector('.dept-intro-modal.active');
    if (!introModal) return false;

    const cards = introModal.querySelectorAll('.netease-card');
    let cardIndex = 0;
    cards.forEach(function(card) {
        const numberEl = card.querySelector('.netease-number');
        const titleEl = card.querySelector('.netease-title');
        const descEl = card.querySelector('.netease-desc');
        const labelEl = card.querySelector('.netease-label');
        const statsInfoEl = card.querySelector('.dept-stats-info');

        if (labelEl && labelEl.textContent.indexOf('ENTERING') >= 0) return;
        if (card.querySelector('#enter-dept-btn')) return;

        if (numberEl && cardIndex === 0 && stats1Total > 0) {
            numberEl.textContent = stats1Total;
            if (descEl) descEl.textContent = '部门总计';
            if (statsInfoEl && stats1TopUser) {
                statsInfoEl.innerHTML = '突出贡献: <span class="highlight">' + stats1TopUser.name + '</span> (' + stats1TopUser.value + ')';
            } else if (stats1TopUser) {
                const newInfo = document.createElement('div');
                newInfo.className = 'dept-stats-info';
                newInfo.innerHTML = '突出贡献: <span class="highlight">' + stats1TopUser.name + '</span> (' + stats1TopUser.value + ')';
                card.appendChild(newInfo);
            }
            cardIndex++;
        } else if ((numberEl || titleEl) && cardIndex === 1 && stats2Total > 0) {
            if (numberEl) numberEl.textContent = stats2Total;
            if (titleEl && !numberEl) titleEl.textContent = stats2Total;
            if (descEl) descEl.textContent = '部门总计';
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

    return true;
}

function waitApplyGuestDeptSummary(deptName) {
    if (!window._youziGuestModeActive) return;
    let tries = 0;
    const maxTries = 180;
    const tick = function() {
        if (applyGuestDeptSummaryData(deptName)) return;
        tries++;
        if (tries < maxTries) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();