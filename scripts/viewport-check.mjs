#!/usr/bin/env node
// Viewport matrix screenshots for responsive regression checking.
//
//   node scripts/viewport-check.mjs            # compare against baseline
//   node scripts/viewport-check.mjs --update   # (re)write the baseline
//
// Requires playwright + a chromium install:  npm i -D playwright && npx playwright install chromium
// Baselines are environment-specific (font rendering differs across OSes) —
// compare on the same machine that produced them.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// OneDrive sync can hold freshly written PNGs briefly — retry before failing.
async function writeWithRetry(file, data, attempts = 4) {
  for (let i = 0; ; i++) {
    try {
      fs.writeFileSync(file, data);
      return;
    } catch (err) {
      if (i >= attempts - 1) throw err;
      await sleep(400);
    }
  }
}

// Pixel diff done INSIDE the browser via canvas: tolerant of antialiasing
// jitter (per-channel delta <= 24 ignored), fails when >0.1% of pixels are
// meaningfully different. Avoids adding a pixelmatch dependency.
async function diffPixels(page, baselinePng, currentPng) {
  return page.evaluate(async ([a, b]) => {
    const load = (src) => new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
    const toDataUrl = (buf) => `data:image/png;base64,${buf}`;
    const [ia, ib] = await Promise.all([load(toDataUrl(a)), load(toDataUrl(b))]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { ratio: 1 };
    const cv = document.createElement('canvas');
    cv.width = ia.width;
    cv.height = ia.height;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(ia, 0, 0);
    const da = ctx.getImageData(0, 0, ia.width, ia.height).data;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(ib, 0, 0);
    const db = ctx.getImageData(0, 0, ib.width, ib.height).data;
    let diff = 0;
    const total = ia.width * ia.height;
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) > 24 || Math.abs(da[i + 1] - db[i + 1]) > 24 || Math.abs(da[i + 2] - db[i + 2]) > 24) diff++;
    }
    return { ratio: diff / total, diffPixels: diff };
  }, [baselinePng.toString('base64'), currentPng.toString('base64')]);
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HARNESS = path.join(ROOT, 'test', 'harness.html');
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'screenshots', 'viewport-baseline');

// width x height x label — covers small phones, folding-phone short landscape,
// tablets, laptop and large desktop.
const VIEWPORTS = [
  [360, 640, 'phone-sm-portrait'],
  [390, 844, 'phone-lg-portrait'],
  [744, 420, 'fold-short-landscape'],
  [1024, 768, 'tablet-landscape'],
  [768, 1024, 'tablet-portrait'],
  [1280, 800, 'laptop'],
  [1920, 1080, 'desktop'],
  [2560, 1440, 'desktop-xl'],
];

// Extra passes at OS-scaling-like device scale factors: these flip the
// `min-resolution` media queries the HiDPI compensation layer keys off.
const DPR_GROUPS = [
  { suffix: '', dpr: 1, items: VIEWPORTS },
  { suffix: '@1.5x', dpr: 1.5, items: [VIEWPORTS[5], VIEWPORTS[2]] },
  { suffix: '@2x', dpr: 2, items: [VIEWPORTS[6]] },
];

// Placeholder "snapshot" so camera/media panels render like production ones.
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4a5a"/><stop offset="1" stop-color="#202830"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="320" cy="170" r="56" fill="none" stroke="#7a8a9a" stroke-width="4"/><text x="320" y="330" font-family="sans-serif" font-size="20" fill="#9aa8b8" text-anchor="middle">Placeholder</text></svg>`;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      let file;
      if (url.pathname.startsWith('/api/')) {
        res.writeHead(200, { 'content-type': 'image/svg+xml' });
        res.end(PLACEHOLDER_SVG);
        return;
      }
      if (url.pathname === '/' || url.pathname === '/harness.html') file = HARNESS;
      else file = path.join(ROOT, url.pathname);
      if (!file || !file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
      res.end(fs.readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function main() {
  const update = process.argv.includes('--update');
  if (!fs.existsSync(path.join(DIST, 'skins-pro.js'))) {
    console.error('dist/skins-pro.js not found — run `npm run build` first.');
    process.exit(1);
  }
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    console.error('playwright is not installed — run: npm i -D playwright && npx playwright install chromium');
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = await serve();
  const { port } = server.address();
  // Prefer bundled chromium; fall back to a system browser (Chrome/Edge are
  // preinstalled on most machines, no `playwright install` needed).
  let browser = null;
  for (const opts of [{}, { channel: 'chrome' }, { channel: 'msedge' }]) {
    try {
      browser = await playwright.chromium.launch(opts);
      break;
    } catch (err) {
      if (opts.channel === 'msedge') throw err;
    }
  }

  const results = [];
  for (const group of DPR_GROUPS) {
    for (const [w, h, name] of group.items) {
  const context = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: group.dpr,
  });
  const page = await context.newPage();
  // Freeze the clock: the card renders the live time and "N minutes ago"
  // strings, which would otherwise make every screenshot differ from the
  // baseline and turn byte comparison into pure noise.
  await context.addInitScript(() => {
    const FIXED = new Date('2026-09-13T10:30:00').getTime();
    const RealDate = Date;
    function FrozenDate(...args) {
      return args.length === 0 ? new RealDate(FIXED) : new RealDate(...args);
    }
    FrozenDate.prototype = RealDate.prototype;
    FrozenDate.now = () => FIXED;
    window.Date = FrozenDate;
  });
  await page.goto(`http://127.0.0.1:${port}/harness.html`, { waitUntil: 'networkidle' });
      // Wait for Lit render, registry loads (the loading banner must be gone —
      // otherwise baselines capture a half-initialised card) and transitions.
      await page.waitForFunction(() => {
        const c = document.querySelector('skins-pro-card');
        const sr = c && c.shadowRoot;
        return Boolean(sr && sr.querySelector('.mc-app .stage') && !sr.querySelector('.loading-registry'));
      }, { timeout: 10_000 }).catch(() => {});
      await page.evaluate(() => document.getElementById('warmup-note')?.remove());
      await page.waitForTimeout(500);
      const outPath = path.join(OUT_DIR, `${name}${group.suffix}.png`);
      const shot = await page.screenshot();
      if (update) {
        await writeWithRetry(outPath, shot);
        results.push(`${name}${group.suffix}: baseline written`);
        await context.close();
        continue;
      }
      if (!fs.existsSync(outPath)) {
        results.push(`${name}${group.suffix}: FAIL (no baseline — run with --update first)`);
        await context.close();
        continue;
      }
      const { ratio, diffPixels: changed } = await diffPixels(page, fs.readFileSync(outPath), shot);
      await context.close();
      if (ratio > 0.001) {
        await writeWithRetry(outPath.replace(/\.png$/, '.new.png'), shot);
        results.push(`${name}${group.suffix}: FAIL (${(ratio * 100).toFixed(2)}% pixels differ, ${changed}px)`);
      } else {
        results.push(`${name}${group.suffix}: OK`);
      }
    }
  }

  await browser.close();
  server.close();
  console.log(results.join('\n'));
  const failed = results.some((r) => r.includes('FAIL'));
  if (failed) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
