/* =========================================================
   兔子糖果夜 · 主逻辑
   ========================================================= */
(function () {
  'use strict';

  const PP = window.PP;
  const PAL = PP.PAL;
  const $ = (s) => document.querySelector(s);

  const DURATION = 60;
  const ALPHA = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

  const LS = {
    lastCode: 'pp.lastCode',
    face: 'pp.face',
    sfx: 'pp.sfx',
    bgm: 'pp.bgm',
    diff: 'pp.diff',
    stickers: 'pp.stickers',
    best: 'pp.best.'
  };

  // iOS 无痕模式下 localStorage 可能抛错，统一兜住
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  const ITEM = {
    candy: { r: 15, score: 10, energy: 3, size: 68 },
    lolli: { r: 16, score: 20, energy: 5, size: 66 },
    carrot: { r: 17, score: 50, energy: 10, size: 64 },
    star: { r: 17, score: 0, energy: 20, size: 60 },
    bat: { r: 19, score: -25, energy: 0, size: 68 }
  };

  const RANKS = [
    { min: 2200, cn: '万圣节传说', th: 'ตำนานฮาโลวีน', color: '#FF6FA5' },
    { min: 1500, cn: '糖果大王', th: 'ราชาลูกอม', color: '#F5B331' },
    { min: 900, cn: '胡萝卜骑士', th: 'อัศวินแครอท', color: '#9B7BE8' },
    { min: 400, cn: '糖果学徒', th: 'เด็กฝึกหัดเก็บลูกอม', color: '#6FE3C4' },
    { min: 0, cn: '小兔子', th: 'กระต่ายน้อย', color: '#FFB6C9' }
  ];

  // 三档难度：速度 / 生成间隔 / 蝙蝠比例 / 多颗连出概率 / 段位阈值系数
  const DIFF = {
    easy: {
      key: 'easy', cn: '简单', th: 'ง่าย',
      speed: [210, 420], spawn: [1.25, 0.80],
      bat: 0.35, burst: 0.12, batPenalty: 0, catch: 1.55, color: '#6FE3C4'
    },
    normal: {
      key: 'normal', cn: '中等', th: 'ปานกลาง',
      speed: [310, 650], spawn: [1.02, 0.50],
      bat: 1.0, burst: 0.24, batPenalty: -25, catch: 1.29, color: '#FFD166'
    },
    hard: {
      key: 'hard', cn: '困难', th: 'ยาก',
      speed: [390, 840], spawn: [0.90, 0.38],
      bat: 1.4, burst: 0.34, batPenalty: -25, catch: 1.20, color: '#FF8FA8'
    }
  };

  /* ---------------- DOM ---------------- */
  const app = $('#app');
  const cv = $('#cv');
  const ctx = cv.getContext('2d');

  const hud = $('#hud');
  const scoreEl = $('#score');
  const timeFill = $('#timeFill');
  const feverFill = $('#feverFill');
  const feverBar = $('#feverBar');
  const comboEl = $('#combo');
  const feverTip = $('#feverTip');
  const loveTip = $('#loveTip');
  const subtitleEl = $('#subtitle');
  const btnPause = $('#btnPause');
  const btnSfx = $('#btnSfx');

  const scrTitle = $('#scrTitle');
  const scrOver = $('#scrOver');
  const scrPause = $('#scrPause');

  const codeVal = $('#codeVal');
  const codeNote = $('#codeNote');
  const facesEl = $('#faces');
  const diffPills = $('#diffPills');
  const diffKey = document.querySelector('.diff-key');

  const overScore = $('#overScore');
  const overHead = $('#overHead');
  const rankPill = $('#rankPill');
  const bestBadge = $('#bestBadge');
  const stCombo = $('#stCombo');
  const stCandy = $('#stCandy');
  const stCode = $('#stCode');
  const compare = $('#compare');
  const cmpMe = $('#cmpMe');
  const cmpYou = $('#cmpYou');

  const modalCard = $('#modalCard');
  const cardImg = $('#cardImg');
  const cardDl = $('#cardDl');
  const modalCode = $('#modalCode');
  const codeInput = $('#codeInput');
  const toastEl = $('#toast');

  const rewardStrip = $('#rewardStrip');
  const rewardThumbs = $('#rewardThumbs');
  const rewardName = $('#rewardName');
  const rewardCount = $('#rewardCount');
  const modalBook = $('#modalBook');
  const bookGrid = $('#bookGrid');
  const bookHint = $('#bookHint');
  const bookCount = $('#bookCount');

  /* ---------------- 尺寸 ---------------- */
  let W = 390, H = 844, DPR = 2, S = 1;

  /* ---------------- 状态 ---------------- */
  const st = {
    screen: 'title',
    code: '',
    opp: null,
    face: 0,
    diff: 'easy',

    score: 0,
    combo: 0,
    maxCombo: 0,
    candies: 0,
    energy: 0,
    fever: 0,
    elapsed: 0,
    timeLeft: DURATION,

    items: [],
    parts: [],
    floats: [],

    charX: 195,
    charY: 700,
    charR: 34,
    catchY: 726,
    halfW: 44,
    targetX: 195,
    squash: 1,
    squashV: 0,

    shake: 0,
    flash: 0,

    rng: Math.random,
    spawnTimer: 0,
    spawnCount: 0,
    ending: false,
    bgmOn: false,
    bonusTotal: 0,
    love520: false,

    attractT: 0,
    decoTimer: 0,
    hintT: 0,

    newBest: false
  };

  let T = 0;
  let last = performance.now();
  let activePtr = null;

  /* ---------------- 工具 ---------------- */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  function hash32(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomCode() {
    let s = '';
    for (let i = 0; i < 6; i++) s += ALPHA[(Math.random() * ALPHA.length) | 0];
    return s;
  }

  const codeDisplay = (c) => (c.length > 2 ? c.slice(0, 2) + '-' + c.slice(2) : c);

  function rankOf(score) {
    for (const r of RANKS) if (score >= r.min) return r;
    return RANKS[RANKS.length - 1];
  }

  const multiplier = () => 1 + 0.1 * Math.min(st.combo, 20);

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('on'), 1800);
  }

  /* ---------------- 尺寸自适应 ---------------- */
  let resizeTimer = 0;
  function fit(force) {
    const w = Math.round(window.innerWidth);
    const h = Math.round(window.innerHeight);
    // 键盘弹出会缩小视口，忽略小幅缩小；变高（地址栏收起）则重新适配
    if (!force && w === W && (h === H || (h < H && H - h < 90))) return;

    W = w;
    H = h;
    DPR = Math.min(2.75, window.devicePixelRatio || 1);
    S = W / 390;

    document.documentElement.style.setProperty('--app-h', H + 'px');
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    st.charR = (H < 700 ? 24 : 34) * S;
    st.charY = H - (H < 700 ? 90 : Math.max(118, H * 0.158));
    st.catchY = st.charY + st.charR * 0.76;
    st.halfW = st.charR * 1.29;
    st.charX = clamp(st.charX, 50 * S, W - 50 * S);
    st.targetX = st.charX;
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (modalCode.classList.contains('on')) return;
      fit(false);
    }, 180);
  });
  window.addEventListener('orientationchange', () => setTimeout(() => fit(true), 260));

  /* ---------------- 关卡码 ---------------- */
  function readHash() {
    const raw = location.hash.replace(/^#/, '');
    if (!raw) return null;
    let p;
    try { p = new URLSearchParams(raw); } catch (e) { return null; }
    const r = (p.get('r') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (r.length < 4) return null;
    const dmap = { e: 'easy', n: 'normal', h: 'hard' };
    return {
      code: r.slice(0, 8),
      diff: dmap[(p.get('d') || '').toLowerCase()] || null,
      hasScore: p.has('s'),
      score: Math.max(0, parseInt(p.get('s') || '0', 10) || 0),
      combo: Math.max(0, parseInt(p.get('c') || '0', 10) || 0),
      candies: Math.max(0, parseInt(p.get('t') || '0', 10) || 0)
    };
  }

  function clearHash() {
    try {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    } catch (e) { /* file:// 下可能不允许 */ }
  }

  function setCode(code, opp) {
    st.code = (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    st.opp = opp || null;
    if (opp && opp.diff && DIFF[opp.diff]) st.diff = opp.diff;
    store.set(LS.lastCode, st.code);
    refreshTitle();
  }

  function setDiff(key) {
    if (!DIFF[key]) key = 'normal';
    st.diff = key;
    store.set(LS.diff, key);
    renderDiffUI();
  }

  function renderDiffUI() {
    if (!diffPills) return;
    const locked = !!(st.opp && st.opp.hasScore);
    diffPills.querySelectorAll('.diff-pill').forEach((b) => {
      b.classList.toggle('on', b.dataset.d === st.diff);
    });
    diffPills.classList.toggle('locked', locked);
    if (diffKey) diffKey.textContent = locked ? '难度·跟随' : '难度';
  }

  function refreshTitle() {
    codeVal.textContent = codeDisplay(st.code);
    const best = +(store.get(LS.best + st.code + '.' + st.diff) || 0);
    const bits = [];
    if (st.opp && st.opp.hasScore) {
      bits.push('TA 的关卡 · ' + (DIFF[st.diff] ? DIFF[st.diff].cn : '') + ' · 拿了 ' + st.opp.score + ' 分');
    } else if (best > 0) {
      bits.push('你的最好成绩 ' + best);
    }
    bits.push('ฝนลูกอมชุดเดียวกัน');
    codeNote.textContent = bits.join(' · ');
    renderDiffUI();
  }

  /* ---------------- 首页 UI ---------------- */
  function buildFaces() {
    facesEl.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const b = document.createElement('button');
      b.className = 'face-btn' + (i === st.face ? ' on' : '');
      b.setAttribute('aria-label', '兔子表情 ' + (i + 1));
      const c = document.createElement('canvas');
      const d = 2, sz = 56;
      c.width = sz * d;
      c.height = sz * d;
      const g = c.getContext('2d');
      g.scale(d, d);
      g.translate(sz / 2, sz / 2 + 5);
      g.lineJoin = 'round';
      PP.drawBunny(g, 0, 0, 15.5, i, 1, false);
      b.appendChild(c);
      b.addEventListener('click', () => {
        PP.Audio.unlock();
        PP.Audio.play('ui');
        st.face = i;
        store.set(LS.face, String(i));
        buildFaces();
      });
      facesEl.appendChild(b);
    }
  }

  /* ---------------- 屏幕切换 ---------------- */
  function showScreen(name) {
    st.screen = name;
    scrTitle.classList.toggle('on', name === 'title');
    scrOver.classList.toggle('on', name === 'over');
    scrPause.classList.toggle('on', name === 'pause');
    hud.classList.toggle('on', name === 'play' || name === 'pause');
    if (name !== 'play' && name !== 'pause') {
      comboEl.classList.remove('on');
      feverTip.classList.remove('on');
    }
    if (name === 'title') {
      st.items.length = 0;
      st.parts.length = 0;
      st.floats.length = 0;
      st.decoTimer = 0;
      refreshTitle();
    }
  }

  /* ---------------- 物品 ---------------- */
  function spriteOf(type, variant) {
    const sp = PP.sprites;
    if (type === 'candy') return sp.candy[variant % sp.candy.length];
    if (type === 'lolli') return sp.lolli[variant % sp.lolli.length];
    if (type === 'carrot') return sp.carrot;
    if (type === 'star') return sp.star;
    return sp.bat;
  }

  function makeItem(type, x, y, vy, deco) {
    const meta = ITEM[type];
    const variant = (st.rng() * 4) | 0;
    return {
      type,
      variant,
      spr: spriteOf(type, variant),
      r: meta.r * S * 0.92,
      x,
      bx: x,
      y,
      vy,
      rot: (st.rng() - 0.5) * 0.6,
      rotV: (st.rng() - 0.5) * (type === 'star' ? 2.2 : 1.2),
      t: st.rng() * 6,
      sway: st.rng() < 0.35 ? 1.4 + st.rng() * 1.2 : 0,
      swayAmp: (6 + st.rng() * 14) * S,
      phase: st.rng() * 6.28,
      deco: !!deco
    };
  }

  function pickType(p) {
    let w;
    if (p < 0.25) w = { candy: 70, lolli: 20, star: 10, carrot: 0, bat: 0 };
    else if (p < 0.5) w = { candy: 55, lolli: 20, star: 7, carrot: 8, bat: 10 };
    else if (p < 0.75) w = { candy: 45, lolli: 18, star: 7, carrot: 10, bat: 20 };
    else w = { candy: 40, lolli: 15, star: 5, carrot: 10, bat: 30 };

    if (st.fever > 0) {
      w.candy += w.bat;
      w.bat = 0;
    }
    w.bat *= (DIFF[st.diff] || DIFF.normal).bat;
    const keys = Object.keys(w);
    let total = 0;
    for (const k of keys) total += w[k];
    let r = st.rng() * total;
    for (const k of keys) {
      r -= w[k];
      if (r <= 0) return k;
    }
    return 'candy';
  }

  function spawn() {
    st.spawnCount++;
    const p = clamp(st.spawnCount / 110, 0, 1);
    const e = Math.pow(p, 1.35);
    const cfg = DIFF[st.diff] || DIFF.normal;

    st.spawnTimer = lerp(cfg.spawn[0], cfg.spawn[1], e) * (0.82 + st.rng() * 0.36) * (st.fever > 0 ? 0.84 : 1);

    let count = 1;
    if (p > 0.22 && st.rng() < cfg.burst) count = 2;
    if (p > 0.6 && st.rng() < cfg.burst * 0.45) count = 3;

    const speed = lerp(cfg.speed[0], cfg.speed[1], e) * S;
    const baseX = 60 * S + st.rng() * Math.max(1, W - 120 * S);

    for (let k = 0; k < count; k++) {
      const type = pickType(p);
      const meta = ITEM[type];
      let x = baseX + (count > 1 ? (k - (count - 1) / 2) * 76 * S : 0);
      x += (st.rng() - 0.5) * 46 * S;
      const pad = meta.r * S + 16 * S;
      x = clamp(x, pad, W - pad);
      const vy = speed * (0.9 + st.rng() * 0.3);
      st.items.push(makeItem(type, x, -50 * S - k * 54 * S, vy, false));
    }
  }

  /* ---------------- 特效 ---------------- */
  function burst(x, y, color, n, spd) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (0.4 + Math.random()) * spd * S;
      st.parts.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 60 * S,
        g: 620 * S,
        life: 0.45 + Math.random() * 0.3,
        max: 0.75,
        r: (2 + Math.random() * 3.4) * S,
        color,
        kind: Math.random() < 0.35 ? 'star' : 'dot',
        rot: Math.random() * 6.28,
        rotV: (Math.random() - 0.5) * 10
      });
    }
  }

  function floatText(x, y, text, color, size) {
    st.floats.push({
      x, y,
      vy: -118 * S,
      life: 0.9,
      max: 0.9,
      text,
      color,
      size: (size || 20) * S
    });
  }

  /* ---------------- 局内更新 ---------------- */
  function updatePlay(dt) {
    st.elapsed += dt;
    st.timeLeft = Math.max(0, DURATION - st.elapsed);
    if (st.hintT > 0) st.hintT -= dt;

    // 角色
    st.charX += (st.targetX - st.charX) * (1 - Math.exp(-16 * dt));
    st.charX = clamp(st.charX, 46 * S, W - 46 * S);

    const k = 340, d = 17;
    st.squashV += -k * (st.squash - 1) * dt - d * st.squashV * dt;
    st.squash = clamp(st.squash + st.squashV * dt, 0.74, 1.14);

    // 狂欢
    if (st.fever > 0) {
      st.fever -= dt;
      if (st.fever <= 0) {
        st.fever = 0;
        st.energy = 0;
        feverTip.classList.remove('on');
      }
    }

    // 生成
    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0) spawn();

    // 物品
    const catchY = st.catchY;
    const halfW = st.charR * ((DIFF[st.diff] || DIFF.normal).catch || 1.29);
    for (let i = st.items.length - 1; i >= 0; i--) {
      const it = st.items[i];
      const py = it.y;
      it.t += dt;
      it.y += it.vy * dt;
      it.rot += it.rotV * dt;
      if (it.sway) it.x = it.bx + Math.sin(it.t * it.sway + it.phase) * it.swayAmp;

      if (py + it.r < catchY && it.y + it.r >= catchY) {
        if (Math.abs(it.x - st.charX) < halfW + it.r * 0.45) {
          collect(it, i);
          continue;
        }
      }
      if (it.y - it.r > H + 50) st.items.splice(i, 1);
    }

    if (st.timeLeft <= 0 && !st.ending) endRun();
  }

  function collect(it, idx) {
    st.items.splice(idx, 1);
    const meta = ITEM[it.type];

    if (it.type === 'bat') {
      const pen = (DIFF[st.diff] || DIFF.normal).batPenalty;
      st.combo = 0;
      st.score = Math.max(0, st.score + pen);
      st.shake = 7;
      st.flash = 0.14;
      PP.Audio.play('bat');
      burst(it.x, it.y, '#9B7BE8', 9, 190);
      if (pen < 0) floatText(it.x, it.y - 6 * S, String(pen), '#C9B6F7', 20);
      return;
    }

    st.combo++;
    st.maxCombo = Math.max(st.maxCombo, st.combo);
    st.candies++;

    const mult = multiplier();
    const gain = Math.round(meta.score * mult * (st.fever > 0 ? 2 : 1));
    st.score += gain;
    st.squashV = -3.6;
    st.energy = Math.min(100, st.energy + meta.energy);

    // 每 5 连击给一次额外奖励
    const mile = st.combo % 5 === 0;
    let bonus = 0;
    if (mile) {
      bonus = 25 * (st.combo / 5);
      st.score += bonus;
      st.bonusTotal += bonus;
      st.flash = 0.14;
      PP.Audio.play('combo');
      burst(it.x, it.y, '#FFD166', 18, 280);
      burst(it.x, it.y, '#FFB6C9', 8, 220);
    }
    bumpCombo();

    if (it.type === 'star') {
      PP.Audio.play('star');
      burst(it.x, it.y, '#FFD166', 12, 220);
      floatText(it.x, it.y - 8 * S, '⭐', '#FFE9A8', 20);
    } else if (it.type === 'carrot') {
      PP.Audio.play('carrot');
      burst(it.x, it.y, '#FF9A3D', 14, 240);
      floatText(it.x, it.y - 8 * S, '+' + gain, '#FFC178', 26);
    } else if (it.type === 'lolli') {
      PP.Audio.play('lolli', st.combo);
      burst(it.x, it.y, '#FFB6C9', 9, 200);
      floatText(it.x, it.y - 6 * S, '+' + gain, '#FFD9E4', 22);
    } else {
      PP.Audio.play('catch', st.combo);
      burst(it.x, it.y, '#FFF1DC', 7, 170);
      floatText(it.x, it.y - 6 * S, '+' + gain, '#FFF6E9', 20);
    }

    if (bonus > 0) {
      floatText(it.x, it.y - 36 * S, '连击×' + st.combo + '  +' + bonus, '#FFD166', 21);
    }

    if (!st.love520 && st.score >= 520) {
      st.love520 = true;
      showLove();
    }

    if (st.energy >= 100 && st.fever <= 0) triggerFever();
  }

  function triggerFever() {
    st.fever = 5;
    st.energy = 0;
    st.flash = 0.6;
    PP.Audio.play('fever');
    feverTip.classList.add('on');
    clearTimeout(triggerFever._t);
    triggerFever._t = setTimeout(() => feverTip.classList.remove('on'), 1300);

    for (const it of st.items) {
      if (it.type === 'bat') {
        it.type = 'candy';
        it.variant = (Math.random() * 4) | 0;
        it.spr = spriteOf('candy', it.variant);
        it.r = ITEM.candy.r * S * 0.92;
        it.vy *= 0.85;
      }
    }
    for (let i = 0; i < 26; i++) {
      burst(
        W * (0.15 + Math.random() * 0.7),
        H * (0.15 + Math.random() * 0.35),
        ['#FFD166', '#FFB6C9', '#6FE3C4', '#C9B6F7'][(Math.random() * 4) | 0],
        2, 180
      );
    }
  }

  function showLove() {
    PP.Audio.play('love');
    if (loveTip) {
      loveTip.classList.add('on');
      clearTimeout(showLove._t);
      showLove._t = setTimeout(() => loveTip.classList.remove('on'), 2300);
    }
    for (let i = 0; i < 9; i++) {
      st.parts.push({
        x: W * (0.25 + Math.random() * 0.5),
        y: H * (0.62 + Math.random() * 0.12),
        vx: (Math.random() - 0.5) * 70 * S,
        vy: -(60 + Math.random() * 90) * S,
        g: -30 * S,
        life: 1.4 + Math.random() * 0.6,
        max: 2.0,
        r: (5 + Math.random() * 4) * S,
        color: i % 3 === 0 ? '#FFD166' : '#FF8FA8',
        kind: 'heart',
        rot: (Math.random() - 0.5) * 0.5,
        rotV: (Math.random() - 0.5) * 1.2
      });
    }
  }

  /* ---------------- 特效更新 ---------------- */
  function updateFX(dt) {
    for (let i = st.parts.length - 1; i >= 0; i--) {
      const p = st.parts[i];
      p.life -= dt;
      if (p.life <= 0) { st.parts.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.g * dt;
      p.vx *= Math.exp(-1.4 * dt);
      p.rot += p.rotV * dt;
    }
    for (let i = st.floats.length - 1; i >= 0; i--) {
      const f = st.floats[i];
      f.life -= dt;
      if (f.life <= 0) { st.floats.splice(i, 1); continue; }
      f.y += f.vy * dt;
      f.vy *= Math.exp(-1.3 * dt);
    }
    if (st.shake > 0) st.shake = Math.max(0, st.shake - dt * 34);
    if (st.flash > 0) st.flash = Math.max(0, st.flash - dt * 2.6);
  }

  /* ---------------- 静态装饰（首页） ---------------- */
  function updateAttract(dt) {
    st.attractT += dt;
    st.charX = W / 2 + Math.sin(st.attractT * 0.8) * W * 0.11;
    st.squash = 1 + Math.sin(st.attractT * 2.4) * 0.022;

    st.decoTimer -= dt;
    if (st.decoTimer <= 0) {
      st.decoTimer = 0.62;
      const types = ['candy', 'lolli', 'star', 'carrot'];
      const type = types[(Math.random() * 4) | 0];
      const x = 40 * S + Math.random() * (W - 80 * S);
      st.items.push(makeItem(type, x, -60 * S, (58 + Math.random() * 46) * S, true));
    }
    for (let i = st.items.length - 1; i >= 0; i--) {
      const it = st.items[i];
      it.t += dt;
      it.y += it.vy * dt;
      it.rot += it.rotV * 0.5 * dt;
      if (it.sway) it.x = it.bx + Math.sin(it.t * it.sway + it.phase) * it.swayAmp;
      if (it.y - it.r > H + 60) st.items.splice(i, 1);
    }
  }

  /* ---------------- 渲染 ---------------- */
  function drawItem(it) {
    const size = ITEM[it.type].size * S;
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);
    ctx.drawImage(it.spr, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawParts() {
    for (const p of st.parts) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.kind === 'star') {
        PP.starPath(ctx, 0, 0, p.r * 1.5, p.r * 0.6, 0);
        ctx.fill();
      } else if (p.kind === 'heart') {
        PP.heartPath(ctx, p.r * 1.6);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, 7);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawFloats() {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of st.floats) {
      const a = clamp(f.life / f.max, 0, 1);
      const pop = 1 + (1 - a) * 0.15;
      ctx.globalAlpha = a;
      ctx.font = '900 ' + (f.size * pop).toFixed(1) + 'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';
      ctx.lineWidth = f.size * 0.34;
      ctx.strokeStyle = 'rgba(43,27,61,.85)';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
  }

  function drawChar() {
    const x = st.charX;
    const y = st.charY;
    const r = st.charR;

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#1A1030';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 2.0, r * 1.47, r * 0.32, 0, 0, 7);
    ctx.fill();
    ctx.restore();

    PP.drawBag(ctx, x, y + r * 0.71, r * 2.76, r * 1.53);
    PP.drawBunny(ctx, x, y, r, st.face, st.squash, true);

    if (st.fever > 0) {
      const a = Math.min(1, st.fever) * 0.7;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = '#FFD166';
      ctx.lineWidth = 3 * S;
      ctx.beginPath();
      ctx.arc(x, y + r * 0.12, r * 1.35 + Math.sin(T * 8) * 3 * S, 0, 7);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawHint() {
    if (st.hintT <= 0 || st.screen !== 'play') return;
    const a = Math.min(1, st.hintT / 0.5) * 0.95;
    const main = '按住屏幕左右拖动 →';
    const sub = 'ลากนิ้วซ้ายขวา';
    const f1 = '700 ' + (13 * S).toFixed(1) + 'px "PingFang SC","Microsoft YaHei",sans-serif';
    const f2 = '600 ' + (10.5 * S).toFixed(1) + 'px "Noto Sans Thai",sans-serif';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = f1;
    const w1 = ctx.measureText(main).width;
    ctx.font = f2;
    const w2 = ctx.measureText(sub).width;

    const pw = Math.max(w1, w2) + 40 * S;
    const ph = 56 * S;
    const cy = st.charY - st.charR * 3.4;

    ctx.globalAlpha = a;
    PP.rr(ctx, W / 2 - pw / 2, cy - ph / 2, pw, ph, 17 * S);
    ctx.fillStyle = 'rgba(30,18,52,.72)';
    ctx.fill();
    ctx.lineWidth = 2 * S;
    ctx.strokeStyle = 'rgba(255,246,233,.28)';
    ctx.stroke();

    ctx.font = f1;
    ctx.fillStyle = '#FFF6E9';
    ctx.fillText(main, W / 2, cy - 7 * S);
    ctx.font = f2;
    ctx.fillStyle = 'rgba(255,240,220,.72)';
    ctx.fillText(sub, W / 2, cy + 13 * S);
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    PP.drawBackground(ctx, W, H, T, st.fever > 0, DPR);

    const sh = st.shake;
    const ox = sh > 0 ? (Math.random() - 0.5) * sh : 0;
    const oy = sh > 0 ? (Math.random() - 0.5) * sh : 0;

    ctx.save();
    ctx.translate(ox, oy);
    for (const it of st.items) drawItem(it);
    drawParts();
    if (st.screen !== 'over') drawChar();
    drawFloats();
    ctx.restore();

    drawHint();

    if (st.flash > 0) {
      ctx.save();
      ctx.globalAlpha = st.flash * 0.55;
      ctx.fillStyle = st.fever > 0 ? '#FFB6C9' : '#FFF6E9';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  /* ---------------- HUD ---------------- */
  let lastScore = -1, lastEnergy = -1, lastCombo = -1;

  function bump(el) {
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }

  function bumpCombo() {
    comboEl.classList.remove('bump');
    void comboEl.offsetWidth;
    comboEl.classList.add('bump');
  }

  function updateHud() {
    const sc = Math.round(st.score);
    if (sc !== lastScore) {
      scoreEl.textContent = sc;
      if (lastScore >= 0) bump(scoreEl);
      lastScore = sc;
    }
    timeFill.style.width = (st.timeLeft / DURATION * 100).toFixed(2) + '%';
    timeFill.classList.toggle('low', st.timeLeft <= 10);

    const e = Math.round(st.energy);
    if (e !== lastEnergy) {
      feverFill.style.width = e + '%';
      feverBar.classList.toggle('full', e >= 100);
      lastEnergy = e;
    }

    if (st.combo !== lastCombo) {
      const show = st.combo >= 2;
      comboEl.classList.toggle('on', show);
      if (show) {
        comboEl.innerHTML = '<b>×' + multiplier().toFixed(1) + '</b><small>连击 ' + st.combo + '</small>';
      }
      lastCombo = st.combo;
    }
  }

  /* ---------------- 开局 / 结束 ---------------- */
  function startRun() {
    PP.Audio.unlock();
    st.items.length = 0;
    st.parts.length = 0;
    st.floats.length = 0;
    st.score = 0;
    st.combo = 0;
    st.maxCombo = 0;
    st.candies = 0;
    st.energy = 0;
    st.fever = 0;
    st.elapsed = 0;
    st.timeLeft = DURATION;
    st.ending = false;
    st.spawnTimer = 0.9;
    st.spawnCount = 0;
    st.shake = 0;
    st.flash = 0;
    st.squash = 1;
    st.squashV = 0;
    st.hintT = 3.2;
    st.charX = W / 2;
    st.targetX = W / 2;
    st.bonusTotal = 0;
    st.love520 = false;

    st.rng = mulberry32(hash32(st.code + '|candy-v1'));

    lastScore = -1;
    lastEnergy = -1;
    lastCombo = -1;
    scoreEl.textContent = '0';
    feverFill.style.width = '0%';
    feverBar.classList.remove('full');
    comboEl.classList.remove('on');

    showScreen('play');
    PP.Audio.play('start');
  }

  function endRun() {
    st.ending = true;
    st.fever = 0;
    finishConfetti();
    showScreen('over');
    PP.Audio.play('over');

    const rank = rankOf(st.score);
    overScore.textContent = Math.round(st.score);
    if (overHead) {
      overHead.innerHTML = '时间到 · ' + (DIFF[st.diff] ? DIFF[st.diff].cn : '') +
        ' <span class="th">หมดเวลา</span>';
    }
    rankPill.textContent = rank.cn + ' · ' + rank.th;
    rankPill.style.background = rank.color;
    rankPill.style.color = '#2B1B3D';

    stCombo.textContent = st.maxCombo;
    stCandy.textContent = st.candies;
    stCode.textContent = codeDisplay(st.code);

    const bestKey = LS.best + st.code + '.' + st.diff;
    const best = +(store.get(bestKey) || 0);
    st.newBest = Math.round(st.score) > best;
    if (st.newBest) store.set(bestKey, String(Math.round(st.score)));
    bestBadge.classList.toggle('on', st.newBest && Math.round(st.score) > 0);
    if (st.newBest) setTimeout(() => PP.Audio.play('best'), 700);

    const o = st.opp;
    if (o && o.hasScore) {
      compare.classList.add('on');
      const me = Math.round(st.score);
      const you = o.score;
      cmpMe.querySelector('b').textContent = me;
      cmpYou.querySelector('b').textContent = you;
      cmpMe.classList.toggle('win', me > you);
      cmpYou.classList.toggle('win', you > me);
    } else {
      compare.classList.remove('on');
    }

    $('#btnShare').innerHTML = o && o.hasScore
      ? '把成绩发回去<span class="th">ส่งคะแนนกลับ</span>'
      : '分享成绩<span class="th">แชร์คะแนน</span>';

    // 兔子贴纸奖励（最后一张是隐藏款，集齐 8 张后才会出现）
    const owned = getStickers();
    const HIDDEN = PP.STICKERS.length - 1;
    const pool = [];
    for (let i = 0; i < HIDDEN; i++) if (owned.indexOf(i) < 0) pool.push(i);
    const got = [];
    if (pool.length) {
      got.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
      if (pool.length && Math.round(st.score) >= RANKS[1].min) {
        got.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
      }
    } else if (owned.indexOf(HIDDEN) < 0) {
      got.push(HIDDEN);
    }
    if (got.length) setStickers(owned.concat(got));
    renderReward(got);
  }

  function finishConfetti() {
    for (let i = 0; i < 30; i++) {
      burst(
        W * Math.random(),
        H * (0.2 + Math.random() * 0.3),
        ['#FFD166', '#FFB6C9', '#6FE3C4', '#C9B6F7', '#FF9F45'][(Math.random() * 5) | 0],
        2, 200
      );
    }
  }

  /* ---------------- 兔子贴纸 ---------------- */
  function getStickers() {
    let a = [];
    try { a = JSON.parse(store.get(LS.stickers) || '[]'); } catch (e) { a = []; }
    if (!Array.isArray(a)) return [];
    return a.filter((n) => typeof n === 'number' && n >= 0 && n < PP.STICKERS.length);
  }

  function setStickers(a) {
    store.set(LS.stickers, JSON.stringify(a));
    updateBookChip();
  }

  function updateBookChip() {
    if (!bookCount) return;
    bookCount.textContent = getStickers().length + '/' + PP.STICKERS.length;
  }

  function stickerCanvas(i, px, locked, secret) {
    const c = document.createElement('canvas');
    c.width = px;
    c.height = px;
    const g = c.getContext('2d');
    g.translate(px / 2, px / 2);
    if (locked) {
      g.beginPath();
      g.arc(0, 0, px * 0.43, 0, 7);
      g.fillStyle = secret ? '#FFF3D0' : '#EADDC9';
      g.fill();
      if (secret) {
        g.lineWidth = px * 0.02;
        g.strokeStyle = '#E0A21F';
        g.stroke();
      }
      g.fillStyle = secret ? '#C98A10' : '#BFAA8D';
      g.font = '900 ' + (px * 0.40).toFixed(1) + 'px "PingFang SC",system-ui,sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('?', 0, px * 0.04);
    } else {
      PP.drawSticker(g, i, px);
    }
    return c;
  }

  function renderReward(got) {
    const owned = getStickers();
    const HIDDEN = PP.STICKERS.length - 1;
    rewardThumbs.innerHTML = '';
    if (got.length) {
      const hidden = got.indexOf(HIDDEN) >= 0;
      rewardStrip.classList.add('on');
      rewardStrip.classList.toggle('hidden', hidden);
      got.forEach((i) => rewardThumbs.appendChild(stickerCanvas(i, 108, false)));
      rewardName.textContent = hidden
        ? '隐藏贴纸 · ' + PP.STICKERS[HIDDEN].cn
        : got.map((i) => PP.STICKERS[i].cn).join(' + ');
      rewardCount.textContent = (hidden ? '集齐了！全部 ' : '新贴纸 · 已收集 ') +
        owned.length + ' / ' + PP.STICKERS.length;
    } else if (owned.length >= PP.STICKERS.length) {
      rewardStrip.classList.add('on');
      rewardStrip.classList.remove('hidden');
      rewardName.textContent = '贴纸全部集齐啦！';
      rewardCount.textContent = PP.STICKERS.length + ' / ' + PP.STICKERS.length + ' · 点开贴纸册';
    } else {
      rewardStrip.classList.remove('on');
    }
  }

  function openBook() {
    const owned = getStickers();
    const HIDDEN = PP.STICKERS.length - 1;
    bookGrid.innerHTML = '';
    PP.STICKERS.forEach((sd, i) => {
      const tile = document.createElement('div');
      const has = owned.indexOf(i) >= 0;
      const secret = i === HIDDEN;
      tile.className = 'book-tile' + (has ? '' : ' locked') + (secret && !has ? ' secret' : '');
      tile.appendChild(stickerCanvas(i, 150, !has, secret));
      const nm = document.createElement('span');
      nm.textContent = has ? sd.cn : (secret ? '隐藏款' : '???');
      tile.appendChild(nm);
      bookGrid.appendChild(tile);
    });
    const n = owned.length;
    let hint = '已收集 ' + n + ' / ' + PP.STICKERS.length;
    if (n >= PP.STICKERS.length) hint += ' · 全部集齐！';
    else if (n >= PP.STICKERS.length - 1) hint += ' · 集齐 8 张后会出现隐藏款';
    else hint += ' · 每局至少得 1 张';
    bookHint.textContent = hint;
    modalBook.classList.add('on');
  }

  /* ---------------- 分享 ---------------- */
  function shareUrl() {
    const base = location.href.split('#')[0];
    const dc = { easy: 'e', normal: 'n', hard: 'h' }[st.diff] || 'n';
    return base + '#r=' + st.code + '&d=' + dc +
      '&s=' + Math.round(st.score) + '&c=' + st.maxCombo + '&t=' + st.candies;
  }

  async function copyText(t) {
    try {
      await navigator.clipboard.writeText(t);
      return true;
    } catch (e) { /* 继续尝试 */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.top = '-200px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }

  async function doShare() {
    const url = shareUrl();
    const score = Math.round(st.score);
    const mine = st.opp && st.opp.hasScore;
    const text = mine
      ? '😝 我打了 ' + score + ' 分！同一场糖果雨，来追我呀～\n' +
        'คะแนน ' + score + ' เล่นด่านเดียวกันนะ 🍬\n' +
        '关卡码 ' + codeDisplay(st.code)
      : '🐰 万圣节糖果大作战！我拿了 ' + score + ' 分，来打同一场糖果雨～\n' +
        '关卡码 ' + codeDisplay(st.code) + '\n' +
        'เก็บลูกอมฮาโลวีน เล่นด่านเดียวกันนะ 🍬';
    if (navigator.share) {
      try {
        await navigator.share({ title: '兔子糖果夜', text, url });
        return;
      } catch (e) { /* 用户取消或不支持 */ }
    }
    const ok = await copyText(text + '\n' + url);
    toast(ok ? '链接已复制，去粘给对方吧' : '请手动复制地址栏链接');
  }

  /* ---------------- 成绩卡 ---------------- */
  const CARD_W = 1080, CARD_H = 1440;

  function fontOf(size, weight) {
    return (weight || 900) + ' ' + size +
      'px "PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC","Noto Sans Thai",system-ui,sans-serif';
  }

  function ctext(g, s, x, y, size, color, opt) {
    opt = opt || {};
    g.font = fontOf(size, opt.weight);
    g.textAlign = opt.align || 'center';
    g.textBaseline = opt.base || 'alphabetic';
    if (opt.stroke) {
      g.lineWidth = opt.stroke;
      g.strokeStyle = opt.strokeColor || PAL.ink;
      g.strokeText(s, x, y);
    }
    g.fillStyle = color;
    g.fillText(s, x, y);
  }

  function buildCard() {
    const c = document.createElement('canvas');
    c.width = CARD_W;
    c.height = CARD_H;
    const g = c.getContext('2d');
    g.lineJoin = 'round';
    g.lineCap = 'round';

    const bg = g.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, '#FFFCF4');
    bg.addColorStop(0.55, '#FFF1DC');
    bg.addColorStop(1, '#FFE0C4');
    g.fillStyle = bg;
    g.fillRect(0, 0, CARD_W, CARD_H);

    for (let i = 0; i < 70; i++) {
      const x = (i * 137.5) % CARD_W;
      const y = (i * 211.7) % CARD_H;
      g.globalAlpha = 0.05;
      g.fillStyle = i % 2 ? '#F2762E' : '#6B4A9E';
      g.beginPath();
      g.arc(x, y, 5 + (i % 4) * 3, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;

    const glow = g.createRadialGradient(540, 420, 40, 540, 420, 460);
    glow.addColorStop(0, 'rgba(255,209,102,.55)');
    glow.addColorStop(1, 'rgba(255,209,102,0)');
    g.fillStyle = glow;
    g.fillRect(0, 100, CARD_W, 800);

    PP.rr(g, 44, 44, CARD_W - 88, CARD_H - 88, 56);
    g.lineWidth = 10;
    g.strokeStyle = PAL.ink;
    g.stroke();
    PP.rr(g, 66, 66, CARD_W - 132, CARD_H - 132, 42);
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(43,27,61,.18)';
    g.stroke();

    ctext(g, 'H A L L O W E E N', 540, 148, 34, '#E0551F', { weight: 900 });
    ctext(g, '万圣节糖果大作战', 540, 226, 78, PAL.gold, { stroke: 16, strokeColor: PAL.ink });
    ctext(g, 'เกมเก็บลูกอมฮาโลวีน', 540, 288, 33, PAL.ink2, { weight: 700 });

    PP.drawBunny(g, 540, 518, 90, st.face, 1, true);

    const deco = [
      [118, 300, 0.5, 96], [962, 290, -0.4, 88],
      [150, 560, -0.9, 78], [930, 548, 0.7, 82],
      [116, 1010, 0.2, 70], [966, 1012, -0.3, 74]
    ];
    const list = [
      PP.sprites.candy[0], PP.sprites.candy[1], PP.sprites.candy[2], PP.sprites.candy[3],
      PP.sprites.lolli[0], PP.sprites.lolli[1]
    ];
    deco.forEach((d, i) => {
      g.save();
      g.globalAlpha = 0.5;
      g.translate(d[0], d[1]);
      g.rotate(d[2]);
      g.drawImage(list[i % list.length], -d[3] / 2, -d[3] / 2, d[3], d[3]);
      g.restore();
    });

    ctext(g, String(Math.round(st.score)), 540, 748, 168, '#FFD166', {
      stroke: 22, strokeColor: PAL.ink
    });
    ctext(g, 'คะแนน · 分', 540, 798, 36, PAL.ink2, { weight: 700 });

    const rank = rankOf(st.score);
    PP.rr(g, 540 - 250, 826, 500, 78, 39);
    g.fillStyle = rank.color;
    g.fill();
    g.lineWidth = 7;
    g.strokeStyle = PAL.ink;
    g.stroke();
    ctext(g, rank.cn + ' · ' + rank.th, 540, 878, 34, PAL.ink, { weight: 900 });

    const chips = [
      ['最高连击', String(st.maxCombo)],
      ['抓到糖果', String(st.candies)],
      ['关卡码', codeDisplay(st.code)]
    ];
    chips.forEach((ch, i) => {
      const x = 96 + i * 296;
      PP.rr(g, x, 936, 280, 128, 28);
      g.fillStyle = '#FFF6E9';
      g.fill();
      g.lineWidth = 6;
      g.strokeStyle = PAL.ink;
      g.stroke();
      ctext(g, ch[1], x + 140, 998, 44, PAL.plumDeep, { weight: 900 });
      ctext(g, ch[0], x + 140, 1038, 24, 'rgba(43,27,61,.55)', { weight: 700 });
    });

    g.save();
    g.setLineDash([10, 12]);
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(43,27,61,.2)';
    g.beginPath();
    g.moveTo(140, 1108);
    g.lineTo(940, 1108);
    g.stroke();
    g.restore();

    ctext(g, '给 Pink_proud', 540, 1182, 52, PAL.ink, { weight: 900 });
    ctext(g, 'ถึง Pink_proud · สุขสันต์วันฮาโลวีน', 540, 1234, 30, '#C4551A', { weight: 700 });
    ctext(g, '60 秒 · 同一场糖果雨 · ฝนลูกอมชุดเดียวกัน', 540, 1310, 22, 'rgba(43,27,61,.45)', { weight: 700 });

    return c.toDataURL('image/png');
  }

  function openCard() {
    toast('正在生成卡片…');
    setTimeout(() => {
      let url;
      try {
        url = buildCard();
      } catch (e) {
        toast('生成失败，请截图保存吧');
        return;
      }
      cardImg.src = url;
      cardDl.href = url;
      modalCard.classList.add('on');
      toastEl.classList.remove('on');
    }, 40);
  }

  /* ---------------- 暂停 ---------------- */
  function pauseGame() {
    if (st.screen !== 'play') return;
    showScreen('pause');
  }
  function resumeGame() {
    if (st.screen !== 'pause') return;
    showScreen('play');
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (st.screen === 'play') pauseGame();
    } else {
      PP.Audio.resumeMusic();
    }
  });

  /* ---------------- 输入 ---------------- */
  cv.addEventListener('pointerdown', (e) => {
    PP.Audio.unlock();
    if (st.screen !== 'play') return;
    activePtr = e.pointerId;
    st.targetX = e.clientX;
    e.preventDefault();
  }, { passive: false });

  cv.addEventListener('pointermove', (e) => {
    if (st.screen !== 'play' || e.pointerId !== activePtr) return;
    st.targetX = e.clientX;
    e.preventDefault();
  }, { passive: false });

  const endPtr = (e) => {
    if (e.pointerId === activePtr) activePtr = null;
  };
  window.addEventListener('pointerup', endPtr);
  window.addEventListener('pointercancel', endPtr);

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  /* ---------------- 按钮绑定 ---------------- */
  $('#btnStart').addEventListener('click', () => {
    PP.Audio.unlock();
    PP.Audio.play('ui');
    if (!st.code) st.code = randomCode();
    startRun();
  });

  document.querySelectorAll('.diff-pill').forEach((b) => {
    b.addEventListener('click', () => {
      PP.Audio.unlock();
      if (st.opp && st.opp.hasScore) {
        toast('这一局跟随对方的难度 · ระดับของอีกฝ่าย');
        return;
      }
      if (b.dataset.d === st.diff) return;
      setDiff(b.dataset.d);
      refreshTitle();
      PP.Audio.play('ui');
    });
  });

  $('#btnNewCode').addEventListener('click', () => {
    PP.Audio.play('ui');
    setCode(randomCode(), null);
    clearHash();
  });

  $('#btnEnter').addEventListener('click', () => {
    PP.Audio.play('ui');
    codeInput.value = '';
    modalCode.classList.add('on');
    setTimeout(() => codeInput.focus(), 120);
  });

  $('#btnCodeOk').addEventListener('click', () => {
    const v = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (v.length < 4) { toast('至少 4 位哦'); return; }
    setCode(v, null);
    modalCode.classList.remove('on');
    clearHash();
    PP.Audio.play('ui');
    toast('已切换关卡 ' + codeDisplay(v));
    setTimeout(() => fit(true), 200);
  });

  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#btnCodeOk').click();
  });

  document.querySelectorAll('[data-close]').forEach((b) => {
    b.addEventListener('click', () => {
      const el = document.getElementById(b.getAttribute('data-close'));
      if (el) el.classList.remove('on');
    });
  });

  modalCode.addEventListener('click', (e) => {
    if (e.target === modalCode) {
      modalCode.classList.remove('on');
      setTimeout(() => fit(true), 200);
    }
  });
  modalCard.addEventListener('click', (e) => {
    if (e.target === modalCard) modalCard.classList.remove('on');
  });
  modalBook.addEventListener('click', (e) => {
    if (e.target === modalBook) modalBook.classList.remove('on');
  });

  rewardStrip.addEventListener('click', () => { PP.Audio.play('ui'); openBook(); });
  $('#btnBookTop').addEventListener('click', () => { PP.Audio.unlock(); PP.Audio.play('ui'); openBook(); });

  btnPause.addEventListener('click', () => { PP.Audio.play('ui'); pauseGame(); });
  $('#btnResume').addEventListener('click', () => { PP.Audio.play('ui'); resumeGame(); });
  $('#btnRestart').addEventListener('click', () => { PP.Audio.play('ui'); startRun(); });
  $('#btnHome2').addEventListener('click', () => { PP.Audio.play('ui'); showScreen('title'); });
  $('#btnHome').addEventListener('click', () => { PP.Audio.play('ui'); showScreen('title'); });

  $('#btnRetry').addEventListener('click', () => { PP.Audio.play('ui'); startRun(); });
  $('#btnShare').addEventListener('click', () => { PP.Audio.play('ui'); doShare(); });
  $('#btnCard').addEventListener('click', () => { PP.Audio.play('ui'); openCard(); });

  function syncSoundUI() {
    btnSfx.classList.toggle('off', !PP.Audio.sfxOn);
    const a = $('#tgSfx');
    const b = $('#tgBgm');
    if (a) a.classList.toggle('on', PP.Audio.sfxOn);
    if (b) b.classList.toggle('on', st.bgmOn);
  }

  function toggleSfx() {
    PP.Audio.unlock();
    const v = !PP.Audio.sfxOn;
    PP.Audio.setSfx(v);
    store.set(LS.sfx, v ? '1' : '0');
    syncSoundUI();
    if (v) PP.Audio.play('ui');
  }

  btnSfx.addEventListener('click', toggleSfx);

  const tgSfx = $('#tgSfx');
  const tgBgm = $('#tgBgm');
  if (tgSfx) tgSfx.addEventListener('click', toggleSfx);
  if (tgBgm) tgBgm.addEventListener('click', () => {
    PP.Audio.unlock();
    st.bgmOn = !st.bgmOn;
    PP.Audio.setMusic(st.bgmOn);
    store.set(LS.bgm, st.bgmOn ? '1' : '0');
    syncSoundUI();
  });

  /* ---------------- 主循环 ---------------- */
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    T += dt;

    if (st.screen === 'play') {
      updatePlay(dt);
      updateFX(dt);
      updateHud();
    } else if (st.screen === 'title') {
      updateAttract(dt);
      updateFX(dt);
    } else if (st.screen === 'over') {
      updateFX(dt);
    }

    render();
    requestAnimationFrame(loop);
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    PP.initArt();

    const savedFace = parseInt(store.get(LS.face) || '0', 10);
    st.face = Number.isFinite(savedFace) ? clamp(savedFace, 0, 3) : 0;

    if (store.get(LS.sfx) === '0') PP.Audio.setSfx(false);
    const bgm = store.get(LS.bgm);

    const savedDiff = store.get(LS.diff);
    if (savedDiff && DIFF[savedDiff]) st.diff = savedDiff;

    // 曼谷时间（UTC+7）：深夜/凌晨换成台灯
    const bkkH = (new Date().getUTCHours() + 7) % 24;
    const qs = location.search || '';
    if (/[?&]night=0/.test(qs)) PP.nightMode = false;
    else if (/[?&]night=1/.test(qs)) PP.nightMode = true;
    else PP.nightMode = (bkkH >= 22 || bkkH < 2);
    if (PP.nightMode && subtitleEl) {
      subtitleEl.textContent = 'ดึกแล้วนะ กินของหวานแล้วนอน';
      subtitleEl.style.color = 'rgba(255,226,170,.95)';
    }

    const h = readHash();
    const lastCode = (store.get(LS.lastCode) || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (h) {
      setCode(h.code, h.hasScore ? h : null);
    } else {
      setCode(lastCode && lastCode.length >= 4 ? lastCode : randomCode(), null);
    }
    if (h && h.hasScore) {
      setTimeout(() => toast('TA 的关卡来了 · ' + h.score + ' 分'), 700);
    }

    if (bgm !== '0') {
      st.bgmOn = true;
      const startBgm = () => {
        PP.Audio.unlock();
        PP.Audio.setMusic(true);
        syncSoundUI();
        document.removeEventListener('pointerdown', startBgm);
      };
      document.addEventListener('pointerdown', startBgm);
    }

    fit(true);
    buildFaces();
    syncSoundUI();
    updateBookChip();

    const bookIcon = $('#bookIcon');
    if (bookIcon) {
      const g = bookIcon.getContext('2d');
      g.translate(20, 22);
      g.lineJoin = 'round';
      PP.drawBunny(g, 0, 0, 7.4, 0, 1, false);
    }

    showScreen('title');
    requestAnimationFrame(loop);
  }

  boot();

  // 调试钩子：仅在 ?debug 时暴露状态，方便本地验收
  if (/[?&]debug/.test(location.search)) {
    window.__pp = { st, startRun, endRun, showScreen, setCode, triggerFever };
  }
})();
