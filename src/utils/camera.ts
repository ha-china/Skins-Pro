// HA's /api/camera_proxy endpoint renders a fresh JPEG per request, so hitting
// it on every hass update (i.e. every render) hammers the backend once cameras
// are on the dashboard. Keep the URL — including its cache-busting ts — stable
// for a short window: a stable src means the browser reuses the cached image
// across re-renders and only re-fetches when the window elapses.
const SNAPSHOT_REFRESH_MS = 10_000;

interface SnapshotCacheEntry {
  url: string;
  token: string;
  ts: number;
}

const snapshotCache = new Map<string, SnapshotCacheEntry>();

export function cameraSnapshotUrl(entityId: string, accessToken: string): string {
  const now = Date.now();
  const cached = snapshotCache.get(entityId);
  if (cached && cached.token === accessToken && now - cached.ts < SNAPSHOT_REFRESH_MS) {
    return cached.url;
  }
  const url = `/api/camera_proxy/${encodeURIComponent(entityId)}?token=${encodeURIComponent(accessToken)}&ts=${now}`;
  snapshotCache.set(entityId, { url, token: accessToken, ts: now });
  return url;
}
