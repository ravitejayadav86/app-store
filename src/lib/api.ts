import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 s timeout
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// ── Per-route TTL (ms) ────────────────────────────────────────────────────
// Frequently-changing routes get a short TTL; static-ish ones get longer.
const ROUTE_TTL: Record<string, number> = {
  "/apps/":          60_000,  // 60 s  — app list changes occasionally
  "/community/posts": 15_000, // 15 s  — posts update often
  "/users/me":       120_000, // 2 min — profile rarely changes mid-session
};
const DEFAULT_TTL = 30_000; // 30 s fallback

function getTTL(url: string): number {
  for (const [pattern, ttl] of Object.entries(ROUTE_TTL)) {
    if (url.startsWith(pattern)) return ttl;
  }
  return DEFAULT_TTL;
}

// ── Cache store ───────────────────────────────────────────────────────────
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(url: string): CacheEntry | null {
  const entry = cache.get(url);
  if (!entry) return null;
  const age = Date.now() - entry.timestamp;
  if (age < entry.ttl) return entry;           // fresh
  if (age < entry.ttl * 5) return entry;       // stale-while-revalidate (5× window)
  cache.delete(url);
  return null;
}

function isStale(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp >= entry.ttl;
}

// ── In-flight deduplication ───────────────────────────────────────────────
// Prevents simultaneous identical GET requests (e.g. two components mount at once)
const inflight = new Map<string, Promise<any>>();

// ── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach auth token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    // Cache reads are handled by the `get` wrapper below, not here,
    // because we need async deduplication logic.

    // Invalidate cache on mutations
    if (config.method !== "get") {
      cache.clear();
      inflight.clear();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (response.config.method === "get" && response.config.url) {
      const url = response.config.url;
      const ttl = getTTL(url);
      cache.set(url, { data: response.data, timestamp: Date.now(), ttl });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const hasToken = !!localStorage.getItem("token");
      const isLogin  = window.location.pathname === "/login";
      if (hasToken && !isLogin) {
        localStorage.removeItem("token");
        window.location.href = "/login?error=session_expired";
      }
    }
    return Promise.reject(error);
  }
);

// ── Smart GET with deduplication + SWR ───────────────────────────────────
const originalGet = api.get.bind(api);

api.get = async function smartGet<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<any> {
  const cacheKey = url + (config?.params ? JSON.stringify(config.params) : "");
  const cached = getCached(cacheKey);

  if (cached) {
    // Return stale data immediately; revalidate in background if stale
    if (isStale(cached)) {
      const inFlight = inflight.get(cacheKey);
      if (!inFlight) {
        const req = originalGet(url, config).finally(() => inflight.delete(cacheKey));
        inflight.set(cacheKey, req);
        req.catch(() => {}); // Prevent unhandled rejection
      }
    }
    // Return a response-shaped object so callers using .data work correctly
    return { data: cached.data, status: 200, statusText: "OK (cache)", headers: {}, config: {} };
  }

  // Check for in-flight request to deduplicate
  const existing = inflight.get(cacheKey);
  if (existing) return existing;

  const req = originalGet<T>(url, config).finally(() => inflight.delete(cacheKey));
  inflight.set(cacheKey, req);
  return req;
} as typeof api.get;

export default api;
