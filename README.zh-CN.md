# Skins Pro — **下一代 Home Assistant 仪表盘**

[English Version](README.md)

**下一代 Home Assistant 仪表盘**——多皮肤、沉浸式、开箱即用。

Skins Pro 是一款社区 Lovelace 卡片，采用多皮肤架构。内置 **modern** 皮肤，并通过皮肤商店提供更多皮肤。自带中英文双语，从 HACS 安装后无需配置即可使用。

- 从 HACS 自定义仓库添加
- 多皮肤自由切换
- 全屏 Kiosk 模式，沉浸式体验
- 构建时自动处理图片（缩放、转 JPG）
- 按房间区域展示设备
- 设备自动按 domain 匹配对应图标

> 说明 — 我们常因喜爱而制作自己喜欢的皮肤，但不经意间可能会触及版权问题。建议尽量使用 AI 生成图片以规避风险。当前所有主题图片资源均由 AI 生成，部分图片可能会出现 AI 水印或类似生成痕迹；如果你不喜欢 AI 生成的图片，可以在设置里自由上传背景图和房间图片。如果您认为某些皮肤侵犯了您的版权，请在 Issue 区留言，我们会及时删除对应皮肤。

## 设计理念

保持简单，保持易用。

Skins Pro 的设计围绕简单和易用展开。从 HACS 安装，选择皮肤，在卡片编辑器里调整几个设置，就可以开始使用。每个功能都力求直观，让你专注于享受智能家居。

## 安装

[![Open your Home Assistant instance and add this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=ha-china&repository=Skins-Pro&category=plugin)

点上面的按钮一键添加，或者手动操作：

1. HACS → Custom Repositories → Add `https://github.com/ha-china/Skins-Pro`, category: Dashboard
2. 安装 Skins Pro
3. 刷新 Home Assistant 前端
4. 设置 → 仪表盘 → 添加新仪表盘 → 选 "Skins Pro"

![New Dashboard](screenshots/add_dashboard.png)

![Settings](screenshots/settings.png)

## 皮肤商店

![商店](screenshots/store.gif)

可在卡片编辑器中直接下载额外皮肤。点击**下载**时，卡片通过 CDN 从 [store 分支](https://github.com/ha-china/Skins-Pro/tree/store) 获取皮肤包，并通过 [`skins-pro-hass`](https://github.com/ha-china/skins-pro-hass) 集成安装到 HA 的 `www/` 目录。

> 集成仅在从商店下载皮肤时需要。如果只用内置的 **modern** 皮肤，可以不安装。

## 内置皮肤

| 皮肤 | 风格 | 特点 |
|---|---|---|
| **modern**（默认） | 白色玻璃 | 毛玻璃效果，高分辨率图片，温润蓝白配色 |

> 其他皮肤（AEON、AEON_glass、visionOS、minecraft 及社区投稿）均通过卡片编辑器中的**皮肤商店**下载使用。点击商店按钮浏览并下载。

## 预览

![modern](screenshots/modern.png)

![Advanced Feature](screenshots/Advanced_Feature.png)

### 皮肤切换演示

<video src="https://github.com/ha-china/Skins-Pro/raw/master/screenshots/skin.mp4" controls width="100%" preload="metadata"></video>
[⬇ Download MP4](screenshots/skin.mp4)

## 功能

- ☀️ 天气与问候
- 💬 信息展示
- 📱 设备控制面板（按房间或按类型）— 灯、开关、窗帘、空调、热水器、风扇、加湿器、扫地机
- 🚪 房间快照
- 🎬 场景按钮
- 🤖 自动化页面
- ⚡ 能源面板（含昨日对比）
- 🛡️ 安全页面 — 摄像头、门锁、安防面板（自动检测，点击可布撤防）
- 🎵 媒体播放器卡片 — 专辑封面、播放控制、上下曲切换、音量条
- 📷 首页摄像头实时快照
- 🌡️ 环境传感器展示
- 🌐 中英文双语自动切换
- ↔️ 全屏 Kiosk 模式
- 🖼️ 使用 HA 区域图片作为房间背景
- 🎨 自定义背景图片上传
- 📱 移动端自适应布局
- 🎭 多皮肤架构 — 从内置商店下载社区皮肤

首次添加时会自动扫描你的 Home Assistant，按区域和设备类型组织页面。

## 皮肤开发

皮肤是一个文件夹放在 `skins-pro/<皮肤名>/` 下，包含图片、CSS 和文本配置。`npm run build` 会自动发现、处理图片并生成代码。

### 目录结构

```
skins-pro/
  your-skin-name/
    theme.css               # 样式（必须）
    strings.json            # 皮肤文本 + icon_map + author（必须）
    avatar.jpg              # 头像，建议 ≥ 300×300
    background.jpg          # 主区域背景，建议宽 ≥ 2560px
    decoration.jpg          # 侧边装饰图，建议高 ≥ 400px
    base-texture.jpg        # 背景纹理，建议宽 ≥ 2560px
    stage-*.jpg             # 阶段/过渡图，建议宽 ≥ 2560px
    room-*.jpg              # 房间图，建议宽 ≥ 1200px
    icon-*.jpg              # 设备图标，建议最长边 ≥ 300px
```

### 构建时图片处理

| 文件名 | 建议源尺寸 | 说明 |
|---|---|---|
| `room-*` | 宽 ≥ 1200px | 保持比例，缩放至 1200px |
| `icon-*` | 最长边 ≥ 300px | 保持比例，缩放至 300px |
| `avatar.*` | 最长边 ≥ 300px | 保持比例，缩放至 300px |
| `decoration.*` | 高 ≥ 400px | 保持比例，缩放至高 400px |
| `background.*`, `base-*`, `stage-*` | 宽 ≥ 2560px | 保持比例，缩放至 2560px |
| 其他 | 宽 ≥ 1200px | 保持比例，缩放至 1200px |

源文件支持 PNG / JPG / BMP / WebP，图标、头像和装饰图输出 PNG，其余输出 JPG，不大于原图。

### theme.css

所有样式通过 `:host` 上的 CSS 变量自定义。每个皮肤独立的 `theme.css` 文件。参考 `skins-pro/modern/theme.css` 查看所有变量。

### strings.json + icon_map + author

```json
{
  "author": "你的-GitHub-用户名",
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

- `author` — 你的 GitHub 用户名（不含 `@`），在商店中显示并链接到你的主页。
- `icon_map` — 定义实体域→图标图片的映射，未覆盖的域自动 fallback。

> **最佳参考** — 创建新皮肤时请以 [`skins-pro/visionOS/`](skins-pro/visionOS/) 为起点，它拥有最完整的 `icon_map`、`theme.css` 和图标资源。

## 开发

```bash
git clone https://github.com/ha-china/Skins-Pro.git
cd Skins-Pro
npm install
npm run build       # 构建全部
npm run build -- <皮肤名>   # 只构建指定皮肤 + modern（更快）
npm run build -- <皮肤名> --skins-only   # 只处理皮肤图片，不重建 JS
npm run watch       # 文件变动时自动重新构建
npm run type-check  # 代码检查
```

`npm run build -- visionOS` 只构建 `modern` + `visionOS`，跳过其它皮肤，适合本地迭代单个皮肤。

`npm run build -- visionOS --skins-only` 只处理皮肤图片，输出到 `dist/visionOS/`，不重建 JS、不打包 zip。已有可用的 `dist/skins-pro.js` 时用这个，只更新皮肤图片。

构建产物在 `dist/`：

- `dist/skins-pro.js` — 主 JS 文件（HA 测试只需要这一个）
- `dist/modern/` — 内置 modern 皮肤的图片和样式

### 在 Home Assistant 中测试

1. **构建项目：**
   ```bash
   npm run build
   ```

2. **把 `dist/skins-pro.js` 复制到 HA 的 `www/` 目录：**
   ```
   <HA 配置>/www/skins-pro.js
   ```

3. **在 Home Assistant 中添加资源：**
   设置 → 仪表盘 → 资源 → 添加资源
   - URL：`/local/skins-pro.js`
   - 类型：JavaScript Module

4. **硬刷新浏览器**（Ctrl+Shift+R）。

   之后每次 `npm run build`，只需要替换 `www/skins-pro.js` 然后硬刷新就能看到效果。

> **提示** — 如果内置 **modern** 皮肤的图片或样式加载不出来，把 `dist/modern/` 也复制到 `www/community/skins-pro/modern/`：
> ```
> <HA 配置>/www/community/skins-pro/modern/  ← 把 dist/modern/ 复制到这里
> ```

### 本地测试新皮肤

不需要通过商店下载，直接本地测试：

1. 在 `skins-pro/<新皮肤名>/` 下创建皮肤目录，放入所需文件（`theme.css`、`strings.json`、图片等）

2. 执行 `npm run build -- <新皮肤名> --skins-only`，只处理皮肤图片，输出到 `dist/<新皮肤名>/`

3. 把 `dist/<新皮肤名>/` 复制到 HA 的 `www/` 目录：
   ```
   <HA 配置>/www/skins-pro/<新皮肤名>/
     ├── theme.css
     ├── avatar.jpg
     ├── background.jpg
     ├── room-*.jpg
     ├── icon-*.jpg
     └── ...（皮肤目录下所有文件）
   ```

4. 在 Skins Pro 卡片编辑器中，把皮肤名加入 `downloaded_skins`：
   ```json
   "downloaded_skins": ["<新皮肤名>"]
   ```
   这样卡片会认为该皮肤已安装，下拉列表中直接出现。选中它，硬刷新即可。

本地测试满意后，通过 PR 提交分享即可。

## 贡献主题

欢迎提交你的皮肤到 Skins Pro！只需：

1. 在 `skins-pro/<皮肤名>/` 下创建皮肤目录，放入所需文件（参见上方 [皮肤开发](#皮肤开发)）
2. 在 `screenshots/<皮肤名>.png` 添加预览截图（1920×1080 为宜）
3. 使用 PR 模板提交 PR，填写所有必填字段

合并后 CI 会自动构建卡片、将皮肤打包到 store 分支、并在卡片编辑器的皮肤商店中上架。

> ⚠️ **版权提醒** — 贡献皮肤时请确保图片资源不侵犯他人版权，建议使用 AI 生成或原创图片。如收到版权投诉，对应皮肤将从商店中移除。

提交后机器人会自动在 PR 下发布一条 **Screenshot Preview** 评论，展示你的皮肤预览图。

### 必须文件

| 文件 | 说明 |
|---|---|
| `theme.css` | 全部样式通过 CSS 变量定义在 `:host` 上。参考 `skins-pro/modern/theme.css` |
| `strings.json` | 问候语 + `icon_map`。**必须**包含非空的 `author` 字段 |
| `avatar.*` (png/jpg) | 头像，建议 ≥ 300×300 |
| `background.*` (png/jpg) | 主背景，建议宽 ≥ 2560px |
| `screenshots/<皮肤名>.png` | 商店预览图，**文件名必须与皮肤文件夹名完全一致** |

### 建议

- 以 [`skins-pro/visionOS/`](skins-pro/visionOS/) 为参考 — 它包含最完整的 `icon_map` 和资源
- 构建时会自动处理图片（缩放、转 JPG），无需手动优化
- `strings.json` 中的 `icon_map` 映射实体域名→图标文件名，未覆盖的域名自动 fallback

## 致谢

- 架构启发自 [dwains-dashboard-next](https://github.com/dwainscheeren/dwains-dashboard-next)
- 设计启发自 [html-card-pro Discussions](https://github.com/ha-china/html-card-pro/discussions/11)
- 全屏模式启发自 [kiosk-mode](https://github.com/NemesisRE/kiosk-mode)
- 核心渲染框架 Lit
- 图片处理 sharp
- 零运行时依赖，保持精简