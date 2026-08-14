// ============================================================
// file-io.js - 文件I/O模块 (FileIO)
// Excel解析、图片处理、ZIP导出
// ============================================================

function fileToBase64(file) {
    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const maxWidth = 1000;
                const maxHeight = 1000;
                const quality = 0.8;
                let width = img.width;
                let height = img.height;
                if (width > height && width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function readAudioAsBase64(file) {
    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function(event) { resolve(event.target.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function readFileAsDataUrl(file) {
    return new Promise(function(resolve, reject) {
        const reader = new FileReader();
        reader.onload = function(event) { resolve(event.target.result); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


function buildExportPayload() {
    const dbData = (Array.isArray(GENERATOR_STATE.cleanData) && GENERATOR_STATE.cleanData.length > 0)
        ? GENERATOR_STATE.cleanData
        : DB;
    return {
        db: dbData,
        weeklyPhotos: normalizeWeeklyPhotos(GENERATOR_STATE.weeklyPhotos),
        bgm1: GENERATOR_STATE.bgm1 || getAudioSource('bgMusic'),
        bgm2: GENERATOR_STATE.bgm2 || getAudioSource('fireworkMusic')
    };
}


async function exportGeneratedHtml() {
    const payload = buildExportPayload();
    if (!Array.isArray(payload.db) || payload.db.length === 0) {
        setGeneratorStatus('请先上传并解析 Excel，再导出。', true);
        return;
    }

    const mediaSummary = hydrateDbMediaFromUploadedImages(payload.db);
    GENERATOR_STATE.lastMediaSummary = mediaSummary;
    if (mediaSummary.unresolved > 0) {
        setGeneratorStatus('导出失败：还有 ' + mediaSummary.unresolved + ' 个图片引用未匹配上传文件，请先上传对应图片目录。', true);
        return;
    }

    // Step 1: 获取完整HTML源代码
    let sourceCode = document.documentElement.outerHTML;

    // Step 2: 检查并替换数据占位区块
    const dataBootstrapPattern = /let USER_DATA = null;\s*[\r\n]+\s*let DB = \[\];\s*[\r\n]+\s*let WEEKLY_PHOTOS = createEmptyWeeklyPhotos\(\);\s*[\r\n]+\s*initializeDataFromUserPayload\(USER_DATA\);\s*/m;
    if (!dataBootstrapPattern.test(sourceCode)) {
        setGeneratorStatus('导出失败：未找到数据注入占位区块。', true);
        return;
    }

    // Step 3: 构建JSON并注入数据
    // ⚠️ 必须转义 </script>，否则注入到 HTML sourceCode 时会截断 <script> 块，
    //    导致 Step 6a 正则提取失败。提取到 script.js 后 <\/script> 仍等价于 </script>。
    const dbJson = JSON.stringify(payload.db).replace(/<\/script>/gi, '<\\/script>');
    const weeklyJson = JSON.stringify(normalizeWeeklyPhotos(payload.weeklyPhotos)).replace(/<\/script>/gi, '<\\/script>');
    sourceCode = sourceCode.replace(dataBootstrapPattern, function() {
        return 'const DB = ' + dbJson + ';\n        const WEEKLY_PHOTOS = ' + weeklyJson + ';\n';
    });

    // Step 4: 注入音频sources
    function escapeAttrValue(value) {
        return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    }
    const bgm1Src = escapeAttrValue(payload.bgm1 || getAudioSource('bgMusic') || '');
    const bgm2Src = escapeAttrValue(payload.bgm2 || getAudioSource('fireworkMusic') || '');
    sourceCode = sourceCode.replace(/(<audio id="bgMusic"[^>]*>[\s\r\n]*<source[^>]*src=")([^"]*)(")/i, function(_, head, __, tail) {
        return head + bgm1Src + tail;
    });
    sourceCode = sourceCode.replace(/(<audio id="fireworkMusic"[^>]*>[\s\r\n]*<source[^>]*src=")([^"]*)(")/i, function(_, head, __, tail) {
        return head + bgm2Src + tail;
    });

    // Step 5: 移除生成器专用资源和面板
    sourceCode = sourceCode.replace(/\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/xlsx@0\.18\.5\/dist\/xlsx\.full\.min\.js"><\/script>\s*/i, '\n');
    sourceCode = sourceCode.replace(/\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/jszip@[^"]*"><\/script>\s*/i, '\n');
    sourceCode = sourceCode.replace(/\s*<script\b[^>]*\bsrc="module-sources\.js"[^>]*><\/script>\s*/i, '\n');
    sourceCode = sourceCode.replace(/\s*<script\b[^>]*\bsrc="mascot-asset-data\.js"[^>]*><\/script>\s*/i, '\n');
    sourceCode = sourceCode.replace(/<!-- GENERATOR_PANEL_START -->[\s\S]*?<!-- GENERATOR_PANEL_END -->\s*/i, '');
    // 移除运行态注入的看板娘 DOM，避免导出后节点已存在但事件未绑定
    sourceCode = sourceCode.replace(/\s*<div id="ai-mascot-wrap"[\s\S]*?<\/div>\s*<\/div>\s*(?=(?:<script|<\/body>))/i, '\n');

    // Step 6: 拆分为 index.html + style.css + script.js
    const jsBlocks = [];

    // 6a-pre: 获取本地脚本内容并内联（data-local 标记的外部脚本）
    // 优先使用预缓存（__SC），其次同步 XHR，最后 fetch；全部失败则中止导出
    const localScriptPattern = /<script\b[^>]*\bdata-local\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/gi;
    let localMatch;
    let failedScripts = [];
    while ((localMatch = localScriptPattern.exec(sourceCode)) !== null) {
        const src = localMatch[1];
        let text = '';

        // 方式1: 预缓存（页面加载时已缓存）
        if (!text && window.__SC && window.__SC[src]) {
            var cached = window.__SC[src];
            if (typeof cached === 'string') {
                text = cached;
            } else if (cached && typeof cached === 'object') {
                if (typeof cached.value === 'string') {
                    text = cached.value;
                } else if (typeof cached.content === 'string') {
                    text = cached.content;
                }
            }
        }

        // 方式2: 同步 XMLHttpRequest（HTTP 下可靠，部分 file:// 环境也可用）
        if (!text) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', src, false);
                xhr.send();
                if ((xhr.status === 200 || xhr.status === 0) && xhr.responseText) {
                    text = xhr.responseText;
                }
            } catch (e) { /* 静默失败，尝试下一种方式 */ }
        }

        // 方式3: fetch（仅 HTTP/HTTPS 协议可用）
        if (!text) {
            try {
                const resp = await fetch(src);
                text = await resp.text();
            } catch (e) { /* 静默失败 */ }
        }

        if (typeof text !== 'string') {
            text = '';
        }

        if (text && text.trim()) {
            jsBlocks.push(text);
        } else {
            failedScripts.push(src);
        }
    }

    if (failedScripts.length > 0) {
        var isFileProtocol = location.protocol === 'file:';
        var hint = isFileProtocol
            ? '\n\n当前以 file:// 协议打开，浏览器安全策略禁止读取本地文件。\n请使用本地服务器打开此页面后再导出：\n  · VS Code 安装 "Live Server" 插件，右键 generator.html → Open with Live Server\n  · 或在此目录打开终端，运行 python -m http.server 8080，然后浏览器访问 http://localhost:8080/generator.html'
            : '';
        setGeneratorStatus('导出失败：无法读取 ' + failedScripts.length + ' 个模块文件（' + failedScripts.join(', ') + '）。' + hint, true);
        return;
    }

    sourceCode = sourceCode.replace(/<script\b[^>]*\bdata-local\b[^>]*><\/script>/gi, '');

    // 6a: 提取所有内联 <script> 内容（保留 CDN <script src> 不动）
    sourceCode = sourceCode.replace(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, function(match, content) {
        if (!content.trim()) return '';
        // 过滤 Live Server / 开发工具注入的脚本（含 WebSocket 连接）
        if (/new\s+WebSocket\b/.test(content)) return '';
        jsBlocks.push(content);
        return '';
    });
    // 在 </body> 前插入外联脚本引用
    sourceCode = sourceCode.replace(/<\/body>/i, '    <script src="script.js"><\/script>\n</body>');

    // 6b: 提取所有 <style> 内容（此时 <script> 已移除，不会误匹配模板中的 <style>）
    const cssBlocks = [];
    sourceCode = sourceCode.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function(match, content) {
        if (content.trim()) cssBlocks.push(content.trim());
        return '';
    });
    // 在 </head> 前插入外联样式引用
    sourceCode = sourceCode.replace(/<\/head>/i, '    <link rel="stylesheet" href="style.css">\n</head>');

    const cssContent = cssBlocks.join('\n\n');
    // 剥离仅开发环境使用的 __SC 自读取 IIFE（导出产品中无用且会触发 CORS 错误）
    var jsRaw = jsBlocks.join('\n\n');
    const jsContent = jsRaw.replace(/\n?\/\/[^\n]*(?:缓存|__SC)[^\n]*\n/g, '\n').replace(/;?\(function\(\)\{try\{var s=document\.currentScript,x=new XMLHttpRequest\(\);x\.open\('GET',s\.src,false\);x\.send\(\);if\(x\.responseText\)\(window\.__SC=window\.__SC\|\|\{\}\)\[s\.getAttribute\('src'\)\]=x\.responseText\}catch\(e\)\{\}\}\)\(\);?/g, '');
    const indexContent = '<!DOCTYPE html>\n' + sourceCode;

    // Step 7: 打包为 ZIP 并下载
    const exportName = sanitizeFileName(GENERATOR_STATE.parsedName || payload.db[0].name || '未命名');
    const folderName = '2025年度总结_' + exportName;

    if (typeof JSZip === 'undefined') {
        setGeneratorStatus('导出失败：JSZip 库未加载，无法生成 ZIP。', true);
        return;
    }

    setGeneratorStatus('正在生成 ZIP 文件…', false);

    const zip = new JSZip();
    const folder = zip.folder(folderName);
    folder.file('index.html', indexContent);
    folder.file('style.css', cssContent);
    folder.file('script.js', jsContent);

    // 打包看板娘表情素材到 assets/ 文件夹
    var mascotAssets = ['Normal.png', 'Happy.png', 'Surprised.png', 'Thinking.png', 'Sad.png', 'Victory.png'];
    var assetsFolder = folder.folder('assets');
    var mascotAssetData = (typeof window !== 'undefined' && window.__MASCOT_ASSET_DATA) ? window.__MASCOT_ASSET_DATA : null;
    mascotAssets.forEach(function(name) {
        var dataUrl = mascotAssetData && mascotAssetData[name];
        if (typeof dataUrl === 'string' && dataUrl.indexOf('base64,') >= 0) {
            assetsFolder.file(name, dataUrl.split('base64,')[1], { base64: true });
        }
    });
    if (!mascotAssetData && location.protocol !== 'file:') {
        await Promise.all(mascotAssets.map(function(name) {
            return fetch('assets/' + name)
                .then(function(resp) { return resp.ok ? resp.blob() : null; })
                .then(function(blob) { if (blob) assetsFolder.file(name, blob); })
                .catch(function() { /* asset not found, skip */ });
        }));
    }

    try {
        var blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = folderName + '.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setGeneratorStatus('导出成功：' + folderName + '.zip（含 index.html + style.css + script.js + assets/）', false);
    } catch (err) {
        setGeneratorStatus('导出失败：ZIP 生成错误 - ' + err.message, true);
    }
}

async function handlePhotoDirectory(files) {
    const mapped = createEmptyWeeklyPhotos();
    const list = Array.from(files || []);
    const uploadedImageMap = new Map();
    let processed = 0;
    let weeklyMatched = 0;
    for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const mime = (file && file.type) ? String(file.type) : '';
        const isImage = /^image\//i.test(mime);
        const isVideo = /^video\//i.test(mime);
        if (!file || (!isImage && !isVideo)) continue;
        const refPath = file.webkitRelativePath || file.name;
        try {
            const base64 = isImage ? await fileToBase64(file) : await readFileAsDataUrl(file);
            addUploadedImageToMap(uploadedImageMap, refPath, base64);
            const dept = detectDeptByPath(refPath);
            if (dept && isImage) {
                mapped[dept].push(base64);
                weeklyMatched++;
            }
        } catch (e) {
            console.warn('Photo convert failed:', file.name, e);
        }
        processed++;
        if (processed % 5 === 0) {
            setGeneratorStatus('周常照片处理中：' + processed + '/' + list.length, false);
            updatePhotoStatsText(mapped);
        }
    }

    GENERATOR_STATE.uploadedImageMap = uploadedImageMap;
    GENERATOR_STATE.weeklyPhotos = normalizeWeeklyPhotos(mapped);
    WEEKLY_PHOTOS = normalizeWeeklyPhotos(mapped);
    updatePhotoStatsText(mapped);

    let mediaTip = '';
    if (Array.isArray(GENERATOR_STATE.cleanData) && GENERATOR_STATE.cleanData.length > 0) {
        const mediaSummary = hydrateDbMediaFromUploadedImages(GENERATOR_STATE.cleanData);
        GENERATOR_STATE.lastMediaSummary = mediaSummary;
        applyReportData({
            db: GENERATOR_STATE.cleanData,
            weeklyPhotos: GENERATOR_STATE.weeklyPhotos,
            bgm1: GENERATOR_STATE.bgm1,
            bgm2: GENERATOR_STATE.bgm2
        });
        mediaTip = '；Excel图片回填 ' + mediaSummary.replaced + ' 项';
        if (mediaSummary.unresolved > 0) mediaTip += '，未匹配 ' + mediaSummary.unresolved + ' 项';
    }

    setGeneratorStatus('照片解析完成：处理 ' + processed + ' 张，周常归类 ' + weeklyMatched + ' 张' + mediaTip + '。', false);
}


;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();