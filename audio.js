/* =========================================================
   兔子糖果夜 · 音频模块（全部 WebAudio 合成，无外部音频）
   ========================================================= */
(function () {
  const PP = (window.PP = window.PP || {});

  let ctx = null;
  let master = null, sfxBus = null, musicBus = null;
  let sfxOn = true, musicOn = false;
  let unlocked = false;

  let timer = null, nextTime = 0, step = 0;

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    sfxBus = ctx.createGain();
    sfxBus.gain.value = 0.9;
    sfxBus.connect(master);

    musicBus = ctx.createGain();
    musicBus.gain.value = 0.62;
    musicBus.connect(master);
    return ctx;
  }

  function unlock() {
    const c = ensure();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    if (!unlocked) {
      unlocked = true;
      // iOS 需要一次真实播放才能完全解锁
      try {
        const b = c.createBuffer(1, 1, 22050);
        const s = c.createBufferSource();
        s.buffer = b;
        s.connect(c.destination);
        s.start(0);
      } catch (e) { /* ignore */ }
    }
  }

  function tone(opt) {
    const c = ctx;
    if (!c) return;
    const t0 = opt.when != null ? opt.when : c.currentTime + (opt.delay || 0);
    const dur = opt.dur || 0.12;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = opt.type || 'triangle';
    o.frequency.setValueAtTime(opt.freq, t0);
    if (opt.slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, opt.slideTo), t0 + dur);

    const peak = Math.max(0.0001, opt.gain == null ? 0.12 : opt.gain);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    o.connect(g);
    g.connect(opt.bus || sfxBus);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  function noise(dur, gain, freq) {
    const c = ctx;
    if (!c) return;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq || 1200;
    f.Q.value = 0.9;
    const g = c.createGain();
    g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(sfxBus);
    src.start();
  }

  const SFX = {
    ui() {
      tone({ freq: midi(84), dur: 0.055, type: 'triangle', gain: 0.09 });
    },
    start() {
      [72, 76, 79, 84].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.16, type: 'triangle', gain: 0.11, delay: i * 0.075 }));
    },
    catch(combo) {
      const n = Math.min(24, combo || 0);
      const f = 620 + n * 26;
      tone({ freq: f, dur: 0.075, type: 'triangle', gain: 0.10, slideTo: f * 1.35 });
      tone({ freq: f * 2, dur: 0.05, type: 'sine', gain: 0.04 });
    },
    lolli(combo) {
      const n = Math.min(24, combo || 0);
      const f = 700 + n * 22;
      tone({ freq: f, dur: 0.07, type: 'triangle', gain: 0.10 });
      tone({ freq: f * 1.5, dur: 0.10, type: 'triangle', gain: 0.09, delay: 0.06 });
    },
    carrot() {
      [72, 76, 79].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.13, type: 'triangle', gain: 0.10, delay: i * 0.055 }));
      tone({ freq: midi(84), dur: 0.18, type: 'sine', gain: 0.06, delay: 0.15 });
    },
    star() {
      [79, 84, 88, 91].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.12, type: 'sine', gain: 0.075, delay: i * 0.045 }));
    },
    combo() {
      [84, 88, 91, 96].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.13, type: 'triangle', gain: 0.085, delay: i * 0.045 }));
      tone({ freq: midi(103), dur: 0.25, type: 'sine', gain: 0.05, delay: 0.18 });
    },
    love() {
      [76, 81].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.55, type: 'sine', gain: 0.06, delay: i * 0.14 }));
      tone({ freq: midi(88), dur: 0.5, type: 'sine', gain: 0.04, delay: 0.3 });
    },
    bat() {
      tone({ freq: 150, dur: 0.16, type: 'sawtooth', gain: 0.055, slideTo: 90 });
      noise(0.10, 0.035, 700);
    },
    fever() {
      [72, 76, 79, 83, 88].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.20, type: 'triangle', gain: 0.10, delay: i * 0.065 }));
      tone({ freq: midi(96), dur: 0.3, type: 'sine', gain: 0.06, delay: 0.36 });
    },
    over() {
      [79, 76, 72, 67].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.26, type: 'triangle', gain: 0.10, delay: i * 0.13 }));
      tone({ freq: midi(72), dur: 0.5, type: 'sine', gain: 0.06, delay: 0.55 });
    },
    best() {
      [76, 79, 84].forEach((n, i) =>
        tone({ freq: midi(n), dur: 0.22, type: 'sine', gain: 0.07, delay: i * 0.1 }));
    }
  };

  /* ---------------- BGM ---------------- */
  // 4 小节 · 8 分音符 × 32
  const PROG = [
    [72, 76, 79, 84, 79, 76, 72, 76], // C
    [69, 72, 76, 81, 76, 72, 69, 72], // Am
    [65, 69, 72, 77, 72, 69, 65, 69], // F
    [67, 71, 74, 79, 74, 71, 67, 71]  // G
  ];
  const BASS = [48, 45, 41, 43];
  const BPM = 112;
  const EIGHTH = 60 / BPM / 2;

  function playStep(s, when) {
    const bar = Math.floor(s / 8) % 4;
    const i = s % 8;
    const lead = PROG[bar][i];
    // 主旋律：轻三角波，短衰减
    tone({
      freq: midi(lead), dur: 0.26, type: 'triangle', gain: 0.092,
      when, bus: musicBus
    });
    // 打击垫式低音
    if (i % 4 === 0) {
      tone({
        freq: midi(BASS[bar]), dur: 0.75, type: 'sine', gain: 0.115,
        when, bus: musicBus
      });
    }
    // 沙锤
    if (i % 2 === 1) {
      // 复用 noise 会连到 sfxBus，这里手写一个极轻的高频点击
      const c = ctx;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'square';
      o.frequency.value = 3600;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(0.012, when + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
      o.connect(g); g.connect(musicBus);
      o.start(when); o.stop(when + 0.06);
    }
  }

  function tick() {
    if (!ctx || !musicOn) return;
    while (nextTime < ctx.currentTime + 0.45) {
      playStep(step, nextTime);
      nextTime += EIGHTH;
      step = (step + 1) % 32;
    }
  }

  function startMusic() {
    const c = ensure();
    if (!c) return;
    musicOn = true;
    if (c.state === 'suspended') c.resume();
    nextTime = c.currentTime + 0.15;
    step = 0;
    if (!timer) timer = setInterval(tick, 120);
    tick();
  }

  function stopMusic() {
    musicOn = false;
    if (timer) { clearInterval(timer); timer = null; }
  }

  const A = (PP.Audio = {
    unlock,
    get sfxOn() { return sfxOn; },
    get musicOn() { return musicOn; },
    setSfx(v) {
      sfxOn = !!v;
      if (master) master.gain.value = sfxOn || musicOn ? 1 : 0;
    },
    setMusic(v) {
      if (v) { startMusic(); } else { stopMusic(); }
      if (master) master.gain.value = sfxOn || musicOn ? 1 : 0;
    },
    play(name, arg) {
      if (!sfxOn) return;
      const c = ensure();
      if (!c) return;
      if (c.state === 'suspended') c.resume();
      const fn = SFX[name];
      if (fn) { try { fn(arg); } catch (e) { /* ignore */ } }
    },
    // 后台回来时恢复 BGM
    resumeMusic() {
      if (musicOn && !timer) startMusic();
    }
  });
})();
