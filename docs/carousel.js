(() => {
  const root = document.getElementById("carousel");
  if (!root) return;

  const cards = [...root.querySelectorAll(".carousel-card")];
  const dots = [...root.querySelectorAll(".carousel-dot")];
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const progress = document.getElementById("carouselProgress");
  const n = cards.length;
  let i = 0;
  let timer = null;
  let paused = false;
  const AUTO_MS = 4200;

  function render() {
    cards.forEach((card, idx) => {
      card.classList.remove("is-active", "is-next", "is-prev", "is-far");
      const d = (idx - i + n) % n;
      if (d === 0) card.classList.add("is-active");
      else if (d === 1) card.classList.add("is-next");
      else if (d === n - 1) card.classList.add("is-prev");
      else card.classList.add("is-far");
    });
    dots.forEach((dot, idx) => {
      const on = idx === i;
      dot.classList.toggle("is-on", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });
    restartProgress();
  }

  function go(to) {
    i = ((to % n) + n) % n;
    render();
  }

  function next() {
    go(i + 1);
  }
  function prev() {
    go(i - 1);
  }

  function restartProgress() {
    if (!progress) return;
    progress.style.transition = "none";
    progress.style.width = "0%";
    void progress.offsetWidth;
    if (paused) return;
    progress.style.transition = `width ${AUTO_MS}ms linear`;
    progress.style.width = "100%";
  }

  function startAuto() {
    stopAuto();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer = setInterval(() => {
      if (!paused) next();
    }, AUTO_MS);
    restartProgress();
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function pause() {
    paused = true;
    if (progress) {
      progress.style.transition = "none";
      progress.style.width = "0%";
    }
  }

  function resume() {
    paused = false;
    startAuto();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAuto(); });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      go(+dot.dataset.go);
      startAuto();
    });
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
      startAuto();
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      startAuto();
    }
  });

  root.addEventListener("mouseenter", pause);
  root.addEventListener("mouseleave", resume);
  root.addEventListener("focusin", pause);
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget)) resume();
  });

  let x0 = null;
  root.addEventListener("pointerdown", (e) => {
    x0 = e.clientX;
  });
  root.addEventListener("pointerup", (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next();
    else prev();
    startAuto();
  });

  render();
  startAuto();
})();
