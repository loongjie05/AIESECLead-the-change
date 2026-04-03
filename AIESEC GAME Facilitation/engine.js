/* ===== ASSET MAP ===== */
const A = {
    bg: { meeting: 'assets/bg_meeting_room.png', cafeteria: 'assets/bg_cafeteria.png', venue: 'assets/bg_event_venue.png' },
    ch: {
        lj: 'assets/lj_neutral.png', lj_sweat: 'assets/lj_sweat.png', lj_happy: 'assets/lj_happy.png',
        meiling: 'assets/meiling_neutral.png', meiling_sad: 'assets/meiling_sad.png',
        arjun: 'assets/arjun_neutral.png',
        siti: 'assets/siti_neutral.png',
        weijie: 'assets/weijie_neutral.png',
        thea: 'assets/Thea_neutral.png',
        none: ''
    }
};

/* ===== STATE ===== */
let S = { ttp: 0, round: null, scenes: [], si: 0, typing: false, timer: null, ctx: null, phase: 'title', flags: {} };

/* ===== AUDIO ENGINE ===== */
function initAudio() { if (!S.ctx) S.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
function resumeCtx() { if (S.ctx && S.ctx.state === 'suspended') S.ctx.resume(); }

/* --- Typing blip --- */
function blip(isNarrator) {
    try {
        if (!S.ctx) return; resumeCtx();
        let o = S.ctx.createOscillator(), g = S.ctx.createGain();
        if (isNarrator) {
            o.type = 'sine'; 
            o.frequency.setValueAtTime(400 + Math.random() * 50, S.ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(800 + Math.random() * 100, S.ctx.currentTime + 0.06);
            g.gain.setValueAtTime(0.3, S.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.005, S.ctx.currentTime + 0.06);
            o.connect(g); g.connect(S.ctx.destination); o.start(); o.stop(S.ctx.currentTime + 0.06);
        } else {
            o.type = 'square'; o.frequency.value = 420 + Math.random() * 60;
            g.gain.setValueAtTime(0.18, S.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.005, S.ctx.currentTime + 0.06);
            o.connect(g); g.connect(S.ctx.destination); o.start(); o.stop(S.ctx.currentTime + 0.06);
        }
    } catch (e) { }
}

/* --- Coaching insight impact --- */
function boom() {
    try {
        if (!S.ctx) return; resumeCtx();
        let o = S.ctx.createOscillator(), g = S.ctx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(220, S.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(10, S.ctx.currentTime + 0.35);
        g.gain.setValueAtTime(0.5, S.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, S.ctx.currentTime + 0.45);
        o.connect(g); g.connect(S.ctx.destination); o.start(); o.stop(S.ctx.currentTime + 0.45);
    } catch (e) { }
}

/* ===== SOUND EFFECTS ===== */
function playSfx(type) {
    if (!S.ctx) return; resumeCtx();
    try {
        let t = S.ctx.currentTime;
        switch (type) {
            case 'slam': { // Desk slam - Ace Attorney style
                let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                o.type = 'sawtooth'; o.frequency.setValueAtTime(120, t);
                o.frequency.exponentialRampToValueAtTime(30, t + 0.2);
                g.gain.setValueAtTime(0.9, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                o.connect(g); g.connect(S.ctx.destination); o.start(t); o.stop(t + 0.3);
                // Add noise burst
                let n = S.ctx.createOscillator(), ng = S.ctx.createGain();
                n.type = 'square'; n.frequency.value = 80;
                ng.gain.setValueAtTime(0.55, t);
                ng.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                n.connect(ng); ng.connect(S.ctx.destination); n.start(t); n.stop(t + 0.15);
                break;
            }
            case 'gasp': { // Surprised gasp
                let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                o.type = 'sine'; o.frequency.setValueAtTime(300, t);
                o.frequency.exponentialRampToValueAtTime(800, t + 0.12);
                o.frequency.exponentialRampToValueAtTime(600, t + 0.25);
                g.gain.setValueAtTime(0.5, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                o.connect(g); g.connect(S.ctx.destination); o.start(t); o.stop(t + 0.3);
                break;
            }
            case 'sad': { // Melancholic descending
                [400, 350, 280].forEach((f, i) => {
                    let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                    o.type = 'sine'; o.frequency.value = f;
                    g.gain.setValueAtTime(0.35, t + i * 0.25);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.25 + 0.35);
                    o.connect(g); g.connect(S.ctx.destination);
                    o.start(t + i * 0.25); o.stop(t + i * 0.25 + 0.35);
                });
                break;
            }
            case 'cheer': { // Victory ascending
                [523, 659, 784, 1047].forEach((f, i) => {
                    let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                    o.type = 'square'; o.frequency.value = f;
                    g.gain.setValueAtTime(0.3, t + i * 0.12);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.2);
                    o.connect(g); g.connect(S.ctx.destination);
                    o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.2);
                });
                break;
            }
            case 'tension': { // Dissonant tension chord
                [185, 220, 233].forEach(f => {
                    let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                    o.type = 'sawtooth'; o.frequency.value = f;
                    g.gain.setValueAtTime(0.22, t);
                    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
                    o.connect(g); g.connect(S.ctx.destination); o.start(t); o.stop(t + 1.2);
                });
                break;
            }
            case 'argue': { // Heated argument — sharp staccato bursts
                [300, 350, 250, 400].forEach((f, i) => {
                    let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                    o.type = 'square'; o.frequency.value = f;
                    g.gain.setValueAtTime(0.45, t + i * 0.08);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.07);
                    o.connect(g); g.connect(S.ctx.destination);
                    o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.07);
                });
                break;
            }
            case 'cry': { // Crying — slow wavery descend
                let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(500, t);
                o.frequency.linearRampToValueAtTime(420, t + 0.3);
                o.frequency.linearRampToValueAtTime(480, t + 0.5);
                o.frequency.linearRampToValueAtTime(350, t + 0.9);
                g.gain.setValueAtTime(0.35, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
                o.connect(g); g.connect(S.ctx.destination); o.start(t); o.stop(t + 1.0);
                break;
            }
            case 'relief': { // Sigh of relief
                let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                o.type = 'sine'; o.frequency.setValueAtTime(500, t);
                o.frequency.exponentialRampToValueAtTime(330, t + 0.5);
                g.gain.setValueAtTime(0.35, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                o.connect(g); g.connect(S.ctx.destination); o.start(t); o.stop(t + 0.6);
                break;
            }
            case 'shock': { // Sharp shock moment
                let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                o.type = 'square'; o.frequency.setValueAtTime(900, t);
                o.frequency.exponentialRampToValueAtTime(150, t + 0.15);
                g.gain.setValueAtTime(0.7, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
                o.connect(g); g.connect(S.ctx.destination); o.start(t); o.stop(t + 0.2);
                break;
            }
            case 'warm': { // Warm heartfelt moment
                [330, 392, 494].forEach((f, i) => {
                    let o = S.ctx.createOscillator(), g = S.ctx.createGain();
                    o.type = 'sine'; o.frequency.value = f;
                    g.gain.setValueAtTime(0, t + i * 0.15);
                    g.gain.linearRampToValueAtTime(0.3, t + i * 0.15 + 0.08);
                    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.6);
                    o.connect(g); g.connect(S.ctx.destination);
                    o.start(t + i * 0.15); o.stop(t + i * 0.15 + 0.6);
                });
                break;
            }
        }
    } catch (e) { }
}

/* ===== BACKGROUND MUSIC ===== */
let bgm = { nodes: [], interval: null, current: null, gainNode: null };

function playBgm(type) {
    if (bgm.current === type) return;
    stopBgm();
    if (!S.ctx) return; resumeCtx();
    bgm.current = type;

    // Master gain for BGM
    bgm.gainNode = S.ctx.createGain();
    bgm.gainNode.gain.value = 0.14;
    bgm.gainNode.connect(S.ctx.destination);

    let notes, tempo, wave;
    switch (type) {
        case 'calm':
            notes = [262, 330, 392, 330, 294, 349, 392, 349, 262, 330, 392, 523, 494, 392, 330, 294];
            tempo = 280; wave = 'sine'; break;
        case 'tense':
            notes = [196, 233, 196, 247, 185, 220, 185, 233, 196, 247, 262, 247, 233, 220, 196, 185];
            tempo = 220; wave = 'sawtooth'; break;
        case 'emotional':
            notes = [330, 294, 262, 294, 330, 392, 349, 330, 294, 262, 247, 262, 294, 330, 294, 262];
            tempo = 350; wave = 'sine'; break;
        case 'victory':
            notes = [392, 440, 494, 523, 587, 659, 784, 659, 523, 587, 659, 784, 880, 784, 659, 523];
            tempo = 200; wave = 'square'; break;
        case 'conflict':
            notes = [220, 0, 233, 0, 220, 247, 0, 233, 262, 0, 247, 220, 0, 233, 220, 0];
            tempo = 180; wave = 'sawtooth'; break;
        default: return;
    }

    let idx = 0;
    bgm.interval = setInterval(() => {
        if (!S.ctx || !bgm.gainNode) return;
        let freq = notes[idx % notes.length];
        idx++;
        if (freq === 0) return; // rest
        try {
            let o = S.ctx.createOscillator(), g = S.ctx.createGain();
            o.type = wave;
            o.frequency.value = freq;
            let now = S.ctx.currentTime;
            let dur = tempo / 1000 * 0.8;
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(1, now + 0.02);
            g.gain.linearRampToValueAtTime(0, now + dur);
            o.connect(g); g.connect(bgm.gainNode);
            o.start(now); o.stop(now + dur);
        } catch (e) { }
    }, tempo);
}

function stopBgm() {
    if (bgm.interval) { clearInterval(bgm.interval); bgm.interval = null; }
    if (bgm.gainNode) { try { bgm.gainNode.disconnect(); } catch (e) { } bgm.gainNode = null; }
    bgm.current = null;
}

/* ===== RENDER ===== */
function $(id) { return document.getElementById(id); }

function go() {
    initAudio(); $('title').classList.remove('on'); $('gs').classList.add('on');
    $('hud').style.display = 'block'; S.ttp = 0; S.flags = {}; updHud();
    playBgm('calm');
    load('prologue', STORY.prologue);
}

function load(id, scenes, phase) {
    S.round = id; S.scenes = scenes; S.si = 0; S.phase = phase || 'dialogue'; render();
}

function render() {
    // Skip scenes based on flags
    while (S.si < S.scenes.length) {
        let s = S.scenes[S.si];
        if (s.skipIf && S.flags[s.skipIf]) { S.si++; continue; }
        if (s.showIf && !S.flags[s.showIf]) { S.si++; continue; }
        break;
    }
    if (S.si >= S.scenes.length) { onEnd(); return; }
    let sc = S.scenes[S.si];

    // If scene has an alternate version when a flag is set, use it
    if (sc.altIf && S.flags[sc.altIf.flag]) {
        sc = Object.assign({}, sc, sc.altIf);
    }

    // Actions
    if (sc.act === 'ROUND') { showBanner(sc.title); load(sc.target, STORY.rounds[sc.target].scenes); return; }

    // Background music changes
    if (sc.bgm) playBgm(sc.bgm);

    // Sound effects
    if (sc.sfx) playSfx(sc.sfx);

    // Background
    if (sc.bg) $('gs').style.backgroundImage = "url('" + A.bg[sc.bg] + "')";

    // Characters
    let cL = $('cL'), cR = $('cR');
    if (sc.cL !== undefined) {
        if (sc.cL === 'none') { cL.classList.remove('on'); }
        else { cL.src = A.ch[sc.cL] || A.ch.lj; cL.classList.add('on'); }
    }
    if (sc.cR !== undefined) {
        if (sc.cR === 'none') { cR.classList.remove('on'); }
        else { cR.src = A.ch[sc.cR] || A.ch.lj; cR.classList.add('on'); }
    }

    // Highlight speaker
    cL.classList.remove('talk', 'dim'); cR.classList.remove('talk', 'dim');
    let isNarrator = (!sc.spk || sc.spk === 'Narrator');
    if (!isNarrator) {
        let lKey = sc.cL || ''; let rKey = sc.cR || '';
        let spkLow = sc.spk.toLowerCase().replace(/[\s_]/g, '');
        if (lKey.toLowerCase().replace(/[\s_]/g, '').includes(spkLow)) { cL.classList.add('talk'); if (cR.classList.contains('on')) cR.classList.add('dim'); }
        else if (rKey.toLowerCase().replace(/[\s_]/g, '').includes(spkLow)) { cR.classList.add('talk'); if (cL.classList.contains('on')) cL.classList.add('dim'); }
    } else { if (cL.classList.contains('on')) cL.classList.add('dim'); if (cR.classList.contains('on')) cR.classList.add('dim'); }

    // Text
    $('spk').textContent = sc.spk || 'Narrator';
    if (isNarrator) $('dtxt').classList.add('narrator'); else $('dtxt').classList.remove('narrator');
    $('dtxt').textContent = '';
    $('nxt').style.display = 'none';

    typeIt(sc.txt, 0, isNarrator);
}

function typeIt(txt, i, isNarrator) {
    S.typing = true;
    if (i < txt.length) {
        $('dtxt').textContent += txt[i];
        if (txt[i] !== ' ') blip(isNarrator);
        S.timer = setTimeout(() => typeIt(txt, i + 1, isNarrator), 28);
    } else {
        S.typing = false;
        $('nxt').style.display = 'block';
    }
}

function adv() {
    if (S.typing) { 
        clearTimeout(S.timer); 
        $('dtxt').textContent = S.scenes[S.si].txt; 
        S.typing = false; 
        $('nxt').style.display = 'block'; 
        return; 
    }
    if ($('chs').classList.contains('on') || $('ins').classList.contains('on')) return;
    S.si++; render();
}

function onEnd() {
    if (S.phase === 'consequence') { showInsight(); return; }
    if (S.phase === 'ending') { showEndScreen(); return; }
    showChoices();
}

/* ===== CHOICES ===== */
function showChoices() {
    let rd = STORY.rounds[S.round];
    S.phase = 'choice';
    // Shuffle choice order so best answer isn't always first
    S.choiceMap = [0, 1, 2];
    for (let i = S.choiceMap.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [S.choiceMap[i], S.choiceMap[j]] = [S.choiceMap[j], S.choiceMap[i]];
    }
    for (let i = 0; i < 3; i++) $('c' + i).textContent = rd.choices[S.choiceMap[i]].txt;
    $('chs').classList.add('on');
}

function pick(i) {
    if (!$('chs').classList.contains('on')) return;
    $('chs').classList.remove('on');
    let rd = STORY.rounds[S.round];
    // Map displayed index back to original choice
    let origIdx = S.choiceMap ? S.choiceMap[i] : i;
    let ch = rd.choices[origIdx];
    S.ttp += ch.pts; updHud();
    if (ch.setFlags) { Object.assign(S.flags, ch.setFlags); }
    // Play feedback sound based on choice quality
    if (ch.pts >= 3) playSfx('cheer');
    else if (ch.pts <= -1) playSfx('tension');
    load(S.round, ch.con, 'consequence');
}

/* ===== INSIGHT ===== */
function showInsight() {
    boom(); flash(); shake();
    let rd = STORY.rounds[S.round];
    $('ins-p').textContent = rd.insight.title;
    $('ins-d').textContent = rd.insight.text;
    $('ins').classList.add('on');
}

function nextAfterInsight() {
    $('ins').classList.remove('on');
    let next = parseInt(S.round) + 1;
    if (next <= 12) { showBanner(STORY.rounds[next].title); load(next, STORY.rounds[next].scenes); }
    else { showFinalEnding(); }
}

/* ===== ENDING ===== */
function showFinalEnding() {
    let e;
    if (S.ttp >= 28) { e = STORY.endings.happy; playBgm('victory'); }
    else if (S.ttp >= 16) { e = STORY.endings.neutral; playBgm('emotional'); }
    else { e = STORY.endings.bad; playBgm('tense'); }
    load('ending', e.scenes, 'ending');
}

function showEndScreen() {
    stopBgm();
    $('gs').classList.remove('on'); $('hud').style.display = 'none';
    let e;
    if (S.ttp >= 28) e = STORY.endings.happy;
    else if (S.ttp >= 16) e = STORY.endings.neutral;
    else e = STORY.endings.bad;
    $('end-t').textContent = e.title; $('end-t').className = e.cls;
    $('end-s').textContent = S.ttp;
    $('end-txt').textContent = e.desc;
    $('end-quote').textContent = e.quote;
    $('end').classList.add('on');
    // Play final sound
    if (S.ttp >= 28) playSfx('cheer');
    else if (S.ttp < 16) playSfx('sad');
}

/* ===== FX ===== */
function flash() { let f = $('flash'); f.classList.remove('fla'); void f.offsetWidth; f.classList.add('fla'); }
function shake() { let g = $('game'); g.classList.remove('shk'); void g.offsetWidth; g.classList.add('shk'); }
function updHud() { $('ttp-val').textContent = S.ttp; }
function showBanner(t) { let b = $('round-banner'); b.textContent = t; b.classList.add('show'); setTimeout(() => b.classList.remove('show'), 3000); }

/* ===== INIT (SLOW COMPUTER SAFE) ===== */
function init() {
    document.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') adv();
        if (e.key === '1') pick(0); if (e.key === '2') pick(1); if (e.key === '3') pick(2);
    });
}
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', init);
setTimeout(init, 1000);
setTimeout(init, 3000);
setTimeout(init, 5000);
