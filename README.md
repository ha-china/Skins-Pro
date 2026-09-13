# Skins Pro — **Next-Gen Home Assistant Dashboard**

[中文版本](README.zh-CN.md)

**Next-Gen Home Assistant Dashboard** — Multi-skin, immersive, plug-and-play.

Skins Pro is a community Lovelace card with a multi-skin architecture. It ships with the **modern** skin and offers additional skins via the built-in skin store. Bilingual (CN/EN) — install from HACS and it just works.

- Add via HACS custom repository
- Switch between skins freely
- True fullscreen mode (browser Fullscreen API) for immersive experience
- Area-based room display
- Auto icon resolution from Home Assistant
- Demo mode for non-admin users (auto-fullscreen on first tap, input guard)

> Note — We often create skins out of passion for the things we like, but this can inadvertently touch on copyright issues. We recommend using AI-generated images whenever possible. All current theme image assets are AI-generated, so some images may contain AI watermarks or similar generation artifacts. If you don't like the AI-generated images, you can freely upload your own background and room images in the settings. If you believe any skin infringes on your copyright, please open an issue and we will remove it promptly.

## Philosophy

Keep it simple, keep it easy.

Skins Pro is built around simplicity and ease of use. Install from HACS, pick a skin, adjust a few settings in the card editor, and you're done. Every feature is designed to be intuitive, so you can focus on enjoying your smart home.

## Installation

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ha-china&repository=Skins-Pro&category=plugin)

Click the button above, or manually:

1. HACS → Custom Repositories → Add `https://github.com/ha-china/Skins-Pro`, category: plugin
2. Install Skins Pro
3. Refresh Home Assistant frontend
4. Settings → Dashboards → Add Dashboard → Select "Skins Pro"

![New Dashboard](https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/add_dashboard.png)

![Settings](https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/settings.png)

## Skin Store

![Store](https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/store.gif)

Download additional skins directly from the card editor. Clicking **Download** fetches the skin package from the CDN and installs it to your HA `www/` directory via the [`skins-pro-hass`](https://github.com/ha-china/skins-pro-hass) integration.

Opening the skin store fetches the public skin registry from our CDN; downloads and likes are counted anonymously via a random local ID (no account or personal data).

> The integration is only needed for downloading skins from the store. If you only use the built-in **modern** skin, you can skip installing it.

## Built-in Skin

| Skin | Style | Features |
|---|---|---|
| **modern** (default) | White glassmorphism | Frosted glass, high-res images, clean blue-white palette, built-in dark mode |

> All other skins (AEON, AEON_glass, visionOS, minecraft, and community submissions) are available via the **Skin Store** built into the card editor. Click the store button to browse and download.

## Preview

![modern](https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/modern.png)

![modern dark](https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/modern-dark.png)

![Advanced Feature](https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/Advanced_Feature.png)

### Skin Switching Demo

<video src="https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/skin.mp4" controls width="100%" preload="metadata"></video>
[⬇ Download MP4](https://github.com/ha-china/Skins-Pro/raw/screenshot-assets/skin.mp4)

## Features

- ☀️ Weather & greeting
- 💬 Info display
- 📱 Device controls (by area or by type) — lights, switches, covers, climate, water heater, fan, humidifier, vacuum
- 🚪 Room snapshots with scene chips
- 🎬 Scene buttons
- 🤖 Automations page
- ⚡ Energy dashboard (today vs yesterday)
- 🛡️ Security page — cameras, locks, alarm control panel (auto-detected, click to arm/disarm)
- 🎵 Media player card — album art, playback controls, skip tracks, volume bar
- 📷 Camera snapshot on homepage
- 🌡️ Environment sensors display — auto icon from HA
- 🗺️ Device grouping by floor
- 🌐 Auto CN/EN bilingual switching
- 🌙 Dark mode — auto sunset/sunrise switching, or tap the clock to toggle manually (modern skin)
- 🔍 Global search — fuzzy match devices, filter by type
- ↔️ True fullscreen mode via the browser Fullscreen API (tap the profile to toggle, ESC to exit)
- 🔒 Demo mode for non-admin users — auto-fullscreen on first tap, context menu & devtools shortcut guard
- 🖼️ Use HA area pictures as room backgrounds
- 🎨 Custom background image upload
- 📱 Responsive across phones, tablets, folding phones and desktop — with HiDPI / OS-scaling / browser-zoom compensation
- 🎭 Multi-skin architecture with built-in skin store

On first add, it automatically scans your Home Assistant and organizes content by area and device type.

## Development

Skin development guide, build instructions, and contributing guide have been moved to the [Wiki](https://github.com/ha-china/Skins-Pro/wiki). ([中文版](https://github.com/ha-china/Skins-Pro/wiki/Home-zh-CN))

## Credits

- Architecture inspired by [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next)
- Design inspired by [html-card-pro Discussions](https://github.com/ha-china/html-card-pro/discussions/11)
- Core rendering by [Lit](https://lit.dev/)
- Image processing by [sharp](https://sharp.pixelplumbing.com/)
- Bundles Lit at build time — zero extra runtime dependencies for your dashboard, lean and fast