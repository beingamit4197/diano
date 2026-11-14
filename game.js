(() => {
  const cv = document.getElementById("c");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = 760, H = 230, GY = 182;
  const SKINS = [
    { b: "#38B6FF", d: "#1B8FD6", bl: "#BFE8FF", ch: "#FF8FA5" },
    { b: "#E4572E", d: "#B83A1C", bl: "#F6C4B4", ch: "#F6F3EC" },
    { b: "#3BB273", d: "#26894F", bl: "#C4EFD6", ch: "#FFB3C1" },
    { b: "#8B5CF6", d: "#6A3FD1", bl: "#DCCFFD", ch: "#FF8FA5" },
  ];
  const store =
    typeof chrome !== "undefined" && chrome.storage && chrome.storage.local
      ? chrome.storage.local
      : null;

  const DEFAULT_KEYS = {
    jumpKeys: ["Space", "ArrowUp"],
    duckKeys: ["ArrowDown"],
  };

  let jumpKeys = [...DEFAULT_KEYS.jumpKeys];
  let duckKeys = [...DEFAULT_KEYS.duckKeys];
  let soundOn = true;
  let lastScoreChime = 0;
  let duckLatched = false;

  function sfx(name) {
    if (!soundOn || !window.DinoSound) return;
    const fn = DinoSound[name];
    if (typeof fn === "function") fn.call(DinoSound);
  }

  function codeOf(e) {
    return e.code || e.key;
  }

  function isJump(e) {
    const c = codeOf(e);
    return jumpKeys.includes(c) || jumpKeys.includes(e.key);
  }

  function isDuck(e) {
    const c = codeOf(e);
    return duckKeys.includes(c) || duckKeys.includes(e.key);
  }

  function prettyKey(code) {
    const map = {
      Space: "Space",
      ArrowUp: "↑",
      ArrowDown: "↓",
      ArrowLeft: "←",
      ArrowRight: "→",
      KeyW: "W",
      KeyA: "A",
      KeyS: "S",
      KeyD: "D",
      KeyZ: "Z",
      KeyX: "X",
      KeyC: "C",
      Enter: "Enter",
      ShiftLeft: "Shift",
      ShiftRight: "Shift",
      ControlLeft: "Ctrl",
      ControlRight: "Ctrl",
    };
    if (map[code]) return map[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit\d$/.test(code)) return code.slice(5);
    return code;
  }

  function updateHint() {
    const hint = document.getElementById("hint");
    if (!hint) return;
    const j = jumpKeys.map(prettyKey).join(" / ");
    const d = duckKeys.map(prettyKey).join(" / ");
    hint.textContent = `${j} to jump · ${d} to duck · Click the game to start`;
  }

  function loadKeys(data) {
    if (Array.isArray(data.jumpKeys) && data.jumpKeys.length) jumpKeys = data.jumpKeys;
    if (Array.isArray(data.duckKeys) && data.duckKeys.length) duckKeys = data.duckKeys;
    if (typeof data.sound === "boolean") {
      soundOn = data.sound;
      if (window.DinoSound) DinoSound.setEnabled(soundOn);
    }
    updateHint();
  }

  let R = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    cv.style.aspectRatio = W + " / " + H;
    R = (cv.clientWidth / W) * dpr || dpr;
    cv.width = Math.round(W * R);
    cv.height = Math.round(H * R);
  }
  window.addEventListener("resize", resize);
  resize();

  const hx = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const mix = (a, b, t) => {
    const A = hx(a),
      B = hx(b);
    return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join() + ")";
  };
  const pad = (n) => String(Math.floor(n)).padStart(5, "0");

  let st = "ready",
    spd = 4.2,
    score = 0,
    hi = 0,
    night = 0,
    t = 0,
    y = GY,
    vy = 0;
  let duck = false,
    obs = [],
    parts = [],
    off = 0,
    gap = 220,
    dc = 0,
    skin = 0;

  const clouds = [
    { x: 60, y: 38, s: 1 },
    { x: 240, y: 66, s: 0.7 },
    { x: 430, y: 30, s: 0.9 },
    { x: 620, y: 58, s: 0.8 },
    { x: 740, y: 34, s: 1 },
  ];
  const stars = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 97) % W,
    y: (i * 53) % 90 + 8,
    r: (i % 3) * 0.4 + 0.6,
  }));
  const peb = Array.from({ length: 30 }, (_, i) => ({
    x: i * 26 + (i % 3) * 7,
    y: GY + 12 + (i % 4) * 9,
    w: 4 + (i % 3) * 4,
  }));

  if (store) {
    store.get(["hi", "skin", "jumpKeys", "duckKeys", "sound"], (r) => {
      hi = r.hi || 0;
      skin = r.skin || 0;
      loadKeys(r);
      markSkin();
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      if (changes.jumpKeys || changes.duckKeys || changes.sound) {
        store.get(["jumpKeys", "duckKeys", "sound"], loadKeys);
      }
      if (changes.hi) hi = changes.hi.newValue || 0;
      if (changes.skin) {
        skin = changes.skin.newValue || 0;
        markSkin();
      }
    });
  } else {
    updateHint();
  }

  function markSkin() {
    document.querySelectorAll(".skin").forEach((b) =>
      b.classList.toggle("on", +b.dataset.skin === skin)
    );
  }
  document.querySelectorAll(".skin").forEach((b) =>
    b.addEventListener("click", () => {
      skin = +b.dataset.skin;
      markSkin();
      if (store) store.set({ skin });
      cv.focus();
    })
  );
  markSkin();

  function dust(n) {
    for (let i = 0; i < n; i++)
      parts.push({
        x: 56 + Math.random() * 10,
        y: GY - 2,
        vx: -1 - Math.random() * 1.5,
        vy: -Math.random() * 1.4,
        l: 1,
      });
  }

  function jump() {
    if (st !== "run") {
      st = "run";
      spd = 4.2;
      score = 0;
      y = GY;
      vy = 0;
      obs = [];
      parts = [];
      gap = 260;
      lastScoreChime = 0;
      sfx("start");
      return;
    }
    if (y >= GY && !duck) {
      vy = -10.8;
      dust(6);
      sfx("jump");
    }
  }

  function update(dt) {
    t += dt;
    const tg = Math.floor(score / 400) % 2;
    night += (tg - night) * 0.02 * dt;
    const bs = st === "run" ? spd : st === "ready" ? 1.2 : 0;
    off += bs * dt;
    clouds.forEach((c) => {
      c.x -= bs * 0.2 * dt * c.s;
      if (c.x < -50) c.x = W + 40;
    });
    if (st !== "run") return;

    spd = Math.min(9, 4.2 + score / 400);
    score += spd * 0.04 * dt;
    const milestone = Math.floor(score / 100);
    if (milestone > lastScoreChime && milestone > 0) {
      lastScoreChime = milestone;
      sfx("score");
    }
    vy += (0.62 + (duck && y < GY ? 0.9 : 0)) * dt;
    y += vy * dt;
    if (y >= GY) {
      if (vy > 4) dust(5);
      y = GY;
      vy = 0;
      dc += dt;
      if (dc > 7) {
        dust(1);
        dc = 0;
      }
    }

    obs.forEach((o) => (o.x -= spd * dt));
    obs = obs.filter((o) => o.x > -60);
    const L = obs[obs.length - 1];
    if (!L || L.x < W - gap) {
      const r = Math.random();
      if (score > 120 && r < 0.25) obs.push({ k: "b", x: W + 20, y: 140, w: 24, h: 16 });
      else {
        const n = r < 0.5 ? 1 : r < 0.8 ? 2 : 3;
        obs.push({
          k: "c",
          x: W + 20,
          n,
          w: 12 + (n - 1) * 16,
          h: 30 + Math.random() * 16,
        });
      }
      gap = 190 + Math.random() * 170 + spd * 14;
    }

    const dh = duck && y >= GY ? 26 : 44;
    const db = { l: 54, r: 84, t: y - dh + 5, b: y - 3 };
    for (const o of obs) {
      const b =
        o.k === "c"
          ? { l: o.x + 3, r: o.x + o.w - 3, t: GY - o.h + 4, b: GY }
          : { l: o.x - 12, r: o.x + 12, t: o.y - 8, b: o.y + 8 };
      if (db.r > b.l && db.l < b.r && db.b > b.t && db.t < b.b) {
        st = "dead";
        sfx("hit");
        if (score > hi) {
          hi = score;
          if (store) store.set({ hi: Math.floor(hi) });
        }
        for (let i = 0; i < 14; i++)
          parts.push({
            x: 68,
            y: y - 20,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 4,
            l: 1,
          });
        break;
      }
    }
  }

  function dino(px, py, ph, mode, dk) {
    const K = SKINS[skin],
      B = K.b,
      D = K.d;
    ctx.save();
    ctx.translate(px, py);
    if (dk) ctx.scale(1.2, 0.62);
    const s = Math.sin(ph),
      c = Math.cos(ph);
    ctx.lineCap = "round";
    ctx.strokeStyle = D;
    ctx.lineWidth = 8;
    const leg = (h_, fx, fy) => {
      ctx.beginPath();
      ctx.moveTo(h_, -14);
      ctx.lineTo(fx, fy);
      ctx.stroke();
    };
    if (mode === 1) {
      leg(-6, -3, -5);
      leg(8, 12, -7);
    } else {
      leg(-6, -6 + s * 7, -Math.max(0, -c) * 5);
      leg(8, 8 - s * 7, -Math.max(0, c) * 5);
    }
    ctx.fillStyle = B;
    ctx.beginPath();
    ctx.moveTo(-12, -30);
    ctx.quadraticCurveTo(-30, -26, -34, -12);
    ctx.quadraticCurveTo(-18, -14, -8, -18);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-16, -36, 36, 26, 12);
    ctx.fill();
    ctx.fillStyle = K.bl;
    ctx.beginPath();
    ctx.ellipse(6, -18, 10, 6, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = D;
    [-10, -2, 6].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, -35);
      ctx.lineTo(x + 4, -44);
      ctx.lineTo(x + 8, -35);
      ctx.fill();
    });
    ctx.fillStyle = B;
    ctx.beginPath();
    ctx.roundRect(8, -54, 30, 26, 12);
    ctx.fill();
    ctx.fillStyle = K.ch;
    ctx.beginPath();
    ctx.arc(30, -38, 3.2, 0, 7);
    ctx.fill();
    if (mode === 2) {
      ctx.strokeStyle = "#1F2A44";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(23, -48);
      ctx.lineTo(31, -40);
      ctx.moveTo(31, -48);
      ctx.lineTo(23, -40);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(27, -45, 5.5, 0, 7);
      ctx.fill();
      ctx.fillStyle = "#1F2A44";
      ctx.beginPath();
      ctx.arc(29, -45, 2.8, 0, 7);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(30, -46, 0.9, 0, 7);
      ctx.fill();
    }
    ctx.strokeStyle = D;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(30, -33);
    ctx.quadraticCurveTo(35, -31, 37, -34);
    ctx.stroke();
    ctx.restore();
  }

  function cactus(o) {
    const g = mix("#3BB273", "#1D6B4A", night * 0.6),
      h = mix("#6FD9A0", "#2E8A62", night * 0.6);
    ctx.fillStyle = "rgba(0,0,0,.14)";
    ctx.beginPath();
    ctx.ellipse(o.x + o.w / 2, GY + 2, o.w / 2 + 4, 3, 0, 0, 7);
    ctx.fill();
    for (let i = 0; i < o.n; i++) {
      const sx = o.x + i * 16,
        hh = o.h - (i % 2) * 6;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(sx, GY - hh, 12, hh, 6);
      ctx.fill();
      if (i % 2 === 0) {
        ctx.beginPath();
        ctx.roundRect(sx - 9, GY - hh * 0.55, 10, 6, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(sx - 9, GY - hh * 0.55 - 13, 6, 19, 3);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(sx + 11, GY - hh * 0.6, 10, 6, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(sx + 15, GY - hh * 0.6 - 12, 6, 18, 3);
        ctx.fill();
      }
      ctx.fillStyle = h;
      ctx.beginPath();
      ctx.roundRect(sx + 2.5, GY - hh + 5, 3, hh - 12, 1.5);
      ctx.fill();
      ctx.fillStyle = "#FF4D6D";
      ctx.beginPath();
      ctx.arc(sx + 6, GY - hh + 1, 3, 0, 7);
      ctx.fill();
    }
  }

  function bird(o) {
    const f = Math.sin(t * 0.5),
      x = o.x,
      cy = o.y;
    ctx.fillStyle = "#E03557";
    ctx.beginPath();
    ctx.moveTo(x + 2, cy - 2);
    ctx.lineTo(x + 8, cy - 4 - f * 16);
    ctx.lineTo(x + 15, cy);
    ctx.fill();
    ctx.fillStyle = "#FF4D6D";
    ctx.beginPath();
    ctx.ellipse(x, cy, 15, 8.5, 0, 0, 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 13, cy);
    ctx.lineTo(x + 24, cy - 5);
    ctx.lineTo(x + 24, cy + 5);
    ctx.fill();
    ctx.fillStyle = "#FFB020";
    ctx.beginPath();
    ctx.moveTo(x - 14, cy - 2);
    ctx.lineTo(x - 25, cy + 2);
    ctx.lineTo(x - 14, cy + 5);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x - 8, cy - 3, 3, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#1F2A44";
    ctx.beginPath();
    ctx.arc(x - 9, cy - 3, 1.5, 0, 7);
    ctx.fill();
  }

  function layer(speed, period, fn) {
    const o = (off * speed) % period;
    for (let k = -1; k <= Math.ceil(W / period) + 1; k++) {
      ctx.save();
      ctx.translate(-o + k * period, 0);
      fn();
      ctx.restore();
    }
  }

  function draw() {
    ctx.setTransform(R, 0, 0, R, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 16);
    ctx.clip();

    const g = ctx.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, mix("#7FCBFF", "#0F1B3D", night));
    g.addColorStop(1, mix("#EAF6FF", "#2E3F73", night));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";
    stars.forEach((s) => {
      ctx.globalAlpha = night * (0.5 + 0.5 * Math.sin(t * 0.05 + s.x));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 7);
      ctx.fill();
    });
    ctx.globalAlpha = 1 - night;
    ctx.fillStyle = "rgba(255,212,94,.25)";
    ctx.beginPath();
    ctx.arc(600, 52, 27, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#FFD45E";
    ctx.beginPath();
    ctx.arc(600, 52, 16, 0, 7);
    ctx.fill();
    ctx.globalAlpha = night;
    ctx.fillStyle = "#EEF2FF";
    ctx.beginPath();
    ctx.arc(600, 52, 14, 0, 7);
    ctx.fill();
    ctx.fillStyle = "#16244F";
    ctx.beginPath();
    ctx.arc(606, 48, 12, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = mix("#FFFFFF", "#52669F", night);
    clouds.forEach((c) => {
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 26 * c.s, 9 * c.s, 0, 0, 7);
      ctx.ellipse(c.x + 16 * c.s, c.y - 6 * c.s, 16 * c.s, 10 * c.s, 0, 0, 7);
      ctx.ellipse(c.x - 14 * c.s, c.y - 3 * c.s, 13 * c.s, 8 * c.s, 0, 0, 7);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    layer(0.1, 380, () => {
      ctx.fillStyle = mix("#B5D6F2", "#27366A", night);
      ctx.beginPath();
      ctx.moveTo(0, GY);
      [
        [60, 120],
        [110, 152],
        [190, 98],
        [260, 150],
        [320, 124],
        [380, GY],
      ].forEach((p) => ctx.lineTo(p[0], p[1]));
      ctx.fill();
      ctx.fillStyle = mix("#FFFFFF", "#8FA2D6", night);
      ctx.beginPath();
      ctx.moveTo(190, 98);
      ctx.lineTo(177, 114);
      ctx.lineTo(190, 110);
      ctx.lineTo(202, 116);
      ctx.fill();
    });
    layer(0.3, 380, () => {
      ctx.fillStyle = mix("#8CD3B4", "#1E4A5A", night);
      ctx.beginPath();
      ctx.moveTo(0, GY);
      ctx.quadraticCurveTo(95, 128, 190, 166);
      ctx.quadraticCurveTo(285, 124, 380, GY);
      ctx.fill();
      ctx.fillStyle = mix("#6CC09B", "#173B4A", night);
      ctx.beginPath();
      ctx.arc(70, 170, 22, Math.PI, 0);
      ctx.arc(300, 172, 18, Math.PI, 0);
      ctx.fill();
    });

    ctx.fillStyle = mix("#F4E7C8", "#363B5C", night);
    ctx.fillRect(0, GY, W, H - GY);
    ctx.fillStyle = mix("#E5D3A8", "#2B3050", night);
    ctx.fillRect(0, GY, W, 6);
    ctx.strokeStyle = mix("#1F2A44", "#AFC0EE", night);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, GY);
    ctx.lineTo(W, GY);
    ctx.stroke();
    ctx.fillStyle = mix("#CDB98C", "#4A5078", night);
    peb.forEach((p) => {
      const x = (((p.x - off) % (W + 12)) + (W + 12)) % (W + 12) - 6;
      ctx.beginPath();
      ctx.roundRect(x, p.y, p.w, 2.5, 1.2);
      ctx.fill();
    });

    const air = Math.max(0, Math.min(1, (GY - y) / 90));
    ctx.fillStyle = "rgba(0,0,0," + (0.2 - air * 0.12) + ")";
    ctx.beginPath();
    ctx.ellipse(68, GY + 3, 20 - air * 8, 3.5, 0, 0, 7);
    ctx.fill();

    obs.forEach((o) => (o.k === "c" ? cactus(o) : bird(o)));

    const grounded = y >= GY;
    const bob =
      st === "run" && grounded ? Math.abs(Math.sin(t * 0.45)) * 1.6 : Math.sin(t * 0.08);
    dino(
      68,
      y - bob,
      st === "run" ? t * 0.45 : 0,
      st === "dead" ? 2 : grounded ? 0 : 1,
      duck && grounded && st === "run"
    );

    parts = parts.filter((p) => p.l > 0);
    parts.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.l -= 0.035;
      ctx.globalAlpha = Math.max(0, p.l);
      ctx.fillStyle = st === "dead" ? SKINS[skin].b : mix("#E8D9B5", "#8A8FB0", night);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * p.l + 1, 0, 7);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const ink = mix("#1F2A44", "#E8EEFF", night);
    ctx.fillStyle = ink;
    ctx.textAlign = "right";
    ctx.font = "500 15px monospace";
    ctx.fillText(pad(score), W - 16, 28);
    ctx.globalAlpha = 0.55;
    ctx.font = "12px monospace";
    ctx.fillText("HI " + pad(hi), W - 80, 28);
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    if (st === "ready") {
      ctx.font = "500 17px sans-serif";
      ctx.fillStyle = ink;
      ctx.fillText(
        "Press " + prettyKey(jumpKeys[0] || "Space") + " or tap to start",
        W / 2,
        100
      );
    }
    if (st === "dead") {
      ctx.fillStyle = "rgba(31,42,68,.88)";
      ctx.beginPath();
      ctx.roundRect(W / 2 - 110, 64, 220, 80, 16);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "500 20px sans-serif";
      ctx.fillText("Game over", W / 2, 98);
      ctx.font = "13px sans-serif";
      ctx.fillStyle = "#BFD0F5";
      ctx.fillText(
        "Score " +
          Math.floor(score) +
          "  |  " +
          prettyKey(jumpKeys[0] || "Space") +
          " to retry",
        W / 2,
        124
      );
    }
    ctx.restore();
  }

  let last = 0;
  function loop(ts) {
    const dt = Math.min(2, (ts - last) / 16.67 || 1);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  cv.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    cv.focus();
    jump();
  });
  window.addEventListener("keydown", (e) => {
    if (isJump(e)) {
      e.preventDefault();
      jump();
    }
    if (isDuck(e)) {
      e.preventDefault();
      if (!duckLatched) sfx("duck");
      duck = true;
      duckLatched = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (isDuck(e)) {
      duck = false;
      duckLatched = false;
    }
  });
  window.addEventListener("blur", () => {
    duck = false;
    duckLatched = false;
  });
})();
