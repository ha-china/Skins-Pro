const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const sharp = require('sharp');
const { ZipArchive } = require('archiver');

const src = 'skins-pro';
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
const allDirs = fs.readdirSync(src, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();
const invalid = targetSkins.filter(s => !allDirs.includes(s));
if (invalid.length > 0) {
  console.error(`Error: skin(s) not found: ${invalid.join(', ')}. Available: ${allDirs.join(', ')}`);
  process.exit(1);
}
const dirs = targetSkins.length > 0
  ? allDirs.filter(d => d === 'modern' || targetSkins.includes(d))
  : allDirs;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp'];

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
  if (name.startsWith('base-') || name.startsWith('stage-') || name.startsWith('background.')) {
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

(async () => {
  fs.mkdirSync(dest, { recursive: true });
  fs.mkdirSync(store, { recursive: true });

  const storePackages = [];

  for (const dir of dirs) {
    const srcDir = path.join(src, dir);
    const isModern = dir === 'modern';
    const outDir = isModern ? path.join(dest, dir) : path.join(stage, dir);

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

    if (!isModern) {
      // Zip non-modern directly into store/<dir>.zip, then clean up staging
      const zipPath = path.join(store, `${dir}.zip`);
      await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = new ZipArchive({ zlib: { level: 9 } });
        output.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(output);
        archive.directory(outDir, dir);
        archive.finalize();
      });
      fs.rmSync(outDir, { recursive: true, force: true });
      storePackages.push(dir);
    }
  }

  // Clean up staging directory
  if (fs.existsSync(stage)) {
    fs.rmSync(stage, { recursive: true, force: true });
  }

  // Generate skin list + strings + icon maps for compile-time injection.
  // Only the bundled 'modern' skin's metadata is injected — non-bundled skins
  // fetch their strings.json at runtime from /local/skins-pro/<skin>/strings.json
  // (the file is shipped inside each store zip and unzipped by skins-pro-hass).
  const stringsMap = {};
  const iconMaps = {};
  dirs.forEach(dir => {
    if (dir !== 'modern') return;
    const file = path.join(src, dir, 'strings.json');
    const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
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
  const screenshotsDir = 'screenshots';
  const thumbsDir = path.join(screenshotsDir, 'thumbnails');
  const registry = [];

  fs.mkdirSync(thumbsDir, { recursive: true });

  // Only generate thumbnails for processed skins (changed ones)
  for (const dir of dirs) {
    if (dir === 'modern') continue;
    const found = IMAGE_EXTENSIONS.map(ext => path.join(screenshotsDir, `${dir}${ext}`)).find(p => fs.existsSync(p));
    if (found) {
      const thumbDest = path.join(thumbsDir, `${dir}.jpg`);
      await sharp(found).resize({ width: 500, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(thumbDest);
    }
  }

  // Registry always includes ALL skins (just reads metadata, fast)
  for (const dir of allDirs) {
    if (dir === 'modern') continue;
    const stringsFile = path.join(src, dir, 'strings.json');
    const stringsData = fs.existsSync(stringsFile) ? JSON.parse(fs.readFileSync(stringsFile, 'utf8')) : {};
    registry.push({
      id: dir,
      name: dir,
      author: stringsData.author || '',
      thumbnail: `screenshots/thumbnails/${dir}.jpg`,
      package: `store/${dir}.zip`,
    });
  }

  fs.writeFileSync(
    path.join('screenshots', 'registry.json'),
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
