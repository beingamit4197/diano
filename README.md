<p align="center">
  <img src="icons/logo.png" alt="DIANO" width="320" />
</p>

<h1 align="center">DIANO</h1>

<p align="center">
  <strong>Jump. Duck. Repeat.</strong><br/>
  A smooth runner game in every new Chrome tab.
</p>

<p align="center">
  <a href="https://beingamit4197.github.io/diano/"><img src="https://img.shields.io/badge/Website-Live-E4572E?style=for-the-badge" alt="Website" /></a>
  <a href="https://github.com/beingamit4197/diano"><img src="https://img.shields.io/badge/GitHub-diano-14171F?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Chrome-MV3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome MV3" />
</p>

---

## Links

| Page | URL |
|---|---|
| **Homepage** | https://beingamit4197.github.io/diano/ |
| **Support** | https://beingamit4197.github.io/diano/support.html |
| **Privacy Policy** | https://beingamit4197.github.io/diano/privacy.html |
| **Repository** | https://github.com/beingamit4197/diano |

Use these URLs in the Chrome Web Store listing (Homepage / Support / Privacy).

---

## Promo

<p align="center">
  <img src="store-assets/promo-marquee.jpg" alt="DIANO promo marquee" width="100%" />
</p>

<p align="center">
  <img src="store-assets/promo-small.jpg" alt="DIANO small promo" width="440" />
</p>

---

## Screenshots

### Gameplay
<img src="store-assets/screenshot-1-gameplay.jpg" alt="Gameplay" width="900" />

### Night mode
<img src="store-assets/screenshot-2-night.jpg" alt="Night mode" width="900" />

### Game over
<img src="store-assets/screenshot-3-game-over.jpg" alt="Game over" width="900" />

### Skins
<img src="store-assets/screenshot-4-skins.jpg" alt="Skins" width="900" />

### Controls
<img src="store-assets/screenshot-5-controls.jpg" alt="Controls" width="900" />

<p align="center">
  <img src="store-assets/store-icon-128.png" alt="Store icon 128x128" width="128" />
</p>

---

## Features

- Runner on every **new tab**
- Jump cacti, duck birds, beat your **HI** score
- Day → night as the score climbs
- **Sound effects** (jump, duck, hit, score)
- Remappable **keyboard controls**
- Runner **colour skins**
- Toolbar popup: game On/Off, sound On/Off, high-score reset
- Top-right **✕** to return to Chrome / Google
- Preferences saved locally (no account)

---

## Install (developer mode)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder
4. Pin **DIANO**
5. Open a **new tab** to play

---

## Default controls

| Action | Keys |
|---|---|
| Jump / Start / Retry | `Space`, `↑` |
| Duck | `↓` |
| Click / tap canvas | Jump / start |

Change keys anytime from the extension popup.

---

## Project structure

```text
diano/
├── manifest.json          # Chrome MV3 extension
├── newtab.html / .js      # New tab (game or search fallback)
├── game.js                # Runner engine
├── sounds.js              # Web Audio SFX
├── popup.html / .css / .js
├── icons/                 # Extension + brand icons
├── store-assets/          # Chrome Web Store graphics
└── docs/                  # GitHub Pages (landing, support, privacy)
```

---

## Chrome Web Store assets

Upload from `store-assets/`:

| Asset | File |
|---|---|
| Store icon (128×128) | `store-assets/store-icon-128.png` |
| Marquee promo | `store-assets/promo-marquee.jpg` |
| Small promo | `store-assets/promo-small.jpg` |
| Screenshots | `store-assets/screenshot-1` … `screenshot-5` |

Listing copy helpers: `STORE_LISTING.md`

---

## Privacy

DIANO stores only local preferences and high score in Chrome storage.  
Full policy: https://beingamit4197.github.io/diano/privacy.html

---

<p align="center">
  Made for quick breaks between tabs.
</p>
