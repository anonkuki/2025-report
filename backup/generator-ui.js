// ============================================================
// generator-ui.js - 生成器UI模块
// 面板事件绑定、状态显示
// ============================================================

function setGeneratorStatus(text, isError) {
    const el = document.getElementById('generator-status');
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? '#ff9191' : '#9cd7ff';
}

function updatePhotoStatsText(photos) {
    const statsEl = document.getElementById('photo-stats');
    if (!statsEl) return;
    const map = photos || createEmptyWeeklyPhotos();
    const lines = [
        'COS: ' + (map['COS部'] || []).length,
        '技术: ' + (map['技术部'] || []).length,
        '轻音: ' + (map['轻音部'] || []).length,
        '原创: ' + (map['原创部'] || []).length,
        '舞: ' + (map['舞装部'] || []).length,
        '外宣: ' + (map['外宣部'] || []).length
    ];
    statsEl.value = lines.join(', ');
}

async function handleGeneratorExportClick(btn) {
    const exportBtn = btn || document.getElementById('btn-export');
    if (exportBtn && exportBtn.dataset.exporting === '1') return;

    setGeneratorStatus('正在生成报告，请稍候…', false);

    if (typeof exportGeneratedHtml !== 'function') {
        setGeneratorStatus('导出失败：导出模块未加载。', true);
        return;
    }

    const originalText = exportBtn ? exportBtn.textContent : '';
    try {
        if (exportBtn) {
            exportBtn.dataset.exporting = '1';
            exportBtn.disabled = true;
            exportBtn.textContent = '⏳ 生成中...';
            exportBtn.style.opacity = '0.7';
            exportBtn.style.cursor = 'wait';
        }
        await exportGeneratedHtml();
    } catch (err) {
        console.error(err);
        setGeneratorStatus('导出失败：' + (err && err.message ? err.message : err), true);
    } finally {
        if (exportBtn) {
            exportBtn.dataset.exporting = '0';
            exportBtn.disabled = false;
            exportBtn.textContent = originalText || '🚀 导出最终 HTML 报告';
            exportBtn.style.opacity = '';
            exportBtn.style.cursor = '';
        }
    }
}

function bindGeneratorPanelEvents() {
    const panel = document.getElementById('generator-panel');
    if (!panel) return;

    const excelInput = document.getElementById('excel-file');
    const photoInput = document.getElementById('photo-dir');
    const bgm1Input = document.getElementById('bgm1-file');
    const bgm2Input = document.getElementById('bgm2-file');
    const exportBtn = document.getElementById('btn-export');
    const exportRow = document.getElementById('export-action-row');

    updatePhotoStatsText(GENERATOR_STATE.weeklyPhotos);

    if (excelInput) {
        excelInput.addEventListener('change', async function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            setGeneratorStatus('Excel 解析中：' + file.name, false);
            try {
                const cleanData = await parseExcelFile(file);
                GENERATOR_STATE.cleanData = cleanData;
                GENERATOR_STATE.parsedName = cleanData[0] ? (cleanData[0].name || '') : '';
                applyReportData({
                    db: cleanData,
                    weeklyPhotos: GENERATOR_STATE.weeklyPhotos,
                    bgm1: GENERATOR_STATE.bgm1,
                    bgm2: GENERATOR_STATE.bgm2
                });
                const mediaSummary = GENERATOR_STATE.lastMediaSummary || { replaced: 0, unresolved: 0 };
                let mediaTip = '；图片内嵌 ' + mediaSummary.replaced + ' 项';
                if (mediaSummary.unresolved > 0) mediaTip += '，未匹配 ' + mediaSummary.unresolved + ' 项';
                setGeneratorStatus('Excel 解析完成，共 ' + cleanData.length + ' 人' + mediaTip + '。', false);
            } catch (err) {
                console.error(err);
                setGeneratorStatus('Excel 解析失败：' + err.message, true);
            }
        });
    }

    if (photoInput) {
        photoInput.addEventListener('change', async function(e) {
            const files = e.target.files;
            if (!files || files.length === 0) return;
            setGeneratorStatus('周常照片读取中：' + files.length + ' 个文件', false);
            await handlePhotoDirectory(files);
        });
    }

    if (bgm1Input) {
        bgm1Input.addEventListener('change', async function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            try {
                GENERATOR_STATE.bgm1 = await readAudioAsBase64(file);
                applyAudioSource('bgMusic', GENERATOR_STATE.bgm1);
                setGeneratorStatus('BGM1 已载入：' + file.name, false);
            } catch (err) {
                setGeneratorStatus('BGM1 读取失败：' + err.message, true);
            }
        });
    }

    if (bgm2Input) {
        bgm2Input.addEventListener('change', async function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            try {
                GENERATOR_STATE.bgm2 = await readAudioAsBase64(file);
                applyAudioSource('fireworkMusic', GENERATOR_STATE.bgm2);
                setGeneratorStatus('BGM2 已载入：' + file.name, false);
            } catch (err) {
                setGeneratorStatus('BGM2 读取失败：' + err.message, true);
            }
        });
    }

    if (exportBtn && exportBtn.dataset.bound !== '1') {
        exportBtn.dataset.bound = '1';
        exportBtn.onclick = function() { handleGeneratorExportClick(exportBtn); };
    }

    if (exportRow && exportRow.dataset.bound !== '1') {
        exportRow.dataset.bound = '1';
        exportRow.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGeneratorExportClick(exportBtn);
            }
        });
    }
}



;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();