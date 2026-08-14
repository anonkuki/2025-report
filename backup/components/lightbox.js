// ============================================================
// components/lightbox.js - 图片/视频放大查看器
// 从 generator.html 提取
// 依赖全局: deptClickGuardUntil, window.isVideoUrl
// ============================================================

// 图片放大查看器
function initImageLightbox() {
    document.querySelectorAll('.clickable-img').forEach(el => {
        el.addEventListener('click', function(e) {
            if (Date.now() < deptClickGuardUntil) {
                e.stopPropagation();
                return;
            }
            e.stopPropagation();
            const url = this.dataset.url;
            const author = this.dataset.author || '';
            const desc = this.dataset.desc || '';
            showLightbox(url, author, desc);
        });
    });
}

function showLightbox(url, author, desc) {
    if (Date.now() < deptClickGuardUntil) return;
    let lightbox = document.getElementById('image-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'image-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-close">&times;</div>
            <div class="lightbox-content">
                <!-- Img 和 Video 容器 -->
                <div class="media-container" style="display: flex; justify-content: center; width: 100%;"></div>
                <div class="lightbox-info">
                    <div class="author"></div>
                    <div class="desc"></div>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);

        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // 清空旧内容
    const container = lightbox.querySelector('.media-container');
    container.innerHTML = '';

    // 判断媒体类型并注入
    if (window.isVideoUrl && window.isVideoUrl(url)) {
         container.innerHTML = `<video src="${url}" controls autoplay style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);"></video>`;
    } else {
         container.innerHTML = `<img src="${url}" alt="" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">`;
    }

    lightbox.querySelector('.lightbox-info .author').textContent = author ? `by ${author}` : '';
    lightbox.querySelector('.lightbox-info .desc').textContent = desc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 暴露给外部调用（星云详情图片点击）
window.showLightbox = showLightbox;

function closeLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

window.closeLightbox = closeLightbox;

;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();