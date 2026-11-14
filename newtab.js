(() => {
  const DEFAULTS = {
    enabled: true,
    jumpKeys: ["Space", "ArrowUp"],
    duckKeys: ["ArrowDown"],
  };

  const gameRoot = document.getElementById("game-root");
  const searchRoot = document.getElementById("search-root");

  function apply(settings) {
    const on = settings.enabled !== false;
    document.title = on ? "Dino Runner" : "New Tab";
    gameRoot.hidden = !on;
    searchRoot.hidden = on;
    if (on && !window.__dinoRunnerLoaded) {
      window.__dinoRunnerLoaded = true;
      const s = document.createElement("script");
      s.src = "game.js";
      document.body.appendChild(s);
    }
  }

  chrome.storage.local.get(DEFAULTS, (stored) => {
    apply({ ...DEFAULTS, ...stored });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    chrome.storage.local.get(DEFAULTS, (stored) => {
      apply({ ...DEFAULTS, ...stored });
      // If user turned game on after page load with search view, reload so canvas/game boot cleanly
      if (changes.enabled && changes.enabled.newValue === true && !document.getElementById("c")) {
        location.reload();
      }
    });
  });
})();
