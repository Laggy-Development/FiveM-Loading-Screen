'use strict';

const TIPS = [
    "Welkom op LaggyDev Roleplay veel plezier!",
    "Heb je een bug gevonden? Meld het via ons Discord!",
    "Respect naar andere spelers maakt de ervaring voor iedereen beter.",
    "Gebruik /help in game voor een overzicht van alle commando's.",
    "Wil je doneren? Bekijk onze Store voor exclusieve voordelen!",
    "Volg onze Discord voor de laatste updates en aankondigingen.",
    "Nieuw? Lees onze regels op de website voordat je begint.",
    "Kom jij in onze Hall of Fame? Word Player of the Month!",
    "Meerdere talen beschikbaar vraag een moderator om hulp.",
    "Rijden zonder gordel in roleplay is ook bij ons gevaarlijk.",
];

const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const progressFill = $('progress-fill');
const progressGlow = $('progress-glow');
const progressPct  = $('progress-pct');
const loadingLabel = $('loading-label');
const tipText      = $('tip-text');
const tipNum       = document.querySelector('.tip-num');
const bgMusic      = $('bg-music');
const btnMute      = $('btn-mute');
const btnBright    = $('btn-bright');
const volumeSlider = $('volume-slider');
const iconSoundOn  = $('icon-sound-on');
const iconSoundOff = $('icon-sound-off');

$$('img').forEach(img => {
    img.addEventListener('error', function () {
        this.setAttribute('data-missing', '');
        const allAvatars = $$('.dc-avatar');
        if ([...allAvatars].every(a => a.hasAttribute('data-missing'))) {
            const wrap = document.querySelector('.discord-avatars');
            if (wrap) wrap.style.display = 'none';
        }
    });
});

let tipIndex = 0;

function showTip(index) {
    tipText.style.transition = 'none';
    tipText.style.opacity    = '0';
    setTimeout(() => {
        tipText.textContent      = TIPS[index];
        tipNum.textContent       = `[${index + 1}]`;
        tipText.style.transition = 'opacity 0.45s ease';
        tipText.style.opacity    = '1';
    }, 300);
}

showTip(0);
setInterval(() => {
    tipIndex = (tipIndex + 1) % TIPS.length;
    showTip(tipIndex);
}, 6000);

const LABELS = [
    [0,  30, 'LOADING ASSETS'],
    [30, 60, 'LOADING SCRIPTS'],
    [60, 90, 'LOADING MAP'],
    [90, 100,'ALMOST DONE...'],
];

function setProgress(pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    progressFill.style.width   = clamped + '%';
    progressPct.textContent    = Math.round(clamped) + '%';
    progressGlow.style.opacity = clamped > 2 ? '1' : '0';
    for (const [min, max, label] of LABELS) {
        if (clamped >= min && clamped < max) { loadingLabel.textContent = label; break; }
    }
    if (clamped >= 100) loadingLabel.textContent = 'ALMOST DONE...';
}

let musicReady = false;
let isMuted    = false;
let targetVol  = 0.5;

function applyVolume() {
    if (!bgMusic) return;
    bgMusic.volume = isMuted ? 0 : targetVol;
}

function fadeInMusic(durationMs = 2000) {
    if (!bgMusic || isMuted) return;
    bgMusic.volume = 0;
    bgMusic.play().catch(() => {});
    const steps = 40;
    let step = 0;
    const fade = setInterval(() => {
        step++;
        bgMusic.volume = Math.min(targetVol, (step / steps) * targetVol);
        if (step >= steps) clearInterval(fade);
    }, durationMs / steps);
}

if (bgMusic) {
    bgMusic.addEventListener('canplaythrough', () => {
        if (!musicReady) { musicReady = true; fadeInMusic(); }
    }, { once: true });

    bgMusic.addEventListener('error', () => {
        const wrap = $('volume-wrap');
        if (wrap) wrap.style.display = 'none';
    });
}

if (btnMute) {
    btnMute.addEventListener('click', () => {
        isMuted = !isMuted;
        btnMute.classList.toggle('active', isMuted);
        if (iconSoundOn)  iconSoundOn.style.display  = isMuted ? 'none' : '';
        if (iconSoundOff) iconSoundOff.style.display = isMuted ? ''     : 'none';
        applyVolume();
        if (!isMuted && bgMusic && bgMusic.paused) fadeInMusic(800);
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', () => {
        targetVol = volumeSlider.value / 100;
        if (!isMuted) applyVolume();
    });
}

const bgEl = document.querySelector('.bg');
let brightMode = false;
if (btnBright) {
    btnBright.addEventListener('click', () => {
        brightMode = !brightMode;
        btnBright.classList.toggle('active', brightMode);
        if (bgEl) bgEl.style.filter = brightMode
            ? 'brightness(0.90) saturate(1.05)'
            : 'brightness(0.72) saturate(1.15)';
    });
}

let shuttingDown = false;

function shutdownLoadingScreen() {
    if (shuttingDown) return;
    shuttingDown = true;
    setProgress(100);

    if (bgMusic && !bgMusic.paused) {
        const vol = bgMusic.volume;
        let step = 0;
        const fade = setInterval(() => {
            step++;
            bgMusic.volume = Math.max(0, vol * (1 - step / 20));
            if (step >= 20) { bgMusic.pause(); clearInterval(fade); }
        }, 40);
    }

    setTimeout(() => {
        document.body.style.transition = 'opacity 0.7s ease';
        document.body.style.opacity    = '0';
        setTimeout(() => {
            if (typeof invokeNative !== 'undefined') invokeNative('shutdown', 'ready');
        }, 750);
    }, 600);
}

window.addEventListener('message', function (event) {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    if (typeof data.loadFraction === 'number') setProgress(data.loadFraction * 100);

    if (data.type === 'setPotm') {
        if (data.name) {
            const el = document.querySelector('.potm-name');
            if (el) el.textContent = data.name;
        }
        if (data.avatar) {
            const el = document.querySelector('.potm-avatar');
            if (el) { el.src = data.avatar; el.removeAttribute('data-missing'); }
        }
    }

    if (data.type === 'setDiscordOnline' && typeof data.count === 'number') {
        const el = $('discord-online');
        if (el) el.textContent = `● ${data.count} online`;
    }

    if (data.eventName === 'loadingScreenStop') shutdownLoadingScreen();
});

// Demo mode in browser (stops once FiveM events come in)
(function demoMode() {
    let fivemActive = false;
    window.addEventListener('message', () => { fivemActive = true; }, { once: true });
    setTimeout(() => {
        if (fivemActive) return;
        let pct = 0;
        const iv = setInterval(() => {
            pct += Math.random() * 1.8 + 0.4;
            if (pct >= 100) { pct = 100; clearInterval(iv); }
            setProgress(pct);
        }, 120);
    }, 600);
})();
