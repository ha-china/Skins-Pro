const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const sharp = require('sharp');
const { ZipArchive } = require('archiver');

const assetsSrc = 'skin-assets';
const devSrc = 'skins-pro';
const screenshotAssetsSrc = 'screenshot-assets';
const modernSrc = 'src/skins/modern';
const dest = 'dist';
const store = 'store';
const stage = '__stage';

// Optional target skins via positional args (multiple supported).
//   npm run build -- visionOS minecraft
//   node scripts/build-skins.cjs visionOS minecraft
// Processes only specified skins + bundled 'modern'. Registry always includes all skins.
function resolveTargetSkins() {
  const skins = [];
  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) break;
    skins.push(arg);
  }
  return skins;
}
const targetSkins = resolveTargetSkins();
const skinsOnly = process.argv.includes('--skins-only');
function scanSkinDirs(root) {
  try {
    return fs.readdirSync(root, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
  } catch { return []; }
}
const allDirs = [...new Set([...scanSkinDirs(assetsSrc), ...scanSkinDirs(devSrc)])].sort();
console.log(`Skin sources: ${assetsSrc}=${scanSkinDirs(assetsSrc).length} dirs, ${devSrc}=${scanSkinDirs(devSrc).length} dirs, total=${allDirs.length}`);
const invalid = targetSkins.filter(s => s !== 'modern' && !allDirs.includes(s));
if (invalid.length > 0) {
  console.error(`Error: skin(s) not found: ${invalid.join(', ')}. Available: ${allDirs.join(', ')}`);
  process.exit(1);
}
const dirs = targetSkins.length > 0
  ? [...new Set(targetSkins)].filter(s => s === 'modern' || allDirs.includes(s))
  : [...allDirs, 'modern'];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'];

// strings.json is contributed by external skin PRs and its fields end up in
// the store registry.json, which is rendered as HTML by the card. Strip
// HTML-dangerous and control characters as defense in depth (the card also
// escapes on render). Keeps international display names intact.
const UNSAFE_META_CHARS = /[<>&"'`\\]|[\u0000-\u001f\u007f]/g;
function safeMeta(value, maxLen) {
  if (typeof value !== 'string') return '';
  const cleaned = value.replace(UNSAFE_META_CHARS, '').trim().slice(0, maxLen);
  if (cleaned !== value.trim()) {
    console.warn(`Warning: sanitized strings.json metadata "${String(value).slice(0, 64)}" -> "${cleaned}"`);
  }
  return cleaned;
}

function getResizeOptions(filename) {
  const name = path.basename(filename).toLowerCase();
  if (name.startsWith('room-')) {
    return { width: 1200 };
  }
  if (name.startsWith('icon-')) {
    return { width: 300, height: 300, fit: 'inside' };
  }
  if (name.startsWith('avatar')) {
    return { width: 300, height: 300, fit: 'inside' };
  }
  if (name.startsWith('decor')) {
    return { height: 400, fit: 'inside' };
  }
  if (name.startsWith('base-') || name.startsWith('stage-') || name.startsWith('background.') || name.startsWith('background-')) {
    return { width: 2560 };
  }
  return { width: 1200 };
}

function getOutputFormat(filename) {
  const name = path.basename(filename).toLowerCase();
  if (name.startsWith('icon-') || name.startsWith('avatar') || name.startsWith('decor')) return 'png';
  return 'jpg';
}

async function processImage(srcPath, destDir) {
  const ext = path.extname(srcPath).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(ext)) return;

  const opts = getResizeOptions(path.basename(srcPath));
  const fmt = getOutputFormat(path.basename(srcPath));
  const outName = path.basename(srcPath, ext) + '.' + fmt;
  const outPath = path.join(destDir, outName);

  try {
    const pipeline = sharp(srcPath);

    if (opts.fit) {
      pipeline.resize({ width: opts.width, height: opts.height, fit: opts.fit, withoutEnlargement: true });
    } else {
      pipeline.resize({ width: opts.width, withoutEnlargement: true });
    }

    if (fmt === 'png') {
      await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(outPath);
    } else {
      await pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(outPath);
    }
  } catch (err) {
    console.warn(`Warning: failed to process ${srcPath}, copying as-is: ${err.message}`);
    fs.copyFileSync(srcPath, outPath);
  }
}

function resolveSkinDir(skin) {
  const dev = path.join(devSrc, skin);
  if (fs.existsSync(dev)) return dev;
  return path.join(assetsSrc, skin);
}

function readSkinStrings(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.warn(`Warning: failed to parse ${file}: ${err.message}`);
    return {};
  }
}

(async () => {
  fs.mkdirSync(dest, { recursive: true });
  fs.mkdirSync(store, { recursive: true });

  const storePackages = [];

  for (const dir of dirs) {
    const srcDir = dir === 'modern' ? modernSrc : resolveSkinDir(dir);
    const isModern = dir === 'modern';
    const outDir = isModern ? path.join(dest, dir) : (skinsOnly ? path.join(dest, dir) : path.join(stage, dir));

    fs.mkdirSync(outDir, { recursive: true });

    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    const jobs = [];

    for (const entry of entries) {
      const srcFile = path.join(srcDir, entry.name);

      if (entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
        jobs.push(processImage(srcFile, outDir));
      } else if (entry.isFile()) {
        fs.copyFileSync(srcFile, path.join(outDir, entry.name));
      } else if (entry.isDirectory()) {
        fs.cpSync(srcFile, path.join(outDir, entry.name), { recursive: true, force: true });
      }
    }

    await Promise.all(jobs);

    if (!isModern && !skinsOnly) {
      // Zip non-modern directly into store/<dir>.zip, then clean up staging
      const zipPath = path.join(store, `${dir}.zip`);
      try {
        await new Promise((resolve, reject) => {
          let output;
          try {
            output = fs.createWriteStream(zipPath);
          } catch (err) {
            reject(err);
            return;
          }
          const archive = new ZipArchive({ zlib: { level: 9 } });
          output.on('close', resolve);
          output.on('error', reject);
          archive.on('error', reject);
          archive.pipe(output);
          archive.directory(outDir, dir);
          archive.finalize();
        });
      } catch (err) {
        console.error(`Error: failed to zip ${dir} -> ${zipPath}: ${err.message}`);
        fs.rmSync(zipPath, { force: true });
        throw err;
      }
      fs.rmSync(outDir, { recursive: true, force: true });
      storePackages.push(dir);
    }
  }

  // Clean up staging directory
  if (fs.existsSync(stage)) {
    fs.rmSync(stage, { recursive: true, force: true });
  }

  if (skinsOnly) {
    const scope = targetSkins.length > 0 ? `: ${targetSkins.join(', ')}` : '';
    console.log(`Skins build complete${scope} — ${dirs.length} skin(s) processed, output in dist/`);
    return;
  }

  // Generate skin list + strings + icon maps for compile-time injection.
  // Only the bundled 'modern' skin's metadata is injected — non-bundled skins
  // fetch their strings.json at runtime from /local/skins-pro/<skin>/strings.json
  // (the file is shipped inside each store zip and unzipped by skins-pro-hass).
  const stringsMap = {};
  const iconMaps = {};
  dirs.forEach(dir => {
    if (dir !== 'modern') return;
    const file = dir === 'modern' ? path.join(modernSrc, 'strings.json') : path.join(resolveSkinDir(dir), 'strings.json');
    const data = fs.existsSync(file) ? readSkinStrings(file) : {};
    stringsMap[dir] = data;
    iconMaps[dir] = data.icon_map || {};
  });

  fs.writeFileSync(
    path.join('src', 'skins', 'generated.ts'),
    '// Auto-generated by build-skins.cjs\n' +
    'export const SKINS: readonly string[] = ' + JSON.stringify(dirs.filter(d => d === 'modern')) + ';\n' +
    'export const DEFAULT_SKIN: string = ' + JSON.stringify('modern') + ';\n' +
    'export const SKIN_STRINGS: Record<string, any> = ' + JSON.stringify(stringsMap) + ';\n' +
    'export const SKIN_ICON_MAPS: Record<string, Record<string, string>> = ' + JSON.stringify(iconMaps) + ';\n',
  );

  // Generate i18n/index.ts — auto-discover language files in src/i18n/
  const i18nDir = path.join('src', 'i18n');
  const i18nFiles = fs.readdirSync(i18nDir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts')
    .sort();
  const localeImports = i18nFiles.map(f => {
    const name = f.replace(/\.ts$/, '');
    const varName = 'locale_' + name.replace(/[^a-zA-Z0-9]/g, '_');
    return `import ${varName} from './${name}';`;
  }).join('\n');
  const localeEntries = i18nFiles.map(f => {
    const name = f.replace(/\.ts$/, '');
    return `  '${name}': ${'locale_' + name.replace(/[^a-zA-Z0-9]/g, '_')},`;
  }).join('\n');
  const locales = i18nFiles.map(f => `'${f.replace(/\.ts$/, '')}'`).join(', ');

  fs.writeFileSync(
    path.join('src', 'i18n', 'index.ts'),
    '// Auto-generated by build-skins.cjs — do not edit manually\n' +
    'import type { TranslationKey } from \'../types\';\n' +
    localeImports + '\n' +
    '\n' +
    'export const SUPPORTED_LOCALES = [' + locales + '] as const;\n' +
    'export type Language = typeof SUPPORTED_LOCALES[number];\n' +
    '\n' +
    'export const STRINGS: Record<Language, Record<TranslationKey, string>> = {\n' +
    localeEntries + '\n' +
    '};\n',
  );

  // Generate theme registry + thumbnails for skin store
  const localScreenshotsDir = 'screenshots';
  const thumbsDir = path.join(screenshotAssetsSrc, 'thumbnails');
  const registry = [];

  function findScreenshot(skin) {
    const candidates = [screenshotAssetsSrc, localScreenshotsDir];
    for (const root of candidates) {
      const found = IMAGE_EXTENSIONS.map(ext => path.join(root, `${skin}${ext}`)).find(p => fs.existsSync(p));
      if (found) return found;
    }
    return undefined;
  }

  fs.mkdirSync(thumbsDir, { recursive: true });

  // Only generate thumbnails for processed skins (changed ones)
  for (const dir of dirs) {
    if (dir === 'modern') continue;
    const found = findScreenshot(dir);
    if (found) {
      const thumbDest = path.join(thumbsDir, `${dir}.jpg`);
      try {
        await sharp(found).resize({ width: 500, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(thumbDest);
      } catch (err) {
        console.warn(`Warning: failed to generate thumbnail for ${dir} from ${found}: ${err.message}`);
        continue;
      }
    }
  }

  // Registry always includes ALL skins (just reads metadata, fast)
  // Carry over sha256 checksums from the previous registry for skins whose zip
  // was not rebuilt in this (incremental) run, so the published registry always
  // has checksums for every skin it lists.
  let prevRegistry = {};
  try {
    for (const entry of JSON.parse(fs.readFileSync(path.join(screenshotAssetsSrc, 'registry.json'), 'utf8'))) {
      if (entry && typeof entry.id === 'string') prevRegistry[entry.id] = entry;
    }
  } catch { /* no previous registry */ }

  function zipSha256(dir) {
    const zipFile = path.join(store, `${dir}.zip`);
    if (fs.existsSync(zipFile)) {
      return crypto.createHash('sha256').update(fs.readFileSync(zipFile)).digest('hex');
    }
    return typeof prevRegistry[dir]?.sha256 === 'string' ? prevRegistry[dir].sha256 : '';
  }

  for (const dir of allDirs) {
    if (dir === 'modern') continue;
    const stringsFile = path.join(resolveSkinDir(dir), 'strings.json');
    const stringsData = fs.existsSync(stringsFile) ? readSkinStrings(stringsFile) : {};
    const sha256 = zipSha256(dir);
    registry.push({
      id: dir,
      name: dir,
      author: safeMeta(stringsData.author, 64),
      version: safeMeta(stringsData.version, 32),
      thumbnail: `screenshots/thumbnails/${dir}.jpg`,
      package: `store/${dir}.zip`,
      ...(sha256 ? { sha256 } : {}),
    });
  }

  fs.writeFileSync(
    path.join(screenshotAssetsSrc, 'registry.json'),
    JSON.stringify(registry, null, 2),
  );

  const scope = targetSkins.length > 0 ? ` (target: ${targetSkins.join(', ')})` : '';
  console.log(`Build complete${scope}: ${dirs.length}/${allDirs.length} skin(s) processed, ${i18nFiles.length} locale(s) detected, ${registry.length} registry entries, ${storePackages.length} store package(s) packed`);

  const rollup = spawnSync('node', [require.resolve('rollup/dist/bin/rollup'), '-c'], { stdio: 'inherit' });
  if (rollup.status !== 0) process.exit(rollup.status ?? 1);
})().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
