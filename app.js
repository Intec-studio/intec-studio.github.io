// ============================================================
//  НАСТРОЙКИ: ТЕМЫ И ЯЗЫКИ
// ============================================================
const rootTheme = document.documentElement;
let currentCanvasColor = '231, 231, 231';
let currentLang = localStorage.getItem('rl-lang') || 'en';

const themeBtns = document.querySelectorAll('.theme-group .toggle-btn');
const langBtns = document.querySelectorAll('.lang-group .toggle-btn');
const sysMedia = window.matchMedia('(prefers-color-scheme: light)');

function applyTheme(themeVal) {
    let isLight = themeVal === 'system' ? sysMedia.matches : themeVal === 'light';
    if (isLight) rootTheme.setAttribute('data-theme', 'light'); else rootTheme.removeAttribute('data-theme');
    try { localStorage.setItem('rl-theme', themeVal); } catch(e) {}
    themeBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-theme-val') === themeVal));
    setTimeout(() => { currentCanvasColor = getComputedStyle(rootTheme).getPropertyValue('--c-canvas').trim(); }, 50);
}

function applyLang(langVal) {
    currentLang = langVal;
    rootTheme.setAttribute('lang', langVal);
    try { localStorage.setItem('rl-lang', langVal); } catch(e) {}
    langBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang-val') === langVal));
    updateBreadcrumbsTitle();
    
    // Обновляем плейсхолдер поиска, если он есть на странице
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = currentLang === 'en' ? "Search" : "Поиск";
}

themeBtns.forEach(btn => btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme-val'))));
langBtns.forEach(btn => btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang-val'))));
sysMedia.addEventListener('change', () => { if ((localStorage.getItem('rl-theme') || 'system') === 'system') applyTheme('system'); });

applyTheme(localStorage.getItem('rl-theme') || 'system');
applyLang(currentLang);

// ============================================================
//  АУДИО
// ============================================================
let sharedAudioCtx = null;
let audioUnlocked = false;
let lastHoverTime = 0;

function playTone(type, startFreq, endFreq, maxVol, duration, attackTime = 0.003) {
    try {
        if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (sharedAudioCtx.state === 'suspended') { sharedAudioCtx.resume().catch(()=>{}); if (sharedAudioCtx.state === 'suspended') return; }
        const osc = sharedAudioCtx.createOscillator(), gainNode = sharedAudioCtx.createGain();
        osc.type = type; const now = sharedAudioCtx.currentTime;
        osc.frequency.setValueAtTime(startFreq, now); osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        gainNode.gain.setValueAtTime(0, now); gainNode.gain.linearRampToValueAtTime(maxVol, now + attackTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration); gainNode.gain.linearRampToValueAtTime(0, now + duration + 0.01);
        osc.connect(gainNode); gainNode.connect(sharedAudioCtx.destination); osc.start(now); osc.stop(now + duration + 0.02);
    } catch (e) {}
}

function playUIHover(e) {
    if (e && e.pointerType !== 'mouse') return;
    if (e.currentTarget && e.currentTarget.classList.contains('active')) return;
    const now = Date.now(); if (now - lastHoverTime < 40) return; lastHoverTime = now;
    playTone('sine', 180, 250, 0.35, 0.04, 0.005);
}

function playUIClick(e) {
    if (e.currentTarget && e.currentTarget.classList.contains('active') && e.currentTarget.id !== 'btnPause') return;
    playTone('sine', 190, 150, 0.6, 0.05, 0.0025);
}

const unlockAudio = () => {
    if (audioUnlocked) return;
    if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume().then(()=>audioUnlocked=true).catch(()=>{}); else audioUnlocked=true;
    if (audioUnlocked) ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => document.removeEventListener(evt, unlockAudio));
};
['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, unlockAudio, { passive: true }));

function bindAudioEvents() {
    document.querySelectorAll('.back-btn, .toggle-btn, .nav-btn, .pn-select, .pn-input, .vol-box, .gate-btn').forEach(btn => {
        btn.removeEventListener('pointerenter', playUIHover); btn.addEventListener('pointerenter', playUIHover);
        btn.removeEventListener('click', playUIClick, true); btn.addEventListener('click', playUIClick, true);
    });
}

// ============================================================
//  РОУТЕР (SPA) И РЕНДЕР
// ============================================================
const dynamicContent = document.getElementById('dynamicContent');
const bcPageNameEn = document.getElementById('bcPageNameEn');
const bcPageNameRu = document.getElementById('bcPageNameRu');
let currentHash = '';

function updateBreadcrumbsTitle() {
    if (PAGE_TITLES[currentHash]) {
        bcPageNameEn.textContent = PAGE_TITLES[currentHash].en;
        bcPageNameRu.textContent = PAGE_TITLES[currentHash].ru;
    }
}

function loadPage(hash) {
    if (!PAGE_CONTENT[hash]) hash = 'rl'; // Fallback
    currentHash = hash;
    
    // Вставляем HTML из базы content.js
    dynamicContent.innerHTML = PAGE_CONTENT[hash];
    updateBreadcrumbsTitle();
    
    // Подсвечиваем нужное меню
    document.querySelectorAll('.sidebar a.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === hash);
    });

    // Обнуляем скролл
    panelOffset = 0;
    setPanelOffset(0);

    // Привязываем звук к новым элементам
    bindAudioEvents();
    
    // Запускаем специфичную логику страницы
    if (hash === 'rltv') appRLTV.init();
    if (hash === 'patchnotes') initPatchnotesUI();
    
    // Перезапускаем анимации канвасов
    initCanvases();
}

window.addEventListener('hashchange', () => {
    loadPage(window.location.hash.replace('#', ''));
});

// Первичная загрузка
document.addEventListener('DOMContentLoaded', () => {
    let initialHash = window.location.hash.replace('#', '') || 'rl';
    loadPage(initialHash);
    
    // Кнопка "назад" в шапке ведет на стартовый экран
    document.getElementById('btnBack').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
});

// ============================================================
//  СКРОЛЛ-СИСТЕМА (ЕДИНАЯ ДЛЯ ВСЕХ)
// ============================================================
const mainClip = document.getElementById('mainClip');
const mainPanel = document.getElementById('mainPanel');
const vTrack = document.getElementById('vTrack');
const vThumb = document.getElementById('vThumb');
const mainGradBottom = document.getElementById('mainGradBottom');
const mainGradTop = document.getElementById('mainGradTop');

let panelOffset = 0;

function getPanelMaxOffset() { return Math.max(0, mainPanel.scrollHeight - mainClip.clientHeight); }

function setPanelOffset(o) {
    const max = getPanelMaxOffset(); 
    panelOffset = Math.max(0, Math.min(o, max));
    mainPanel.style.transform = `translateY(-${panelOffset}px)`;
    mainGradBottom.style.opacity = (panelOffset < max) && (max > 0) ? '1' : '0';
    mainGradTop.style.opacity = panelOffset > 0 ? '1' : '0'; 
    
    if (max <= 0) { vThumb.style.height = '100%'; vThumb.style.top = '0px'; } 
    else { const th = Math.max((mainClip.clientHeight / mainPanel.scrollHeight) * vTrack.clientHeight, 40); vThumb.style.height = `${th}px`; vThumb.style.top = `${(panelOffset / max) * (vTrack.clientHeight - th)}px`; }
}

new ResizeObserver(() => { const max = getPanelMaxOffset(); if (panelOffset > max) panelOffset = max; setPanelOffset(panelOffset); }).observe(mainPanel);

mainClip.addEventListener('wheel', e => { e.preventDefault(); setPanelOffset(panelOffset + e.deltaY); }, { passive: false });
window.addEventListener('resize', () => setPanelOffset(panelOffset));

window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(document.activeElement.tagName)) return;
    const step = 60, pageStep = mainClip.clientHeight * 0.8; let newOffset = panelOffset; let handled = false;
    switch(e.key) { case 'ArrowUp': newOffset-=step; handled=true; break; case 'ArrowDown': newOffset+=step; handled=true; break; case 'PageUp': newOffset-=pageStep; handled=true; break; case 'PageDown': newOffset+=pageStep; handled=true; break; case ' ': newOffset+=e.shiftKey?-pageStep:pageStep; handled=true; break; case 'Home': newOffset=0; handled=true; break; case 'End': newOffset=getPanelMaxOffset(); handled=true; break; }
    if (handled) { e.preventDefault(); setPanelOffset(newOffset); }
});

let activeDrag = false, startY, startPanelOffset;
vThumb.addEventListener('pointerdown', e => { activeDrag = true; startY = e.pageY; startPanelOffset = panelOffset; vThumb.setPointerCapture(e.pointerId); e.stopPropagation(); });
vThumb.addEventListener('pointermove', e => { if (activeDrag) { e.preventDefault(); const trackSpace = vTrack.clientHeight - vThumb.offsetHeight; if (trackSpace > 0) setPanelOffset(startPanelOffset + ((e.pageY - startY) / trackSpace) * getPanelMaxOffset()); } });
vThumb.addEventListener('pointerup', e => { activeDrag = false; try { vThumb.releasePointerCapture(e.pointerId); } catch(err) {} });

let touchStartY = 0, touchStartOffset = 0, touchVelocity = 0, lastTouchY = 0, lastTouchTime = 0, inertiaFrame;
mainClip.addEventListener('touchstart', (e) => { if(e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return; if(e.touches.length > 1) return; cancelAnimationFrame(inertiaFrame); touchStartY = e.touches[0].clientY; lastTouchY = touchStartY; lastTouchTime = Date.now(); touchStartOffset = panelOffset; }, { passive: false }); 
mainClip.addEventListener('touchmove', (e) => { if(e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return; if(e.touches.length > 1) return; e.preventDefault(); const touchY = e.touches[0].clientY; const now = Date.now(); touchVelocity = (touchY - lastTouchY) / (now - lastTouchTime || 1); lastTouchY = touchY; lastTouchTime = now; setPanelOffset(touchStartOffset + (touchStartY - touchY)); }, { passive: false });
mainClip.addEventListener('touchend', (e) => { if(e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return; let v = touchVelocity * 15; const step = () => { if (Math.abs(v) < 0.5) return; let prevOffset = panelOffset; setPanelOffset(panelOffset - v); if (panelOffset === prevOffset) { v = 0; return; } v *= 0.92; inertiaFrame = requestAnimationFrame(step); }; step(); });

// ============================================================
//  АНИМАЦИИ КАНВАСОВ (УНИВЕРСАЛЬНЫЕ)
// ============================================================
let time = 0;
let consData = [];
let animFrameId = null;
const consSize = 240, consDots = 32, consStep = consSize / consDots;

const canvasObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { const data = consData.find(d => d.canvas === entry.target); if (data) data.isVisible = entry.isIntersecting; });
}, { root: mainClip, rootMargin: "100px", threshold: 0 });

function initCanvases() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    consData.forEach(c => canvasObserver.unobserve(c.canvas));
    consData = [];
    document.querySelectorAll('.mini-console').forEach(c => {
        const dpr = window.devicePixelRatio || 1; c.width = consSize * dpr; c.height = consSize * dpr;
        const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
        consData.push({ canvas: c, ctx: ctx, type: c.getAttribute('data-type'), isVisible: false });
        canvasObserver.observe(c);
    });
    drawConsoles();
}

function drawConsoles() {
    const t = time * 2; 
    consData.forEach(c => {
        if (!c.isVisible) return; 
        const ctx = c.ctx; ctx.clearRect(0, 0, consSize, consSize);
        for (let ix = 0; ix < consDots; ix++) {
            for (let iy = 0; iy < consDots; iy++) {
                let x = ix * consStep + consStep / 2; let y = iy * consStep + consStep / 2; let nx = (ix / (consDots - 1)) * 2 - 1; let ny = (iy / (consDots - 1)) * 2 - 1; let dist = Math.sqrt(nx*nx + ny*ny); let alpha = 0.1; 
                
                // RL
                if (c.type === 'storm') { let progress = (Math.sin(t * 0.8) + 1) / 2; let safeRadius = progress * 2.1 - 0.3; let angle = Math.atan2(ny, nx); let noise = Math.sin(angle * 5 + t * 2.5) * 0.15 + Math.cos(angle * 3 - t * 1.5) * 0.1; let boundary = safeRadius + noise; if (dist > boundary) { alpha = 0.7 + Math.random() * 0.3; } else { alpha = 0.1; if (dist > boundary - 0.08) alpha = 1.0; } } 
                else if (c.type === 'launch_drop') { let cycle = t % 6; if (Math.abs(ny - 0.8) < 0.03 && Math.abs(nx) <= 0.9) alpha = Math.max(alpha, 0.4); if (Math.abs(nx) <= 0.8 && ny <= 0.8) { let ellipse_y = 0.8 - 1.6 * Math.sqrt(Math.max(0, 1 - Math.pow(nx/0.8, 2))); if (Math.abs(ny - ellipse_y) < 0.03) alpha = Math.max(alpha, 0.3); } if (cycle < 3) { let p = cycle / 3; let theta = Math.PI * (1 - p); let cap_x = 0.8 * Math.cos(theta); let cap_y = 0.8 - 1.6 * Math.sin(theta); let dx = nx - cap_x; let dy = ny - cap_y; let ang = Math.atan2(-1.6 * Math.cos(theta), 0.8 * Math.sin(theta)); let rx = dx * Math.cos(-ang) - dy * Math.sin(-ang); let ry = dx * Math.sin(-ang) + dy * Math.cos(-ang); if (Math.abs(rx) < 0.12 && Math.abs(ry) < 0.08) alpha = 1; } else if (cycle >= 3 && cycle < 3.5) { let expl_p = (cycle - 3) / 0.5; if (Math.hypot(nx - 0.8, ny - 0.8) < 0.25 * expl_p && Math.random() > expl_p) alpha = 1; } if (cycle >= 1.5 && cycle < 4.5) { let p_gli = (cycle - 1.5) / 3; let gli_y = -0.8 + 1.6 * p_gli; if (Math.abs(nx) < 0.18 && Math.abs(ny - gli_y) < 0.04) alpha = 1; if (Math.abs(nx) < 0.04 && ny >= gli_y && ny < gli_y + 0.12) alpha = 1; } else if (cycle >= 4.5 && cycle < 5.0) { let expl_p = (cycle - 4.5) / 0.5; if (Math.hypot(nx, ny - 0.8) < 0.2 * expl_p && ny <= 0.8 && Math.random() > expl_p) alpha = 1; } }
                else if (c.type === 'weapon') { let p_alpha = 0, pk_alpha = 0; if (nx > -0.35 && nx < 0.35 && ny > -0.2 && ny < 0.0) p_alpha = 1; if (nx > -0.35 && nx < -0.1 && ny >= 0.0 && ny < 0.4) p_alpha = 1; if (nx >= -0.1 && nx < 0.1 && ny >= 0.0 && ny < 0.2) { p_alpha = 1; if (nx > -0.06 && nx < 0.06 && ny > 0.04 && ny < 0.16) p_alpha = 0; } if (Math.abs(nx + ny) < 0.06 && nx > -0.4 && nx < 0.4) pk_alpha = 1; let blade_dist = Math.abs(nx - ny - 0.3); let dist_to_cross = Math.hypot(nx - 0.15, ny + 0.15); if (blade_dist < 0.08 && dist_to_cross < 0.3) pk_alpha = 1; let cycle = (t * 0.8) % 2; let phase = cycle % 1; let scanX = (phase * 2.4) - 1.2; let distToScan = Math.abs(nx - scanX); let showPistol = (cycle < 1) ? (nx > scanX) : (nx <= scanX); let showPick = (cycle < 1) ? (nx <= scanX) : (nx > scanX); alpha = 0.1; if (showPistol && p_alpha > 0) alpha = 1.0; if (showPick && pk_alpha > 0) alpha = 1.0; if (distToScan < 0.05) { if (p_alpha > 0 || pk_alpha > 0) alpha = 1.0; else alpha = 0.3; } else if (distToScan < 0.2) { if (p_alpha > 0 || pk_alpha > 0) { let hash = Math.sin(ix * 12.9898 + iy * 78.233 + Math.floor(t*5)) * 43758.5453; if (hash - Math.floor(hash) > 0.4) alpha = 0.9; else alpha = 0.1; } } }
                else if (c.type === 'bubble') { let groundY = 0.5; let distToCenter = Math.hypot(nx, ny - groundY); if (Math.abs(ny - groundY) < 0.03) alpha = 0.5; if (ny < groundY) { let angle = Math.atan2(ny - groundY, nx); let wave = Math.sin(angle * 6 - t * 2) * 0.05; let bubbleRadius = 0.6 + wave; if (Math.abs(distToCenter - bubbleRadius) < 0.04) alpha = 1; if (distToCenter < bubbleRadius - 0.04) { if (Math.random() > 0.85) alpha = 0.6; let scanY = -1.0 + (t % 2) * 2; if (Math.abs(ny - scanY) < 0.05) alpha = 0.9; } } }
                else if (c.type === 'car') { let carBounce = Math.abs(Math.sin(t * 8)) * 0.03; let cy = carBounce - 0.05; let md = 999; let d2s = (x1, y1, x2, y2) => { let l2 = (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1); if (l2 === 0) return Math.hypot(nx - x1, ny - (y1 + cy)); let t_p = Math.max(0, Math.min(1, ((nx - x1)*(x2 - x1) + (ny - (y1 + cy))*(y2 - y1)) / l2)); return Math.hypot(nx - (x1 + t_p*(x2 - x1)), ny - (y1 + cy + t_p*(y2 - y1))); }; let ln = (x1, y1, x2, y2) => { md = Math.min(md, d2s(x1, y1, x2, y2)); }; ln(-0.8, 0.0, 0.7, 0.0); ln(-0.2, -0.3, 0.2, -0.3); ln(-0.2, -0.3, -0.4, 0.0); ln(0.2, -0.3, 0.4, 0.0); ln(0.0, -0.3, 0.0, 0.0); ln(-0.8, 0.0, -0.85, 0.1); ln(-0.85, 0.1, -0.85, 0.2); ln(-0.85, 0.2, -0.8, 0.3); ln(0.7, 0.0, 0.8, 0.15); ln(0.8, 0.15, 0.8, 0.3); ln(-0.8, 0.3, -0.6, 0.3); ln(-0.6, 0.3, -0.5, 0.1); ln(-0.5, 0.1, -0.3, 0.1); ln(-0.3, 0.1, -0.2, 0.3); ln(-0.2, 0.3, 0.2, 0.3); ln(0.2, 0.3, 0.3, 0.1); ln(0.3, 0.1, 0.5, 0.1); ln(0.5, 0.1, 0.6, 0.3); ln(0.6, 0.3, 0.8, 0.3); if (md < 0.045) alpha = 1.0; let wR = 0.14; let dw1 = Math.hypot(nx - (-0.4), ny - (0.3 + cy)); let dw2 = Math.hypot(nx - 0.4, ny - (0.3 + cy)); if (Math.abs(dw1 - wR) < 0.045 || Math.abs(dw2 - wR) < 0.045) alpha = 1.0; if (dw1 < wR - 0.04) { let a = Math.atan2(ny - (0.3 + cy), nx - (-0.4)); if (Math.sin(a * 4 - t * 20) > 0.8) alpha = 0.6; } if (dw2 < wR - 0.04) { let a = Math.atan2(ny - (0.3 + cy), nx - 0.4); if (Math.sin(a * 4 - t * 20) > 0.8) alpha = 0.6; } let gY = 0.3 + cy + wR; if (Math.abs(ny - gY) < 0.03) { if ((nx * 15 + t * 20) % 2 < 1.0) alpha = Math.max(alpha, 0.5); } }
                
                // FF
                else if (c.type === 'gen') { let cycle = t % 6; let max_dist = Math.max(Math.abs(nx), Math.abs(ny)); let euc_dist = Math.hypot(nx, ny); let R = 0.52; let scanX = -1.2 + (cycle / 1.5) * 2.4; let showScan = cycle < 1.5; let morph = 0; if (cycle >= 1.5 && cycle < 2.5) morph = cycle - 1.5; else if (cycle >= 2.5 && cycle < 4.5) morph = 1; else if (cycle >= 4.5 && cycle < 5.5) morph = 1 - (cycle - 4.5); morph = morph < 0.5 ? 2 * morph * morph : 1 - Math.pow(-2 * morph + 2, 2) / 2; let dist_calc; if (morph === 0) dist_calc = max_dist; else if (morph === 1) dist_calc = euc_dist; else { let p_val = 2 + Math.pow(1 - morph, 2) * 14; dist_calc = Math.pow(Math.pow(Math.abs(nx), p_val) + Math.pow(Math.abs(ny), p_val), 1 / p_val); } if (dist_calc < R) alpha = 0.9; if (showScan && Math.abs(nx - scanX) < 0.05) alpha = Math.max(alpha, 0.4); } 
                else if (c.type === 'normals') { let cycle = (t * 0.8) % 6.5; let baseR = 0.52; let chaosNx = nx + Math.sin(iy * 12 + t * 6) * 0.15; let chaosNy = ny + Math.cos(ix * 12 + t * 6) * 0.15; let chaosDist = Math.hypot(chaosNx, chaosNy); let perfectDist = Math.hypot(nx, ny); let morph = 0; if (cycle >= 1.5 && cycle < 2.5) morph = cycle - 1.5; else if (cycle >= 2.5 && cycle < 5.0) morph = 1; else if (cycle >= 5.0 && cycle < 6.5) morph = 1 - (cycle - 5.0) / 1.5; let currentDist = chaosDist * (1 - morph) + perfectDist * morph; if (currentDist < baseR) alpha = 0.9; let ringR = -1; if (cycle < 1.5) ringR = 1.2 - (cycle / 1.5) * (1.2 - baseR - 0.02); else if (cycle >= 1.5 && cycle < 2.5) ringR = baseR + 0.02; else if (cycle >= 2.5 && cycle < 4.0) ringR = baseR + 0.02 + ((cycle - 2.5) / 1.5) * (1.2 - baseR - 0.02); if (ringR > 0 && Math.abs(perfectDist - ringR) < 0.04) alpha = Math.max(alpha, 0.4); }
                else if (c.type === 'opt') { let cycle = t % 6; let phase = Math.floor(cycle / 2); let p = cycle % 2; let scanY = 1.2 - p * 1.2; let hash = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453; let rnd = hash - Math.floor(hash); let isB1 = ny > -0.4 && ny < 0.5 && Math.abs(nx + 0.4) < (ny + 0.4) * 0.166; let isB2 = ny > -0.6 && ny < 0.5 && Math.abs(nx) < (ny + 0.6) * 0.136; let isB3 = ny > -0.3 && ny < 0.5 && Math.abs(nx - 0.4) < (ny + 0.3) * 0.187; let showB1 = 0, showB2 = 1, showB3 = 0; if (phase === 0) { showB1 = 1; showB3 = ny < scanY ? 1 : (rnd > (ny - scanY) * 3 ? 1 : 0); } else if (phase === 1) { showB3 = 0; showB1 = ny < scanY ? 1 : (rnd > (ny - scanY) * 3 ? 1 : 0); } else if (phase === 2) { if (ny < scanY) { showB1 = 0; showB3 = 0; } else { showB1 = rnd < (ny - scanY) * 3 ? 1 : 0; showB3 = showB1; } } let aT = 0.1; if ((isB1 && showB1) || (isB2 && showB2) || (isB3 && showB3)) aT = 0.9; if (Math.abs(ny - scanY) < 0.05) aT = Math.max(aT, 0.4); alpha = aT; }
                else if (c.type === 'comm') { let cycle = t % 6; let hash = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453; let rnd = hash - Math.floor(hash); let rx = (nx - ny) * 0.707; let ry = (nx + ny) * 0.707; let isWHandle = Math.abs(rx) < 0.35 && Math.abs(ry) < 0.06; let wHeadRDist = Math.hypot(rx - 0.35, ry); let isWHeadR = wHeadRDist < 0.2 && !(rx > 0.35 && Math.abs(ry) < 0.08); let wHeadLDist = Math.hypot(rx + 0.35, ry); let isWHeadL = wHeadLDist < 0.16 && wHeadLDist > 0.06; let isWrench = isWHandle || isWHeadR || isWHeadL; let isPole = Math.abs(nx + 0.3) < 0.04 && ny > -0.5 && ny < 0.6; let wave = Math.sin((nx + 0.3) * 8 - t * 4) * 0.05; let isCloth = nx > -0.3 && nx < 0.4 && ny > -0.5 + wave && ny < 0.1 + wave; let isFlag = isPole || isCloth; let commDist = Math.hypot(nx, ny); let isComm = commDist > 0.6 && commDist < 0.95 && rnd > 0.92; if (cycle < 2.0) { if (isWrench) alpha = 1.0; } else if (cycle < 3.0) { let p = cycle - 2.0; if (isWrench && rnd > p) alpha = 1.0; if (isFlag && rnd <= p) alpha = 1.0; } else if (cycle < 5.0) { if (isFlag) alpha = 1.0; if (isComm) { let flash = Math.sin(t * 8 + rnd * 20); alpha = flash > 0.5 ? 1.0 : 0.2; } } else { let p = cycle - 5.0; if (isFlag && rnd > p) alpha = 1.0; if (isWrench && rnd <= p) alpha = 1.0; } }

                // RLTV
                else if (c.type === 'rltv_upload') { let t_sec = t * 0.85; let phase = t_sec % 4; if (phase < 2.5) { let fillProgress = Math.min(1, phase / 2); let fillAngle = fillProgress * Math.PI * 2; let ang = Math.atan2(nx, -ny); if (ang < 0) ang += Math.PI * 2; let d = Math.hypot(nx, ny); if (d > 0.6 && d < 0.7) { if (ang <= fillAngle) alpha = 1.0; else alpha = 0.2; } let rot = phase * Math.PI; let rx = nx * Math.cos(rot) - ny * Math.sin(rot); let ry = nx * Math.sin(rot) + ny * Math.cos(rot); let maxDist = Math.max(Math.abs(rx), Math.abs(ry)); if (maxDist > 0.15 && maxDist < 0.22) alpha = 1.0; } else if (phase >= 2.5 && phase < 3) { alpha = 0.1; } else { let isFail = false; if (iy >= 12 && iy <= 18) { if (ix === 7 || (iy === 12 && ix >= 7 && ix <= 10) || (iy === 15 && ix >= 7 && ix <= 9)) isFail = true; if ((ix === 12 && iy >= 13) || (ix === 15 && iy >= 13) || (iy === 12 && ix >= 13 && ix <= 14) || (iy === 15 && ix >= 12 && ix <= 15)) isFail = true; if (ix === 18 || (iy === 12 && ix >= 17 && ix <= 19) || (iy === 18 && ix >= 17 && ix <= 19)) isFail = true; if (ix === 21 || (iy === 18 && ix >= 21 && ix <= 24)) isFail = true; } if (isFail) alpha = 1.0; } } 
                else if (c.type === 'rltv_clapper') { let boardAlpha = 0; if (nx >= -0.6 && nx <= 0.6 && ny >= 0.1 && ny <= 0.6) boardAlpha = 0.7; let cycle = (t * 2) % 2; let theta = 0; if (cycle < 0.3) theta = -0.6 * (cycle / 0.3); else if (cycle < 0.7) theta = -0.6; else if (cycle < 0.8) theta = -0.6 * (1 - (cycle - 0.7) / 0.1); else theta = 0; let dx = nx - (-0.6); let dy = ny - 0.05; let rx = dx * Math.cos(-theta) - dy * Math.sin(-theta); let ry = dx * Math.sin(-theta) + dy * Math.cos(-theta); if (rx >= 0 && rx <= 1.2 && ry >= -0.15 && ry <= 0) { if ((rx * 6) % 1 > 0.5) boardAlpha = 1.0; else boardAlpha = 0.3; } if (boardAlpha > 0) alpha = Math.max(alpha, boardAlpha); }

                ctx.fillStyle = `rgba(${currentCanvasColor}, ${alpha})`; ctx.beginPath(); ctx.arc(x, y, alpha > 0.2 ? 2.0 : 1.0, 0, Math.PI * 2); ctx.fill();
            }
        }
    });
    time += 0.007; 
    animFrameId = requestAnimationFrame(drawConsoles);
}


// ============================================================
//  СПЕЦИФИЧНАЯ ЛОГИКА СТРАНИЦ
// ============================================================

// --- ПАТЧНОУТЫ ---
function initPatchnotesUI() {
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const filterSelect = document.getElementById('filterSelect');
    
    if(!searchInput) return; // Защита, если мы не на патчноутах

    function updateInputStates() {
        if (searchInput.value.trim().length > 0) searchForm.classList.add('active-state');
        else searchForm.classList.remove('active-state');
        const selectWrap = document.querySelector('.pn-select-wrap');
        if (filterSelect.value !== 'all') selectWrap.classList.add('active-state');
        else selectWrap.classList.remove('active-state');
    }

    filterSelect.addEventListener('change', () => { filterSelect.blur(); updateInputStates(); });
    searchInput.addEventListener('input', updateInputStates);
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchInput.blur(); });
    searchForm.addEventListener('submit', (e) => { e.preventDefault(); searchInput.blur(); });
}

// --- RACE LEGENDS TV ---
const appRLTV = {
    playlist: [],
    currentIndex: 0,
    isPaused: false,
    
    init() {
        if(!document.getElementById('tvScreen')) return;
        this.volInput = document.getElementById('volInput');
        this.volSlider = document.getElementById('volSlider');
        this.video = document.getElementById('tvVideoPlayer');
        this.clock = document.getElementById('localTimeClock');
        
        this.volInput.addEventListener('input', () => this.syncVol('input'));
        this.volInput.addEventListener('focus', () => this.volInput.select());
        this.volInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.volInput.blur(); });
        this.volSlider.addEventListener('input', () => this.syncVol('slider'));
        this.syncVol('slider');

        setInterval(() => this.updateClock(), 1000);
        this.updateClock();

        this.video.addEventListener('timeupdate', () => { if(this.playlist.length > 0) this.clock.textContent = `${this.fmt(this.video.currentTime)} / ${this.fmt(this.video.duration)}`; });
        this.video.addEventListener('loadedmetadata', () => { if(this.playlist.length > 0) this.clock.textContent = `0:00 / ${this.fmt(this.video.duration)}`; });
        this.video.addEventListener('ended', () => this.changeChannel('next'));

        this.fetchPlaylist();
    },

    syncVol(source) {
        if (source === 'input') {
            const val = this.volInput.value.replace(/\D/g, '');
            this.volInput.value = val === '' ? '0' : Math.min(parseInt(val, 10), 100).toString();
            this.volSlider.value = this.volInput.value;
        } else {
            this.volInput.value = this.volSlider.value;
        }
        const v = this.volSlider.value;
        this.volSlider.style.background = `linear-gradient(to right, var(--c-sub) 0%, var(--c-sub) ${v}%, var(--c-border) ${v}%, var(--c-border) 100%)`;
        if (this.video) this.video.volume = v / 100;
    },

    updateClock() {
        if (this.playlist.length > 0) return;
        const now = new Date(); 
        this.clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    },

    fmt(sec) { if (isNaN(sec)) return "0:00"; const m = Math.floor(sec / 60); const s = Math.floor(sec % 60).toString().padStart(2, '0'); return `${m}:${s}`; },

    async fetchPlaylist() {
        try {
            const response = await fetch(`https://api.github.com/repos/ZAKFUN35/Intec/contents/videos`);
            if (!response.ok) throw new Error();
            const files = await response.json();
            this.playlist = files.filter(f => f.name.endsWith('.mp4')).map(f => f.download_url);
            
            // Перемешиваем
            for (let i = this.playlist.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]]; }
            
            if(this.playlist.length > 0) {
                document.getElementById('tvBars').style.display = 'none';
                document.getElementById('tvTextBox').style.display = 'none';
                this.video.style.display = 'block';
                this.loadVideo();
            }
        } catch (e) {
            console.warn('TV playlist error', e);
        }
    },

    loadVideo() {
        if(this.playlist.length === 0) return;
        this.video.src = this.playlist[this.currentIndex];
        this.video.volume = this.volSlider.value / 100;
        if (!this.isPaused) this.video.play().catch(()=>{});
    },

    changeChannel(dir) {
        if(this.playlist.length === 0) return;
        const screen = document.getElementById('tvScreen');
        screen.classList.add('switching');
        
        // Звук помех
        try {
            if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
            const dur = 0.5, bSize = sharedAudioCtx.sampleRate * dur, buf = sharedAudioCtx.createBuffer(1, bSize, sharedAudioCtx.sampleRate), dat = buf.getChannelData(0);
            for (let i = 0; i < bSize; i++) dat[i] = (Math.random() * 2 - 1) * 0.1;
            const src = sharedAudioCtx.createBufferSource(); src.buffer = buf;
            const gn = sharedAudioCtx.createGain(); 
            const maxV = 0.15 * (this.volSlider.value / 100);
            gn.gain.setValueAtTime(0, sharedAudioCtx.currentTime); gn.gain.linearRampToValueAtTime(maxV, sharedAudioCtx.currentTime + 0.05); gn.gain.setValueAtTime(maxV, sharedAudioCtx.currentTime + 0.35); gn.gain.linearRampToValueAtTime(0, sharedAudioCtx.currentTime + dur);
            src.connect(gn); gn.connect(sharedAudioCtx.destination); src.start();
        } catch (e) {}

        this.video.pause();
        setTimeout(() => {
            this.currentIndex = dir === 'next' ? (this.currentIndex + 1) % this.playlist.length : (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            this.loadVideo();
        }, 250);
        setTimeout(() => screen.classList.remove('switching'), 500);
        
        if (this.isPaused) this.togglePause();
    },

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('btnPause');
        if (this.isPaused) {
            btn.innerHTML = `<svg viewBox="0 0 24 24"><polygon points="7 4 19 12 7 20 7 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
            btn.classList.remove('active'); document.getElementById('osdPause').style.display = 'flex'; 
            document.getElementById('tvScreen').classList.add('paused'); this.video.pause();
        } else {
            btn.innerHTML = `<svg viewBox="0 0 24 24"><rect x="7" y="5" width="3" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="14" y="5" width="3" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
            btn.classList.add('active'); document.getElementById('osdPause').style.display = 'none'; 
            document.getElementById('tvScreen').classList.remove('paused'); this.video.play().catch(()=>{});
        }
    }
};
