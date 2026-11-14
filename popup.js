const DEFAULTS = {
  enabled: true,
  jumpKeys: ["Space", "ArrowUp"],
  duckKeys: ["ArrowDown"],
  hi: 0,
};

const enabledEl = document.getElementById("enabled");
const statusPill = document.getElementById("statusPill");
const jumpLabel = document.getElementById("jumpLabel");
const duckLabel = document.getElementById("duckLabel");
const bindJump = document.getElementById("bindJump");
const bindDuck = document.getElementById("bindDuck");
const bindHint = document.getElementById("bindHint");
const resetKeys = document.getElementById("resetKeys");
const hiScore = document.getElementById("hiScore");
const resetHi = document.getElementById("resetHi");

let listening = null; // 'jump' | 'duck' | null
let settings = { ...DEFAULTS };

function prettyKey(code) {
  const map = {
    Space: "Space",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    Enter: "Enter",
    ShiftLeft: "Shift",
    ShiftRight: "Shift",
  };
  if (map[code]) return map[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  return code;
}

function labelKeys(keys) {
  return (keys || []).map(prettyKey).join(", ");
}

function applyUi() {
  enabledEl.checked = !!settings.enabled;
  statusPill.textContent = settings.enabled ? "ON" : "OFF";
  statusPill.dataset.on = settings.enabled ? "true" : "false";
  jumpLabel.textContent = labelKeys(settings.jumpKeys);
  duckLabel.textContent = labelKeys(settings.duckKeys);
  hiScore.textContent = String(settings.hi || 0);
}

async function load() {
  const stored = await chrome.storage.local.get(DEFAULTS);
  settings = { ...DEFAULTS, ...stored };
  applyUi();
}

async function save(patch) {
  await chrome.storage.local.set(patch);
  settings = { ...settings, ...patch };
  applyUi();
}

function stopListen() {
  listening = null;
  bindJump.classList.remove("listening");
  bindDuck.classList.remove("listening");
  bindJump.textContent = "Change";
  bindDuck.textContent = "Change";
  bindHint.textContent = "Click Change, then press a key.";
  bindHint.classList.remove("bind-active");
}

function startListen(kind) {
  listening = kind;
  bindJump.classList.toggle("listening", kind === "jump");
  bindDuck.classList.toggle("listening", kind === "duck");
  if (kind === "jump") {
    bindJump.textContent = "Press key…";
    bindDuck.textContent = "Change";
  } else {
    bindDuck.textContent = "Press key…";
    bindJump.textContent = "Change";
  }
  bindHint.textContent = "Press any key (Esc to cancel).";
  bindHint.classList.add("bind-active");
}

bindJump.addEventListener("click", () => {
  if (listening === "jump") stopListen();
  else startListen("jump");
});
bindDuck.addEventListener("click", () => {
  if (listening === "duck") stopListen();
  else startListen("duck");
});

window.addEventListener("keydown", async (e) => {
  if (!listening) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.code === "Escape") {
    stopListen();
    return;
  }
  // Ignore pure modifier presses
  if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

  const code = e.code;
  if (listening === "jump") {
    // Primary remapped key + Space/ArrowUp as handy fallbacks (deduped)
    const keys = [code, "Space", "ArrowUp"].filter((v, i, a) => a.indexOf(v) === i);
    await save({ jumpKeys: keys });
  } else if (listening === "duck") {
    await save({ duckKeys: [code] });
  }
  stopListen();
}, true);

enabledEl.addEventListener("change", () => save({ enabled: enabledEl.checked }));
resetKeys.addEventListener("click", () =>
  save({ jumpKeys: DEFAULTS.jumpKeys, duckKeys: DEFAULTS.duckKeys })
);
resetHi.addEventListener("click", () => save({ hi: 0 }));

load();
