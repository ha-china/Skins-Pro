// One-off probe: load the harness, dump console/page errors and card state.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HARNESS = path.join(ROOT, 'test', 'harness.html');
const PIXEL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) { res.writeHead(200, {'content-type':'image/png'}); res.end(PIXEL_PNG); return; }
  let file = url.pathname === '/' || url.pathname === '/harness.html' ? HARNESS : path.join(ROOT, url.pathname);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const { port } = server.address();
const playwright = await import('playwright');
let browser = null;
for (const opts of [{}, { channel: 'chrome' }, { channel: 'msedge' }]) {
  try { browser = await playwright.chromium.launch(opts); break; }
  catch (err) { if (opts.channel === 'msedge') throw err; }
}
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => logs.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`));

await page.goto(`http://127.0.0.1:${port}/harness.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const state = await page.evaluate(() => {
  const card = window.__skinsProCard;
  const sr = card?.shadowRoot;
  const q = (sel) => Boolean(sr?.querySelector(sel));
  return {
    hasCard: Boolean(card),
    hasMcApp: q('.mc-app'),
    loadingRegistry: q('.loading-registry'),
    loadingText: sr?.querySelector('.loading-registry')?.textContent?.trim() || null,
    deviceCards: sr?.querySelectorAll('.devices .device, .sp-devices-strip .device').length,
    stageChildren: sr?.querySelector('.stage')?.children.length,
    regAreas: card?._reg ? { areas: card._reg.areas, entities: card._reg.entities, devices: card._reg.devices } : null,
    areasLen: card?._areas?.length,
    entitiesLen: card?._entityRegistry?.length,
    devicesLen: card?._deviceRegistry?.length,
    dataSpSize: sr?.querySelector('.mc-app')?.getAttribute('data-sp-size'),
  };
});

console.log('=== STATE ===');
console.log(JSON.stringify(state, null, 2));
console.log('=== LOGS ===');
console.log(logs.slice(0, 40).join('\n') || '(none)');
await browser.close();
server.close();
