// ============================================================
//  ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И DOM-ЭЛЕМЕНТЫ
// ============================================================
const rootTheme = document.documentElement;
let currentCanvasColor = '231, 231, 231';
let currentLang = localStorage.getItem('rl-lang') || 'en';
let currentHash = '';

const dynamicContent = document.getElementById('dynamicContent');
const bcPageNameEn = document.getElementById('bcPageNameEn');
const bcPageNameRu = document.getElementById('bcPageNameRu');

const themeBtns = document.querySelectorAll('.theme-group .toggle-btn');
const langBtns = document.querySelectorAll('.lang-group .toggle-btn');
const sysMedia = window.matchMedia('(prefers-color-scheme: light)');

// ============================================================
//  СИСТЕМА ЗВУКОВ (БЕЛЫЙ ШУМ ДЛЯ ТЕЛЕВИЗОРА)
// ============================================================
let sharedAudioCtx = null;
let audioUnlocked = false;

const unlockAudio = () => {
    if (audioUnlocked) return;
    if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().then(() => { audioUnlocked = true; }).catch(() => {});
    } else {
        audioUnlocked = true;
    }
    if (audioUnlocked) {
        ['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => document.removeEventListener(evt, unlockAudio));
    }
};
['click', 'pointerdown', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, unlockAudio, { passive: true }));

function playStaticNoiseSound() {
    try {
        if (!sharedAudioCtx) sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
        const duration = 0.5; 
        const bufferSize = sharedAudioCtx.sampleRate * duration; 
        const buffer = sharedAudioCtx.createBuffer(1, bufferSize, sharedAudioCtx.sampleRate); 
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            let white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759; 
            b2 = 0.96900 * b2 + white * 0.1538520; b3 = 0.86650 * b3 + white * 0.3104856; 
            b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362; 
            data[i] *= 0.11; b6 = white * 0.115926;
        }
        const noise = sharedAudioCtx.createBufferSource(); noise.buffer = buffer;
        const gain = sharedAudioCtx.createGain(); 
        const volSlider = document.getElementById('volSlider');
        const currentVol = volSlider ? (parseInt(volSlider.value, 10) / 100) : 0.5; 
        const maxVol = 0.15 * currentVol;
        gain.gain.setValueAtTime(0, sharedAudioCtx.currentTime); 
        gain.gain.linearRampToValueAtTime(maxVol, sharedAudioCtx.currentTime + 0.05); 
        gain.gain.setValueAtTime(maxVol, sharedAudioCtx.currentTime + 0.35); 
        gain.gain.linearRampToValueAtTime(0, sharedAudioCtx.currentTime + duration);
        noise.connect(gain); gain.connect(sharedAudioCtx.destination); noise.start();
    } catch (e) { }
}

// ============================================================
//  НАСТРОЙКИ: ТЕМЫ И ЯЗЫКИ
// ============================================================
function updateBreadcrumbsTitle() {
    if (typeof PAGE_TITLES !== 'undefined' && PAGE_TITLES[currentHash]) {
        if(bcPageNameEn) bcPageNameEn.textContent = PAGE_TITLES[currentHash].en;
        if(bcPageNameRu) bcPageNameRu.textContent = PAGE_TITLES[currentHash].ru;
    }
}

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
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = currentLang === 'en' ? "Search" : "Поиск";
}

themeBtns.forEach(btn => btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme-val'))));
langBtns.forEach(btn => btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang-val'))));
sysMedia.addEventListener('change', () => { if ((localStorage.getItem('rl-theme') || 'system') === 'system') applyTheme('system'); });

applyTheme(localStorage.getItem('rl-theme') || 'system');
applyLang(currentLang);

// ============================================================
//  РОУТЕР (SPA)
// ============================================================
function loadPage(hash) {
    if (currentHash === 'rltv' && typeof appRLTV !== 'undefined' && appRLTV.video) {
        appRLTV.video.pause();
    }

    if (typeof PAGE_CONTENT === 'undefined' || !PAGE_CONTENT[hash]) hash = 'rl'; 
    
    if (window.location.hash !== `#${hash}`) {
        window.history.replaceState(null, '', `#${hash}`);
    }

    currentHash = hash;
    
    if (dynamicContent) {
        dynamicContent.innerHTML = PAGE_CONTENT[hash];
    }
    
    updateBreadcrumbsTitle();
    
    document.querySelectorAll('.sidebar a.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-target') === hash);
    });

    panelOffset = 0;
    setPanelOffset(0);

    if (hash === 'rltv' && typeof appRLTV !== 'undefined') appRLTV.init();
    if (hash === 'patchnotes') initPatchnotesUI();
    
    initCanvases();
}

window.addEventListener('hashchange', () => {
    let hash = window.location.hash.replace('#', '');

    // === НОВАЯ ЛОГИКА КНОПКИ "НАЗАД" ДЛЯ СТАТЕЙ ===
    // Если мы вернулись из статьи назад в список
    if (hash === 'patchnotes' && currentHash === 'article') {
        currentHash = 'patchnotes';
        const singlePostView = document.getElementById('singlePostView');
        if (singlePostView && singlePostView.style.display === 'flex') {
            // Просто скрываем статью, не перерисовывая страницу заново
            singlePostView.style.display = 'none';
            document.getElementById('postsSearchBlock').style.display = 'flex';
            document.getElementById('postsList').style.display = 'flex';
            document.getElementById('singlePostContent').innerHTML = ''; 
            updateBreadcrumbsTitle();
            setPanelOffset(0);
            return; // Прерываем работу роутера
        }
    }

    // Если мы только что кликнули на статью
    if (hash === 'article') {
        if (document.getElementById('postsList')) {
            // Мы перешли из списка, просто запоминаем состояние
            currentHash = 'article';
            return; 
        } else {
            // Срабатывает, если вернулись назад с другой вкладки (например с #rl)
            // Просто кидаем пользователя в список статей
            window.location.replace('#patchnotes');
            return;
        }
    }
    // ==============================================

    loadPage(hash);
});

document.addEventListener('DOMContentLoaded', () => {
    let initialHash = window.location.hash.replace('#', '') || 'rl';
    loadPage(initialHash);
});

// ============================================================
//  СКРОЛЛ-СИСТЕМА
// ============================================================
const mainClip = document.getElementById('mainClip');
const mainPanel = document.getElementById('mainPanel');
const vTrack = document.getElementById('vTrack');
const vThumb = document.getElementById('vThumb');
const mainGradBottom = document.getElementById('mainGradBottom');
const mainGradTop = document.getElementById('mainGradTop');

let panelOffset = 0;

// === АВТОСКРОЛЛ КОЛЕСИКОМ МЫШИ (MIDDLE CLICK) ===
let isAutoScrolling = false;
let asOriginX = 0, asOriginY = 0;
let asVelocityY = 0;
let asFrameId = null;
let asMoved = false;

function stopAutoScroll() {
    isAutoScrolling = false;
    document.body.classList.remove('autoscroll-active'); // Возвращаем обычную мышку
    cancelAnimationFrame(asFrameId);
}

function autoScrollLoop() {
    if (!isAutoScrolling) return;
    if (asVelocityY !== 0) {
        setPanelOffset(panelOffset + asVelocityY);
    }
    asFrameId = requestAnimationFrame(autoScrollLoop);
}

// 1. Блокируем появление уродливого стандарта браузера
mainClip.addEventListener('mousedown', e => {
    if (e.button === 1) e.preventDefault();
});

// 2. Обработка нажатий
mainClip.addEventListener('pointerdown', e => {
    // Если мы уже автоскроллим, и человек нажал левую/правую кнопку — отключаем
    if (isAutoScrolling && e.button !== 1) {
        stopAutoScroll();
        return;
    }

    // Если нажато КОЛЕСИКО (кнопка 1)
    if (e.button === 1) {
        e.preventDefault();
        if (isAutoScrolling) { 
            stopAutoScroll(); 
            return; 
        } 
        
        isAutoScrolling = true;
        asMoved = false;
        asOriginX = e.clientX;
        asOriginY = e.clientY;
        asVelocityY = 0;
        
        // Включаем системный курсор (ns-resize)
        document.body.classList.add('autoscroll-active');
        
        asFrameId = requestAnimationFrame(autoScrollLoop);
    }
});

// 3. Отслеживание перемещения мыши
window.addEventListener('pointermove', e => {
    if (!isAutoScrolling) return;

    const dy = e.clientY - asOriginY;
    const dx = e.clientX - asOriginX;
    
    // Мертвая зона
    if (Math.abs(dy) > 10 || Math.abs(dx) > 10) asMoved = true;

    // Скорость скролла
    if (Math.abs(dy) > 15) {
        asVelocityY = Math.sign(dy) * Math.pow(Math.abs(dy) - 15, 1.2) * 0.04;
    } else {
        asVelocityY = 0;
    }
});

// 4. Логика отпускания кнопки
window.addEventListener('pointerup', e => {
    if (e.button === 1 && isAutoScrolling) {
        if (asMoved) stopAutoScroll();
    }
});

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

mainClip.addEventListener('wheel', e => { 
    e.preventDefault(); 
    if (isAutoScrolling) return; // Блокируем скролл колесиком, если работает автоскролл
    setPanelOffset(panelOffset + e.deltaY); 
}, { passive: false });
window.addEventListener('resize', () => setPanelOffset(panelOffset));

window.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(document.activeElement.tagName)) return;
    const step = 60, pageStep = mainClip.clientHeight * 0.8; let newOffset = panelOffset; let handled = false;
    switch(e.key) { case 'ArrowUp': newOffset-=step; handled=true; break; case 'ArrowDown': newOffset+=step; handled=true; break; case 'PageUp': newOffset-=pageStep; handled=true; break; case 'PageDown': newOffset+=pageStep; handled=true; break; case ' ': newOffset+=e.shiftKey?-pageStep:pageStep; handled=true; break; case 'Home': newOffset=0; handled=true; break; case 'End': newOffset=getPanelMaxOffset(); handled=true; break; }
    if (handled) { e.preventDefault(); setPanelOffset(newOffset); }
});

let activeDrag = null; 
let startY = 0; 
let startPanelOffset = 0;

// Переменные для инерции свайпа на телефонах
let touchVelocity = 0;
let lastTouchY = 0;
let lastTouchTime = 0;
let inertiaFrame = null;

// 1. Логика ползунка скролла (Справа)
vThumb.addEventListener('pointerdown', e => { 
    activeDrag = 'thumb'; 
    startY = e.pageY; 
    startPanelOffset = panelOffset; 
    vThumb.setPointerCapture(e.pointerId); 
    e.stopPropagation(); 
});

// 2. Логика свайпов по самой странице (Для смартфонов)
mainClip.addEventListener('pointerdown', e => {
    // Игнорируем мышь (оставляем ей колесо), а также инпуты и кнопки
    if (e.pointerType === 'mouse') return;
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(e.target.tagName)) return;
    
    activeDrag = 'clip';
    startY = e.pageY;
    startPanelOffset = panelOffset;
    
    cancelAnimationFrame(inertiaFrame);
    lastTouchY = e.pageY;
    lastTouchTime = Date.now();
    
    mainClip.setPointerCapture(e.pointerId);
});

// Глобальный слушатель движения
window.addEventListener('pointermove', e => { 
    if (!activeDrag) return;
    
    if (activeDrag === 'thumb') {
        e.preventDefault(); 
        const trackSpace = vTrack.clientHeight - vThumb.offsetHeight; 
        if (trackSpace > 0) {
            setPanelOffset(startPanelOffset + ((e.pageY - startY) / trackSpace) * getPanelMaxOffset()); 
        }
    } else if (activeDrag === 'clip') {
        e.preventDefault();
        const now = Date.now();
        // Считаем скорость движения пальца для инерции
        touchVelocity = (e.pageY - lastTouchY) / (now - lastTouchTime || 1);
        lastTouchY = e.pageY;
        lastTouchTime = now;
        
        // Смещаем панель синхронно с пальцем
        setPanelOffset(startPanelOffset + (startY - e.pageY));
    }
}, { passive: false });

// Окончание касания
window.addEventListener('pointerup', e => { 
    if (activeDrag === 'thumb') {
        try { vThumb.releasePointerCapture(e.pointerId); } catch(err) {}
    } else if (activeDrag === 'clip') {
        try { mainClip.releasePointerCapture(e.pointerId); } catch(err) {}
        
        // Запускаем плавную инерцию скролла
        let v = touchVelocity * 15; 
        const step = () => {
            if (Math.abs(v) < 0.5) return; 
            let prevOffset = panelOffset; 
            setPanelOffset(panelOffset - v);
            if (panelOffset === prevOffset) { v = 0; return; } // Уперлись в конец страницы
            v *= 0.92; // Коэффициент трения
            inertiaFrame = requestAnimationFrame(step);
        };
        step();
    }
    activeDrag = null; 
});

window.addEventListener('pointercancel', () => { activeDrag = null; });

// ============================================================
//  АНИМАЦИИ КАНВАСОВ
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
                let x = ix * consStep + consStep / 2; 
                let y = iy * consStep + consStep / 2; 
                let nx = (ix / (consDots - 1)) * 2 - 1; 
                let ny = (iy / (consDots - 1)) * 2 - 1; 
                let dist = Math.sqrt(nx*nx + ny*ny); 
                let alpha = 0.1; 
                
                if (c.type === 'storm') { 
                    let progress = (Math.sin(t * 0.8) + 1) / 2; let safeRadius = progress * 2.1 - 0.3; let angle = Math.atan2(ny, nx); let noise = Math.sin(angle * 5 + t * 2.5) * 0.15 + Math.cos(angle * 3 - t * 1.5) * 0.1; let boundary = safeRadius + noise; if (dist > boundary) { alpha = 0.7 + Math.random() * 0.3; } else { alpha = 0.1; if (dist > boundary - 0.08) alpha = 1.0; } 
                } 
                else if (c.type === 'launch_drop') { 
                    let cycle = t % 6; if (Math.abs(ny - 0.8) < 0.03 && Math.abs(nx) <= 0.9) alpha = Math.max(alpha, 0.4); if (Math.abs(nx) <= 0.8 && ny <= 0.8) { let ellipse_y = 0.8 - 1.6 * Math.sqrt(Math.max(0, 1 - Math.pow(nx/0.8, 2))); if (Math.abs(ny - ellipse_y) < 0.03) alpha = Math.max(alpha, 0.3); } if (cycle < 3) { let p = cycle / 3; let theta = Math.PI * (1 - p); let      cap_x = 0.8 * Math.cos(theta); let cap_y = 0.8 - 1.6 * Math.sin(theta); let dx = nx - cap_x; let dy = cap_y - ny; let ang = Math.atan2(-1.6 * Math.cos(theta), 0.8 * Math.sin(theta)); let rx = dx * Math.cos(-ang) - dy * Math.sin(-ang); let ry = dx * Math.sin(-ang) + dy * Math.cos(-ang); if (Math.abs(rx) < 0.12 && Math.abs(ry) < 0.08) alpha = 1; } else if (cycle >= 3 && cycle < 3.5) { let expl_p = (cycle - 3) / 0.5; if (Math.hypot(nx - 0.8, ny - 0.8) < 0.25 * expl_p && Math.random() > expl_p) alpha = 1; } if (cycle >= 1.5 && cycle < 4.5) { let p_gli = (cycle - 1.5) / 3; let gli_y = -0.8 + 1.6 * p_gli; if (Math.abs(nx) < 0.18 && Math.abs(ny - gli_y) < 0.04) alpha = 1; if (Math.abs(nx) < 0.04 && ny >= gli_y && ny < gli_y + 0.12) alpha = 1; } else if (cycle >= 4.5 && cycle < 5.0) { let expl_p = (cycle - 4.5) / 0.5; if (Math.hypot(nx, ny - 0.8) < 0.2 * expl_p && ny <= 0.8 && Math.random() > expl_p) alpha = 1; } 
                }
                else if (c.type === 'weapon') { 
                    let p_alpha = 0, pk_alpha = 0; if (nx > -0.35 && nx < 0.35 && ny > -0.2 && ny < 0.0) p_alpha = 1; if (nx > -0.35 && nx < -0.1 && ny >= 0.0 && ny < 0.4) p_alpha = 1; if (nx >= -0.1 && nx < 0.1 && ny >= 0.0 && ny < 0.2) { p_alpha = 1; if (nx > -0.06 && nx < 0.06 && ny > 0.04 && ny < 0.16) p_alpha = 0; } if (Math.abs(nx + ny) < 0.06 && nx > -0.4 && nx < 0.4) pk_alpha = 1; let blade_dist = Math.abs(nx - ny - 0.3); let dist_to_cross = Math.hypot(nx - 0.15, ny + 0.15); if (blade_dist < 0.08 && dist_to_cross < 0.3) pk_alpha = 1; let cycle = (t * 0.8) % 2; let phase = cycle % 1; let scanX = (phase * 2.4) - 1.2; let distToScan = Math.abs(nx - scanX); let showPistol = (cycle < 1) ? (nx > scanX) : (nx <= scanX); let showPick = (cycle < 1) ? (nx <= scanX) : (nx > scanX); alpha = 0.1; if (showPistol && p_alpha > 0) alpha = 1.0; if (showPick && pk_alpha > 0) alpha = 1.0; if (distToScan < 0.05) { if (p_alpha > 0 || pk_alpha > 0) alpha = 1.0; else alpha = 0.3; } else if (distToScan < 0.2) { if (p_alpha > 0 || pk_alpha > 0) { let hash = Math.sin(ix * 12.9898 + iy * 78.233 + Math.floor(t*5)) * 43758.5453; if (hash - Math.floor(hash) > 0.4) alpha = 0.9; else alpha = 0.1; } } 
                }
                else if (c.type === 'bubble') { 
                    let groundY = 0.5; let distToCenter = Math.hypot(nx, ny - groundY); if (Math.abs(ny - groundY) < 0.03) alpha = 0.5; if (ny < groundY) { let angle = Math.atan2(ny - groundY, nx); let wave = Math.sin(angle * 6 - t * 2) * 0.05; let bubbleRadius = 0.6 + wave; if (Math.abs(distToCenter - bubbleRadius) < 0.04) alpha = 1; if (distToCenter < bubbleRadius - 0.04) { if (Math.random() > 0.85) alpha = 0.6; let scanY = -1.0 + (t % 2) * 2; if (Math.abs(ny - scanY) < 0.05) alpha = 0.9; } } 
                }
                else if (c.type === 'car') { 
                    let carBounce = Math.abs(Math.sin(t * 8)) * 0.03; let cy = carBounce - 0.05; let md = 999; let d2s = (x1, y1, x2, y2) => { let l2 = (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1); if (l2 === 0) return Math.hypot(nx - x1, ny - (y1 + cy)); let t_p = Math.max(0, Math.min(1, ((nx - x1)*(x2 - x1) + (ny - (y1 + cy))*(y2 - y1)) / l2)); return Math.hypot(nx - (x1 + t_p*(x2 - x1)), ny - (y1 + cy + t_p*(y2 - y1))); }; let ln = (x1, y1, x2, y2) => { md = Math.min(md, d2s(x1, y1, x2, y2)); }; ln(-0.8, 0.0, 0.7, 0.0); ln(-0.2, -0.3, 0.2, -0.3); ln(-0.2, -0.3, -0.4, 0.0); ln(0.2, -0.3, 0.4, 0.0); ln(0.0, -0.3, 0.0, 0.0); ln(-0.8, 0.0, -0.85, 0.1); ln(-0.85, 0.1, -0.85, 0.2); ln(-0.85, 0.2, -0.8, 0.3); ln(0.7, 0.0, 0.8, 0.15); ln(0.8, 0.15, 0.8, 0.3); ln(-0.8, 0.3, -0.6, 0.3); ln(-0.6, 0.3, -0.5, 0.1); ln(-0.5, 0.1, -0.3, 0.1); ln(-0.3, 0.1, -0.2, 0.3); ln(-0.2, 0.3, 0.2, 0.3); ln(0.2, 0.3, 0.3, 0.1); ln(0.3, 0.1, 0.5, 0.1); ln(0.5, 0.1, 0.6, 0.3); ln(0.6, 0.3, 0.8, 0.3); if (md < 0.045) alpha = 1.0; let wR = 0.14; let dw1 = Math.hypot(nx - (-0.4), ny - (0.3 + cy)); let dw2 = Math.hypot(nx - 0.4, ny - (0.3 + cy)); if (Math.abs(dw1 - wR) < 0.045 || Math.abs(dw2 - wR) < 0.045) alpha = 1.0; if (dw1 < wR - 0.04) { let a = Math.atan2(ny - (0.3 + cy), nx - (-0.4)); if (Math.sin(a * 4 - t * 20) > 0.8) alpha = 0.6; } if (dw2 < wR - 0.04) { let a = Math.atan2(ny - (0.3 + cy), nx - 0.4); if (Math.sin(a * 4 - t * 20) > 0.8) alpha = 0.6; } let gY = 0.3 + cy + wR; if (Math.abs(ny - gY) < 0.03) { if ((nx * 15 + t * 20) % 2 < 1.0) alpha = Math.max(alpha, 0.5); } 
                }
                else if (c.type === 'gen') { 
                    let cycle = t % 6; let max_dist = Math.max(Math.abs(nx), Math.abs(ny)); let euc_dist = Math.hypot(nx, ny); let R = 0.52; let scanX = -1.2 + (cycle / 1.5) * 2.4; let showScan = cycle < 1.5; let morph = 0; if (cycle >= 1.5 && cycle < 2.5) morph = cycle - 1.5; else if (cycle >= 2.5 && cycle < 4.5) morph = 1; else if (cycle >= 4.5 && cycle < 5.5) morph = 1 - (cycle - 4.5); morph = morph < 0.5 ? 2 * morph * morph : 1 - Math.pow(-2 * morph + 2, 2) / 2; let dist_calc; if (morph === 0) dist_calc = max_dist; else if (morph === 1) dist_calc = euc_dist; else { let p_val = 2 + Math.pow(1 - morph, 2) * 14; dist_calc = Math.pow(Math.pow(Math.abs(nx), p_val) + Math.pow(Math.abs(ny), p_val), 1 / p_val); } if (dist_calc < R) alpha = 0.9; if (showScan && Math.abs(nx - scanX) < 0.05) alpha = Math.max(alpha, 0.4); 
                } 
                else if (c.type === 'normals') { 
                    let cycle = (t * 0.8) % 6.5; let baseR = 0.52; let chaosNx = nx + Math.sin(iy * 12 + t * 6) * 0.15; let chaosNy = ny + Math.cos(ix * 12 + t * 6) * 0.15; let chaosDist = Math.hypot(chaosNx, chaosNy); let perfectDist = Math.hypot(nx, ny); let morph = 0; if (cycle >= 1.5 && cycle < 2.5) morph = cycle - 1.5; else if (cycle >= 2.5 && cycle < 5.0) morph = 1; else if (cycle >= 5.0 && cycle < 6.5) morph = 1 - (cycle - 5.0) / 1.5; let currentDist = chaosDist * (1 - morph) + perfectDist * morph; if (currentDist < baseR) alpha = 0.9; let ringR = -1; if (cycle < 1.5) ringR = 1.2 - (cycle / 1.5) * (1.2 - baseR - 0.02); else if (cycle >= 1.5 && cycle < 2.5) ringR = baseR + 0.02; else if (cycle >= 2.5 && cycle < 4.0) ringR = baseR + 0.02 + ((cycle - 2.5) / 1.5) * (1.2 - baseR - 0.02); if (ringR > 0 && Math.abs(perfectDist - ringR) < 0.04) alpha = Math.max(alpha, 0.4); 
                }
                else if (c.type === 'opt') { 
                    let cycle = t % 6; let phase = Math.floor(cycle / 2); let p = cycle % 2; let scanY = 1.2 - p * 1.2; let hash = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453; let rnd = hash - Math.floor(hash); let isB1 = ny > -0.4 && ny < 0.5 && Math.abs(nx + 0.4) < (ny + 0.4) * 0.166; let isB2 = ny > -0.6 && ny < 0.5 && Math.abs(nx) < (ny + 0.6) * 0.136; let isB3 = ny > -0.3 && ny < 0.5 && Math.abs(nx - 0.4) < (ny + 0.3) * 0.187; let showB1 = 0, showB2 = 1, showB3 = 0; if (phase === 0) { showB1 = 1; showB3 = ny < scanY ? 1 : (rnd > (ny - scanY) * 3 ? 1 : 0); } else if (phase === 1) { showB3 = 0; showB1 = ny < scanY ? 1 : (rnd > (ny - scanY) * 3 ? 1 : 0); } else if (phase === 2) { if (ny < scanY) { showB1 = 0; showB3 = 0; } else { showB1 = rnd < (ny - scanY) * 3 ? 1 : 0; showB3 = showB1; } } let aT = 0.1; if ((isB1 && showB1) || (isB2 && showB2) || (isB3 && showB3)) aT = 0.9; if (Math.abs(ny - scanY) < 0.05) aT = Math.max(aT, 0.4); alpha = aT; 
                }
                else if (c.type === 'comm') { 
                    let cycle = t % 6; let hash = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453; let rnd = hash - Math.floor(hash); let rx = (nx - ny) * 0.707; let ry = (nx + ny) * 0.707; let isWHandle = Math.abs(rx) < 0.35 && Math.abs(ry) < 0.06; let wHeadRDist = Math.hypot(rx - 0.35, ry); let isWHeadR = wHeadRDist < 0.2 && !(rx > 0.35 && Math.abs(ry) < 0.08); let wHeadLDist = Math.hypot(rx + 0.35, ry); let isWHeadL = wHeadLDist < 0.16 && wHeadLDist > 0.06; let isWrench = isWHandle || isWHeadR || isWHeadL; let isPole = Math.abs(nx + 0.3) < 0.04 && ny > -0.5 && ny < 0.6; let wave = Math.sin((nx + 0.3) * 8 - t * 4) * 0.05; let isCloth = nx > -0.3 && nx < 0.4 && ny > -0.5 + wave && ny < 0.1 + wave; let isFlag = isPole || isCloth; let commDist = Math.hypot(nx, ny); let isComm = commDist > 0.6 && commDist < 0.95 && rnd > 0.92; if (cycle < 2.0) { if (isWrench) alpha = 1.0; } else if (cycle < 3.0) { let p = cycle - 2.0; if (isWrench && rnd > p) alpha = 1.0; if (isFlag && rnd <= p) alpha = 1.0; } else if (cycle < 5.0) { if (isFlag) alpha = 1.0; if (isComm) { let flash = Math.sin(t * 8 + rnd * 20); alpha = flash > 0.5 ? 1.0 : 0.2; } } else { let p = cycle - 5.0; if (isFlag && rnd > p) alpha = 1.0; if (isWrench && rnd <= p) alpha = 1.0; } 
                }
                else if (c.type === 'rltv_upload') { 
                    let t_sec = t * 0.85; let phase = t_sec % 4; if (phase < 2.5) { let fillProgress = Math.min(1, phase / 2); let fillAngle = fillProgress * Math.PI * 2; let ang = Math.atan2(nx, -ny); if (ang < 0) ang += Math.PI * 2; let d = Math.hypot(nx, ny); if (d > 0.6 && d < 0.7) { if (ang <= fillAngle) alpha = 1.0; else alpha = 0.2; } let rot = phase * Math.PI; let rx = nx * Math.cos(rot) - ny * Math.sin(rot); let ry = nx * Math.sin(rot) + ny * Math.cos(rot); let maxDist = Math.max(Math.abs(rx), Math.abs(ry)); if (maxDist > 0.15 && maxDist < 0.22) alpha = 1.0; } else if (phase >= 2.5 && phase < 3) { alpha = 0.1; } else { let isFail = false; if (iy >= 12 && iy <= 18) { if (ix === 7 || (iy === 12 && ix >= 7 && ix <= 10) || (iy === 15 && ix >= 7 && ix <= 9)) isFail = true; if ((ix === 12 && iy >= 13) || (ix === 15 && iy >= 13) || (iy === 12 && ix >= 13 && ix <= 14) || (iy === 15 && ix >= 12 && ix <= 15)) isFail = true; if (ix === 18 || (iy === 12 && ix >= 17 && ix <= 19) || (iy === 18 && ix >= 17 && ix <= 19)) isFail = true; if (ix === 21 || (iy === 18 && ix >= 21 && ix <= 24)) isFail = true; } if (isFail) alpha = 1.0; } 
                } 
                else if (c.type === 'rltv_clapper') { 
                    let boardAlpha = 0; if (nx >= -0.6 && nx <= 0.6 && ny >= 0.1 && ny <= 0.6) boardAlpha = 0.7; let cycle = (t * 2) % 2; let theta = 0; if (cycle < 0.3) theta = -0.6 * (cycle / 0.3); else if (cycle < 0.7) theta = -0.6; else if (cycle < 0.8) theta = -0.6 * (1 - (cycle - 0.7) / 0.1); else theta = 0; let dx = nx - (-0.6); let dy = ny - 0.05; let rx = dx * Math.cos(-theta) - dy * Math.sin(-theta); let ry = dx * Math.sin(-theta) + dy * Math.cos(-theta); if (rx >= 0 && rx <= 1.2 && ry >= -0.15 && ry <= 0) { if ((rx * 6) % 1 > 0.5) boardAlpha = 1.0; else boardAlpha = 0.3; } if (boardAlpha > 0) alpha = Math.max(alpha, boardAlpha); 
                }
                // ТВОЙ НОВЫЙ БЛОК:
                else if (c.type === 'article_loader') {
                    let angle = Math.atan2(ny, nx) + t * 2.5; 
                    angle = ((angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
                    if (dist > 0.55 && dist < 0.7) {
                        if (angle < Math.PI) {
                            alpha = 1.0;
                        } else {
                            alpha = 0.15; 
                        }
                    }
                }
                
                else if (c.type === 'nerd_ackchyually') {
                    // Медленный прыжок
                    let yBounce = Math.abs(Math.sin(t * 2.5)) * 0.1; 
                    let pnx = nx; 
                    let pny = ny - yBounce; 
                    
                    // Финальная матрица 40x26
                    const grid = [
                        "          ####################          ", // 0
                        "        ##--------------------##        ", // 1
                        "      ###----------------------###      ", // 2
                        "     ###------------------------###     ", // 3
                        "    ##------####--------####------##    ", // 4
                        "   ##----#####------------#####----##   ", // 5
                        "  ##----####----------------####----##  ", // 6
                        " ##----####------------------####----## ", // 7
                        " ##----------------------------------## ", // 8
                        "##################----##################", // 9
                        "##-----###  ###--######--###  ###-----##", // 10
                        " #-----###  ###--#----#--###  ###-----# ", // 11
                        " ##----########--#----#--########----## ", // 12
                        "  #-----#####----#----#----#####-----#  ", // 13
                        "  ###----------###----###----------###  ", // 14
                        "  #--###########--------###########--#  ", // 15
                        "  #----------------------------------#  ", // 16
                        "  #----------------------------------#  ", // 17
                        "  #----------##############----------#  ", // 18
                        "  #---------#--###----###--#---------#  ", // 19
                        "   #--------#--###----###--#--------#   ", // 20
                        "    #-------#--###----###--#-------#    ", // 21
                        "     #-------##----------##-------#     ", // 22
                        "       #------------------------#       ", // 23
                        "        ####----------------####        ", // 24
                        "            ################            "  // 25
                    ];

                    let gridWidth = 40;
                    let gridHeight = 26;
                    
                    // Масштаб для лица
                    let pixelSizeX = 0.045; 
                    let pixelSizeY = 0.058; 
                    
                    // Центрирование
                    let col = Math.floor((pnx / pixelSizeX) + 20);
                    let row = Math.floor((pny / pixelSizeY) + 13);
                    
                    alpha = 0.0; // По умолчанию фон прозрачный (пустота)
                    
                    if (col >= 0 && col < gridWidth && row >= 0 && row < gridHeight) {
                        let char = grid[row][col];
                        
                        if (char === ' ') {
                            // ИСПРАВЛЕНО: проверяем, что пробелы не только на 10-11 строках, 
                            // но и находятся внутри лица (отсекаем колонки 0 и 39)
                            if ((row === 10 || row === 11) && col > 5 && col < 35) {
                                alpha = 1.0; // Глаза (ярко-белый)
                            } else {
                                alpha = 0.0; // Пустой фон по бокам
                            }
                        } else if (char === '#') {
                            // '#' может быть контуром, а может быть белыми зубами
                            // Проверяем координаты зубов по матрице
                            let isTeeth = (row >= 19 && row <= 21) && ((col >= 15 && col <= 17) || (col >= 22 && col <= 24));
                            if (isTeeth) {
                                alpha = 1.0; // Зубы (ярко-белые)
                            } else {
                                alpha = 0.15; // Контур лица и оправа очков (тёмные, как в оригинале)
                            }
                        } else if (char === '-') {
                            // '-' может быть кожей, а может быть глубиной рта
                            let isInnerMouth = (row >= 19 && row <= 22) && (col >= 13 && col <= 26);
                            if (isInnerMouth) {
                                alpha = 0.25; // Внутри рта темнее
                            } else {
                                alpha = 0.65; // Кожа лица (серая/светлая)
                            }
                        }
                    }
                }

                ctx.fillStyle = `rgba(${currentCanvasColor}, ${alpha})`; 
                ctx.beginPath(); 
                ctx.arc(x, y, alpha > 0.2 ? 2.0 : 1.0, 0, Math.PI * 2); 
                ctx.fill();
            }
        }
    });
    time += 0.007; 
    animFrameId = requestAnimationFrame(drawConsoles);
}

// ============================================================
//  ЛОГИКА РАЗДЕЛА СТАТЕЙ
// ============================================================
function initPatchnotesUI() {
    const searchInput = document.getElementById('searchInput');
    const searchBlock = document.getElementById('postsSearchBlock');
    const categorySelect = document.getElementById('categorySelect');
    const sortSelect = document.getElementById('sortSelect');
    const postsList = document.getElementById('postsList');
    const singlePostView = document.getElementById('singlePostView');
    const singlePostContent = document.getElementById('singlePostContent');
    const backToPostsBtn = document.getElementById('backToPostsBtn');
    
    if(!searchInput) return;

    searchInput.placeholder = currentLang === 'en' ? "Search" : "Поиск";

    function renderPostsList() {
        if (!postsList) return;
        postsList.innerHTML = '';
        const query = searchInput.value.toLowerCase().trim();
        const category = categorySelect.value;
        const sortOrder = sortSelect.value;

        let filtered = (typeof POSTS_DATABASE !== 'undefined' ? POSTS_DATABASE : []).filter(post => {
            // Безопасно достаем описание (если его вдруг нет, берем пустую строку)
            const descEn = post.description?.en || '';
            const descRu = post.description?.ru || '';

            const matchesSearch = !query || `
                ${post.title.en.toLowerCase()} ${post.title.ru.toLowerCase()} 
                ${descEn.toLowerCase()} ${descRu.toLowerCase()} 
                ${post.tags.join(' ').toLowerCase()} ${post.date}
            `.includes(query);
            
            const matchesCategory = category === 'all' || post.tags.includes(category);
            return matchesSearch && matchesCategory;
        });

        filtered.sort((a, b) => sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);

        if (filtered.length === 0) {
            postsList.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 40px 0;">
                    <div class="loader-card" style="display: flex; flex-direction: column; padding: 18px; gap: 18px;">
                        <div class="info-console" style="background: #000; margin: 0;">
                            <canvas class="mini-console" data-type="nerd_ackchyually"></canvas>
                        </div>
                        <div class="pn-card-title" style="text-align: center; margin: 0; font-weight: 900; letter-spacing: 0.05em;">
                            Um Actually...
                        </div>
                    </div>
                </div>
            `;
            initCanvases();
        } else {
            filtered.forEach(post => {
                const card = document.createElement('div');
                card.className = 'pn-card';
                card.style.cssText = 'cursor: pointer; transition: border-color 0.1s ease;';
                card.onmouseenter = () => card.style.borderColor = 'var(--c-text)';
                card.onmouseleave = () => card.style.borderColor = 'var(--c-border)';
                
                const tagsHtml = post.tags.map(t => `<div class="tag">${t}</div>`).join('');
                
                card.innerHTML = `
                    <div class="pn-card-title-wrap">
                        <div class="pn-card-title" data-lang="en">${post.title.en}</div>
                        <div class="pn-card-title" data-lang="ru">${post.title.ru}</div>
                    </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="tags-group">${tagsHtml}</div>
                        <div class="tag">${post.date}</div>
                    </div>
                `;
                card.addEventListener('click', () => openPost(post));
                postsList.appendChild(card);
            });
        }

        // --- ЛОГИКА ПОДСВЕТКИ ---
        const searchWrap = searchInput.closest('.pn-input-wrap');
        if (query.length > 0) searchWrap.classList.add('active-state');
        else searchWrap.classList.remove('active-state');

        const catWrap = categorySelect.closest('.pn-select-wrap');
        if (categorySelect.value !== 'all') catWrap.classList.add('active-state');
        else catWrap.classList.remove('active-state');

        const sWrap = sortSelect.closest('.pn-select-wrap');
        if (sortSelect.value !== 'newest') sWrap.classList.add('active-state');
        else sWrap.classList.remove('active-state');
    }

    async function openPost(post) {
        
        // --- 1. ДОБАВЛЕННЫЙ КОД ДЛЯ ИСТОРИИ ---
        if (window.location.hash !== '#article') {
            window.location.hash = 'article';
        }
        // --------------------------------------

        searchBlock.style.display = 'none';
        postsList.style.display = 'none';
        singlePostView.style.display = 'flex';
        
        // ОБНОВЛЕННЫЙ БЛОК ЗАГРУЗКИ
        singlePostContent.innerHTML = `
        <div style="display: flex; flex: 1; align-items: center; justify-content: center; min-height: calc(100vh - 200px); width: 100%;">
            <div class="loader-card" style="display: flex; flex-direction: column; padding: 18px; gap: 18px;">
                <div class="info-console" style="background: #000; margin: 0;">
                    <canvas class="mini-console" data-type="article_loader"></canvas>
                </div>
                <div class="pn-card-title" style="text-align: center; margin: 0; user-select: none;">
                    Loading...
                </div>
            </div>
        </div>
        `;
        initCanvases(); // <--- Запускаем движок анимаций для этого квадратика!
        
        // Дальше идет твой существующий код (хлебные крошки, fetch и т.д.)
        if(bcPageNameEn) bcPageNameEn.innerHTML = `Articles <svg class="bc-icon" viewBox="0 0 18 18"><path d="M 6 3 L 12 9 L 6 15" stroke="currentColor" fill="none" stroke-width="1.5"/></svg> ${post.title.en}`;
        if(bcPageNameRu) bcPageNameRu.innerHTML = `Статьи <svg class="bc-icon" viewBox="0 0 18 18"><path d="M 6 3 L 12 9 L 6 15" stroke="currentColor" fill="none" stroke-width="1.5"/></svg> ${post.title.ru}`;
        setPanelOffset(0);

        try {
            // Подгружаем внешний файл статьи
            const response = await fetch(post.contentFile);
            if (!response.ok) throw new Error("File not found");
            
            const htmlData = await response.json();
            
            // Вставляем скачанный HTML
            singlePostContent.innerHTML = htmlData.en + htmlData.ru;
            
            // Убираем старую анимацию загрузки из памяти, чтобы не было утечек!
            initCanvases();
            
            // =========================================================
            // --- ЛОГИКА КАСТОМНЫХ ПЛЕЕРОВ ---
            // =========================================================
            let currentAudio = null;
            let currentBtn = null;

            // SVG Иконки (идентично RLTV)
            const svgPlay = `<svg viewBox="0 0 24 24"><polygon points="6 4 18 12 6 20 6 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
            const svgPause = `<svg viewBox="0 0 24 24"><rect x="7" y="5" width="3" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" /><rect x="14" y="5" width="3" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>`;

            singlePostContent.querySelectorAll('.article-player').forEach(player => {
                const btn = player.querySelector('.player-btn');
                const timeline = player.querySelector('.player-timeline');
                const volume = player.querySelector('.player-volume');
                const volInput = player.querySelector('.player-vol-input');
                const timeCurrent = player.querySelector('.time-current');
                const timeTotal = player.querySelector('.time-total');
                const src = player.getAttribute('data-src');
                
                if (!src || !btn) return;

                btn.innerHTML = svgPlay;

                const audio = new Audio(src);
                if (volume) audio.volume = volume.value / 100;

                const formatTime = (sec) => {
                    if (isNaN(sec)) return "0:00";
                    const m = Math.floor(sec / 60);
                    const s = Math.floor(sec % 60).toString().padStart(2, '0');
                    return `${m}:${s}`;
                };

                // Функция ПЛАВНОГО обновления (60 раз в секунду)
                let animFrame;
                const updatePlayState = () => {
                    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
                    if (timeline && audio.duration) {
                        const percent = (audio.currentTime / audio.duration) * 100;
                        timeline.value = percent;
                        timeline.style.setProperty('--val', percent);
                    }
                    if (!audio.paused) {
                        animFrame = requestAnimationFrame(updatePlayState);
                    }
                };

                // 1. Кнопка Play / Pause
                btn.addEventListener('click', () => {
                    if (currentAudio && currentAudio !== audio) {
                        currentAudio.pause();
                        if (currentBtn) {
                            currentBtn.innerHTML = svgPlay;
                            currentBtn.classList.remove('playing');
                        }
                    }

                    if (audio.paused) {
                        audio.play();
                        btn.innerHTML = svgPause;
                        btn.classList.add('playing'); 
                        currentAudio = audio;
                        currentBtn = btn;
                        updatePlayState(); // Запуск плавной анимации
                    } else {
                        audio.pause();
                        btn.innerHTML = svgPlay;
                        btn.classList.remove('playing');
                        cancelAnimationFrame(animFrame); // Остановка анимации
                    }
                });

                // 2. Длительность трека
                audio.addEventListener('loadedmetadata', () => {
                    if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
                });

                // 3. Трек закончился
                audio.addEventListener('ended', () => {
                    btn.innerHTML = svgPlay;
                    btn.classList.remove('playing');
                    cancelAnimationFrame(animFrame);
                    if (timeline) {
                        timeline.value = 0;
                        timeline.style.setProperty('--val', 0);
                    }
                    if (timeCurrent) timeCurrent.textContent = "0:00";
                });

                // 4. Перемотка
                if (timeline) {
                    timeline.addEventListener('input', (e) => {
                        const percent = e.target.value;
                        if (audio.duration) audio.currentTime = (percent / 100) * audio.duration;
                        timeline.style.setProperty('--val', percent);
                        if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
                    });
                }

                // 5. Управление громкостью
                if (volume && volInput) {
                    const syncVol = (source) => {
                        let val;
                        if (source === 'input') {
                            let raw = volInput.value.replace(/\D/g, '');
                            val = raw === '' ? 0 : Math.min(parseInt(raw, 10), 100);
                            volInput.value = val;
                            volume.value = val;
                        } else {
                            val = volume.value;
                            volInput.value = val;
                        }
                        audio.volume = val / 100;
                        volume.style.setProperty('--val', val);
                    };

                    syncVol('slider'); 
                    volume.addEventListener('input', () => syncVol('slider'));
                    volInput.addEventListener('input', () => syncVol('input'));
                }
            });
            // =========================================================

        } catch (error) {
            singlePostContent.innerHTML = `<div class="pn-card-desc" style="text-align: center; margin-top: 36px; color: var(--c-sub);">Error loading content / Ошибка загрузки контента</div>`;
            initCanvases(); // Очищаем память даже если произошла ошибка
        }
    }

    if (backToPostsBtn) {
        backToPostsBtn.addEventListener('click', () => {
            // --- 2. МЕНЯЕМ ЛОГИКУ КНОПКИ ВНУТРИ СТАТЬИ ---
            window.history.back();
        });
    }

    searchInput.addEventListener('input', renderPostsList);
    categorySelect.addEventListener('change', renderPostsList);
    sortSelect.addEventListener('change', renderPostsList);

    renderPostsList();
}

// ============================================================
//  ЛОГИКА ТЕЛЕВИЗОРА
// ============================================================
const appRLTV = {
    // МАССИВ ССЫЛОК НА ВИДЕО. (Не забывайте кавычки "" для ссылок!)
    playlist: [
        // "https://ссылка_на_ваше_видео.mp4"
    ],
    
    currentIndex: 0,
    isPaused: false,
    clockInterval: null,
    
    init() {
        if(!document.getElementById('tvScreen')) return;
        this.volInput = document.getElementById('volInput');
        this.volSlider = document.getElementById('volSlider');
        this.video = document.getElementById('tvVideoPlayer');
        this.clock = document.getElementById('localTimeClock');
        this.tvBars = document.getElementById('tvBars');
        this.tvTextBox = document.getElementById('tvTextBox');
        this.tvLoading = document.getElementById('tvLoading');
        
        this.volInput.addEventListener('input', () => this.syncVol('input'));
        this.volSlider.addEventListener('input', () => this.syncVol('slider'));
        this.syncVol('slider');

        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(() => this.updateClock(), 1000);
        this.updateClock();

        this.video.addEventListener('timeupdate', () => { 
            if(this.playlist.length > 0) this.clock.textContent = `${this.fmt(this.video.currentTime)} / ${this.fmt(this.video.duration)}`; 
        });
        
        this.video.addEventListener('ended', () => this.changeChannel('next'));

        this.video.addEventListener('waiting', () => { if (this.tvLoading) this.tvLoading.style.display = 'block'; });
        this.video.addEventListener('playing', () => { if (this.tvLoading) this.tvLoading.style.display = 'none'; });
        this.video.addEventListener('canplay', () => { if (this.tvLoading) this.tvLoading.style.display = 'none'; });

        if (this.playlist.length === 0) {
            if (this.tvBars) this.tvBars.style.display = '';
            if (this.tvTextBox) this.tvTextBox.style.display = '';
            if (this.video) this.video.style.display = 'none';
        } else {
            if (this.tvBars) this.tvBars.style.display = 'none';
            if (this.tvTextBox) this.tvTextBox.style.display = 'none';
            if (this.video) this.video.style.display = 'block';
            this.loadVideo();
        }
    },

    syncVol(source) {
        if (source === 'input') {
            const val = this.volInput.value.replace(/\D/g, '');
            this.volInput.value = val === '' ? '0' : Math.min(parseInt(val, 10), 100).toString();
            this.volSlider.value = this.volInput.value;
        } else {
            this.volInput.value = this.volSlider.value;
        }
        
        if (this.video) {
            this.video.volume = this.volSlider.value / 100;
        }

        // Закрашиваем канавку слайдера фирменным цветом
        const percent = this.volSlider.value;
        this.volSlider.style.setProperty('--val', percent);
    }, // <--- ИМЕННО ЭТУ ЗАПЯТУЮ Я ЗАБЫЛ ВАМ НАПИСАТЬ! ИЗВИНИТЕ :)

    updateClock() {
        if (this.playlist.length > 0) return;
        const now = new Date(); 
        this.clock.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    },

    fmt(sec) { 
        if (isNaN(sec)) return "0:00"; 
        const m = Math.floor(sec / 60); 
        const s = Math.floor(sec % 60).toString().padStart(2, '0'); 
        return `${m}:${s}`; 
    },

    loadVideo() {
        if(this.playlist.length === 0) return;
        if (this.tvLoading) this.tvLoading.style.display = 'block';
        this.video.src = this.playlist[this.currentIndex];
        if (!this.isPaused) this.video.play().catch(()=>{});
    },

    changeChannel(dir) {
        if(this.playlist.length === 0) return;
        playStaticNoiseSound();
        this.currentIndex = dir === 'next' ? (this.currentIndex + 1) % this.playlist.length : (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadVideo();
    },

    togglePause() {
        if(this.playlist.length === 0) return;
        this.isPaused = !this.isPaused;
        if (this.isPaused) this.video.pause();
        else this.video.play();
    }
};
// ГЛОБАЛЬНАЯ КНОПКА НАЗАД В HUB
document.getElementById('globalBackBtn').addEventListener('click', () => {
    const singlePostView = document.getElementById('singlePostView');
    
    // Если мы внутри статьи - эмулируем системную кнопку "Назад"
    if (singlePostView && singlePostView.style.display === 'flex') {
        window.history.back();
    } else {
        // Иначе выходим на стартовый экран
        window.location.href = '/';
    }
});