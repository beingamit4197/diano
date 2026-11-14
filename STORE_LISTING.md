# Chrome Web Store listing — DIANO

## Live site URLs

| Field | URL |
|---|---|
| **Homepage** | https://beingamit4197.github.io/diano/ |
| **Support** | https://beingamit4197.github.io/diano/support.html |
| **Privacy Policy** | https://beingamit4197.github.io/diano/privacy.html |
| **GitHub** | https://github.com/beingamit4197/diano |

## Category
**Fun** (or Entertainment / Games if available)

## Language
**English**

---

## Description (paste)

```
DIANO turns every new Chrome tab into a quick runner game.

Jump the cacti, duck the birds, chase a new high score — then get back to browsing with one click.

HOW TO PLAY
1. Open a new tab
2. Press Space / ↑ (or tap the game) to start
3. Jump obstacles, duck flying birds
4. Beat your HI score

FEATURES
• Instant play on every new tab
• Smooth runner with day/night feel
• Sound effects (jump, duck, hit, score)
• Remappable keyboard controls
• Skin colours for your runner
• Toolbar popup: game On/Off + sound On/Off
• ✕ button to jump back to Chrome / Google
• High score saved locally in your browser

CONTROLS
• Jump / Start / Retry — Space or ↑ (changeable in popup)
• Duck — ↓ (changeable in popup)
• Click / tap the game area to jump

Perfect when you want a 10-second break between tabs — no account, no setup beyond install.
```

---

## Graphic assets (from this repo)

| Field | File | Size |
|---|---|---|
| **Store icon** | `icons/icon128.png` | 128×128 |
| Full logo (optional screenshots/promo) | `icons/logo.png` | 512×512 |
| Mark only | `icons/logo-mark.png` | 512×512 |

Path: `/Users/amit/Projects/Personal/dino-runner/icons/icon128.png`

### Screenshots tip
Open a new tab with the game, take 1280×800 (or similar) screenshots of:
1. Ready / start screen
2. Mid-run gameplay
3. Game over + score
4. Toolbar popup controls

---

## Privacy (next tab — short answers)

### Single purpose
```
Replace the Chrome new tab with a lightweight DIANO runner game and optional search page when the game is turned off.
```

### storage justification
```
Used to save game preferences (enabled/disabled, sound on/off, keyboard bindings, runner skin) and the local high score. No browsing history is stored.
```

### Host permission justification
```
(None required beyond new-tab override / storage unless you add host permissions later.)
```

If Chrome asks about `chrome_url_overrides` / new tab:
```
Overrides the new tab page to show the DIANO runner game (or a simple search page when the user turns the game off in the popup).
```

### Remote code
**No, I am not using remote code**

### Data usage
- Check **Website content** only if you consider the new-tab page UI as such; for a self-contained game with local storage, many listings check nothing under collection if no user page content is read.
- Prefer: no PII / health / financial / auth / communications / location / web history / user activity
- If forced to pick one for a new-tab game that only stores prefs/score locally: leave collection boxes unchecked if accurate, and certify all three disclosure checkboxes.

Certify:
- ✅ I do not sell or transfer user data to third parties, outside of the approved use cases
- ✅ I do not use or transfer user data for purposes unrelated to my item’s single purpose
- ✅ I do not use or transfer user data to determine creditworthiness or for lending purposes
