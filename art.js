/* =========================================================
   兔子糖果夜 · 美术模块
   全部图形用代码绘制，零外部资源
   ========================================================= */
(function () {
  const PP = (window.PP = window.PP || {});

  const PAL = (PP.PAL = {
    ink: '#2B1B3D',
    ink2: '#4A3563',
    cream: '#FFF6E9',
    cream2: '#FFEBD2',
    orange: '#FF9F45',
    orangeDeep: '#F2762E',
    orangeLite: '#FFC178',
    gold: '#FFD166',
    goldDeep: '#E0A21F',
    pink: '#FFB6C9',
    pinkDeep: '#F0719A',
    mint: '#6FE3C4',
    plum: '#8A67C9',
    plumDeep: '#6B4A9E',
    plumDark: '#4A2F6B',
    night: '#2E1F4F',
    white: '#FFFFFF'
  });

  const CANDY = [
    { main: '#FF7A9C', dark: '#D94C74', light: '#FFB3C7' },
    { main: '#6FE3C4', dark: '#3FB89A', light: '#B4F5E4' },
    { main: '#9B7BE8', dark: '#6E4FC4', light: '#C9B6F7' },
    { main: '#FFD166', dark: '#DDA82C', light: '#FFE9AE' }
  ];
  PP.CANDY = CANDY;

  /* ---------- 基础工具 ---------- */
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.lineTo(x + w - r, y);
    g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r);
    g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r);
    g.lineTo(x, y + r);
    g.quadraticCurveTo(x, y, x + r, y);
    g.closePath();
  }
  PP.rr = rr;

  function starPath(g, x, y, R, r, rot) {
    const n = 5;
    g.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (Math.PI / n) * i - Math.PI / 2 + (rot || 0);
      const rad = i % 2 === 0 ? R : r;
      const px = x + Math.cos(a) * rad;
      const py = y + Math.sin(a) * rad;
      i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
    }
    g.closePath();
  }
  PP.starPath = starPath;

  function heartPath(g, s) {
    g.beginPath();
    g.moveTo(0, s * 0.38);
    g.bezierCurveTo(-s * 0.72, -s * 0.12, -s * 0.32, -s * 0.68, 0, -s * 0.20);
    g.bezierCurveTo(s * 0.32, -s * 0.68, s * 0.72, -s * 0.12, 0, s * 0.38);
    g.closePath();
  }
  PP.heartPath = heartPath;

  function makeSprite(size, draw) {
    const d = 2;
    const c = document.createElement('canvas');
    c.width = size * d;
    c.height = size * d;
    const g = c.getContext('2d');
    g.scale(d, d);
    g.translate(size / 2, size / 2);
    const k = size / 56;
    g.scale(k, k);
    g.lineJoin = 'round';
    g.lineCap = 'round';
    draw(g, size / k);
    return c;
  }

  /* ---------- 糖果 ---------- */
  function drawCandy(g, col) {
    const W = 24, H = 18;
    g.lineWidth = 2.6;
    g.strokeStyle = PAL.ink;
    // 两头的糖纸
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * (W / 2 - 1), -7);
      g.lineTo(s * (W / 2 + 9), -5);
      g.lineTo(s * (W / 2 + 9), 5);
      g.lineTo(s * (W / 2 - 1), 7);
      g.closePath();
      g.fillStyle = col.dark;
      g.fill();
      g.stroke();
    }
    // 主体
    rr(g, -W / 2, -H / 2, W, H, 5.5);
    g.fillStyle = col.main;
    g.fill();
    g.save();
    g.clip();
    g.fillStyle = col.light;
    g.fillRect(-6.5, -H, 3.6, H * 2);
    g.fillRect(1.5, -H, 3.6, H * 2);
    g.restore();
    rr(g, -W / 2, -H / 2, W, H, 5.5);
    g.stroke();
    // 高光
    g.beginPath();
    g.ellipse(-5, -3.4, 4, 2, -0.5, 0, 7);
    g.fillStyle = 'rgba(255,255,255,.65)';
    g.fill();
  }

  /* ---------- 棒棒糖 ---------- */
  function drawLolli(g, col) {
    // 棍
    rr(g, -2, 4, 4, 22, 2);
    g.fillStyle = '#FFF3E0';
    g.strokeStyle = PAL.ink;
    g.lineWidth = 2.4;
    g.fill();
    g.stroke();
    // 糖球
    const R = 13.5;
    g.beginPath();
    g.arc(0, -3, R, 0, 7);
    g.fillStyle = col.main;
    g.fill();
    g.save();
    g.clip();
    g.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.1) {
      const rad = 1.5 + a * 1.0;
      const x = Math.cos(a) * rad;
      const y = -3 + Math.sin(a) * rad;
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.strokeStyle = col.light;
    g.lineWidth = 3.2;
    g.stroke();
    g.restore();
    g.beginPath();
    g.arc(0, -3, R, 0, 7);
    g.strokeStyle = PAL.ink;
    g.lineWidth = 2.6;
    g.stroke();
    g.beginPath();
    g.ellipse(-5, -8, 3.6, 2.4, -0.6, 0, 7);
    g.fillStyle = 'rgba(255,255,255,.8)';
    g.fill();
  }

  /* ---------- 星星 ---------- */
  function drawStarSprite(g) {
    g.save();
    g.rotate(-0.12);
    starPath(g, 0, 0, 17, 7.6, 0);
    g.fillStyle = PAL.gold;
    g.strokeStyle = PAL.ink;
    g.lineWidth = 2.8;
    g.fill();
    g.stroke();
    g.beginPath();
    g.arc(-3, -4, 2.6, 0, 7);
    g.fillStyle = 'rgba(255,255,255,.9)';
    g.fill();
    g.restore();
    // 小闪
    g.strokeStyle = 'rgba(255,255,255,.85)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(11, -13); g.lineTo(11, -7);
    g.moveTo(8, -10); g.lineTo(14, -10);
    g.stroke();
  }

  /* ---------- 小蝙蝠（可爱版） ---------- */
  function drawBat(g) {
    g.lineWidth = 2.6;
    g.strokeStyle = PAL.ink;
    // 翅膀
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 8, -2);
      g.quadraticCurveTo(s * 22, -12, s * 25, -1);
      g.quadraticCurveTo(s * 20, 1, s * 21, 7);
      g.quadraticCurveTo(s * 15, 4, s * 8, 6);
      g.closePath();
      g.fillStyle = '#5C4385';
      g.fill();
      g.stroke();
    }
    // 身体
    g.beginPath();
    g.ellipse(0, 1, 9, 10, 0, 0, 7);
    g.fillStyle = '#7A5BA8';
    g.fill();
    g.stroke();
    // 耳朵
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 3, -7);
      g.lineTo(s * 6.5, -14);
      g.lineTo(s * 8.5, -5.5);
      g.closePath();
      g.fillStyle = '#7A5BA8';
      g.fill();
      g.stroke();
    }
    // 眼睛
    for (const s of [-1, 1]) {
      g.beginPath();
      g.arc(s * 3.4, -1, 2.5, 0, 7);
      g.fillStyle = '#FFF7E8';
      g.fill();
      g.beginPath();
      g.arc(s * 3.4, -0.6, 1.3, 0, 7);
      g.fillStyle = PAL.ink;
      g.fill();
    }
    // 腮红
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * 6.4, 3.4, 2.4, 1.6, 0, 0, 7);
      g.fillStyle = 'rgba(255,150,180,.75)';
      g.fill();
    }
    // 小嘴
    g.beginPath();
    g.moveTo(-1.4, 5);
    g.quadraticCurveTo(0, 6.6, 1.4, 5);
    g.strokeStyle = PAL.ink;
    g.lineWidth = 1.6;
    g.stroke();
  }

  /* ---------- 南瓜（背景装饰用） ---------- */
  function drawHat(g, r) {
    const baseY = -r * 0.64;
    const top = -r * 2.02;
    const halfW = r * 0.58;
    const ink = PAL.ink;

    g.save();
    g.rotate(-0.08);

    // 帽檐
    g.beginPath();
    g.ellipse(0, baseY, halfW * 1.34, r * 0.17, 0, 0, 7);
    g.fillStyle = '#8A67C9';
    g.fill();
    g.lineWidth = Math.max(2, r * 0.1);
    g.strokeStyle = ink;
    g.stroke();

    // 帽筒
    g.beginPath();
    g.moveTo(-halfW, baseY);
    g.quadraticCurveTo(-halfW * 0.62, baseY - (baseY - top) * 0.52, r * 0.05, top);
    g.quadraticCurveTo(halfW * 0.72, baseY - (baseY - top) * 0.5, halfW, baseY);
    g.closePath();
    g.fillStyle = '#7B5AC7';
    g.fill();
    g.stroke();

    // 金色帽带（裁剪在帽筒内）
    g.save();
    g.clip();
    g.fillStyle = PAL.gold;
    g.fillRect(-halfW * 1.2, baseY - r * 0.30, halfW * 2.4, r * 0.15);
    g.restore();

    // 小星星
    g.save();
    g.translate(r * 0.20, -r * 1.30);
    starPath(g, 0, 0, r * 0.17, r * 0.075, 0.2);
    g.fillStyle = PAL.gold;
    g.fill();
    g.lineWidth = Math.max(1.2, r * 0.045);
    g.strokeStyle = ink;
    g.stroke();
    g.restore();

    g.restore();
  }

  function drawFace(g, r, face) {
    const ey = -r * 0.02;
    const ex = r * 0.30;
    const ink = PAL.ink;
    g.strokeStyle = ink;
    g.fillStyle = ink;
    g.lineCap = 'round';

    if (face === 0) {
      // 豆豆眼 + 微笑 + 小牙
      for (const s of [-1, 1]) {
        g.beginPath();
        g.ellipse(s * ex, ey, r * 0.10, r * 0.13, 0, 0, 7);
        g.fill();
      }
      g.beginPath();
      g.moveTo(-r * 0.20, r * 0.24);
      g.quadraticCurveTo(0, r * 0.44, r * 0.20, r * 0.24);
      g.lineWidth = Math.max(1.6, r * 0.085);
      g.stroke();
      // 小尖牙
      g.beginPath();
      g.moveTo(r * 0.10, r * 0.29);
      g.lineTo(r * 0.16, r * 0.36);
      g.lineTo(r * 0.21, r * 0.27);
      g.closePath();
      g.fillStyle = '#FFF7E8';
      g.fill();
    } else if (face === 1) {
      // 大圆眼 + 小 O 嘴
      for (const s of [-1, 1]) {
        g.beginPath();
        g.arc(s * ex, ey, r * 0.155, 0, 7);
        g.fillStyle = '#FFF7E8';
        g.fill();
        g.lineWidth = Math.max(1.4, r * 0.075);
        g.strokeStyle = ink;
        g.stroke();
        g.beginPath();
        g.arc(s * ex + s * r * 0.02, ey + r * 0.02, r * 0.085, 0, 7);
        g.fillStyle = ink;
        g.fill();
      }
      g.beginPath();
      g.ellipse(0, r * 0.30, r * 0.085, r * 0.11, 0, 0, 7);
      g.fillStyle = ink;
      g.fill();
    } else if (face === 2) {
      // ^^ 眼 + 大笑
      g.lineWidth = Math.max(1.8, r * 0.095);
      g.strokeStyle = ink;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * ex - r * 0.13, ey + r * 0.04);
        g.quadraticCurveTo(s * ex, ey - r * 0.15, s * ex + r * 0.13, ey + r * 0.04);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(-r * 0.26, r * 0.18);
      g.quadraticCurveTo(0, r * 0.60, r * 0.26, r * 0.18);
      g.closePath();
      g.fillStyle = '#5B2338';
      g.fill();
      g.lineWidth = Math.max(1.4, r * 0.07);
      g.strokeStyle = ink;
      g.stroke();
      g.save();
      g.beginPath();
      g.moveTo(-r * 0.18, r * 0.28);
      g.quadraticCurveTo(0, r * 0.44, r * 0.18, r * 0.28);
      g.closePath();
      g.fillStyle = '#FF8FA8';
      g.fill();
      g.restore();
    } else {
      // 眨一只眼 + 吐舌
      g.beginPath();
      g.ellipse(-ex, ey, r * 0.10, r * 0.13, 0, 0, 7);
      g.fillStyle = ink;
      g.fill();
      g.beginPath();
      g.moveTo(ex - r * 0.13, ey);
      g.quadraticCurveTo(ex, ey - r * 0.06, ex + r * 0.13, ey);
      g.lineWidth = Math.max(1.8, r * 0.09);
      g.strokeStyle = ink;
      g.stroke();
      g.beginPath();
      g.moveTo(-r * 0.16, r * 0.26);
      g.quadraticCurveTo(0, r * 0.40, r * 0.16, r * 0.26);
      g.lineWidth = Math.max(1.6, r * 0.085);
      g.stroke();
      g.beginPath();
      g.ellipse(r * 0.06, r * 0.42, r * 0.10, r * 0.08, 0, 0, 7);
      g.fillStyle = '#FF8FA8';
      g.fill();
      g.lineWidth = Math.max(1.2, r * 0.05);
      g.strokeStyle = ink;
      g.stroke();
    }

    // 腮红
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * r * 0.56, r * 0.26, r * 0.14, r * 0.09, 0, 0, 7);
      g.fillStyle = 'rgba(255,120,150,.42)';
      g.fill();
    }
  }

  function drawPumpkin(g, x, y, r, face, squash, hasHat) {
    g.save();
    g.translate(x, y);
    g.scale(1, squash || 1);
    g.lineJoin = 'round';

    if (hasHat !== false) drawHat(g, r);

    // 身体
    const grad = g.createRadialGradient(-r * 0.32, -r * 0.38, r * 0.12, 0, 0, r * 1.18);
    grad.addColorStop(0, '#FFCB8C');
    grad.addColorStop(0.55, '#FF9F45');
    grad.addColorStop(1, '#EE6C28');
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
    g.fillStyle = grad;
    g.fill();

    // 南瓜纹
    g.save();
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
    g.clip();
    g.strokeStyle = 'rgba(150,60,10,.16)';
    g.lineWidth = r * 0.11;
    g.beginPath();
    g.moveTo(-r * 0.34, -r * 0.96);
    g.quadraticCurveTo(-r * 0.56, 0, -r * 0.34, r * 0.96);
    g.moveTo(r * 0.34, -r * 0.96);
    g.quadraticCurveTo(r * 0.56, 0, r * 0.34, r * 0.96);
    g.stroke();
    // 高光
    g.beginPath();
    g.ellipse(-r * 0.36, -r * 0.44, r * 0.26, r * 0.15, -0.55, 0, 7);
    g.fillStyle = 'rgba(255,255,255,.42)';
    g.fill();
    g.restore();

    // 描边
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
    g.lineWidth = Math.max(2, r * 0.1);
    g.strokeStyle = PAL.ink;
    g.stroke();

    if (face >= 0) drawFace(g, r, face | 0);
    g.restore();
  }
  PP.drawPumpkin = drawPumpkin;

  /* ---------- 小兔子（主角） ---------- */
  function drawBunnyFace(g, r, face) {
    const ink = PAL.ink;
    const ey = -r * 0.06;
    const ex = r * 0.30;
    g.strokeStyle = ink;
    g.fillStyle = ink;
    g.lineCap = 'round';
    g.lineJoin = 'round';

    if (face === 0) {
      // 豆豆眼 + 粉鼻子 + w 嘴 + 小门牙
      for (const s of [-1, 1]) {
        g.beginPath();
        g.ellipse(s * ex, ey, r * 0.10, r * 0.125, 0, 0, 7);
        g.fill();
      }
      g.beginPath();
      g.moveTo(-r * 0.075, r * 0.16);
      g.quadraticCurveTo(0, r * 0.10, r * 0.075, r * 0.16);
      g.quadraticCurveTo(0, r * 0.27, -r * 0.075, r * 0.16);
      g.closePath();
      g.fillStyle = '#FF8FA8';
      g.fill();

      g.beginPath();
      g.moveTo(0, r * 0.25);
      g.lineTo(0, r * 0.31);
      g.quadraticCurveTo(-r * 0.07, r * 0.40, -r * 0.13, r * 0.31);
      g.moveTo(0, r * 0.31);
      g.quadraticCurveTo(r * 0.07, r * 0.40, r * 0.13, r * 0.31);
      g.lineWidth = Math.max(1.3, r * 0.055);
      g.strokeStyle = ink;
      g.stroke();

      // 门牙
      rr(g, -r * 0.085, r * 0.42, r * 0.17, r * 0.16, r * 0.045);
      g.fillStyle = '#FFFDF7';
      g.fill();
      g.lineWidth = Math.max(1, r * 0.038);
      g.stroke();
      g.beginPath();
      g.moveTo(0, r * 0.43);
      g.lineTo(0, r * 0.57);
      g.lineWidth = Math.max(0.8, r * 0.028);
      g.stroke();
    } else if (face === 1) {
      // 大圆眼 + 小 O 嘴
      for (const s of [-1, 1]) {
        g.beginPath();
        g.arc(s * ex, ey, r * 0.155, 0, 7);
        g.fillStyle = '#FFFDF7';
        g.fill();
        g.lineWidth = Math.max(1.3, r * 0.07);
        g.strokeStyle = ink;
        g.stroke();
        g.beginPath();
        g.arc(s * ex + s * r * 0.02, ey + r * 0.02, r * 0.085, 0, 7);
        g.fillStyle = ink;
        g.fill();
        g.beginPath();
        g.arc(s * ex - r * 0.03, ey - r * 0.05, r * 0.028, 0, 7);
        g.fillStyle = '#FFFDF7';
        g.fill();
      }
      g.beginPath();
      g.ellipse(0, r * 0.29, r * 0.075, r * 0.10, 0, 0, 7);
      g.fillStyle = ink;
      g.fill();
    } else if (face === 2) {
      // ^^ 眼 + 大笑
      g.lineWidth = Math.max(1.7, r * 0.09);
      g.strokeStyle = ink;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * ex - r * 0.13, ey + r * 0.04);
        g.quadraticCurveTo(s * ex, ey - r * 0.14, s * ex + r * 0.13, ey + r * 0.04);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(-r * 0.22, r * 0.18);
      g.quadraticCurveTo(0, r * 0.52, r * 0.22, r * 0.18);
      g.closePath();
      g.fillStyle = '#5B2338';
      g.fill();
      g.lineWidth = Math.max(1.3, r * 0.06);
      g.stroke();
      g.save();
      g.beginPath();
      g.moveTo(-r * 0.15, r * 0.27);
      g.quadraticCurveTo(0, r * 0.40, r * 0.15, r * 0.27);
      g.closePath();
      g.fillStyle = '#FF8FA8';
      g.fill();
      g.restore();
    } else if (face === 3) {
      // 眨眼 + 小舌头
      g.beginPath();
      g.ellipse(-ex, ey, r * 0.10, r * 0.125, 0, 0, 7);
      g.fillStyle = ink;
      g.fill();
      g.beginPath();
      g.moveTo(ex - r * 0.12, ey);
      g.quadraticCurveTo(ex, ey - r * 0.06, ex + r * 0.12, ey);
      g.lineWidth = Math.max(1.7, r * 0.085);
      g.strokeStyle = ink;
      g.stroke();

      g.beginPath();
      g.ellipse(0, r * 0.20, r * 0.065, r * 0.055, 0, 0, 7);
      g.fillStyle = '#FF8FA8';
      g.fill();

      g.beginPath();
      g.moveTo(-r * 0.10, r * 0.30);
      g.quadraticCurveTo(0, r * 0.42, r * 0.10, r * 0.30);
      g.lineWidth = Math.max(1.3, r * 0.055);
      g.strokeStyle = ink;
      g.stroke();
      g.beginPath();
      g.ellipse(r * 0.045, r * 0.42, r * 0.075, r * 0.06, 0, 0, 7);
      g.fillStyle = '#FF8FA8';
      g.fill();
      g.lineWidth = Math.max(1, r * 0.04);
      g.stroke();
    } else if (face === 10) {
      // 睡着：闭眼弧线
      g.lineWidth = Math.max(1.8, r * 0.08);
      g.strokeStyle = ink;
      for (const s of [-1, 1]) {
        g.beginPath();
        g.moveTo(s * ex - r * 0.12, ey);
        g.quadraticCurveTo(s * ex, ey + r * 0.13, s * ex + r * 0.12, ey);
        g.stroke();
      }
      g.beginPath();
      g.ellipse(0, r * 0.24, r * 0.06, r * 0.05, 0, 0, 7);
      g.fillStyle = '#FF8FA8';
      g.fill();
      g.beginPath();
      g.ellipse(0, r * 0.37, r * 0.05, r * 0.04, 0, 0, 7);
      g.fillStyle = ink;
      g.fill();
    } else if (face === 11) {
      // 星星眼
      for (const s of [-1, 1]) {
        starPath(g, s * ex, ey, r * 0.18, r * 0.08, 0);
        g.fillStyle = '#FFD166';
        g.fill();
        g.lineWidth = Math.max(1.3, r * 0.055);
        g.strokeStyle = ink;
        g.stroke();
      }
      g.beginPath();
      g.moveTo(-r * 0.16, r * 0.28);
      g.quadraticCurveTo(0, r * 0.46, r * 0.16, r * 0.28);
      g.closePath();
      g.fillStyle = '#5B2338';
      g.fill();
      g.lineWidth = Math.max(1.2, r * 0.05);
      g.strokeStyle = ink;
      g.stroke();
    } else {
      // 默认：微笑
      for (const s of [-1, 1]) {
        g.beginPath();
        g.ellipse(s * ex, ey, r * 0.10, r * 0.125, 0, 0, 7);
        g.fillStyle = ink;
        g.fill();
      }
    }

    // 腮红
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * r * 0.60, r * 0.24, r * 0.135, r * 0.085, 0, 0, 7);
      g.fillStyle = 'rgba(255,130,165,.45)';
      g.fill();
    }
  }

  function drawBunny(g, x, y, r, face, squash, hasHat) {
    g.save();
    g.translate(x, y);
    g.scale(1, squash || 1);
    g.lineJoin = 'round';
    const ink = PAL.ink;
    const lw = Math.max(2, r * 0.10);

    // 长耳朵（画在头后面）
    for (const s of [-1, 1]) {
      g.save();
      g.translate(s * r * 0.50, -r * 0.62);
      g.rotate(s * 0.17);
      g.beginPath();
      g.ellipse(0, -r * 0.72, r * 0.195, r * 0.80, 0, 0, 7);
      g.fillStyle = '#FFF8F0';
      g.fill();
      g.lineWidth = lw;
      g.strokeStyle = ink;
      g.stroke();
      g.beginPath();
      g.ellipse(0, -r * 0.70, r * 0.088, r * 0.56, 0, 0, 7);
      g.fillStyle = '#FFC4D6';
      g.fill();
      g.restore();
    }

    // 头
    const grad = g.createRadialGradient(-r * 0.30, -r * 0.40, r * 0.10, 0, 0, r * 1.18);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.58, '#FFF5E9');
    grad.addColorStop(1, '#F1DCC6');
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
    g.fillStyle = grad;
    g.fill();

    g.save();
    g.beginPath();
    g.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
    g.clip();
    g.beginPath();
    g.ellipse(-r * 0.36, -r * 0.46, r * 0.27, r * 0.15, -0.55, 0, 7);
    g.fillStyle = 'rgba(255,255,255,.85)';
    g.fill();
    g.restore();

    g.beginPath();
    g.ellipse(0, 0, r, r * 0.94, 0, 0, Math.PI * 2);
    g.lineWidth = lw;
    g.strokeStyle = ink;
    g.stroke();

    drawBunnyFace(g, r, face | 0);

    // 帽子（戴在头上，会压住一点额头和耳根）
    if (hasHat !== false) {
      g.save();
      g.translate(0, -r * 0.14);
      drawHat(g, r * 0.90);
      g.restore();
    }

    // 小爪爪（抓着糖袋）
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * r * 0.80, r * 0.70, r * 0.155, r * 0.125, s * 0.22, 0, 7);
      g.fillStyle = '#FFF8F0';
      g.fill();
      g.lineWidth = lw * 0.85;
      g.strokeStyle = ink;
      g.stroke();
    }

    g.restore();
  }
  PP.drawBunny = drawBunny;

  /* ---------- 胡萝卜 ---------- */
  function drawCarrot(g) {
    const ink = PAL.ink;

    // 叶子
    for (const s of [-1, 0, 1]) {
      g.save();
      g.translate(s * 5, -11);
      g.rotate(s * 0.44);
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(-3.6, -8, 0, -15);
      g.quadraticCurveTo(3.6, -8, 0, 0);
      g.closePath();
      g.fillStyle = '#63C48E';
      g.fill();
      g.lineWidth = 2.2;
      g.strokeStyle = ink;
      g.stroke();
      g.restore();
    }

    // 根
    g.beginPath();
    g.moveTo(-9, -10);
    g.quadraticCurveTo(-11.5, 6, 0, 21);
    g.quadraticCurveTo(11.5, 6, 9, -10);
    g.quadraticCurveTo(0, -15, -9, -10);
    g.closePath();
    g.fillStyle = '#FF9A3D';
    g.fill();
    g.lineWidth = 2.6;
    g.strokeStyle = ink;
    g.stroke();

    g.strokeStyle = 'rgba(180,80,20,.32)';
    g.lineWidth = 1.6;
    for (const y of [-2, 5]) {
      g.beginPath();
      g.moveTo(-6.6, y);
      g.lineTo(-1.6, y + 2.2);
      g.stroke();
    }

    g.beginPath();
    g.ellipse(-4.4, -2, 2.2, 6, 0.22, 0, 7);
    g.fillStyle = 'rgba(255,255,255,.45)';
    g.fill();
  }
  function drawBag(g, x, yTop, w, h) {
    const w2 = w / 2;
    g.save();
    g.lineJoin = 'round';
    g.lineWidth = Math.max(2.5, w * 0.045);
    g.strokeStyle = PAL.ink;

    g.beginPath();
    g.moveTo(x - w2, yTop);
    g.quadraticCurveTo(x - w2 - w * 0.06, yTop + h * 0.72, x - w2 * 0.58, yTop + h);
    g.quadraticCurveTo(x, yTop + h * 1.10, x + w2 * 0.58, yTop + h);
    g.quadraticCurveTo(x + w2 + w * 0.06, yTop + h * 0.72, x + w2, yTop);
    g.closePath();
    g.fillStyle = '#FFF1DC';
    g.fill();
    g.stroke();

    // 袋口
    g.beginPath();
    g.ellipse(x, yTop, w2, h * 0.16, 0, 0, 7);
    g.fillStyle = '#E6CBB2';
    g.fill();
    g.stroke();

    // 紫色边条
    g.save();
    g.beginPath();
    g.moveTo(x - w2, yTop);
    g.quadraticCurveTo(x - w2 - w * 0.06, yTop + h * 0.72, x - w2 * 0.58, yTop + h);
    g.quadraticCurveTo(x, yTop + h * 1.10, x + w2 * 0.58, yTop + h);
    g.quadraticCurveTo(x + w2 + w * 0.06, yTop + h * 0.72, x + w2, yTop);
    g.closePath();
    g.clip();
    g.fillStyle = '#8A67C9';
    g.fillRect(x - w2, yTop + h * 0.34, w, h * 0.10);
    g.restore();

    // 一颗小星星
    g.save();
    g.translate(x + w * 0.18, yTop + h * 0.62);
    starPath(g, 0, 0, w * 0.075, w * 0.033, 0.2);
    g.fillStyle = PAL.gold;
    g.fill();
    g.lineWidth = Math.max(1, w * 0.014);
    g.strokeStyle = PAL.ink;
    g.stroke();
    g.restore();
    g.restore();
  }
  PP.drawBag = drawBag;

  /* =========================================================
     兔子贴纸（奖励图）
     ========================================================= */
  const STICKERS = [
    { cn: '抱糖兔', th: 'กระต่ายถือลูกอม', bg: '#FFE3EC' },
    { cn: '胡萝卜兔', th: 'กระต่ายกินแครอท', bg: '#FFF0D2' },
    { cn: '南瓜帽兔', th: 'กระต่ายหมวกฟักทอง', bg: '#FFE7D2' },
    { cn: '星星眼兔', th: 'กระต่ายตาดาว', bg: '#E9E2FF' },
    { cn: '睡觉兔', th: 'กระต่ายหลับ', bg: '#E2F1FF' },
    { cn: '巫师兔', th: 'กระต่ายแม่มด', bg: '#EDE4FF' },
    { cn: '招手兔', th: 'กระต่ายโบกมือ', bg: '#E1F7EE' },
    { cn: '皇冠兔', th: 'กระต่ายมงกุฎ', bg: '#FFF3C9' },
    { cn: '出差兔', th: 'กระต่ายเดินทาง', bg: '#DFF0FF' }
  ];
  PP.STICKERS = STICKERS;

  const STICKER_FACE = [0, 0, 2, 11, 10, 1, 2, 0, 0];

  function drawCrown(g, x, y, w) {
    g.save();
    g.translate(x, y);
    g.beginPath();
    g.moveTo(-w * 0.5, 0);
    g.lineTo(-w * 0.5, -w * 0.34);
    g.lineTo(-w * 0.24, -w * 0.12);
    g.lineTo(0, -w * 0.46);
    g.lineTo(w * 0.24, -w * 0.12);
    g.lineTo(w * 0.5, -w * 0.34);
    g.lineTo(w * 0.5, 0);
    g.closePath();
    g.fillStyle = PAL.gold;
    g.fill();
    g.lineWidth = w * 0.055;
    g.strokeStyle = PAL.ink;
    g.lineJoin = 'round';
    g.stroke();
    g.beginPath();
    g.arc(0, -w * 0.08, w * 0.065, 0, 7);
    g.fillStyle = '#FF5C93';
    g.fill();
    g.lineWidth = w * 0.025;
    g.stroke();
    g.restore();
  }

  PP.drawSticker = function (g, i, S) {
    const sd = STICKERS[i] || STICKERS[0];
    const R = S * 0.47;
    const r = S * 0.225;
    const cy = S * 0.05;

    g.save();

    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.fillStyle = sd.bg;
    g.fill();

    g.save();
    g.beginPath();
    g.arc(0, 0, R, 0, Math.PI * 2);
    g.clip();

    g.globalAlpha = 0.4;
    g.fillStyle = '#FFFFFF';
    for (let k = 0; k < 7; k++) {
      const a = k * 0.9 + 0.35;
      g.beginPath();
      g.arc(Math.cos(a) * R * 0.8, Math.sin(a) * R * 0.8, S * 0.016, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;

    if (i === 5) {
      g.save();
      g.translate(r * 1.02, r * 0.62);
      g.rotate(0.5);
      rr(g, -r * 0.05, -r * 0.9, r * 0.10, r * 1.75, r * 0.05);
      g.fillStyle = '#D2A06E';
      g.fill();
      g.lineWidth = r * 0.055;
      g.strokeStyle = PAL.ink;
      g.stroke();
      starPath(g, 0, -r * 1.0, r * 0.24, r * 0.11, 0);
      g.fillStyle = PAL.gold;
      g.fill();
      g.stroke();
      g.restore();
    }

    drawBunny(g, 0, cy, r, STICKER_FACE[i] == null ? 0 : STICKER_FACE[i], 1, i === 5);

    if (i === 0) {
      g.save();
      g.translate(r * 0.72, r * 0.66);
      g.rotate(-0.3);
      const k = r / 34;
      g.scale(k, k);
      drawCandy(g, CANDY[0]);
      g.restore();
      g.save();
      g.translate(-r * 0.74, r * 0.64);
      g.rotate(0.28);
      const k2 = r / 40;
      g.scale(k2, k2);
      drawCandy(g, CANDY[1]);
      g.restore();
    } else if (i === 1) {
      g.save();
      g.translate(r * 0.60, r * 0.72);
      g.rotate(0.42);
      const k = r / 30;
      g.scale(k, k);
      drawCarrot(g);
      g.restore();
    } else if (i === 2) {
      drawPumpkin(g, 0, -r * 1.02, r * 0.40, 0, 1, false);
    } else if (i === 3) {
      for (const p of [[-0.95, -0.55], [0.98, -0.42], [-0.75, 0.72], [0.82, 0.68]]) {
        g.save();
        g.translate(p[0] * r, p[1] * r);
        starPath(g, 0, 0, r * 0.20, r * 0.085, 0.2);
        g.fillStyle = PAL.gold;
        g.fill();
        g.lineWidth = r * 0.045;
        g.strokeStyle = PAL.ink;
        g.stroke();
        g.restore();
      }
    } else if (i === 4) {
      g.save();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = 'rgba(90,120,170,.8)';
      const zs = [[0.92, -0.88, 0.46], [1.16, -1.22, 0.34], [1.34, -1.52, 0.26]];
      for (const z of zs) {
        g.save();
        g.translate(r * z[0], r * z[1]);
        g.rotate(0.2);
        g.font = '900 ' + (r * z[2]).toFixed(1) + 'px "PingFang SC",system-ui,sans-serif';
        g.fillText('z', 0, 0);
        g.restore();
      }
      g.restore();
    } else if (i === 6) {
      g.save();
      g.translate(r * 0.98, -r * 0.36);
      g.rotate(-0.3);
      g.beginPath();
      g.ellipse(0, 0, r * 0.15, r * 0.19, 0, 0, 7);
      g.fillStyle = '#FFF8F0';
      g.fill();
      g.lineWidth = r * 0.075;
      g.strokeStyle = PAL.ink;
      g.stroke();
      g.restore();

      const hx = r * 1.22, hy = -r * 0.86;
      g.beginPath();
      g.moveTo(hx, hy + r * 0.16);
      g.bezierCurveTo(hx - r * 0.30, hy - r * 0.05, hx - r * 0.12, hy - r * 0.28, hx, hy - r * 0.08);
      g.bezierCurveTo(hx + r * 0.12, hy - r * 0.28, hx + r * 0.30, hy - r * 0.05, hx, hy + r * 0.16);
      g.fillStyle = '#FF6FA0';
      g.fill();
      g.lineWidth = r * 0.05;
      g.strokeStyle = PAL.ink;
      g.stroke();
    } else if (i === 7) {
      drawCrown(g, 0, -r * 0.98, r * 1.02);
    } else if (i === 8) {
      // 行李箱
      g.save();
      g.translate(r * 0.86, r * 0.86);
      rr(g, -r * 0.44, -r * 0.34, r * 0.88, r * 0.64, r * 0.12);
      g.fillStyle = '#6FE3C4';
      g.fill();
      g.lineWidth = r * 0.065;
      g.strokeStyle = PAL.ink;
      g.stroke();
      // 提手
      g.beginPath();
      g.moveTo(-r * 0.17, -r * 0.34);
      g.lineTo(-r * 0.17, -r * 0.52);
      g.lineTo(r * 0.17, -r * 0.52);
      g.lineTo(r * 0.17, -r * 0.34);
      g.lineWidth = r * 0.075;
      g.stroke();
      // 箱贴
      g.beginPath();
      g.arc(-r * 0.14, r * 0.02, r * 0.10, 0, 7);
      g.fillStyle = PAL.gold;
      g.fill();
      g.lineWidth = r * 0.03;
      g.stroke();
      g.beginPath();
      g.arc(r * 0.16, r * 0.12, r * 0.065, 0, 7);
      g.fillStyle = '#FF7A9C';
      g.fill();
      g.restore();

      // 一架小飞机
      g.save();
      g.translate(-r * 0.95, -r * 1.05);
      g.rotate(-0.25);
      g.beginPath();
      g.moveTo(-r * 0.26, 0);
      g.lineTo(r * 0.24, -r * 0.10);
      g.lineTo(r * 0.02, r * 0.04);
      g.lineTo(r * 0.10, r * 0.18);
      g.lineTo(-r * 0.02, r * 0.10);
      g.lineTo(-r * 0.10, r * 0.20);
      g.lineTo(-r * 0.10, r * 0.06);
      g.closePath();
      g.fillStyle = '#FFF6E9';
      g.fill();
      g.lineWidth = r * 0.05;
      g.strokeStyle = PAL.ink;
      g.stroke();
      g.restore();
    }

    g.restore();
    g.restore();
  };

  /* =========================================================
     背景
     ========================================================= */
  let bgCache = null;

  function buildBG(W, H, DPR) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(W * DPR));
    c.height = Math.max(1, Math.round(H * DPR));
    const g = c.getContext('2d');
    g.scale(DPR, DPR);
    g.lineJoin = 'round';

    // 夜空
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#241639');
    sky.addColorStop(0.28, '#3E2A63');
    sky.addColorStop(0.55, '#6B4A9E');
    sky.addColorStop(0.76, '#B4739F');
    sky.addColorStop(0.90, '#F2A98F');
    sky.addColorStop(1, '#FFC9A8');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // 月亮 / 深夜台灯
    const mx = W * 0.79, my = H * 0.115, mr = Math.max(26, W * 0.115);
    if (PP.nightMode) {
      // 深夜：把月亮换成吊灯
      const shadeW = mr * 1.5;
      g.save();
      // 灯线
      g.strokeStyle = '#2E1F4F';
      g.lineWidth = Math.max(2, mr * 0.08);
      g.beginPath();
      g.moveTo(mx, -10);
      g.lineTo(mx, my - mr * 0.55);
      g.stroke();
      // 灯光晕
      const lg = g.createRadialGradient(mx, my + mr * 0.2, mr * 0.2, mx, my + mr * 0.3, mr * 4.2);
      lg.addColorStop(0, 'rgba(255,214,130,.55)');
      lg.addColorStop(0.35, 'rgba(255,206,120,.20)');
      lg.addColorStop(1, 'rgba(255,206,120,0)');
      g.fillStyle = lg;
      g.beginPath();
      g.arc(mx, my + mr * 0.3, mr * 4.2, 0, 7);
      g.fill();
      // 灯罩
      g.beginPath();
      g.moveTo(mx - shadeW * 0.34, my - mr * 0.72);
      g.lineTo(mx + shadeW * 0.34, my - mr * 0.72);
      g.lineTo(mx + shadeW * 0.5, my + mr * 0.16);
      g.lineTo(mx - shadeW * 0.5, my + mr * 0.16);
      g.closePath();
      g.fillStyle = '#FFD79A';
      g.fill();
      g.lineWidth = Math.max(2, mr * 0.08);
      g.strokeStyle = '#2B1B3D';
      g.stroke();
      // 灯罩沿口
      g.beginPath();
      g.moveTo(mx - shadeW * 0.5, my + mr * 0.16);
      g.lineTo(mx + shadeW * 0.5, my + mr * 0.16);
      g.lineWidth = Math.max(3, mr * 0.16);
      g.strokeStyle = '#F2A65A';
      g.stroke();
      // 灯泡
      g.beginPath();
      g.arc(mx, my + mr * 0.30, mr * 0.20, 0, 7);
      g.fillStyle = '#FFF3C9';
      g.fill();
      g.restore();
    } else {
      const glow = g.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 3.6);
      glow.addColorStop(0, 'rgba(255,236,190,.42)');
      glow.addColorStop(0.45, 'rgba(255,220,170,.14)');
      glow.addColorStop(1, 'rgba(255,220,170,0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(mx, my, mr * 3.6, 0, 7);
      g.fill();

      g.beginPath();
      g.arc(mx, my, mr, 0, 7);
      g.fillStyle = '#FFF0C4';
      g.fill();
      // 月亮的睡脸
      g.strokeStyle = 'rgba(120,90,60,.45)';
      g.lineWidth = Math.max(1.4, mr * 0.055);
      g.beginPath();
      g.arc(mx - mr * 0.32, my - mr * 0.05, mr * 0.16, 0.35, Math.PI - 0.35);
      g.stroke();
      g.beginPath();
      g.arc(mx + mr * 0.30, my - mr * 0.05, mr * 0.16, 0.35, Math.PI - 0.35);
      g.stroke();
      g.beginPath();
      g.arc(mx + mr * 0.02, my + mr * 0.30, mr * 0.16, 0.35, Math.PI - 0.35);
      g.stroke();
      // 麻子
      g.fillStyle = 'rgba(210,180,120,.35)';
      g.beginPath(); g.arc(mx - mr * 0.5, my + mr * 0.1, mr * 0.09, 0, 7); g.fill();
      g.beginPath(); g.arc(mx + mr * 0.45, my + mr * 0.42, mr * 0.07, 0, 7); g.fill();
    }

    // 曼谷天际线（远景剪影 + BTS 高架）
    g.save();
    g.globalAlpha = 0.92;
    g.fillStyle = '#3A2457';
    const skyBase = H * 0.782;
    const bld = (bx, bw, bh) => g.fillRect(bx - bw / 2, skyBase - bh, bw, bh);
    bld(W * 0.045, W * 0.040, H * 0.030);
    bld(W * 0.098, W * 0.026, H * 0.048);
    bld(W * 0.142, W * 0.050, H * 0.022);
    bld(W * 0.205, W * 0.034, H * 0.038);
    bld(W * 0.255, W * 0.022, H * 0.058);
    bld(W * 0.300, W * 0.046, H * 0.026);
    g.fillRect(W * 0.352 - W * 0.012, skyBase - H * 0.082, W * 0.024, H * 0.082);
    g.fillRect(W * 0.352 - W * 0.004, skyBase - H * 0.100, W * 0.008, H * 0.020);
    bld(W * 0.400, W * 0.038, H * 0.034);
    bld(W * 0.452, W * 0.028, H * 0.050);
    // 像素大厦（MahaNakhon 那种积木感）
    bld(W * 0.560, W * 0.056, H * 0.062);
    g.fillRect(W * 0.560 + W * 0.012, skyBase - H * 0.078, W * 0.020, H * 0.018);
    g.fillRect(W * 0.560 - W * 0.030, skyBase - H * 0.046, W * 0.018, H * 0.016);
    bld(W * 0.640, W * 0.034, H * 0.040);
    bld(W * 0.690, W * 0.048, H * 0.024);
    bld(W * 0.742, W * 0.026, H * 0.046);
    bld(W * 0.800, W * 0.044, H * 0.028);
    bld(W * 0.860, W * 0.030, H * 0.040);
    bld(W * 0.925, W * 0.052, H * 0.022);

    g.fillStyle = 'rgba(255,214,140,.5)';
    const ws = mulberry32(88);
    for (let i = 0; i < 40; i++) {
      const wx = W * (0.03 + ws() * 0.94);
      const wy = skyBase - H * (0.006 + ws() * 0.070);
      g.fillRect(wx, wy, Math.max(1.5, W * 0.004), Math.max(1.5, W * 0.004));
    }

    // BTS 高架
    g.fillStyle = '#3A2457';
    const btsY = skyBase - H * 0.030;
    g.fillRect(0, btsY, W * 0.30, H * 0.008);
    for (let i = 0; i < 5; i++) {
      g.fillRect(W * (0.012 + i * 0.062), btsY, W * 0.010, H * 0.030);
    }
    g.restore();

    // 远山
    g.beginPath();
    g.moveTo(0, H * 0.735);
    g.bezierCurveTo(W * 0.18, H * 0.685, W * 0.30, H * 0.775, W * 0.48, H * 0.745);
    g.bezierCurveTo(W * 0.64, H * 0.718, W * 0.74, H * 0.79, W * 0.88, H * 0.755);
    g.bezierCurveTo(W * 0.94, H * 0.738, W * 0.98, H * 0.75, W, H * 0.745);
    g.lineTo(W, H); g.lineTo(0, H); g.closePath();
    g.fillStyle = '#4A2F6B';
    g.fill();

    // 近山
    g.beginPath();
    g.moveTo(0, H * 0.845);
    g.bezierCurveTo(W * 0.22, H * 0.80, W * 0.36, H * 0.875, W * 0.56, H * 0.85);
    g.bezierCurveTo(W * 0.75, H * 0.828, W * 0.86, H * 0.885, W, H * 0.855);
    g.lineTo(W, H); g.lineTo(0, H); g.closePath();
    g.fillStyle = '#34204C';
    g.fill();

    // 远山上的棒棒糖树
    function lolliTree(tx, ty, s, col, alpha) {
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = col;
      g.lineWidth = s * 0.16;
      g.beginPath();
      g.moveTo(tx, ty);
      g.lineTo(tx, ty - s * 1.05);
      g.stroke();
      g.beginPath();
      g.arc(tx, ty - s * 1.35, s * 0.52, 0, 7);
      g.fillStyle = col;
      g.fill();
      g.globalAlpha = alpha * 0.5;
      g.strokeStyle = '#2E1F4F';
      g.lineWidth = s * 0.10;
      g.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.15) {
        const rad = s * 0.07 + a * s * 0.06;
        const px = tx + Math.cos(a) * rad;
        const py = ty - s * 1.35 + Math.sin(a) * rad;
        a === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
      }
      g.stroke();
      g.restore();
    }
    lolliTree(W * 0.10, H * 0.752, W * 0.05, '#6B4A9E', 0.95);
    lolliTree(W * 0.20, H * 0.778, W * 0.035, '#6B4A9E', 0.85);
    lolliTree(W * 0.90, H * 0.768, W * 0.045, '#6B4A9E', 0.9);

    // 小山屋
    function house(hx, hy, s) {
      g.save();
      g.fillStyle = '#3A2457';
      g.beginPath();
      g.rect(hx - s * 0.5, hy - s * 0.85, s, s * 0.85);
      g.fill();
      g.beginPath();
      g.moveTo(hx - s * 0.66, hy - s * 0.85);
      g.lineTo(hx, hy - s * 1.6);
      g.lineTo(hx + s * 0.66, hy - s * 0.85);
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(255,214,130,.85)';
      g.fillRect(hx - s * 0.18, hy - s * 0.6, s * 0.36, s * 0.30);
      g.restore();
    }
    house(W * 0.31, H * 0.788, W * 0.045);
    house(W * 0.72, H * 0.795, W * 0.038);


    // 星星
    const rs = mulberry32(20261031);
    g.globalAlpha = 1;
    for (let i = 0; i < 46; i++) {
      const x = rs() * W;
      const y = rs() * H * 0.62;
      const s = 0.7 + rs() * 1.7;
      const a = 0.25 + rs() * 0.6;
      g.globalAlpha = a;
      g.fillStyle = i % 7 === 0 ? '#FFD166' : '#FFF6E9';
      g.beginPath();
      g.arc(x, y, s, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;

    // 远处的小蝙蝠剪影
    function silhouetteBat(bx, by, s) {
      g.save();
      g.globalAlpha = 0.35;
      g.fillStyle = '#2E1F4F';
      g.beginPath();
      g.ellipse(bx, by, s * 0.28, s * 0.30, 0, 0, 7);
      g.fill();
      for (const d of [-1, 1]) {
        g.beginPath();
        g.moveTo(bx + d * s * 0.2, by - s * 0.1);
        g.quadraticCurveTo(bx + d * s * 0.9, by - s * 0.55, bx + d * s * 1.05, by + s * 0.1);
        g.quadraticCurveTo(bx + d * s * 0.75, by + s * 0.05, bx + d * s * 0.62, by + s * 0.42);
        g.quadraticCurveTo(bx + d * s * 0.4, by + s * 0.18, bx + d * s * 0.2, by + s * 0.3);
        g.closePath();
        g.fill();
      }
      g.restore();
    }
    silhouetteBat(W * 0.22, H * 0.20, W * 0.06);
    silhouetteBat(W * 0.63, H * 0.31, W * 0.042);
    silhouetteBat(W * 0.86, H * 0.42, W * 0.032);

    return c;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const twinkles = [];
  function initTwinkles(W, H) {
    twinkles.length = 0;
    const rs = mulberry32(777);
    for (let i = 0; i < 16; i++) {
      twinkles.push({
        x: rs() * W,
        y: rs() * H * 0.55,
        s: 1.6 + rs() * 3.2,
        p: rs() * 6.28,
        sp: 0.6 + rs() * 1.4
      });
    }
  }

  PP.drawBackground = function (ctx, W, H, t, fever, DPR) {
    if (!bgCache || bgCache.W !== W || bgCache.H !== H || bgCache.dpr !== DPR) {
      bgCache = { c: buildBG(W, H, DPR), W, H, dpr: DPR };
      initTwinkles(W, H);
    }
    ctx.drawImage(bgCache.c, 0, 0, W, H);

    // 闪烁的星
    for (let i = 0; i < twinkles.length; i++) {
      const s = twinkles[i];
      const k = (Math.sin(t * s.sp + s.p) + 1) / 2;
      const a = 0.15 + k * 0.75;
      const r = s.s * (0.6 + k * 0.6);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#FFF6E9';
      ctx.translate(s.x, s.y);
      ctx.beginPath();
      ctx.moveTo(0, -r * 2.4);
      ctx.quadraticCurveTo(0, 0, r * 2.4, 0);
      ctx.quadraticCurveTo(0, 0, 0, r * 2.4);
      ctx.quadraticCurveTo(0, 0, -r * 2.4, 0);
      ctx.quadraticCurveTo(0, 0, 0, -r * 2.4);
      ctx.fill();
      ctx.restore();
    }

    // 飘浮的糖屑
    ctx.save();
    for (let i = 0; i < 14; i++) {
      const seed = i * 137.5;
      const sp = 9 + (i % 5) * 4;
      const y = H - (((t * sp + seed * 0.9) % (H * 1.15)));
      const x = (seed * 3.1) % W + Math.sin(t * 0.8 + i) * 12;
      const r = 1.2 + (i % 3) * 0.9;
      ctx.globalAlpha = 0.10 + (i % 4) * 0.05;
      ctx.fillStyle = i % 3 === 0 ? '#FFD166' : '#FFE6F0';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7);
      ctx.fill();
    }
    ctx.restore();

    // 狂欢模式色调
    if (fever) {
      const g2 = ctx.createRadialGradient(W * 0.5, H * 0.72, H * 0.05, W * 0.5, H * 0.72, H * 0.9);
      g2.addColorStop(0, 'rgba(255,105,180,.40)');
      g2.addColorStop(0.55, 'rgba(255,110,190,.18)');
      g2.addColorStop(1, 'rgba(120,60,190,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = 0.10 + Math.sin(t * 6) * 0.03;
      ctx.fillStyle = '#FF7AB8';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  };

  /* ---------- 精灵预热 ---------- */
  PP.initArt = function () {
    const sp = (PP.sprites = {});
    sp.candy = CANDY.map((c) => makeSprite(68, (g) => drawCandy(g, c)));
    sp.lolli = CANDY.slice(0, 3).map((c) => makeSprite(66, (g) => drawLolli(g, c)));
    sp.star = makeSprite(60, drawStarSprite);
    sp.bat = makeSprite(68, drawBat);
    sp.carrot = makeSprite(64, drawCarrot);
    sp.shard = makeSprite(24, (g) => {
      rr(g, -3.5, -3.5, 7, 7, 2);
      g.fillStyle = '#fff';
      g.fill();
    });
  };
})();
