# Skins Pro — **Next-Gen Home Assistant Dashboard**

[中文版本](README.zh-CN.md)

**Next-Gen Home Assistant Dashboard** — Multi-skin, immersive, plug-and-play.

Skins Pro is a community Lovelace card with a multi-skin architecture. It ships with the **modern** skin and offers additional skins via the built-in skin store. Bilingual (CN/EN) — install from HACS and it just works.

- Add via HACS custom repository
- Switch between skins freely
- Fullscreen Kiosk mode for immersive experience
- Auto image processing on build (resize, JPG convert)
- Area-based room display
- Auto icon matching by entity domain

> Note — We often create skins out of passion for the things we love, but this can inadvertently touch on copyright issues. We recommend using AI-generated images whenever possible. All current theme image assets are AI-generated, so some images may contain AI watermarks or similar generation artifacts. If you don't like the AI-generated images, you can freely upload your own background and room images in the settings. If you believe any skin infringes on your copyright, please open an issue and we will remove it promptly.

## Philosophy

Keep it simple, keep it easy.

Skins Pro is built around simplicity and ease of use. Install from HACS, pick a skin, adjust a few settings in the card editor, and you're done. Every feature is designed to be intuitive, so you can focus on enjoying your smart home.

## Installation

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ha-china&repository=Skins-Pro&category=plugin)

Click the button above, or manually:

1. HACS → Custom Repositories → Add `https://github.com/ha-china/Skins-Pro`, category: Dashboard
2. Install Skins Pro
3. Refresh Home Assistant frontend
4. Settings → Dashboards → Add Dashboard → Select "Skins Pro"

![New Dashboard](screenshots/add_dashboard.png)

![Settings](screenshots/settings.png)

## Skin Store

![Store](screenshots/store.gif)

Download additional skins directly from the card editor. Clicking **Download** fetches the skin package from the [store branch](https://github.com/ha-china/Skins-Pro/tree/store) via CDN and installs it to your HA `www/` directory via the [`skins-pro-hass`](https://github.com/ha-china/skins-pro-hass) integration.

> The integration is only needed for downloading skins from the store. If you only use the built-in **modern** skin, you can skip installing it.

## Built-in Skin

| Skin | Style | Features |
|---|---|---|
| **modern** (default) | White glassmorphism | Frosted glass, high-res images, clean blue-white palette |

> All other skins (AEON, AEON_glass, visionOS, minecraft, and community submissions) are available via the **Skin Store** built into the card editor. Click the store button to browse and download.

## Preview

![modern](screenshots/modern.png)

![Advanced Feature](screenshots/Advanced_Feature.png)

### Skin Switching Demo

<video src="https://github.com/ha-china/Skins-Pro/raw/master/screenshots/skin.mp4" controls width="100%" preload="metadata"></video>
[⬇ Download MP4](screenshots/skin.mp4)

## Features

- ☀️ Weather & greeting
- 💬 Info display
- 📱 Device controls (by area or by type)
- 🚪 Room snapshots
- 🎬 Scene buttons
- 🤖 Automations page
- ⚡ Energy dashboard (today vs yesterday)
- 🛡️ Security page — cameras, locks, alarm control panel (auto-detected, click to arm/disarm)
- 🎵 Media player card — album art, playback controls, volume bar
- 📷 Camera snapshot on homepage
- 🌡️ Environment sensors display
- 🌐 Auto CN/EN bilingual switching
- ↔️ Fullscreen Kiosk mode
- 🖼️ Use HA area pictures as room backgrounds
- 🎨 Custom background image upload
- 📱 Mobile responsive layout
- 🎭 Multi-skin architecture with built-in skin store

On first add, it automatically scans your Home Assistant and organizes content by area and device type.

## Skin Development

A skin is a folder under `skins-pro/<skin-name>/` containing images, CSS, and strings. `npm run build` auto-discovers, processes images, and generates code.

### Directory Structure

```
skins-pro/
  your-skin-name/
    theme.css               # Styles (required)
    strings.json            # Strings + icon_map + author (required)
    avatar.jpg              # Avatar, recommended ≥ 300×300
    background.jpg          # Background, recommended width ≥ 2560px
    decoration.jpg          # Side decoration, recommended width ≥ 800px
    base-texture.jpg        # Base texture, recommended width ≥ 2560px
    stage-*.jpg             # Stage image, recommended width ≥ 2560px
    room-*.jpg              # Room image, recommended width ≥ 1200px
    icon-*.jpg              # Device icon, recommended longest edge ≥ 300px
```

### Image Processing on Build

| Pattern | Recommended source | Notes |
|---|---|---|
| `room-*` | width ≥ 1200px | Maintain ratio, downscale to 1200px |
| `icon-*` | longest edge ≥ 300px | Maintain ratio, downscale to 300px |
| `avatar.*` | longest edge ≥ 300px | Maintain ratio, downscale to 300px |
| `decoration.*` | width ≥ 800px | Maintain ratio, downscale to 800px |
| `background.*`, `base-*`, `stage-*` | width ≥ 2560px | Maintain ratio, downscale to 2560px |
| others | width ≥ 1200px | Maintain ratio, downscale to 1200px |

Supports PNG / JPG / BMP / WebP input, outputs JPG. Never upscales.

### theme.css

All styles are customized via CSS variables on `:host`. Each skin has its own `theme.css`. See `skins-pro/modern/theme.css` for the full variable list.

### strings.json + icon_map + author

```json
{
  "author": "your-github-username",
  "title_zh": "欢迎回来！",
  "title_en": "Welcome back!",
  "icon_map": {
    "light": "light",
    "switch": "switch",
    "climate": "climate",
    "media_player": "speaker",
    "lock": "lock"
  }
}
```

- `author` — Your GitHub username (without `@`). Displayed in the store and linked to your profile.
- `icon_map` — Maps entity domains to icon image filenames. Unmapped domains fall back automatically.

> **Best reference** — Use [`skins-pro/visionOS/`](skins-pro/visionOS/) as the starting point when creating a new skin. It has the most complete `icon_map`, `theme.css`, and icon assets.

## Development

```bash
git clone https://github.com/ha-china/Skins-Pro.git
cd Skins-Pro
npm install
npm run build       # Build all skins (also runs rollup)
npm run build -- <skin-name>   # Build only one skin + the bundled 'modern' (faster for local testing)
npm run watch       # Watch mode (auto-rebuild on source changes)
npm run type-check  # TypeScript type check
```

`npm run build -- visionOS` processes only `modern` + `visionOS`, skipping the other skins and store packages — useful when iterating on a single skin.

Build output in `dist/`:

- `dist/skins-pro.js` — Core JS bundle (the only file you need for HA testing)
- `dist/modern/` — The built-in modern skin's processed assets and CSS

### Testing a Local Build in Home Assistant

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy `skins-pro.js` to HA's `www/` directory:**  
   Copy `dist/skins-pro.js` into your HA `config/www/` folder:
   ```
   <HA config>/www/skins-pro.js
   ```

3. **Register the resource in Home Assistant:**  
   Settings → Dashboards → Resources → Add Resource
   - URL: `/local/skins-pro.js`
   - Type: JavaScript Module

4. **Hard refresh** (Ctrl+Shift+R) your browser.

   After that, every time you `npm run build`, just replace `www/skins-pro.js` and hard refresh to see changes.

> **Tip** — If the built-in **modern** skin assets (images, CSS) are not loading and you see broken images or unstyled output, also copy `dist/modern/` into `www/community/skins-pro/modern/`:
> ```
> <HA config>/www/community/skins-pro/modern/  ← copy dist/modern/ here
> ```

### Testing a New Skin (Store-less Local Workflow)

While developing a new skin, you don't need to go through the store. Instead:

1. Add your skin directory under `skins-pro/<new-skin-name>/` with the usual files (`theme.css`, `strings.json`, images)

2. Build the project: the skin will be auto-discovered and baked into `generated.ts`

3. Copy your skin's images to your HA `www/` for direct serving:
   ```
   <HA config>/www/skins-pro/<new-skin-name>/
     ├── theme.css
     ├── avatar.jpg
     ├── background.jpg
     ├── room-*.jpg
     ├── icon-*.jpg
     └── ... (all the images from your skin directory)
   ```

4. In the Skins Pro card editor, add the skin name to the `downloaded_skins` array:
   ```json
   "downloaded_skins": ["<new-skin-name>"]
   ```
   This tells the card that the skin is already installed, so it appears in the skin dropdown immediately without going through the store. Select it from the dropdown and hard refresh.

That's it — no store, no PR, no CI needed for local development. When you're happy with the result, open a PR to share it.

## Contributing a Skin

We welcome skin contributions! Simply:

1. **Create a skin folder** under `skins-pro/<skin-name>/` with the required files (see [Skin Development](#skin-development) above)
2. **Add a preview screenshot** `screenshots/<skin-name>.png` (1920×1080 recommended)
3. **Submit a PR** using the PR template — fill in all required fields

Once merged, CI automatically builds the card, packages your skin to the store branch, and makes it available in the card editor's skin store.

> ⚠️ **Copyright Notice** — When contributing skins, please ensure your image assets do not infringe on others' copyright. We recommend using AI-generated or original images. Skins with valid copyright complaints will be removed from the store.

### PR Template Requirements (enforced by CI)

- PR description must keep the full template structure
- At least one type must be checked (`Contribute a Skin` / `Architecture Optimization`)
- `### 描述 / Description` must be filled in
- For skin contributions: `### 皮肤名称 / Skin Name` must be filled in

After submitting, a bot will automatically post a **Screenshot Preview** comment showing your skin's preview image.

### Required Files

| File | Purpose |
|---|---|
| `theme.css` | All styles via CSS variables on `:host`. See `skins-pro/modern/theme.css` |
| `strings.json` | Greeting text + `icon_map`. **Must** include a non-empty `author` field |
| `avatar.*` (png/jpg) | Avatar image, recommended ≥ 300×300 |
| `background.*` (png/jpg) | Main background, recommended width ≥ 2560px |
| `screenshots/<skin-name>.png` | Store preview image. **Filename must match the skin folder name exactly** |

### Validation Rules (enforced by CI)

- Skin folder name (`skins-pro/<name>/`) must match preview filename (`screenshots/<name>.png`)
- `strings.json` must contain a non-empty `author` field (your GitHub username, without `@`)
- `theme.css` must be present
- Skin directory may only contain image files + `theme.css` + `strings.json`
- Exactly one preview screenshot per skin

### Tips

- Use [`skins-pro/visionOS/`](skins-pro/visionOS/) as the reference — it has the most complete `icon_map` and assets
- Images are auto-processed on build (resize, JPG output) — no manual optimization needed
- `icon_map` in `strings.json` maps entity domains to icon filenames; unmapped domains fall back automatically

## Credits

- Architecture inspired by [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next)
- Design inspired by [html-card-pro Discussions](https://github.com/ha-china/html-card-pro/discussions/11)
- Kiosk mode inspired by [kiosk-mode](https://github.com/NemesisRE/kiosk-mode)
- Core rendering by [Lit](https://lit.dev/)
- Image processing by [sharp](https://sharp.pixelplumbing.com/)
- Zero runtime dependencies, lean and fast