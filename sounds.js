(() => {
  const Sound = {
    enabled: true,
    ctx: null,

    setEnabled(on) {
      this.enabled = !!on;
    },

    ensure() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },

    tone({ freq = 440, dur = 0.08, type = "square", gain = 0.08, slide = 0, delay = 0 }) {
      if (!this.enabled) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },

    noise({ dur = 0.12, gain = 0.05 }) {
      if (!this.enabled) return;
      const ctx = this.ensure();
      if (!ctx) return;
      const n = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 900;
      src.buffer = buf;
      g.gain.value = gain;
      src.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      src.start();
    },

    jump() {
      this.tone({ freq: 420, dur: 0.09, type: "square", gain: 0.07, slide: 280 });
    },

    duck() {
      this.tone({ freq: 220, dur: 0.06, type: "triangle", gain: 0.04, slide: -80 });
    },

    start() {
      this.tone({ freq: 360, dur: 0.07, type: "square", gain: 0.06 });
      this.tone({ freq: 520, dur: 0.08, type: "square", gain: 0.05, delay: 0.07 });
    },

    hit() {
      this.noise({ dur: 0.16, gain: 0.07 });
      this.tone({ freq: 180, dur: 0.18, type: "sawtooth", gain: 0.06, slide: -120 });
    },

    score() {
      this.tone({ freq: 660, dur: 0.05, type: "square", gain: 0.035 });
      this.tone({ freq: 880, dur: 0.06, type: "square", gain: 0.03, delay: 0.05 });
    },
  };

  window.DinoSound = Sound;
})();
