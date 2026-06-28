# Skins Pro — **Next-Gen Home Assistant Dashboard**

**下一代 Home Assistant 仪表盘**——多皮肤、沉浸式、开箱即用。  
**Next-Gen Home Assistant Dashboard** — Multi-skin, immersive, plug-and-play.

Skins Pro 是一款社区 Lovelace 卡片，采用多皮肤架构，内置 **modern**、**AEON** 和 **minecraft** 三套精美皮肤，自带中英文双语，从 HACS 安装后无需配置即可使用。  
Skins Pro is a community Lovelace card with a multi-skin architecture featuring **modern**, **AEON**, and **minecraft** skins. Bilingual (CN/EN) — install from HACS and it just works.

- 从 HACS Community Dashboards 直接添加 / Add directly from HACS Community Dashboards
- 多皮肤自由切换 / Switch between skins freely
- 全屏 Kiosk 模式，沉浸式体验 / Fullscreen Kiosk mode for immersive experience
- 构建时自动处理图片（缩放、转 JPG）/ Auto image processing on build (resize, JPG convert)
- 按房间区域展示设备 / Area-based room display
- 设备自动按 domain 匹配对应图标 / Auto icon matching by entity domain

## 安装 / Installation

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Desmond-Dong&repository=Skins-Pro&category=plugin)

点上面的按钮一键添加，或者手动操作：  
Click the button above, or manually:

1. HACS → Custom Repositories → 添加 `https://github.com/Desmond-Dong/Skins-Pro`，类别选 Dashboard
2. 安装 Skins Pro / Install Skins Pro
3. 刷新 Home Assistant 前端 / Refresh Home Assistant frontend
4. 设置 → 仪表盘 → 添加新仪表盘 → 选 "Skins Pro" / Settings → Dashboards → Add Dashboard → Select "Skins Pro"

## 内置皮肤 / Built-in Skins

| 皮肤 / Skin | 风格 / Style | 特点 / Features |
|---|---|---|
| **modern**（默认 / default） | 白色玻璃 / White glassmorphism | 毛玻璃效果，高分辨率图片，温润蓝白配色 / Frosted glass, high-res images, clean blue-white palette |
| **AEON** | 暗色奢华 / Dark luxury | 深邃黑底，蓝色辉光，毛玻璃卡片，影院级阴影 / Deep blacks, blue glow, glassmorphism, cinematic shadows |
| **minecraft** | Minecraft 主题 / Minecraft theme | 深色纹理背景，暖色调，Steve 头像 / Dark textured background, warm tones, Steve avatar |

在卡片编辑器的「皮肤 / Skin」字段切换。  
Switch via the "Skin" field in the card editor.

## 功能 / Features

- ☀️ 天气与问候 / Weather & greeting
- 💬 信息展示 / Info display
- 📱 设备控制面板（按房间或按类型）/ Device controls (by area or by type)
- 🚪 房间快照 / Room snapshots
- 🎬 场景按钮 / Scene buttons
- ⚡ 今日用电（含昨日对比）/ Energy usage today (with vs yesterday)
- 🛡️ 安全页面（摄像头、门锁、布撤防）/ Security page (cameras, locks, arming)
- 🌐 中英文自动切换 / Auto CN/EN language switching
- ↔️ 全屏 Kiosk 模式 / Kiosk mode
- 🖼️ 使用 HA 区域图片作为房间背景 / Use HA area pictures as room backgrounds

首次添加时会自动扫描你的 Home Assistant，按区域和设备类型组织页面。  
On first add, it automatically scans your Home Assistant and organizes content by area and device type.

## 皮肤开发 / Skin Development

皮肤是一个文件夹放在 `skins-pro/<皮肤名>/` 下，包含图片、CSS 和文本配置。`npm run build` 会自动发现、处理图片并生成代码。  
A skin is a folder under `skins-pro/<skin-name>/` containing images, CSS, and strings. `npm run build` auto-discovers, processes images, and generates code.

### 目录结构 / Directory Structure

```
skins-pro/
  your-skin-name/
    theme.css               # 样式（必须）/ Styles (required)
    strings.json            # 皮肤文本 + icon_map（可选）/ Strings + icon_map (optional)
    avatar.jpg              # 头像，建议 300×300 / Avatar, recommended 300×300
    background.jpg          # 主区域背景，宽 ≤ 2560px / Background, width ≤ 2560px
    decoration.jpg          # 侧边装饰图，宽 ≤ 800px / Side decoration, width ≤ 800px
    base-texture.jpg        # 背景纹理，宽 ≤ 2560px / Base texture, width ≤ 2560px
    stage-*.jpg             # 阶段/过渡图，宽 ≤ 2560px / Stage image, width ≤ 2560px
    room-*.jpg              # 房间图，宽 ≤ 1200px / Room image, width ≤ 1200px
    icon-*.jpg              # 设备图标，最长边 ≤ 300px / Device icon, longest edge ≤ 300px
```

### 构建时图片处理 / Image Processing

| 文件名 / Pattern | 目标尺寸 / Target | 说明 / Notes |
|---|---|---|
| `room-*` | 宽 ≤ 1200px / width | 保持比例 / Maintain aspect ratio |
| `icon-*` | 最长边 ≤ 300px / longest edge | 保持比例 / Maintain aspect ratio |
| `avatar.*` | 最长边 ≤ 300px / longest edge | 保持比例 / Maintain aspect ratio |
| `decoration.*` | 宽 ≤ 800px / width | 保持比例 / Maintain aspect ratio |
| `background.*`, `base-*`, `stage-*` | 宽 ≤ 2560px / width | 保持比例 / Maintain aspect ratio |
| 其他 / others | 宽 ≤ 1200px / width | 保持比例 / Maintain aspect ratio |

源文件支持 PNG / JPG / BMP / WebP，一律输出 JPG，不大于原图。  
Supports PNG / JPG / BMP / WebP input, outputs JPG. Never upscales.

### theme.css

所有样式通过 `:host` 上的 CSS 变量自定义。每个皮肤独立的 `theme.css` 文件。参考 `skins-pro/modern/theme.css` 查看所有变量。  
All styles are customized via CSS variables on `:host`. Each skin has its own `theme.css`. See `skins-pro/modern/theme.css` for the full variable list.

### strings.json + icon_map

```json
{
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

`icon_map` 定义实体域→图标图片的映射，未覆盖的域自动 fallback。  
Maps entity domains to icon image filenames. Unmapped domains fall back automatically.

## 开发 / Development

```bash
git clone https://github.com/Desmond-Dong/Skins-Pro.git
cd Skins-Pro
npm install
npm run build       # 构建 / Build
npm run watch       # 开发模式自动构建 / Watch mode
npm run type-check  # TypeScript 类型检查 / Type check
```

构建产物在 `dist/`：  
Build output: `dist/`

- `dist/skins-pro.js` — 核心 JS / Core JS bundle
- `dist/<皮肤名>/` — 各皮肤素材和 CSS / Per-skin assets and CSS

### 在 HA 中测试 / Testing in HA

1. `npm run build`
2. 将 `dist/` 复制到 HA 的 `www/community/skins-pro/` / Copy `dist/` to HA's `www/community/skins-pro/`
3. 硬刷新浏览器（Ctrl+Shift+R）/ Hard refresh

## 致谢 / Credits

- 架构启发自 [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next) / Architecture inspired by dwains-dashboard-next
- 设计启发自 [html-card-pro Discussions](https://github.com/ha-china/html-card-pro/discussions/11) / Design inspired by html-card-pro
- 全屏模式启发自 [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) / Kiosk mode inspired by kiosk-mode
- 核心渲染框架 [Lit](https://lit.dev/) / Core rendering by Lit
- 图片处理 [sharp](https://sharp.pixelplumbing.com/) / Image processing by sharp
- 零运行时依赖，保持精简 / Zero runtime dependencies, lean and fast
