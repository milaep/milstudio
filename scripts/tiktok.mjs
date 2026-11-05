#!/usr/bin/env node
/**
 * TikTok helpers for Mil Studio.
 *
 *   node scripts/tiktok.mjs auth    one-time: authorize the account and save tokens
 *   node scripts/tiktok.mjs sync    refresh the token, read the stats, update data/stats.json
 *
 * Credentials are read from the environment (never hard-code them):
 *   TIKTOK_CLIENT_KEY      developer app client key
 *   TIKTOK_CLIENT_SECRET   developer app client secret (server-side only)
 *   TIKTOK_REFRESH_TOKEN   refresh token printed by `auth`
 *
 * Optional:
 *   TIKTOK_REDIRECT_URI    registered redirect URI (auth only)
 *   TIKTOK_SCOPES          default: user.info.basic,user.info.stats,video.list
 *   TIKTOK_TZ              date timezone for rows, default Asia/Jakarta
 *   TIKTOK_REFRESH_TOKEN_OUT  write the rotated refresh token to this file
 *   STATS_FILE             override the stats path (used by tests)
 *   TIKTOK_API_BASE        override the API host (used by tests)
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout, exit } from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = (process.env.TIKTOK_API_BASE || "https://open.tiktokapis.com").replace(/\/+$/, "");
const STATS_FILE = process.env.STATS_FILE || path.join(ROOT, "data", "stats.json");
const TOKEN_FILE = path.join(ROOT, "data", ".tiktok-token.json");
const TZ = process.env.TIKTOK_TZ || "Asia/Jakarta";

function fail(message) {
  console.error("\n✖ " + message);
  exit(1);
}

function need(name) {
  const value = process.env[name];
  if (!value || !value.trim()) fail(`Missing ${name}. See scripts/tiktok.mjs for the list of variables.`);
  return value.trim();
}

async function readJson(res) {
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    fail(`Unexpected non-JSON response (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }
  const code = body?.error?.code;
  if (!res.ok || (code && code !== "ok")) {
    const err = body?.error || {};
    fail(`${err.message || body?.message || "Request failed"} (code: ${code || res.status}${err.log_id ? " · log_id: " + err.log_id : ""})`);
  }
  return body;
}

function postForm(url, data) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams(data),
  }).then(readJson);
}

function api(pathname, token, init = {}) {
  return fetch(API + pathname, {
    ...init,
    headers: { Authorization: "Bearer " + token, "Cache-Control": "no-cache", ...(init.headers || {}) },
  }).then(readJson);
}

/* ---------- auth ---------- */
async function auth() {
  const clientKey = need("TIKTOK_CLIENT_KEY");
  const redirectUri = need("TIKTOK_REDIRECT_URI");
  const scopes = process.env.TIKTOK_SCOPES || "user.info.basic,user.info.stats,video.list";
  const state = randomBytes(16).toString("hex");

  const url =
    "https://www.tiktok.com/v2/auth/authorize/?" +
    new URLSearchParams({
      client_key: clientKey,
      scope: scopes,
      response_type: "code",
      redirect_uri: redirectUri,
      state,
      disable_auto_auth: "1",
    });

  console.log("\n1. Open this URL and approve access with the TikTok account:\n\n" + url + "\n");
  console.log("2. TikTok redirects you to " + redirectUri);
  console.log("   If that page is your GitHub Pages site, copy the whole address from the browser bar.\n");

  const rl = createInterface({ input: stdin, output: stdout });
  const answer = (await rl.question("Paste the full redirect URL (or just the code): ")).trim();
  rl.close();
  if (!answer) fail("Nothing pasted.");

  let code = answer;
  if (/^https?:\/\//i.test(answer)) {
    let parsed;
    try {
      parsed = new URL(answer);
    } catch {
      fail("That does not look like a valid URL.");
    }
    const error = parsed.searchParams.get("error");
    if (error) fail(`TikTok returned "${error}"${parsed.searchParams.get("error_description") ? ": " + parsed.searchParams.get("error_description") : ""}`);
    if (parsed.searchParams.get("state") !== state) fail("State does not match. Start again with a fresh URL.");
    code = parsed.searchParams.get("code") || "";
  }

  const token = await postForm(`${API}/v2/oauth/token/`, {
    client_key: clientKey,
    client_secret: need("TIKTOK_CLIENT_SECRET"),
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const saved = {
    open_id: token.open_id ?? null,
    scope: token.scope ?? scopes,
    refresh_token: token.refresh_token,
    access_token_expires_in: token.expires_in ?? null,
    refresh_token_expires_in: token.refresh_expires_in ?? null,
    saved_at: new Date().toISOString(),
  };
  await mkdir(path.dirname(TOKEN_FILE), { recursive: true });
  await writeFile(TOKEN_FILE, JSON.stringify(saved, null, 1) + "\n");

  console.log("\n✔ Authorized. Tokens saved to data/.tiktok-token.json (git-ignored).");
  console.log("\nRefresh token (valid ~180 days, rotates on every refresh):\n" + token.refresh_token);
  console.log("\nStore it as the TIKTOK_REFRESH_TOKEN secret, then run:\n  node scripts/tiktok.mjs sync\n");
}

/* ---------- sync ---------- */
async function readStats() {
  let raw;
  try {
    raw = await readFile(STATS_FILE, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return { updated: null, history: [] };
    throw err;
  }
  let json;
  try {
    json = JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    fail(`${path.relative(ROOT, STATS_FILE)} is not valid JSON. Fix or delete it before syncing.`);
  }
  return {
    updated: json.updated ?? null,
    history: Array.isArray(json.history) ? json.history.filter((r) => r && typeof r.date === "string") : [],
  };
}

async function countVideos(accessToken) {
  let cursor;
  let hasMore = true;
  let pages = 0;
  let views = 0;
  let videos = 0;

  while (hasMore && pages < 500) {
    const body = { max_count: 20 };
    if (cursor !== undefined && cursor !== null) body.cursor = cursor;
    const res = await api("/v2/video/list/?fields=id,view_count", accessToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = res.data || {};
    for (const video of data.videos || []) {
      videos += 1;
      if (typeof video.view_count === "number") views += video.view_count;
    }
    hasMore = Boolean(data.has_more);
    cursor = data.cursor;
    pages += 1;
    if (hasMore && (cursor === undefined || cursor === null)) break;
  }

  return { views, videos, pages };
}

async function sync() {
  const clientKey = need("TIKTOK_CLIENT_KEY");
  const clientSecret = need("TIKTOK_CLIENT_SECRET");
  const refreshToken = need("TIKTOK_REFRESH_TOKEN");

  const token = await postForm(`${API}/v2/oauth/token/`, {
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const accessToken = token.access_token;
  if (!accessToken) fail("No access_token in the refresh response.");

  const userRes = await api(
    "/v2/user/info/?fields=open_id,follower_count,following_count,likes_count,video_count",
    accessToken
  );
  const user = userRes.data?.user || {};
  const totals = await countVideos(accessToken);

  if (typeof user.follower_count !== "number") {
    fail("follower_count is missing — make sure the app has the user.info.stats scope approved.");
  }
  if (!totals.videos) {
    fail("No public videos returned — make sure the app has the video.list scope approved.");
  }

  const date = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  const stats = await readStats();
  const history = stats.history.filter((row) => row.date !== date);
  history.push({ date, followers: user.follower_count, views: totals.views });
  history.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  await mkdir(path.dirname(STATS_FILE), { recursive: true });
  await writeFile(STATS_FILE, JSON.stringify({ updated: date, history }, null, 1) + "\n");

  const n = (v) => (typeof v === "number" ? v.toLocaleString("en-US") : "—");
  console.log(`\n✔ ${date} (${TZ})`);
  console.log(`  followers  ${n(user.follower_count)}`);
  console.log(`  likes      ${n(user.likes_count)}`);
  console.log(`  videos     ${n(totals.videos)}`);
  console.log(`  views      ${n(totals.views)}  (sum of public video views)`);
  console.log(`  rows       ${history.length} → ${path.relative(ROOT, STATS_FILE)}`);

  // The refresh token is single-use: store the new one.
  if (token.refresh_token) {
    if (process.env.TIKTOK_REFRESH_TOKEN_OUT) {
      await writeFile(process.env.TIKTOK_REFRESH_TOKEN_OUT, token.refresh_token + "\n");
      console.log(`\n  rotated refresh token → ${process.env.TIKTOK_REFRESH_TOKEN_OUT}`);
    }
    if (!process.env.CI) {
      console.log("\n  New refresh token (replaces the old one):\n  " + token.refresh_token);
    }
  }
}

/* ---------- entry ---------- */
const command = process.argv[2];
try {
  if (command === "auth") await auth();
  else if (command === "sync") await sync();
  else {
    console.log("Usage: node scripts/tiktok.mjs <auth|sync>");
    exit(command ? 1 : 0);
  }
} catch (err) {
  fail(err?.message || String(err));
}
