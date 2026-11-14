(() => {
  const DEFAULTS = {
    enabled: true,
    jumpKeys: ["Space", "ArrowUp"],
    duckKeys: ["ArrowDown"],
    sound: true,
  };

  const gameRoot = document.getElementById("game-root");
  const searchRoot = document.getElementById("search-root");
  const closeBtn = document.getElementById("closeNtp");

  function apply(settings) {
    const on = settings.enabled !== false;
    document.title = on ? "Dino Runner" : "New Tab";
    gameRoot.hidden = !on;
    searchRoot.hidden = on;
    if (window.DinoSound) DinoSound.setEnabled(settings.sound !== false);
    if (on && !window.__dinoRunnerLoaded) {
      window.__dinoRunnerLoaded = true;
      const s = document.createElement("script");
      s.src = "game.js";
      document.body.appendChild(s);
    }
  }

  // Leave extension new-tab and open Chrome's default NTP (fallback: Google)
  function openChromeNewTab() {
    const targets = [
      "chrome://new-tab-page/",
      "chrome://new-tab-page-third-party/",
      "https://www.google.com/",
    ];
    // Try default NTP first; if Chrome blocks navigation, fall through
    let i = 0;
    const tryNext = () => {
      if (i >= targets.length) return;
      const url = targets[i++];
      try {
        location.href = url;
      } catch {
        tryNext();
      }
    };
    tryNext();
    // If still on this page shortly after, force Google
    setTimeout(() => {
      if (location.protocol === "chrome-extension:") {
        location.href = "https://www.google.com/";
      }
    }, 250);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openChromeNewTab();
    });
  }

  chrome.storage.local.get(DEFAULTS, (stored) => {
    apply({ ...DEFAULTS, ...stored });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    chrome.storage.local.get(DEFAULTS, (stored) => {
      apply({ ...DEFAULTS, ...stored });
      if (changes.enabled && changes.enabled.newValue === true && !document.getElementById("c")) {
        location.reload();
      }
    });
  });
})();
