# Skins Pro

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Desmond-Dong&repository=Skins-Pro&category=plugin)

给你的 Home Assistant 换上精美的主页吧！  
Make your Home Assistant dashboard beautiful!

Skins Pro 是一款社区仪表盘卡片，采用多皮肤架构，内置 Minecraft 和 Modern 两套皮肤。自带中英文双语——装上就能用。

Skins Pro is a community dashboard card with a multi-skin architecture, featuring built-in **minecraft** and **modern** skins. Bilingual (CN/EN) — plug and play.

- 从 Community dashboards 直接添加，开箱即用 / Add from HACS Community Dashboards
- 多皮肤支持，自由切换 / Multiple skins, freely switchable
- 全屏（Kiosk）模式，沉浸式体验 / Fullscreen (Kiosk) mode for an immersive experience
- 构建时自动处理图片（缩放、转格式） / Auto image processing on build (resize, convert)

## 安装 / Installation

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Desmond-Dong&repository=Skins-Pro&category=plugin)

点上面的按钮一键添加，或者手动操作：  
Click the button above, or manually:

1. HACS → Custom Repositories → Add `https://github.com/Desmond-Dong/Skins-Pro`, category: Dashboard
2. Install Skins Pro
3. Refresh Home Assistant frontend
4. Settings → Dashboards → Add Dashboard → Select "Skins Pro"

## 内置皮肤 / Built-in Skins

| 皮肤 / Skin | 风格 / Style | 特点 / Features |
|---|---|---|
| **default** | Minecraft 暗色主题 / Dark Minecraft theme | 深色纹理背景，暖色系 / Dark textured background, warm tones |
| **modern** | 白色玻璃主题 / White glassmorphism | 毛玻璃效果，蓝色调，高分辨率图片 / Frosted glass, blue accent, high-res images |

在卡片编辑器的 `resource_pack.skin` 字段切换皮肤。  
Switch skins via the `resource_pack.skin` field in the card editor.

## 功能 / Features

- ☀️ 天气 / Weather
- 💬 信息展示 / Info display
- 📱 设备控制面板 / Device controls
- 🚪 房间快照 / Room snapshots
- 🎬 场景按钮 / Scene buttons
- ⚡ 今日用电 / Energy usage today
- 🛡️ 安全页面（摄像头、门锁、报警）/ Security page (cameras, locks, alarm)
- 🌐 中英文自动切换 / Auto CN/EN language switching
- ↔️ 全屏/Kiosk 模式（点击侧边装饰图切换）/ Kiosk mode (click sidebar decor to toggle)

首次添加时会自动扫描你的 Home Assistant，尽量匹配已有的实体。  
On first add, it scans your Home Assistant and auto-matches entities.

## 如何制作皮肤 / Creating a Skin

皮肤是一个文件夹放在 `skins-pro/<皮肤名>/` 下，包含图片素材、CSS 和文本配置。`npm run build` 会自动发现并处理。

A skin is a folder under `skins-pro/<skin-name>/` containing images, CSS, and strings. `npm run build` auto-discovers and processes it.

### 目录结构 / Directory Structure

```
skins-pro/
  your-skin-name/
    theme.css            # 样式文件（必须） / Styles (required)
    strings.json         # 皮肤专属文本 + icon_map（可选 / optional）
    avatar.jpg     # 头像（可选，建议 300×300） / Avatar
    base-texture.jpg     # 背景纹理（可选，自动缩放到 2560×1440 16:9）
    stage-background.jpg # 主区域背景（可选，自动缩放到 2560×1440 16:9）
    decoration.jpg  # 侧边装饰图（可选，宽 ≤ 800px）
    room-living.jpg      # 房间图（可选，宽 ≤ 1200px）
    room-bedroom.jpg     # 同上 / same
    room-kitchen.jpg     # 同上 / same
    room-garden.jpg      # 同上 / same
    icon-light.jpg       # 灯光图标（可选，最长边 ≤ 300px）
    icon-switch.jpg      # 开关图标 / Switch icon
    icon-button.jpg      # 按钮/传感器图标 / Button/sensor icon
    icon-fan.jpg         # 风扇/吸尘器图标 / Fan/vacuum icon
    icon-ac.jpg          # 空调/温控图标 / Climate/thermostat icon
    icon-water_heater.jpg  # 热水器图标 / Water heater icon
    icon-humidifier.jpg  # 除湿机图标 / Humidifier icon
    icon-speaker.jpg     # 音响图标 / Speaker icon
    icon-remote.jpg      # 遥控器图标 / Remote icon
    icon-lock.jpg        # 门锁图标 / Lock icon
    icon-camera.jpg      # 摄像头图标 / Camera icon
    icon-garden-light.jpg  # 花园灯/通用设备图标 / Garden light / fallback icon
```

### 构建时图片处理 / Image Processing

构建时（`npm run build`）自动处理所有图片：  
All images are auto-processed during `npm run build`:

| 文件名前缀 / Prefix | 目标尺寸 / Target | 说明 / Notes |
|---|---|---|
| `room-*` | 宽 ≤ 1200px / width | 保持比例 / Maintain aspect ratio |
| `icon-*` | 最长边 ≤ 300px / longest edge | 保持比例 / Maintain aspect ratio |
| `avatar-*` | 最长边 ≤ 300px / longest edge | 保持比例 / Maintain aspect ratio |
| `decor-*` | 宽 ≤ 800px / width | 保持比例 / Maintain aspect ratio |
| `base-*`, `stage-*` | 宽 ≤ 2560px | 保持比例 / Maintain aspect ratio |
| 其他 / others | 宽 ≤ 1200px / width | 保持比例 / Maintain aspect ratio |

源文件支持 PNG / JPG / BMP / WebP，一律输出为 JPG，小于目标尺寸的图片不会放大。  
Supports PNG / JPG / BMP / WebP input, outputs JPG. Never upscales (`withoutEnlargement: true`).

### theme.css

所有样式写在 `theme.css` 里，通过 CSS 变量自定义。完整变量列表参考 `skins-pro/modern/theme.css`。  
All styles go in `theme.css`, customized via CSS variables. See `skins-pro/modern/theme.css` for the full variable list.

### strings.json + icon_map

```json
{
  "title_zh": "欢迎回来！",
  "title_en": "Welcome back!",
  "profile_name_zh": "主人",
  "profile_name_en": "Owner",
  "icon_map": {
    "light": "light",
    "switch": "switch",
    "climate": "climate",
    "media_player": "speaker",
    "lock": "lock"
  }
}
```

`icon_map` 定义实体域 → 图标图片的映射，未覆盖的域会自动 fallback。  
`icon_map` maps entity domains → icon image filenames. Unmapped domains fall back automatically.

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
Build output goes to `dist/`:

- `dist/skins-pro.js` — 核心 JS / Core JS bundle
- `dist/<皮肤名>/` — 各皮肤的素材和 CSS / Per-skin assets and CSS

### 在 HA 中测试 / Testing in HA

1. `npm run build`
2. 把 `dist/` 下文件拷贝到 HA 的 `www/community/skins-pro/` / Copy `dist/` to HA's `www/community/skins-pro/`
3. 硬刷新浏览器（Ctrl+Shift+R / Cmd+Shift+R）/ Hard refresh browser

### 调试技巧 / Debugging Tips

- DevTools 查看 Shadow DOM 结构 / Inspect Shadow DOM structure
- CSS 变量在 `:host` 上设置，可实时修改 / CSS variables on `:host` — tweak live in DevTools
- 构建日志会输出每个皮肤的处理状态 / Build logs show each skin's processing status

## 说明 / Notes

- 架构启发自 [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next) / Architecture inspired by dwains-dashboard-next
- 设计启发自 [html-card-pro Discussions](https://github.com/ha-china/html-card-pro/discussions/11) / Design inspired by html-card-pro
- 全屏模式启发自 [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) / Kiosk mode inspired by kiosk-mode
- 核心渲染框架使用 [Lit](https://lit.dev/)，HA 状态更新时只按需更新 DOM / Uses [Lit](https://lit.dev/) for reactive, flicker-free DOM updates
- 构建时使用 [sharp](https://sharp.pixelplumbing.com/) 自动处理图片 / Uses [sharp](https://sharp.pixelplumbing.com/) for image processing on build
- 没有运行时依赖，保持精简 / Zero runtime dependencies, lean and fast
