// ============================================================
// product-runtime.js - 产品运行时 (3D引擎 + 交互系统)
// Three.js 场景、飞船、流星、用户验证、部门导航
// ============================================================

// ================= 3D 引擎 (Three.js) =================
let scene, camera, renderer, clock;
let bgStars, brightStars, dustSystem, dustVel = [];
let starshipObj, solarSystem, hubMesh, hubGlow;
let objects = [], interactables = [], meteors = [];
let isFlying = false;
let glowTex, meteorHeadTex, meteorTrailTex, dustTex;
let raycaster, mouse;

// === Texture Factory (完整复刻 system.html) ===
const TextureFactory = {
    createBase: (size=512) => {
        const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        return { canvas, ctx, center: size/2 };
    },

    dance_refined: (c1, c2) => {
        const { canvas, ctx, center } = TextureFactory.createBase();
        const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
        grad.addColorStop(0, '#c8a898'); grad.addColorStop(1, '#8b6e62');
        ctx.fillStyle = grad; ctx.fillRect(0,0,512,512);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 0.5;
        for(let i=0; i<512; i+=4) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,512); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(512,i); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(240, 230, 214, 0.7)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineCap = 'round';
        for(let k=0; k<30; k++) { const x = Math.random()*512; const y = Math.random()*512; const len = 30 + Math.random()*40; const angle = Math.random() * Math.PI; ctx.beginPath(); ctx.moveTo(x - Math.cos(angle)*len, y - Math.sin(angle)*len); ctx.lineTo(x + Math.cos(angle)*len, y + Math.sin(angle)*len); ctx.stroke(); }
        ctx.setLineDash([]); ctx.fillStyle = '#f0e6d6';
        for(let b=0; b<6; b++) { const bx = Math.random()*400 + 56; const by = Math.random()*400 + 56; ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI*2); ctx.fill(); }
        return new THREE.CanvasTexture(canvas);
    },

    cos_refined: (c1, c2) => {
        const { canvas, ctx, center } = TextureFactory.createBase();
        const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
        grad.addColorStop(0, '#d89fbf'); grad.addColorStop(0.6, '#7a4d54'); grad.addColorStop(1, '#4a2533');
        ctx.fillStyle = grad; ctx.fillRect(0,0,512,512);
        ctx.fillStyle = 'rgba(255, 248, 220, 0.15)'; for(let i=0; i<4000; i++) { ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2); }
        ctx.fillStyle = 'rgba(248, 224, 230, 0.7)'; for(let i=0; i<600; i++) { const r = 1 + Math.random(); ctx.beginPath(); ctx.arc(Math.random()*512, Math.random()*512, r, 0, Math.PI*2); ctx.fill(); }
        ctx.globalCompositeOperation = 'screen'; for(let i=0; i<4; i++) { const x = Math.random() * 512; const y = Math.random() * 512; const r = 35; const spotGrad = ctx.createRadialGradient(x, y, 0, x, y, r); spotGrad.addColorStop(0, 'rgba(248, 200, 220, 0.8)'); spotGrad.addColorStop(1, 'rgba(248, 200, 220, 0)'); ctx.fillStyle = spotGrad; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill(); }
        return new THREE.CanvasTexture(canvas);
    },

    dance_trajectory: (color) => {
        const { canvas, ctx, center } = TextureFactory.createBase(512);
        ctx.strokeStyle = '#f0e6d6'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.setLineDash([20, 40]);
        const radius = 220; const segments = [ { start: 0, len: 1.5 }, { start: 2.2, len: 0.8 }, { start: 3.8, len: 2.0 } ];
        segments.forEach(seg => { ctx.beginPath(); ctx.arc(center, center, radius, seg.start, seg.start + seg.len); ctx.stroke(); });
        return new THREE.CanvasTexture(canvas);
    },

    dual_layer: (c1, c2) => {
        const { canvas, ctx, center } = TextureFactory.createBase(512);
        ctx.strokeStyle = 'rgba(216, 159, 191, 0.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(center, center, 200, 0, Math.PI*2); ctx.stroke();
        ctx.strokeStyle = 'rgba(248, 224, 230, 0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(center, center, 230, 0, Math.PI*2); ctx.stroke();
        return new THREE.CanvasTexture(canvas);
    },

    propIcon: (type, color) => {
        const { canvas, ctx, center } = TextureFactory.createBase(64);
        ctx.fillStyle = color;
        if (type === 'wig') { ctx.beginPath(); ctx.moveTo(32, 12); ctx.bezierCurveTo(10, 15, 10, 55, 25, 50); ctx.bezierCurveTo(25, 45, 39, 45, 39, 50); ctx.bezierCurveTo(54, 55, 54, 15, 32, 12); ctx.fill(); }
        else if (type === 'dress') { ctx.beginPath(); ctx.moveTo(24, 15); ctx.lineTo(40, 15); ctx.lineTo(48, 30); ctx.lineTo(16, 30); ctx.fill(); ctx.beginPath(); ctx.moveTo(14, 32); ctx.lineTo(50, 32); ctx.lineTo(58, 52); ctx.lineTo(6, 52); ctx.fill(); }
        else if (type === 'shoe') { ctx.beginPath(); ctx.ellipse(32, 32, 8, 24, 0, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(24, 20); ctx.lineTo(40, 20); ctx.stroke(); }
        else if (type === 'lace') { ctx.beginPath(); ctx.arc(32, 32, 12, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; for(let i=0; i<12; i++) { const a = i * Math.PI/6; ctx.beginPath(); ctx.arc(32 + Math.cos(a)*18, 32 + Math.sin(a)*18, 3, 0, Math.PI*2); ctx.stroke(); } }
        return new THREE.CanvasTexture(canvas);
    },

    ink: (c1, c2) => { const { canvas, ctx, center } = TextureFactory.createBase(); const grad = ctx.createRadialGradient(center, center, 0, center, center, center); grad.addColorStop(0, '#f8f8f8'); grad.addColorStop(1, '#e0e0e0'); ctx.fillStyle = grad; ctx.fillRect(0,0,512,512); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = c2; for(let i=0; i<15; i++) { const r = Math.random()*50 + 20; ctx.beginPath(); ctx.arc(Math.random()*512, Math.random()*512, r, 0, Math.PI*2); ctx.fill(); } ctx.strokeStyle = 'rgba(60, 70, 90, 0.5)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; for(let i=0; i<250; i++) { const x = Math.random()*512; const y = Math.random()*512; ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x+10, y-10, x+5, y+10, x+15, y+5); ctx.stroke(); } return new THREE.CanvasTexture(canvas); },
    signal: (c1, c2) => { const { canvas, ctx, center } = TextureFactory.createBase(); const grad = ctx.createRadialGradient(center, center, 0, center, center, center); grad.addColorStop(0, c1); grad.addColorStop(1, '#cc5500'); ctx.fillStyle = grad; ctx.fillRect(0,0,512,512); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 10; for(let r=50; r<400; r+=60) { ctx.beginPath(); ctx.arc(center, center, r, 0, Math.PI*2); ctx.stroke(); } return new THREE.CanvasTexture(canvas); },
    circuit: (c1, c2) => { const { canvas, ctx, center } = TextureFactory.createBase(); ctx.fillStyle = c1; ctx.fillRect(0,0,512,512); ctx.strokeStyle = c2; ctx.lineWidth = 5; ctx.lineCap = 'square'; ctx.shadowBlur = 10; ctx.shadowColor = c2; for(let i=0; i<15; i++) { const x = Math.random()*512; const y = Math.random()*512; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x, y + (Math.random()-0.5)*200); ctx.lineTo(x + (Math.random()-0.5)*200, y + (Math.random()-0.5)*200); ctx.stroke(); ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fillStyle=c2; ctx.fill(); } return new THREE.CanvasTexture(canvas); },
    soundwave: (c1, c2) => { const { canvas, ctx, center } = TextureFactory.createBase(); const grad = ctx.createRadialGradient(center, center, 0, center, center, center); grad.addColorStop(0, c1); grad.addColorStop(1, '#008b8b'); ctx.fillStyle = grad; ctx.fillRect(0,0,512,512); ctx.strokeStyle = c2; ctx.lineWidth = 4; for(let j=0; j<5; j++) { ctx.beginPath(); for(let x=0; x<512; x+=10) { const y = center + Math.sin(x*0.05 + j)*50 + (j-2)*40; x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y); } ctx.stroke(); } return new THREE.CanvasTexture(canvas); },
    sun: (color) => { const { canvas, ctx, center } = TextureFactory.createBase(); const grad = ctx.createRadialGradient(center, center, 50, center, center, center); grad.addColorStop(0, '#fff'); grad.addColorStop(0.3, '#fff'); grad.addColorStop(0.6, color || '#ffd700'); grad.addColorStop(1, '#ffa500'); ctx.fillStyle = grad; ctx.fillRect(0,0,512,512); return new THREE.CanvasTexture(canvas); },
    ring: (type, color) => { const { canvas, ctx, center } = TextureFactory.createBase(512); const grad = ctx.createRadialGradient(center, center, 180, center, center, 256); if (type === 'data') { grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(0.4, 'rgba(0,255,255,0.8)'); grad.addColorStop(0.45, 'rgba(0,0,0,0)'); grad.addColorStop(0.6, 'rgba(0,255,255,0.3)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = grad; ctx.fillRect(0,0,512,512); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; for(let i=0; i<512; i+=15) ctx.fillRect(0, i, 512, 5); } return new THREE.CanvasTexture(canvas); },
    satellite: (type, color) => { const { canvas, ctx, center } = TextureFactory.createBase(64); if (type === 'paper') { ctx.fillStyle = color; ctx.fillRect(16,16,32,32); } else if (type === 'quill') { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(32, 32, 8, 20, Math.PI/4, 0, Math.PI*2); ctx.fill(); } else if (type === 'note') { ctx.font = '40px serif'; ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('♪', 32, 32); } else { ctx.beginPath(); ctx.arc(32,32,12,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); } return new THREE.CanvasTexture(canvas); },
    glow: (color) => { const { canvas, ctx, center } = TextureFactory.createBase(128); const grad = ctx.createRadialGradient(64,64,0, 64,64,64); grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.3, color); grad.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = grad; ctx.fillRect(0,0,128,128); return new THREE.CanvasTexture(canvas); },
    meteorHead: () => { const { canvas, ctx, center } = TextureFactory.createBase(64); const grad = ctx.createRadialGradient(32,32,0, 32,32,32); grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.3, 'rgba(200,240,255,0.8)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = grad; ctx.fillRect(0,0,64,64); return new THREE.CanvasTexture(canvas); },
    meteorTrail: () => { const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 32; const ctx = canvas.getContext('2d'); const grad = ctx.createLinearGradient(0, 0, 256, 0); grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(0.8, 'rgba(150,220,255,0.4)'); grad.addColorStop(1, 'rgba(255,255,255,0.95)'); ctx.fillStyle = grad; ctx.fillRect(0,0,256,32); return new THREE.CanvasTexture(canvas); },
    dust: () => { const { canvas, ctx, center } = TextureFactory.createBase(32); const grad = ctx.createRadialGradient(16,16,0, 16,16,16); grad.addColorStop(0, 'rgba(255,255,255,0.8)'); grad.addColorStop(0.5, 'rgba(255,255,255,0.1)'); grad.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = grad; ctx.fillRect(0,0,32,32); return new THREE.CanvasTexture(canvas); }
};

// === 流星类 ===
class Meteor {
    constructor() {
        this.active = false;
        const headMat = new THREE.SpriteMaterial({ map: meteorHeadTex, transparent: true, blending: THREE.AdditiveBlending });
        this.head = new THREE.Sprite(headMat); this.head.scale.set(1.5, 1.5, 1); scene.add(this.head);
        const trailMat = new THREE.SpriteMaterial({ map: meteorTrailTex, transparent: true, blending: THREE.AdditiveBlending });
        this.trail = new THREE.Sprite(trailMat); this.trail.center.set(1.0, 0.5); this.trail.scale.set(30, 0.8, 1); scene.add(this.trail);
        this.reset(true);
    }
    reset(initial = false) {
        const startX = 50 + Math.random() * 60; const startY = 40 + Math.random() * 50; const startZ = (Math.random() - 0.5) * 80;
        this.pos = new THREE.Vector3(startX, startY, startZ);
        const speed = 1.0 + Math.random() * 0.8; const angleVar = (Math.random() - 0.5) * 0.3;
        this.velocity = new THREE.Vector3(-1.2, -0.8 + angleVar, 0.8).normalize().multiplyScalar(speed);
        this.maxLife = 100 + Math.random() * 50; this.life = 0;
        this.delay = initial ? Math.random() * 300 : Math.random() * 600 + 300; this.active = false;
        this.updatePos();
    }
    updatePos() { this.head.position.copy(this.pos); this.trail.position.copy(this.pos); }
    update() {
        if (this.delay > 0) { this.delay--; return; }
        this.active = true; this.life++;
        const prevPos = this.pos.clone(); const prevProj = prevPos.project(camera);
        this.pos.add(this.velocity); this.updatePos();
        const currPos = this.pos.clone(); const currProj = currPos.project(camera);
        const dx = (currProj.x - prevProj.x) * window.innerWidth;
        const dy = (currProj.y - prevProj.y) * window.innerHeight;
        const angle = Math.atan2(dy, dx);
        this.trail.material.rotation = angle;
        const progress = this.life / this.maxLife; let opacity = 0;
        if (progress < 0.15) opacity = progress / 0.15; else opacity = 1 - (progress - 0.15) / 0.85;
        opacity = Math.pow(opacity, 1.2);
        this.head.material.opacity = opacity; this.trail.material.opacity = opacity * 0.6;
        const speedPixel = Math.sqrt(dx*dx + dy*dy);
        this.trail.scale.set(speedPixel * 3 + 10, 0.6, 1);
        if (progress >= 1) { this.reset(); }
    }
}

// === Starship 类 (Mecha Style - Scaled Down) ===
class Starship {
    constructor() {
        this.active = false;
        this.group = new THREE.Group();
        scene.add(this.group);

        // --- 比例修正: 缩小飞船以避免在近景时看起来比星球还大 ---
        this.group.scale.set(0.25, 0.25, 0.25);

        // --- 机体结构 ---
        this.hullGroup = new THREE.Group();
        this.group.add(this.hullGroup);

        // 材质定义
        const matWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const matBlue = new THREE.MeshBasicMaterial({ color: 0x007ACC });
        const matDark = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const matYellow = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        const matGlass = new THREE.MeshBasicMaterial({ color: 0x111111 });

        // 1. 机身主体 (Main Hull)
        // 1.1 机头 (Nose)
        const noseGeo = new THREE.ConeGeometry(0.4, 1.8, 4);
        noseGeo.rotateY(Math.PI / 4); // 菱形截面
        noseGeo.rotateX(Math.PI / 2);
        noseGeo.translate(0, 0, 1.9);
        this.hullGroup.add(new THREE.Mesh(noseGeo, matBlue));

        // 1.2 机身中段 (Body)
        const bodyGeo = new THREE.BoxGeometry(1.0, 0.6, 2.6);
        this.hullGroup.add(new THREE.Mesh(bodyGeo, matWhite));

        // 1.3 驾驶舱 (Cockpit)
        const cockpitGeo = new THREE.BoxGeometry(0.7, 0.4, 0.9);
        cockpitGeo.translate(0, 0.4, 0.6);
        this.hullGroup.add(new THREE.Mesh(cockpitGeo, matGlass));

        // 1.4 顶部背鳍 (Top Detail)
        const topFinGeo = new THREE.BoxGeometry(0.4, 0.4, 0.8);
        topFinGeo.translate(0, 0.6, -0.6);
        this.hullGroup.add(new THREE.Mesh(topFinGeo, matBlue));

        // 2. 侧面大型引擎舱 (Side Pontoons) - 关键特征
        const pontoonGeo = new THREE.BoxGeometry(0.7, 0.7, 2.5);

        // 左侧引擎
        const engineL = new THREE.Group();
        engineL.position.set(1.6, -0.2, -0.5);

        // 主体
        const pMesh = new THREE.Mesh(pontoonGeo, matWhite);
        engineL.add(pMesh);

        // 前端进气口 (Blue)
        const intakeGeo = new THREE.BoxGeometry(0.75, 0.75, 0.2);
        intakeGeo.translate(0, 0, 1.25);
        engineL.add(new THREE.Mesh(intakeGeo, matBlue));

        // 顶部细节块 (Dark)
        const detailGeo = new THREE.BoxGeometry(0.5, 0.2, 0.8);
        detailGeo.translate(0, 0.45, 0.2);
        engineL.add(new THREE.Mesh(detailGeo, matDark));

        this.hullGroup.add(engineL);

        // 右侧引擎 (镜像)
        const engineR = engineL.clone();
        engineR.position.set(-1.6, -0.2, -0.5);
        engineR.scale.x = -1; // 镜像翻转
        this.hullGroup.add(engineR);

        // 3. 连接翼 (Wings)
        // 主翼
        const wingGeo = new THREE.BoxGeometry(3.2, 0.1, 1.2);
        wingGeo.translate(0, -0.1, -0.5);
        this.hullGroup.add(new THREE.Mesh(wingGeo, matWhite));

        // 前掠鸭翼 (Canards)
        const canardGeo = new THREE.BoxGeometry(2.0, 0.05, 0.4);
        canardGeo.translate(0, 0.1, 1.2);
        // 稍微倾斜
        const canardMesh = new THREE.Mesh(canardGeo, matYellow);
        canardMesh.rotation.x = 0.1;
        this.hullGroup.add(canardMesh);

        // 4. 推进系统 (Thrusters)
        const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0x00AAFF, transparent: true, blending: THREE.AdditiveBlending });

        // 主喷口
        this.mainJet = new THREE.Sprite(glowMat);
        this.mainJet.scale.set(1.5, 1.5, 1);
        this.mainJet.position.set(0, 0, -1.8);
        this.hullGroup.add(this.mainJet);

        // 侧喷口
        const sideJet = new THREE.Sprite(glowMat);
        sideJet.scale.set(1.2, 1.2, 1);
        sideJet.position.set(0, 0, -1.5); // Local to engine group
        engineL.add(sideJet);
        engineR.add(sideJet.clone());

        // 5. 拖尾系统
        this.trailParticles = [];
        const trailGeo = new THREE.BufferGeometry();
        const trailPos = new Float32Array(90 * 3);
        trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
        // 缩小粒子尺寸以匹配缩小的飞船
        const trailMat = new THREE.PointsMaterial({ size: 0.15, color: 0x00AAFF, transparent: true, opacity: 0.6, map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false });
        this.trailSystem = new THREE.Points(trailGeo, trailMat);
        scene.add(this.trailSystem);

        this.floatTick = 0;

        this.state = 'orbiting';
        this.orbitCenter = new THREE.Vector3(0, 20, 0);
        this.progress = 0;
        this.path = null;
        this.group.position.copy(this.orbitCenter);
        this.isFollowing = false;
        this.targetPlanet = null;
    }

    goToPlanet(index) {
        const targetPlanet = objects[index];
        this.targetPlanet = targetPlanet;
        this.targetDeptId = DEPARTMENTS[index].id;
        const startPos = this.group.position.clone();
        const endPos = targetPlanet.group.position.clone().add(new THREE.Vector3(0, 3, 0));
        const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
        const dist = startPos.distanceTo(endPos);
        midPoint.y += dist * 0.3;
        if (startPos.distanceTo(new THREE.Vector3(0,0,0)) < 10) {
             midPoint.normalize().multiplyScalar(CONFIG.orbitRadius * 0.8);
        }
        this.path = new THREE.CatmullRomCurve3([startPos, midPoint, endPos]);
        this.state = 'travelling';
        this.progress = 0;
        this.isFollowing = true;
        this.orbitCenter = endPos.clone();
        // 到达后显示部门页面
        this.onArrival = () => { showDeptPage(this.targetDeptId); };
    }

    returnToOrbit() {
        this.isFollowing = false;
        this.state = 'orbiting';
        this.orbitCenter = new THREE.Vector3(0, 20, 0);
        const startPos = this.group.position.clone();
        const endPos = this.orbitCenter;
        const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
        midPoint.y += 20;
        this.path = new THREE.CatmullRomCurve3([startPos, midPoint, endPos]);
        this.state = 'travelling';
        this.progress = 0;
        this.onArrival = null;
        gsap.to(camera.position, { x: 0, y: 55, z: 90, duration: 2, ease: "power2.inOut", onUpdate: () => camera.lookAt(0,0,0) });
    }

    update(time, delta) {
        // 机体动画: 旋转环加速 & 喷口脉冲
        this.floatTick += delta;
        if(this.rotor) this.rotor.rotation.z -= delta * 15;
        if(this.mainJet) this.mainJet.scale.setScalar(2.0 + Math.sin(time * 30) * 0.5);

        // 待机时的微动 (hullGroup)
        if (this.state === 'orbiting' && this.hullGroup) {
            this.hullGroup.rotation.z = Math.sin(this.floatTick) * 0.1;
            this.hullGroup.position.y = Math.sin(this.floatTick * 2) * 0.2;
        } else if(this.hullGroup) {
            this.hullGroup.rotation.z = 0;
            this.hullGroup.position.y = 0;
        }

        if (this.state === 'travelling' && this.path) {
            this.progress += delta * 0.9;
            if (this.progress >= 1) {
                this.progress = 1;
                this.state = 'orbiting';
                const point = this.path.getPoint(1);
                this.group.position.copy(point);
                // 到达后触发回调
                if (this.onArrival) {
                    setTimeout(() => { if(this.onArrival) this.onArrival(); }, 500);
                }
            } else {
                const point = this.path.getPoint(this.progress);
                this.group.position.copy(point);
                const nextPoint = this.path.getPoint(Math.min(this.progress + 0.05, 1));
                this.group.lookAt(nextPoint);

                // 飞行侧倾特效
                if(this.hullGroup) {
                     const turnFactor = (this.path.getPoint(Math.min(this.progress + 0.1, 1)).x - point.x) * 2;
                     this.hullGroup.rotation.z = -Math.max(-0.8, Math.min(0.8, turnFactor));
                }
            }
            if (this.isFollowing) {
                const relativeOffset = new THREE.Vector3(0, 5, 15);
                const cameraOffset = relativeOffset.applyMatrix4(this.group.matrixWorld);
                camera.position.lerp(cameraOffset, 0.1);
                camera.lookAt(this.group.position);
            }
        } else if (this.state === 'orbiting') {
            if (this.isFollowing && this.targetPlanet) {
                // 跟随目标星球，飞船在星球附近盘旋
                this.orbitCenter = this.targetPlanet.group.position.clone().add(new THREE.Vector3(0, 3, 0));
                const orbitAngle = time * 0.5;
                const orbitDist = 5;
                this.group.position.x = this.orbitCenter.x + Math.cos(orbitAngle) * orbitDist;
                this.group.position.y = this.orbitCenter.y + Math.sin(time * 2) * 0.5;
                this.group.position.z = this.orbitCenter.z + Math.sin(orbitAngle) * orbitDist;
                this.group.lookAt(this.targetPlanet.group.position);

                const camTargetPos = this.targetPlanet.group.position.clone().add(new THREE.Vector3(0, 5, 15));
                camera.position.lerp(camTargetPos, 0.05);
                camera.lookAt(this.targetPlanet.group.position);
            } else {
                // 默认待机：在太阳附近盘旋
                const orbitAngle = time * 0.3;
                const orbitDist = 12;
                this.group.position.x = Math.cos(orbitAngle) * orbitDist;
                this.group.position.y = this.orbitCenter.y + Math.sin(time * 2) * 0.5;
                this.group.position.z = Math.sin(orbitAngle) * orbitDist;

                // 面向切线方向
                const nextX = Math.cos(orbitAngle + 0.1) * orbitDist;
                const nextZ = Math.sin(orbitAngle + 0.1) * orbitDist;
                this.group.lookAt(nextX, this.group.position.y, nextZ);
            }
        }
        this.updateTrail();
    }

    updateTrail() {
        const positions = this.trailSystem.geometry.attributes.position.array;
        const count = positions.length / 3;

        // 移动所有点向后 (shift right)
        for(let i = count - 1; i > 0; i--) {
            positions[i*3] = positions[(i-1)*3];
            positions[i*3+1] = positions[(i-1)*3+1];
            positions[i*3+2] = positions[(i-1)*3+2];
        }

        // 新点: 引擎尾部世界坐标
        const tailPos = new THREE.Vector3(0, 0, -2.5);
        tailPos.applyMatrix4(this.group.matrixWorld); // 转换为世界坐标

        positions[0] = tailPos.x + (Math.random()-0.5)*0.2;
        positions[1] = tailPos.y + (Math.random()-0.5)*0.2;
        positions[2] = tailPos.z + (Math.random()-0.5)*0.2;

        this.trailSystem.geometry.attributes.position.needsUpdate = true;
    }
}

function init3D() {
    const canvas = document.querySelector('#glCanvas');
    if (!canvas) return;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.005);
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 12);

    // 预先生成纹理
    glowTex = TextureFactory.glow('white');
    meteorHeadTex = TextureFactory.meteorHead();
    meteorTrailTex = TextureFactory.meteorTrail();
    dustTex = TextureFactory.dust();

    // 背景星空 - 基础星尘 (更深邃，透明度降低)
    const starGeo = new THREE.BufferGeometry(); const starPos = []; const starSizes = [];
    for(let i=0; i<CONFIG.starCount; i++){
        const r = 20 + Math.random() * 150; const th = Math.random() * Math.PI * 2; const y = (Math.random()-0.5) * 100;
        starPos.push(r*Math.cos(th), y, r*Math.sin(th)); starSizes.push(Math.random() > 0.9 ? 0.6 : 0.2);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3)); starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    bgStars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.3, vertexColors: false, color: 0xaaaaaa, transparent:true, opacity: 0.3, map: glowTex, depthWrite:false, blending: THREE.AdditiveBlending }));
    scene.add(bgStars);

    // 稀疏高亮微星 (减少数量，增加亮度，营造极简感)
    const brightStarGeo = new THREE.BufferGeometry(); const brightStarPos = [];
    for(let i=0; i<CONFIG.brightStarCount * 0.6; i++){ // 减少40%的高亮星星
        const r = 55 + Math.random() * 250; const th = Math.random() * Math.PI * 2; const y = (Math.random()-0.5) * 150;
        brightStarPos.push(r*Math.cos(th), y, r*Math.sin(th));
    }
    brightStarGeo.setAttribute('position', new THREE.Float32BufferAttribute(brightStarPos, 3));
    brightStars = new THREE.Points(brightStarGeo, new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent:true, opacity: 0.8, map: glowTex, depthWrite:false, blending: THREE.AdditiveBlending }));
    scene.add(brightStars);

    // 添加极小的深空白点 - 增加纵深感
    const tinyStarGeo = new THREE.BufferGeometry(); const tinyStarPos = [];
    for(let i=0; i<CONFIG.tinyStarCount; i++){
        const r = 80 + Math.random() * 300; const th = Math.random() * Math.PI * 2; const phi = (Math.random() - 0.5) * Math.PI;
        const x = r * Math.cos(th) * Math.cos(phi);
        const y = r * Math.sin(phi);
        const z = r * Math.sin(th) * Math.cos(phi);
        tinyStarPos.push(x, y, z);
    }
    tinyStarGeo.setAttribute('position', new THREE.Float32BufferAttribute(tinyStarPos, 3));
    const tinyStars = new THREE.Points(tinyStarGeo, new THREE.PointsMaterial({ size: 0.15, color: 0xffffff, transparent:true, opacity: 0.4, map: glowTex, depthWrite:false, blending: THREE.AdditiveBlending }));
    scene.add(tinyStars);

    // 浮游微尘 (更加隐蔽)
    const dustGeo = new THREE.BufferGeometry(); const dustPos = [];
    for(let i=0; i<CONFIG.dustCount; i++) {
        const x = (Math.random() - 0.5) * 120; const y = (Math.random() - 0.5) * 80; const z = (Math.random() - 0.5) * 100;
        dustPos.push(x, y, z);
        dustVel.push((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02);
    }
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustPos, 3));
    dustSystem = new THREE.Points(dustGeo, new THREE.PointsMaterial({ size: 0.3, color: 0x888888, map: dustTex, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(dustSystem);

    // 星系 (初始隐藏)
    solarSystem = new THREE.Group();
    solarSystem.visible = false;
    scene.add(solarSystem);

    // 太阳核心
    hubMesh = new THREE.Mesh(new THREE.SphereGeometry(HUB_DATA.scale*0.5, 64, 64), new THREE.MeshBasicMaterial({ map: TextureFactory.sun(HUB_DATA.color) }));
    hubMesh.userData = { isSun: true };
    solarSystem.add(hubMesh);
    hubGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#ffccaa', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending }));
    hubGlow.scale.set(HUB_DATA.scale*4, HUB_DATA.scale*4, 1); solarSystem.add(hubGlow);

    // 行星系统
    DEPARTMENTS.forEach((dept, deptIndex) => {
        const grp = new THREE.Group();
        const x = Math.cos(dept.angle) * CONFIG.orbitRadius; const z = Math.sin(dept.angle) * CONFIG.orbitRadius;
        grp.position.set(x, 0, z);
        scene.add(grp);

        let map;
        switch(dept.type) {
            case 'ink': map = TextureFactory.ink(dept.color, dept.color2); break;
            case 'cos_refined': map = TextureFactory.cos_refined(dept.color, dept.color2); break;
            case 'dance_refined': map = TextureFactory.dance_refined(dept.color, dept.color2); break;
            case 'signal': map = TextureFactory.signal(dept.color, dept.color2); break;
            case 'circuit': map = TextureFactory.circuit(dept.color, dept.color2); break;
            case 'soundwave': map = TextureFactory.soundwave(dept.color, dept.color2); break;
            default: map = TextureFactory.createBase().canvas;
        }
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(dept.scale*0.5, 32, 32), new THREE.MeshBasicMaterial({ map: map }));
        sphere.userData = { id: dept.id, isPlanet: true, group: grp };
        grp.add(sphere);
        interactables.push(sphere);

        const decorationGroup = new THREE.Group();
        grp.add(decorationGroup);

        // Ring logic
        if (dept.hasRing) {
            let ringMap;
            if(dept.ringType === 'dance_trajectory') ringMap = TextureFactory.dance_trajectory(dept.color2);
            else if(dept.ringType === 'dual_layer') ringMap = TextureFactory.dual_layer(dept.color, dept.color2);
            else ringMap = TextureFactory.ring(dept.ringType, dept.color2);

            const rSize = dept.id === 'cos' ? dept.scale * 3.2 : (dept.id === 'dance' ? dept.scale * 3.0 : dept.scale * 3.5);
            const ringGeo = new THREE.PlaneGeometry(rSize, rSize);
            const ringMat = new THREE.MeshBasicMaterial({ map: ringMap, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2 + 0.3;
            decorationGroup.add(ring);
        }

        // Satellite logic
        if (dept.hasSatellites) {
            for(let i=0; i<dept.satCount; i++) {
                const satGeo = new THREE.PlaneGeometry(0.8, 0.8);
                let satMap;
                if(dept.satType === 'dance_props_v2') satMap = TextureFactory.propIcon(i%2===0 ? 'shoe' : 'lace', i%2===0 ? '#c8a898' : '#f0e6d6');
                else if (dept.satType === 'cos_props_v2') satMap = TextureFactory.propIcon(i%2===0 ? 'wig' : 'dress', i%2===0 ? '#d89fbf' : '#f8c8dc');
                else satMap = TextureFactory.satellite(dept.satType, dept.color2);
                const satMat = new THREE.MeshBasicMaterial({ map: satMap, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
                const sat = new THREE.Mesh(satGeo, satMat);
                const r = dept.scale * (dept.id === 'dance' ? 1.4 : 1.3); const theta = (i / dept.satCount) * Math.PI * 2;
                sat.position.set(Math.cos(theta)*r, (Math.random()-0.5)*1, Math.sin(theta)*r);
                sat.userData = { angle: theta, radius: r, speed: 0.015 + Math.random()*0.01 };
                decorationGroup.add(sat);
                const trailGeo = new THREE.RingGeometry(r-0.03, r+0.03, 64);
                const trailMat = new THREE.MeshBasicMaterial({ color: dept.color2, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
                const trail = new THREE.Mesh(trailGeo, trailMat);
                trail.rotation.x = Math.PI/2;
                decorationGroup.add(trail);
            }
        }

        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: dept.color2, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending }));
        glow.scale.set(dept.scale*3, dept.scale*3, 1);
        grp.add(glow);

        const card = document.createElement('div'); card.className = 'star-card'; card.style.setProperty('--glow-color', dept.color2);
        card.dataset.deptId = dept.id;
        card.dataset.deptIndex = String(deptIndex);
        card.innerHTML = `<div class="card-body"><div class="card-title">${dept.name}</div><div class="card-extra">${dept.hoverText || ''}</div></div><div class="card-line"></div>`;
        card.onclick = function(e) {
            if (e) e.stopPropagation();
            const idx = parseInt(card.dataset.deptIndex, 10);
            if (!goToPlanetByIndex(idx)) {
                const resolved = DEPARTMENTS.findIndex(function(d) { return d.id === dept.id; });
                goToPlanetByIndex(resolved);
            }
        };
        card.addEventListener('click', (e) => { e.stopPropagation(); const idx = DEPARTMENTS.findIndex(d => d.id === dept.id); starshipObj.goToPlanet(idx); });
        document.getElementById('labels-container').appendChild(card);

        objects.push({ group: grp, sphere: sphere, decoration: decorationGroup, glow: glow, element: card, data: dept, currentAngle: dept.angle, yOffset: Math.random() * 100, hovered: false });
    });

    // 创建飞船
    starshipObj = new Starship();

    // 创建3D流星
    meteors = [new Meteor(), new Meteor()];

    // 初始化raycaster和mouse
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    animate();
}

window.addEventListener('mousemove', (e) => {
    if (!mouse) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if(solarSystem && solarSystem.visible && starshipObj && !starshipObj.isFollowing) {
        scene.rotation.y = mouse.x * 0.05; scene.rotation.x = mouse.y * 0.05;
    }
});

function animate() {
    requestAnimationFrame(animate);
    if (!clock) return;
    const time = clock.getElapsedTime();
    const delta = clock.getDelta();

    if(bgStars) bgStars.rotation.y += 0.0001;
    if(brightStars) brightStars.rotation.y += 0.00005;

    // 微尘更新
    if(dustSystem) {
        const positions = dustSystem.geometry.attributes.position.array;
        for(let i=0; i<CONFIG.dustCount; i++) {
            positions[i*3] += dustVel[i*2]; positions[i*3+1] += dustVel[i*2+1];
            if(positions[i*3] > 60) positions[i*3] = -60; if(positions[i*3] < -60) positions[i*3] = 60;
            if(positions[i*3+1] > 40) positions[i*3+1] = -40; if(positions[i*3+1] < -40) positions[i*3+1] = 40;
        }
        dustSystem.geometry.attributes.position.needsUpdate = true;
        dustSystem.rotation.y = time * 0.02;
    }

    if(solarSystem && solarSystem.visible && raycaster && mouse) {
        hubMesh.rotation.y -= 0.005;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactables);
        const hoveredObj = intersects.length > 0 ? intersects[0].object : null;
        document.body.style.cursor = hoveredObj ? 'pointer' : 'default';

        objects.forEach(obj => {
            obj.currentAngle += CONFIG.orbitSpeed * 0.01;
            const newX = Math.cos(obj.currentAngle) * CONFIG.orbitRadius;
            const newZ = Math.sin(obj.currentAngle) * CONFIG.orbitRadius;
            obj.group.position.set(newX, 0, newZ);

            const isHovered = (hoveredObj === obj.sphere);
            const rotSpeed = isHovered ? 2.0 : 0.5;
            obj.sphere.rotation.y += 0.01 * rotSpeed;

            obj.decoration.children.forEach(child => {
                if (child.type === 'Mesh' && child.geometry.type === 'PlaneGeometry') {
                     if (child.geometry.parameters.width > 2) { child.rotation.z -= isHovered ? 0.02 : 0.005; }
                     else if(child.userData.angle !== undefined) {
                         child.userData.angle += child.userData.speed * (isHovered ? 2 : 1);
                         child.position.x = Math.cos(child.userData.angle) * child.userData.radius;
                         child.position.z = Math.sin(child.userData.angle) * child.userData.radius;
                         child.lookAt(camera.position);
                     }
                }
            });

            const breathe = Math.sin(time * 2 + obj.yOffset);
            obj.glow.material.opacity = isHovered ? 0.6 : (0.3 + breathe * 0.05);
            const scale = isHovered ? obj.data.scale * 3.5 : obj.data.scale * 3.0;
            obj.glow.scale.lerp(new THREE.Vector3(scale, scale, 1), 0.1);

            const tempV = new THREE.Vector3(); obj.sphere.getWorldPosition(tempV); tempV.y += obj.data.scale * 0.4; tempV.project(camera);
            const x = (tempV.x * .5 + .5) * window.innerWidth; const y = (tempV.y * -.5 + .5) * window.innerHeight;
            const dist = camera.position.distanceTo(obj.group.position);
            let showUI = dist < 120;
            if(starshipObj.isFollowing && starshipObj.targetPlanet !== obj) showUI = false;

            if(showUI) {
                obj.element.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
                obj.element.style.opacity = obj.group.position.z < -10 ? 0.3 : 1;
                obj.element.style.pointerEvents = 'auto';
                if(isHovered && !obj.hovered) { obj.element.classList.add('hovered'); obj.element.querySelector('.card-body').style.borderColor = '#fff'; obj.hovered = true; }
                else if (!isHovered && obj.hovered) { obj.element.classList.remove('hovered'); obj.element.querySelector('.card-body').style.borderColor = 'rgba(255,255,255,0.15)'; obj.hovered = false; }
            } else { obj.element.style.opacity = 0; obj.element.style.pointerEvents = 'none'; }
        });

        starshipObj.update(time, 0.016);

        // 更新太阳卡片位置
        const sunCard = document.getElementById('sun-card');
        if(sunCard && !starshipObj.isFollowing) {
            const sunWorldPos = new THREE.Vector3();
            hubMesh.getWorldPosition(sunWorldPos);
            sunWorldPos.y += HUB_DATA.scale * 0.5;
            sunWorldPos.project(camera);
            const sx = (sunWorldPos.x * 0.5 + 0.5) * window.innerWidth;
            const sy = (sunWorldPos.y * -0.5 + 0.5) * window.innerHeight;
            if(sunWorldPos.z < 1) {
                // 确保left/top为0后使用translate定位到屏幕坐标
                sunCard.style.top = '0px';
                sunCard.style.left = '0px';
                sunCard.style.transform = 'translate(-50%, -100%) translate(' + sx + 'px, ' + sy + 'px)';
                sunCard.style.opacity = document.body.classList.contains('phase-system') ? 1 : 0;
                if(document.body.classList.contains('phase-system')) sunCard.style.pointerEvents = 'auto';
            } else {
                sunCard.style.opacity = 0;
                sunCard.style.pointerEvents = 'none';
            }
        } else if(sunCard) {
            sunCard.style.opacity = 0;
            sunCard.style.pointerEvents = 'none';
        }
    }

    meteors.forEach(m => m.update());

    if (renderer) renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (!camera) return;
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    if(renderer) renderer.setSize(window.innerWidth, window.innerHeight);
});

// 鼠标点击交互
/* window.addEventListener('click', (e) => {
    if(!document.body.classList.contains('phase-system')) return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    // 检测点击太阳
    const sunIntersects = raycaster.intersectObject(hubMesh);
    if(sunIntersects.length > 0) {
        showReport();
        return;
    }

    // 检测点击星球
    const planetIntersects = raycaster.intersectObjects(interactables);
    if(planetIntersects.length > 0) {
        const clickedSphere = planetIntersects[0].object;
        const deptId = clickedSphere.userData.id;
        const idx = DEPARTMENTS.findIndex(d => d.id === deptId);
        if(idx >= 0) {
            starshipObj.goToPlanet(idx);
        }
        return;
    }

    // 如果飞船正在跟随某个星球，点击空白区域返回概览
    if(starshipObj.isFollowing) {
        // 点击的是空白区域，返回概览
        starshipObj.returnToOrbit();
    }
}); */

// ================= 业务逻辑 =================

// 鼠标拖尾系统
let cursorComet = null;
let cursorTails = [];
let mouseX = 0, mouseY = 0;
let grabbedMeteor = null;

function initCursorTrail() {
    // 创建彗星头部
    cursorComet = document.createElement('div');
    cursorComet.className = 'cursor-comet';
    cursorComet.style.opacity = '0';
    document.body.appendChild(cursorComet);

    // 创建拖尾粒子
    for (let i = 0; i < 8; i++) {
        const tail = document.createElement('div');
        tail.className = 'cursor-tail';
        tail.style.opacity = (1 - i / 8) * 0.6;
        tail.style.width = (6 - i * 0.5) + 'px';
        tail.style.height = (6 - i * 0.5) + 'px';
        document.body.appendChild(tail);
        cursorTails.push({ el: tail, x: 0, y: 0 });
    }

    // 鼠标移动事件
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorComet.style.left = mouseX + 'px';
        cursorComet.style.top = mouseY + 'px';

        // 只在首页显示
        if (!document.body.classList.contains('phase-ticket') &&
            !document.body.classList.contains('phase-flight') &&
            !document.body.classList.contains('phase-system') &&
            !document.body.classList.contains('phase-report')) {
            cursorComet.style.opacity = '1';
        } else {
            cursorComet.style.opacity = '0';
        }

        // 检测与流星的碰撞
        checkMeteorCollision();
    });

    // 拖尾动画
    function animateTails() {
        let prevX = mouseX, prevY = mouseY;
        cursorTails.forEach((tail, i) => {
            const speed = 0.2 - i * 0.015;
            tail.x += (prevX - tail.x) * speed;
            tail.y += (prevY - tail.y) * speed;
            tail.el.style.left = tail.x + 'px';
            tail.el.style.top = tail.y + 'px';

            // 只在首页显示
            if (!document.body.classList.contains('phase-ticket') &&
                !document.body.classList.contains('phase-flight') &&
                !document.body.classList.contains('phase-system') &&
                !document.body.classList.contains('phase-report')) {
                tail.el.style.opacity = (1 - i / 8) * 0.6;
            } else {
                tail.el.style.opacity = '0';
            }

            prevX = tail.x;
            prevY = tail.y;
        });
        requestAnimationFrame(animateTails);
    }
    animateTails();

    // 鼠标离开窗口
    document.addEventListener('mouseleave', () => {
        cursorComet.style.opacity = '0';
        cursorTails.forEach(t => t.el.style.opacity = '0');
    });
}

// 检测鼠标与流星的碰撞
function checkMeteorCollision() {
    const meteors = document.querySelectorAll('.meteor.play');

    // 先检查当前抓取的流星是否还在范围内
    if (grabbedMeteor) {
        const rect = grabbedMeteor.getBoundingClientRect();
        const hitboxPadding = 40;
        const stillInRange = mouseX >= rect.left - hitboxPadding &&
                            mouseX <= rect.right + hitboxPadding &&
                            mouseY >= rect.top - hitboxPadding &&
                            mouseY <= rect.bottom + hitboxPadding;

        if (!stillInRange) {
            // 鼠标离开了抓取的流星，释放它
            grabbedMeteor.classList.remove('grabbed');
            grabbedMeteor = null;
            if (cursorComet) cursorComet.classList.remove('grabbing');
            return;
        }
    }

    // 如果没有抓取流星，检测新的碰撞
    if (!grabbedMeteor) {
        meteors.forEach(meteor => {
            if (meteor.classList.contains('grabbed')) return;

            const rect = meteor.getBoundingClientRect();
            const hitboxPadding = 25;
            const inRange = mouseX >= rect.left - hitboxPadding &&
                           mouseX <= rect.right + hitboxPadding &&
                           mouseY >= rect.top - hitboxPadding &&
                           mouseY <= rect.bottom + hitboxPadding;

            if (inRange) {
                meteor.classList.add('grabbed');
                grabbedMeteor = meteor;
                if (cursorComet) cursorComet.classList.add('grabbing');
            }
        });
    }
}

window.onload = () => {
    if (!hasLoadedReportData()) {
        document.getElementById('total-counts').innerText = DB.length;
        setTimeout(() => { document.getElementById('loader').style.opacity = 0; }, 200);
        return;
    }
    init3D(); // 初始化3D星系场景
    if (typeof initDroneBackground === 'function') {
        initDroneBackground(); // 2D首页背景
    }
    startMeteorShower();
    initCursorTrail(); // 初始化鼠标拖尾
    document.getElementById('total-counts').innerText = DB.length;
    setTimeout(() => { document.getElementById('loader').style.opacity = 0; }, 1000);
};

function startMeteorShower() {
    const container = document.getElementById('meteor-layer');
    const allNames = DB.map(u => u.name).filter(Boolean);
    if(allNames.length === 0) return;

    meteorInterval = setInterval(() => {
        const name = allNames[Math.floor(Math.random() * allNames.length)];
        const el = document.createElement('div');
        el.className = 'meteor';
        el.style.top = (5 + Math.random() * 90) + 'vh';
        const dur = (8 + Math.random() * 4).toFixed(2);
        el.style.setProperty('--dur', dur + 's');
        el.innerHTML = `<div class="trail"></div><div class="name">${name}</div>`;

        container.appendChild(el);
        requestAnimationFrame(() => el.classList.add('play'));
        setTimeout(() => {
            if (el === grabbedMeteor) {
                grabbedMeteor = null;
                if (cursorComet) cursorComet.classList.remove('grabbing');
            }
            if(el.parentNode) el.remove();
        }, parseFloat(dur) * 1000 + 100);
    }, 900);
}


// 打孔动画函数
function triggerPunchAnimation() {
    // 重置数字的打孔动画
    document.querySelectorAll('.punch-hole').forEach(el => {
        el.classList.remove('active');
        void el.offsetWidth; // 强制重绘
        el.classList.add('active');
    });

    const sparksContainer = document.getElementById('punch-sparks');
    sparksContainer.innerHTML = '';

    // 为每个数字创建火花效果
    // 减慢打孔速度，配合激光效果
    const delays = [200, 1000, 1800, 2600];
    delays.forEach((delay, index) => {
        setTimeout(() => {
            // 播放打孔音效可以在这里添加
            // 创建火花粒子
            for(let i = 0; i < 12; i++) {
                const spark = document.createElement('div');
                spark.className = 'spark';
                spark.style.left = '15px';
                spark.style.top = (index * 43 + 19) + 'px';
                spark.style.setProperty('--tx', (Math.random() - 0.5) * 60 + 'px');
                spark.style.setProperty('--ty', (Math.random() - 0.5) * 60 + 'px');
                // 激光火花更密集，延迟稍晚一点点匹配激光击中瞬间
                spark.style.animationDelay = (i * 0.02 + 0.1) + 's';
                sparksContainer.appendChild(spark);

                // 清理粒子
                setTimeout(() => spark.remove(), 800);
            }
        }, delay);
    });
}

function verifyUser() {
    const input = document.getElementById('username').value.trim();
    const normalizedInput = input.toUpperCase();

    // 佑子游客模式：输入“佑子”或“YOUZI”直接使用本地默认数据进入可手动浏览报告
    if (input === '佑子' || normalizedInput === 'YOUZI') {
        const guest = (typeof buildCleanYouziUser === 'function')
            ? buildCleanYouziUser()
            : {
                id: 'YOUZI',
                name: '佑子',
                joinTime: '',
                depts: (typeof DEPARTMENTS !== 'undefined' && Array.isArray(DEPARTMENTS)) ? DEPARTMENTS.map(d => d.name) : [],
                deptData: {},
                commonData: {}
            };
        enterYouziGuestMode(guest);
        return;
    }

    const user = DB.find(u => u.name.toLowerCase() === input.toLowerCase());

    if(!user) {
        const err = document.getElementById('error-msg');
        err.innerText = "ACCESS DENIED: USER NOT FOUND";
        err.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => err.classList.remove('animate__animated', 'animate__shakeX'), 1000);
        return;
    }

    currentUser = user;
    clearInterval(meteorInterval);
    document.getElementById('meteor-layer').innerHTML = '';

    document.getElementById('ticket-name').innerText = user.name;

    // 按Excel排序显示序号 (NO.0001) - 使用findIndex确保准确
    const index = DB.findIndex(u => u.name === user.name);
    if (index !== -1) {
        const numStr = (index + 1).toString().padStart(4, '0');
        const ticketNumEl = document.getElementById('ticket-number');
        if (ticketNumEl) {
            ticketNumEl.innerText = 'NO.' + numStr;
        }
    }

    document.getElementById('ticket-rank').innerText = getSeniorityTitle(user.joinTime);

    // 更新部门显示为chips格式
    const deptsContainer = document.getElementById('ticket-depts');
    deptsContainer.innerHTML = (user.depts || []).map(d => `<span class="dept-chip">${d}</span>`).join('');

    if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
        window.YouziAgent.notify('user_verified', { user: user, visitedDeptIds: Array.from(visitedDepts) });
    }

    // 触发打孔动画
    triggerPunchAnimation();

    document.body.classList.add('phase-ticket');
}

function launchShip() {
    isFlying = true;
    document.body.classList.remove('phase-ticket');
    document.body.classList.add('phase-flight');

    const tl = gsap.timeline();

    // 船票翻转消失
    tl.to('.ticket-card', { rotationX: -90, opacity: 0, duration: 0.6, ease: "power2.in" });

    // 屏幕闪白 (warp effect)
    tl.to('.nebula-cloud', { opacity: 0.8, scale: 2, duration: 0.3 }, "<0.3");
    tl.to('.nebula-cloud', { opacity: 0, duration: 1 }, ">0.2");

    // 星空拉伸 (超空间跳跃感)
    if (bgStars && bgStars.material) {
        tl.to(bgStars.material, { opacity: 1 }, "<-0.5");
        tl.to(bgStars.scale, { z: 8, duration: 2, ease: "power2.in" }, "<");
    }
    if (brightStars && brightStars.scale) {
        tl.to(brightStars.scale, { z: 12, duration: 2, ease: "power2.in" }, "<");
    }

    // 相机前推
    if (camera && camera.position) {
        tl.to(camera.position, { z: -50, duration: 2, ease: "power2.in" }, "<");
    }

    // 星空渐隐
    if (bgStars && bgStars.material) {
        tl.to(bgStars.material, { opacity: 0, duration: 0.8 }, ">-0.8");
    }
    if (brightStars && brightStars.material) {
        tl.to(brightStars.material, { opacity: 0, duration: 0.8 }, "<");
    }

    // 切换到星系视角
    tl.call(() => {
        if (solarSystem) solarSystem.visible = true;
        // 飞船进入星系，开始在太阳附近盘旋
        if (starshipObj && starshipObj.group) {
            starshipObj.group.position.set(12, 20, 0);
            starshipObj.state = 'orbiting';
            starshipObj.isFollowing = false;
            if (typeof THREE !== 'undefined') {
                starshipObj.orbitCenter = new THREE.Vector3(0, 20, 0);
            }
        }

        if (camera) {
            camera.position.set(0, 55, 90);
            camera.lookAt(0, 0, 0);
        }
        if (bgStars) {
            bgStars.scale.set(1,1,1);
            bgStars.material.opacity = 0.5;
        }
        if (brightStars) {
            brightStars.scale.set(1,1,1);
            brightStars.material.opacity = 0.9;
        }
    });

    // 星系渐入 + 相机下降
    if (solarSystem) {
        tl.to(solarSystem.scale, { x: 1, y: 1, z: 1, duration: 0.1 });
        tl.from(solarSystem.position, { y: -50, duration: 2, ease: "power2.out" });
    }
    if (camera && camera.position) {
        tl.to(camera.position, { y: 55, z: 90, duration: 2, ease: "power2.out" }, "<");
    }

    // 完成
    tl.call(() => {
        document.body.classList.remove('phase-flight');
        document.body.classList.add('phase-system');
        if (window._youziGuestModeActive) {
            document.body.classList.add('youzi-guest-mode');
            document.documentElement.classList.add('youzi-guest-mode');
            ensureYouziGuestStyles();
        } else {
            document.body.classList.remove('youzi-guest-mode');
            document.documentElement.classList.remove('youzi-guest-mode');
        }
        isFlying = false;
        // 初始化进度条星球点击事件
        initProgressPlanetClicks();
        ensureSystemInteractionFallback();
        if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
            window.YouziAgent.notify('entered_system', { visitedDeptIds: Array.from(visitedDepts) });
        }
    });
}

function ensureYouziGuestStyles() {
    let styleEl = document.getElementById('youzi-guest-style');
    if (styleEl) return;
    styleEl = document.createElement('style');
    styleEl.id = 'youzi-guest-style';
    styleEl.textContent = [
        'html.youzi-guest-mode, body.youzi-guest-mode { overflow: auto !important; }',
        'body.youzi-guest-mode.phase-system { overflow: auto !important; }',
        'body.youzi-guest-mode.phase-dept { overflow: auto !important; }',
        'body.youzi-guest-mode.phase-report { overflow: auto !important; }',
        'body.youzi-guest-mode.phase-report .swiper,',
        'body.youzi-guest-mode.phase-report .swiper-wrapper,',
        'body.youzi-guest-mode.phase-report .swiper-slide { pointer-events: auto !important; }'
    ].join('\n');
    document.head.appendChild(styleEl);
}

function initYouziGuestReportSwiper() {
    var isMobile = /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
    try {
        if (window.reportSwiper && typeof window.reportSwiper.destroy === 'function') {
            window.reportSwiper.destroy(true, true);
        }
    } catch (e) {}

    window.reportSwiper = new Swiper('.swiper', {
        direction: 'vertical',
        threshold: isMobile ? 5 : 10,
        touchRatio: isMobile ? 1.15 : 1,
        longSwipesRatio: isMobile ? 0.3 : 0.5,
        touchReleaseOnEdges: isMobile,
        mousewheel: {
            forceToAxis: true,
            releaseOnEdges: true,
            eventsTarget: '.swiper'
        },
        noSwiping: false,
        on: {
            init: function() {
                var total = this.slides.length;
                var pc = document.getElementById('pageCurrent');
                var pt = document.getElementById('pageTotal');
                var pf = document.getElementById('pageBarFill');
                if (pt) pt.textContent = total;
                if (pc) pc.textContent = 1;
                if (pf) pf.style.width = (1 / total * 100).toFixed(1) + '%';
            },
            slideChangeTransitionStart: function() {
                var current = this.activeIndex + 1;
                var total = this.slides.length;
                var pc = document.getElementById('pageCurrent');
                var pt = document.getElementById('pageTotal');
                var pf = document.getElementById('pageBarFill');
                if (pc) pc.textContent = current;
                if (pt) pt.textContent = total;
                if (pf) pf.style.width = (current / total * 100).toFixed(1) + '%';
            }
        }
    });
}

function enterYouziGuestMode(user) {
    currentUser = user;
    // 游客模式保持与正常流程一致：需探索6个部门后解锁最终报告
    secretUnlocked = false;
    window.secretUnlocked = false;
    window._youziCleanUser = user;
    window._youziReadingModeActive = false;
    window._youziGuestModeActive = true;

    // 彻底关闭阅读模式（若存在）
    try {
        if (typeof YouziReadingMode !== 'undefined' && YouziReadingMode && typeof YouziReadingMode.stop === 'function') {
            YouziReadingMode.stop();
        }
    } catch (e) {}

    // 若历史版本曾重写过定时器，这里恢复原生实现
    if (window.__guestNativeSetTimeout) {
        window.setTimeout = window.__guestNativeSetTimeout;
    }
    if (window.__guestNativeSetInterval) {
        window.setInterval = window.__guestNativeSetInterval;
    }

    try { clearInterval(meteorInterval); } catch(e) {}
    const meteorLayer = document.getElementById('meteor-layer');
    if (meteorLayer) meteorLayer.innerHTML = '';

    // 清理可能阻挡点击的残留弹层
    document.querySelectorAll('.dept-intro-modal, .dept-summary-overlay').forEach(function(el) { el.remove(); });
    const imageOverlay = document.getElementById('youzi-image-overlay');
    if (imageOverlay) imageOverlay.remove();
    const deptContent = document.getElementById('dept-content');
    if (deptContent) deptContent.innerHTML = '';

    document.body.classList.remove('youzi-guest-mode');
    document.documentElement.classList.remove('youzi-guest-mode');

    document.body.classList.remove('phase-flight', 'phase-system', 'phase-dept', 'phase-report');
    document.body.classList.add('phase-ticket');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';

    // 按常规流程展示船票，用户手动点击“启航”进入星系
    document.getElementById('ticket-name').innerText = user.name || '佑子';
    const ticketNumEl = document.getElementById('ticket-number');
    if (ticketNumEl) ticketNumEl.innerText = 'NO.0000';
    document.getElementById('ticket-rank').innerText = getSeniorityTitle(user.joinTime || '');
    const deptsContainer = document.getElementById('ticket-depts');
    deptsContainer.innerHTML = (user.depts || []).map(d => '<span class="dept-chip">' + d + '</span>').join('');
    visitedDepts.clear();
    updateProgressBar();
    if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
        window.YouziAgent.notify('user_verified', { user: user, visitedDeptIds: Array.from(visitedDepts) });
    }
    triggerPunchAnimation();
}

function setReportInteractionLock(locked) {
    const reportLayer = document.getElementById('report-layer');
    if (reportLayer && reportLayer.dataset.reportGuardBound !== '1') {
        ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'pointerdown', 'pointerup'].forEach(function(type) {
            reportLayer.addEventListener(type, function(e) {
                e.stopPropagation();
            }, false);
        });
        reportLayer.dataset.reportGuardBound = '1';
    }

    const systemLayer = document.getElementById('system-layer');
    const progressPanel = document.getElementById('progress-panel');
    const labelsContainer = document.getElementById('labels-container');
    const sunCard = document.getElementById('sun-card');
    const glCanvas = document.getElementById('glCanvas');

    [systemLayer, progressPanel, labelsContainer, sunCard, glCanvas].forEach(function(el) {
        if (!el) return;
        el.style.pointerEvents = locked ? 'none' : '';
    });
}

function showReport() {
    function showReportToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(35,25,70,.96),rgba(85,45,160,.96));color:#fff;padding:16px 28px;border-radius:16px;font-size:16px;font-weight:700;z-index:100000;box-shadow:0 12px 40px rgba(0,0,0,.35);animation:fadeInOut 2.2s ease forwards;pointer-events:none;text-align:center;';
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2200);
    }

    if (!currentUser) {
        showReportToast('请先输入名字并进入星系后，再生成报告');
        return;
    }

    // 检查是否已访问所有部门（秘密解锁则跳过检查）
    if (visitedDepts.size < 6 && !secretUnlocked) {
        const remaining = 6 - visitedDepts.size;
        // 显示提示动画
        const hint = document.getElementById('progress-hint');
        if (hint) {
            hint.textContent = '你还差 ' + remaining + ' 颗星球 · 先完成探索再进入恒星报告';
            hint.style.color = '#ff3366';
            hint.style.transform = 'scale(1.1)';
            setTimeout(() => {
                hint.style.color = '';
                hint.style.transform = '';
            }, 500);
        }

        // 抖动太阳卡片
        const sunCard = document.getElementById('sun-card');
        if (sunCard) {
            sunCard.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                sunCard.style.animation = '';
            }, 500);
        }
        showReportToast('还差 ' + remaining + ' 颗星球，完成探索后才能生成报告');
        return;
    }

    if (document.body.classList.contains('phase-report') || window.__reportOpenLock) {
        return;
    }
    window.__reportOpenLock = true;

    renderSlides(currentUser);
    document.body.classList.add('phase-report');
    setReportInteractionLock(true);
    if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
        window.YouziAgent.notify('entered_report', { user: currentUser, visitedDeptIds: Array.from(visitedDepts) });
    }

    if (window.reportSwiper && typeof window.reportSwiper.destroy === 'function') {
        try {
            window.reportSwiper.destroy(true, true);
        } catch (e) {}
    }

    setTimeout(function() {
        window.__reportOpenLock = false;
    }, 400);

    // 进入最终报告：如果有第二首音乐，淡出第一首再淡入第二首
    (function() {
        if (hasSecondMusic()) {
            var fm = document.getElementById('fireworkMusic');
            var targetVol = getUserVolume();
            // 先完全淡出第一首，再淡入第二首（不重叠）
            fadeOutAudio(bgMusic, 1500).then(function() {
                _currentTrack = 'report';
                return fadeInAudio(fm, 2000, targetVol);
            }).then(function() {
                isMusicPlaying = true;
                if (musicIcon) musicIcon.textContent = '🔊';
            }).catch(function() {
                // 第二首播放失败，恢复第一首
                _currentTrack = 'bg';
                bgMusic.volume = targetVol;
                bgMusic.play().catch(function(){});
            });
        }
    // 没有第二首音乐时，第一首继续播放不做切换
    })();

    if (window._youziGuestModeActive) {
        document.body.classList.add('youzi-guest-mode');
        document.documentElement.classList.add('youzi-guest-mode');
        ensureYouziGuestStyles();
    }

    window.reportSwiper = new Swiper('.swiper', {
        direction: 'vertical',
        simulateTouch: true,
        allowTouchMove: true,
        threshold: 8,
        touchRatio: 1,
        mousewheel: {
            forceToAxis: true,
            releaseOnEdges: false,
            eventsTarget: '.swiper'
        },
        noSwiping: false,
        noSwipingClass: 'swiper-no-swiping',
        on: {
            init: function() {
                var total = this.slides.length;
                var pc = document.getElementById('pageCurrent');
                var pt = document.getElementById('pageTotal');
                var pf = document.getElementById('pageBarFill');
                if (pt) pt.textContent = total;
                if (pc) pc.textContent = 1;
                if (pf) pf.style.width = (1 / total * 100).toFixed(1) + '%';
            },
            slideChangeTransitionStart: function() {
                var slide = this.slides[this.activeIndex];
                var nums = slide.querySelectorAll('.big-num');
                gsap.fromTo(nums, {scale:0, opacity:0}, {scale:1, opacity:1, duration:0.5, ease:"back.out"});
                // 更新页码指示器
                var current = this.activeIndex + 1;
                var total = this.slides.length;
                var pc = document.getElementById('pageCurrent');
                var pt = document.getElementById('pageTotal');
                var pf = document.getElementById('pageBarFill');
                if (pc) pc.textContent = current;
                if (pt) pt.textContent = total;
                if (pf) pf.style.width = (current / total * 100).toFixed(1) + '%';
            }
        }
    });

    // 修复回忆墙滚动问题 - 完全禁用Swiper在回忆墙区域的滚轮控制
    setTimeout(() => {
        const memoryScrolls = document.querySelectorAll('.memory-wall-scroll');
        memoryScrolls.forEach(el => {
            // 在捕获阶段处理，优先于Swiper
            el.addEventListener('wheel', function(e) {
                const atTop = this.scrollTop <= 1;
                const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 2;
                const scrollingUp = e.deltaY < 0;
                const scrollingDown = e.deltaY > 0;

                // 只有在边界且继续向外滚动时才允许翻页
                if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
                    // 允许翻页，但需要延迟一下防止误触
                    return;
                }
                // 其他情况阻止事件传播到Swiper
                e.stopPropagation();
                e.stopImmediatePropagation();
            }, { passive: false, capture: true });

            // 额外添加一个冒泡阶段的监听器作为保险
            el.addEventListener('wheel', function(e) {
                const atTop = this.scrollTop <= 1;
                const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight - 2;
                if (!((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0))) {
                    e.stopPropagation();
                }
            }, { passive: false });
        });

        // 同时处理整个memory-wall-slide
        const memorySlides = document.querySelectorAll('.memory-wall-slide');
        memorySlides.forEach(slide => {
            slide.addEventListener('wheel', function(e) {
                const scrollEl = this.querySelector('.memory-wall-scroll');
                if (scrollEl) {
                    const atTop = scrollEl.scrollTop <= 1;
                    const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 2;
                    if (!((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0))) {
                        e.stopPropagation();
                    }
                }
            }, { passive: false, capture: true });
        });
    }, 500);
}

function backToSystem() {
    document.body.classList.remove('phase-report');
    setReportInteractionLock(false);
    if (window._youziGuestModeActive) {
        document.body.classList.add('youzi-guest-mode');
        document.documentElement.classList.add('youzi-guest-mode');
        ensureYouziGuestStyles();
    }
    ensureSystemInteractionFallback();
    if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
        window.YouziAgent.notify('returned_system', { currentDeptName: '', visitedDeptIds: Array.from(visitedDepts) });
    }
    // 返回星系时：如果正在播放第二首，淡出后恢复第一首
    (function() {
        var fm = document.getElementById('fireworkMusic');
        if (_currentTrack === 'report' && fm && !fm.paused) {
            var targetVol = getUserVolume();
            fadeOutAudio(fm, 1500).then(function() {
                _currentTrack = 'bg';
                return fadeInAudio(bgMusic, 2000, targetVol);
            }).then(function() {
                isMusicPlaying = true;
                if (musicIcon) musicIcon.textContent = '🔊';
            }).catch(function(){});
        } else {
            _currentTrack = 'bg';
        }
    })();
}

// ================= 部门展示逻辑 =================


function showDeptPage(deptId) {
    try {
    const deptName = DEPT_ID_TO_NAME[deptId];
    if (!deptName) return;
    deptClickGuardUntil = Date.now() + 900;

    // 记录当前访问的部门
    currentVisitingDept = deptId;

    // 收集该部门所有成员的照片，优先以部门数据本身为准，避免再通过作者名反推“我的图片”时串图
    const deptMembers = DB.filter(u => u.depts && u.depts.includes(deptName));
    const allImages = [];
    const seenImageKeys = new Set();

    function buildDeptImageRecord(owner, img) {
        if (!img || !img.url) return null;
        return {
            url: img.url,
            desc: img.desc || '',
            author: owner && owner.name ? owner.name : '',
            col: img.col || 0
        };
    }

    function pushUniqueImage(target, record) {
        if (!record || !record.url) return;
        const key = [record.author || '', record.col || 0, record.url, record.desc || ''].join('::');
        if (seenImageKeys.has(key)) return;
        seenImageKeys.add(key);
        target.push(record);
    }

    DB.forEach(u => {
        if (!u.deptData || !u.deptData[deptName]) return;
        const deptImages = Array.isArray(u.deptData[deptName].images) ? u.deptData[deptName].images : [];
        deptImages.forEach(img => {
            pushUniqueImage(allImages, buildDeptImageRecord(u, img));
        });
    });

    // 判断当前用户是否属于该部门
    const isInDept = currentUser.depts && currentUser.depts.includes(deptName);
    if (window.YouziAgent && typeof window.YouziAgent.notify === 'function') {
        window.YouziAgent.notify('entered_dept', {
            currentDeptName: deptName,
            deptId: deptId,
            isInDept: !!isInDept,
            user: currentUser,
            visitedDeptIds: Array.from(visitedDepts)
        });
    }

    // “我的图片”直接取当前用户在该部门的数据，避免姓名格式差异导致 intro 无图、报告串成他人投稿
    const myDeptData = currentUser && currentUser.deptData ? currentUser.deptData[deptName] : null;
    const myImages = [];
    const myImageKeys = new Set();
    if (myDeptData && Array.isArray(myDeptData.images)) {
        myDeptData.images.forEach(img => {
            const record = buildDeptImageRecord(currentUser, img);
            if (!record) return;
            const key = [record.col || 0, record.url, record.desc || ''].join('::');
            if (myImageKeys.has(key)) return;
            myImageKeys.add(key);
            myImages.push(record);
        });
    }
    const otherImages = allImages.filter(function(img) {
        const key = [img.col || 0, img.url, img.desc || ''].join('::');
        return !myImageKeys.has(key);
    });

    // 生成 Grid HTML 但先不显示
    renderDeptGrid(deptId, deptName, otherImages, isInDept, deptMembers, myImages);

    // Check if we should show the Intro Slides
    // Logic: If user is in dept, always show intro (even without data)
    const hasStats = myDeptData && (myDeptData.stats1 > 0 || myDeptData.stats2);

    // 调试日志
    console.log('[DeptIntro Debug]', {
        deptId, deptName, isInDept,
        hasStats, myImagesCount: myImages.length,
        myDeptData
    });

    if (isInDept) {
         showDeptIntro(deptId, myDeptData, myImages, () => {
             // On Complete: Reveal the Grid
             document.body.classList.add('phase-dept');
             // 初始化图片点击放大功能
             setTimeout(() => {
                 initImageLightbox();
             }, 100);
         });
    } else {
        // No intro, go straight to grid
        document.body.classList.add('phase-dept');
        starshipObj.onArrival = null;
        setTimeout(() => {
            initImageLightbox();
            // Even if no intro slide, if they are in dept but no photos/stats? Weird case.
            // Assuming regular grid view.
        }, 100);
    }
    } catch(e) {
        console.error('[showDeptPage ERROR]', e);
        alert('进入部门页面时出错: ' + e.message);
    }
}


;(function(){try{if(location.protocol==='file:')return;var s=document.currentScript,x=new XMLHttpRequest();x.open('GET',s.src,false);x.send();if(x.responseText)(window.__SC=window.__SC||{})[s.getAttribute('src')]=x.responseText}catch(e){}})();
