// ============================================================
// utils.js - 佐佑动漫社2025年度总结 工具函数集
// 从 generator.html 提取的公共函数
// ============================================================

function getSeniorityTitle(joinTimeRaw) {
    const str = String(joinTimeRaw).trim();
    if(str.includes('2024') || str.includes('2025') || str.includes('24') || str.includes('25')) return "新晋领航员 (NOVICE)";
    if(str.includes('2022') || str.includes('2023') || str.includes('22') || str.includes('23')) return "核心指挥官 (COMMANDER)";
    if(str.includes('2021') || str.includes('2020') || str.includes('2019') || str.includes('19') || str.includes('20') || str.includes('21')) return "传奇舰长 (ADMIRAL)";
    return "时空旅行者 (TRAVELER)";
}

// 计算部门平均值
function calculateDeptAverage(deptName, members) {
    let total1 = 0, total2 = 0, count = 0;
    members.forEach(m => {
        if (m.deptData && m.deptData[deptName]) {
            total1 += (m.deptData[deptName].stats1 || 0);
            const s2 = m.deptData[deptName].stats2;
            total2 += (typeof s2 === 'number' ? s2 : 0);
            count++;
        }
    });
    return {
        stats1: count > 0 ? total1/count : 0,
        stats2: count > 0 ? total2/count : 0
    };
}

// 通用各个部门照片墙滚动弹出动画初始化
window.initScrollAnimation = function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-in');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });

    const items = document.querySelectorAll('.scroll-animate-item');
    items.forEach(item => {
        observer.observe(item);
    });
};

// 保存海报图片
function savePosterImage() {
    const card = document.getElementById('ending-card');
    if (!card) { alert('未找到海报元素'); return; }
    const btn = card.querySelector('.save-poster-btn');
    if (btn) btn.style.display = 'none';
    // 临时让所有动画元素可见
    const animEls = card.querySelectorAll('[style*="animation"], .ending-header, .message, .ending-poster, .ending-bottom-bar, .poster-watermark');
    animEls.forEach(el => { el.dataset.origOpacity = el.style.opacity; el.style.opacity = '1'; });

    if (typeof html2canvas === 'undefined') {
        alert('html2canvas 未加载，请检查网络连接');
        if (btn) btn.style.display = '';
        animEls.forEach(el => { el.style.opacity = el.dataset.origOpacity || ''; });
        return;
    }
    html2canvas(card, {
        backgroundColor: '#0B0E14',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = '佐佑2025年度总结_我的海报.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        if (btn) btn.style.display = '';
        animEls.forEach(el => { el.style.opacity = el.dataset.origOpacity || ''; });
    }).catch(err => {
        console.error('保存海报失败:', err);
        alert('保存失败，请截图保存');
        if (btn) btn.style.display = '';
        animEls.forEach(el => { el.style.opacity = el.dataset.origOpacity || ''; });
    });
}

// ============================================================
// 背景音乐系统
// ============================================================

// 背景音乐控制
let isMusicPlaying = false;
const bgMusic = document.getElementById('bgMusic');
const musicIcon = document.getElementById('musicIcon');
const volumeSlider = document.getElementById('volumeSlider');
const volumeRange = document.getElementById('volumeRange');
const volumeValue = document.getElementById('volumeValue');
const musicControlWrapper = document.getElementById('musicControlWrapper');

// 秘密快捷入口：连续点击音乐按钮5次解锁恒星报告入口
let musicClickCount = 0;
let musicClickTimer = null;

function toggleMusic() {
    // 检测连续点击
    musicClickCount++;
    clearTimeout(musicClickTimer);
    musicClickTimer = setTimeout(function() { musicClickCount = 0; }, 1500); // 1.5秒内的点击算连续

    if (musicClickCount >= 5) {
        musicClickCount = 0;
        // 解锁恒星报告入口
        const sunCard = document.getElementById('sun-card');
        if (sunCard && sunCard.classList.contains('locked')) {
            secretUnlocked = true; // 设置秘密解锁标志
            sunCard.classList.remove('locked');
            const cardData = sunCard.querySelector('.card-data');
            if (cardData) cardData.textContent = '点击进入恒星报告';
            const cardBody = sunCard.querySelector('.card-body');
            if (cardBody) cardBody.style.animation = 'sunCardPulse 1.5s ease-in-out infinite';

            // 更新进度提示
            const hint = document.getElementById('progress-hint');
            if (hint) {
                hint.textContent = '🎉 已秘密解锁！';
                hint.classList.add('complete');
            }

            // 小彩蛋提示
            const toast = document.createElement('div');
            toast.innerHTML = '🌟 恒星报告已解锁 🌟';
            toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(255,215,0,0.95),rgba(255,140,0,0.95));color:#fff;padding:20px 40px;border-radius:30px;font-size:18px;font-weight:bold;z-index:99999;animation:fadeInOut 2s ease forwards;pointer-events:none;text-shadow:0 2px 4px rgba(0,0,0,0.3);';
            document.body.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 2000);
            return;
        } else if (sunCard && !sunCard.classList.contains('locked')) {
            // 已经解锁了，给个提示
            const toast = document.createElement('div');
            toast.innerHTML = '✨ 恒星报告早已解锁 ✨';
            toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(100,200,100,0.95),rgba(50,150,50,0.95));color:#fff;padding:20px 40px;border-radius:30px;font-size:18px;font-weight:bold;z-index:99999;animation:fadeInOut 2s ease forwards;pointer-events:none;';
            document.body.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 2000);
            return;
        }
    }

    if (isMusicPlaying) {
        // 暂停当前播放的音轨
        if (_currentTrack === 'report') {
            var fm = document.getElementById('fireworkMusic');
            if (fm) fm.pause();
        } else {
            bgMusic.pause();
        }
        musicIcon.textContent = '🔇';
        isMusicPlaying = false;
    } else {
        // 播放当前应该播放的音轨，恢复正确音量
        var vol = getUserVolume();
        if (_currentTrack === 'report') {
            var fm = document.getElementById('fireworkMusic');
            if (fm) { fm.volume = vol; fm.play().catch(function(){}); }
        } else {
            bgMusic.volume = vol;
            bgMusic.play().catch(function(e) { console.log('音乐播放失败:', e); });
            _currentTrack = 'bg';
        }
        musicIcon.textContent = '🔊';
        isMusicPlaying = true;
    }
}

// 音量控制
if (volumeRange) {
    volumeRange.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        bgMusic.volume = volume;
        // 同步烟花音乐音量
        const fireworkMusic = document.getElementById('fireworkMusic');
        if (fireworkMusic) fireworkMusic.volume = volume;
        volumeValue.textContent = e.target.value + '%';
    });
}

// 鼠标悬停显示音量条
if (musicControlWrapper) {
    musicControlWrapper.addEventListener('mouseenter', () => {
        volumeSlider.style.display = 'flex';
    });
    musicControlWrapper.addEventListener('mouseleave', () => {
        volumeSlider.style.display = 'none';
    });
}

// 获取用户设定的目标音量
function getUserVolume() {
    var vr = document.getElementById('volumeRange');
    return vr ? (parseInt(vr.value) / 100) : 1;
}

// 判断 fireworkMusic 是否有真实音源
function hasSecondMusic() {
    var fm = document.getElementById('fireworkMusic');
    if (!fm) return false;
    var src = fm.querySelector('source');
    if (!src) return false;
    var val = src.getAttribute('src') || '';
    // 只有 data:audio 开头或有效 URL 才算有音源
    return val.length > 10 && (val.startsWith('data:audio') || val.startsWith('http'));
}

// 淡入音频（返回 Promise）
function fadeInAudio(audioEl, duration, targetVol) {
    return new Promise(function(resolve, reject) {
        if (!audioEl) { reject('no element'); return; }
        targetVol = typeof targetVol === 'number' ? targetVol : getUserVolume();
        audioEl.volume = 0;
        audioEl.play().then(function() {
            var step = 50;
            var delta = targetVol / (duration / step);
            var timer = setInterval(function() {
                if (audioEl.volume + delta >= targetVol) {
                    audioEl.volume = targetVol;
                    clearInterval(timer);
                    resolve();
                } else {
                    audioEl.volume = Math.min(audioEl.volume + delta, targetVol);
                }
            }, step);
        }).catch(function(e) {
            audioEl.volume = targetVol; // 恢复音量
            reject(e);
        });
    });
}

// 淡出音频（返回 Promise）
function fadeOutAudio(audioEl, duration) {
    return new Promise(function(resolve) {
        if (!audioEl || audioEl.paused) { resolve(); return; }
        var startVol = audioEl.volume;
        if (startVol <= 0) { audioEl.pause(); resolve(); return; }
        var step = 50;
        var delta = startVol / (duration / step);
        var timer = setInterval(function() {
            if (audioEl.volume - delta <= 0) {
                audioEl.volume = 0;
                audioEl.pause();
                clearInterval(timer);
                resolve();
            } else {
                audioEl.volume = Math.max(audioEl.volume - delta, 0);
            }
        }, step);
    });
}

// 标记当前正在播放哪首音乐: 'bg' | 'report' | null
var _currentTrack = null;

// 页面加载后2秒淡入自动播放第一首音乐
window.addEventListener('load', function() {
    if (!hasLoadedReportData()) return;
    setTimeout(function() {
        fadeInAudio(bgMusic, 2000, getUserVolume()).then(function() {
            isMusicPlaying = true;
            _currentTrack = 'bg';
            if (musicIcon) musicIcon.textContent = '🔊';
        }).catch(function() {
            // 自动播放被浏览器阻止，等待用户首次交互后再播放
            isMusicPlaying = false;
            _currentTrack = null;
            if (musicIcon) musicIcon.textContent = '🔇';
            function onFirstInteraction() {
                document.removeEventListener('click', onFirstInteraction, true);
                document.removeEventListener('touchstart', onFirstInteraction, true);
                if (!isMusicPlaying && _currentTrack === null) {
                    bgMusic.volume = getUserVolume();
                    bgMusic.play().then(function() {
                        isMusicPlaying = true;
                        _currentTrack = 'bg';
                        if (musicIcon) musicIcon.textContent = '🔊';
                    }).catch(function() {});
                }
            }
            document.addEventListener('click', onFirstInteraction, true);
            document.addEventListener('touchstart', onFirstInteraction, true);
        });
    }, 2000);
});

// === 视频/图片处理工具函数 ===
function isVideoUrl(str) {
    if (!str) return false;
    const s = String(str).trim();
    if (/^data:video\//i.test(s)) return true;
    return s.match(/\.(mp4|webm|mov)(\?.*)?$/i) !== null;
}


function getMediaHtml(url, alt, extraClass, onerrorFallback) {
    alt = alt || '';
    extraClass = extraClass || '';
    onerrorFallback = onerrorFallback || '';
    // 转义URL中的特殊字符，防止破坏HTML结构
    const safeUrl = String(url || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const safeAlt = String(alt || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    if (isVideoUrl(url)) {
        return '<video src="' + safeUrl + '" class="' + extraClass + '" style="max-width:100%; max-height:100%; object-fit:contain;" controls muted playsinline preload="metadata"></video>';
    } else {
        const fallback = onerrorFallback || "this.src='https://picsum.photos/400/300?random='+Math.random()";
        return '<img src="' + safeUrl + '" alt="' + safeAlt + '" class="' + extraClass + '" onerror="' + fallback + '">';
    }
}

function genIsUrl(str) {
    if (!str) return false;
    const s = String(str).trim();
    if (/^https?:\/\//i.test(s)) return true;
    if (/\.(jpg|jpeg|png|gif|webp|bmp|mp4|webm|mov)(\?.*)?$/i.test(s)) return true;
    if (/^data:(image|video)\//i.test(s)) return true;
    return false;
}


function applyAudioSource(audioId, dataUrl) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
    let source = audio.querySelector('source');
    if (!source) {
        source = document.createElement('source');
        source.type = 'audio/mpeg';
        audio.appendChild(source);
    }
    source.src = dataUrl || '';
    audio.load();
}


function getAudioSource(audioId) {
    const audio = document.getElementById(audioId);
    if (!audio) return '';
    const source = audio.querySelector('source');
    return source ? (source.getAttribute('src') || '') : '';
}



;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();