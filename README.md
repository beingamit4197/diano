# Dino Runner — Chrome New Tab Game

Chrome ke **new tab** pe Dino-style runner. Jump cacti, duck birds, beat your high score.

## Install

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this folder
4. Pin the extension icon
5. Open a **new tab** to play

## Popup controls

Toolbar icon pe click karke:

- **Game on new tab** — On/Off (Off hone par simple Google search new tab)
- **Sound effects** — jump / duck / hit / score sounds
- **Jump / Duck keys** — Change dabao, naya key press karo
- **Reset defaults** — Space / ↑ jump, ↓ duck
- **High score reset**

New tab pe top-right **✕** → Chrome default new tab / Google pe wapas.

## Default keyboard

| Action | Keys |
|---|---|
| Jump / Start / Retry | `Space`, `↑` |
| Duck | `↓` |

Tap / click canvas se bhi jump / start hota hai.

## Files

```
dino-runner/
├── manifest.json
├── newtab.html / newtab.js
├── game.js
├── style.css / search.css
├── popup.html / popup.css / popup.js
└── icons/
```
