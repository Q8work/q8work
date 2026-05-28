import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import type { Env, UserRow, Variables } from "../types";

const SESSION_COOKIE = "q8_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const PBKDF2_ITERATIONS = 100_000;

const enc = new TextEncoder();

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt.buffer)}$${toB64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const salt = fromB64(parts[2]);
  const expected = parts[3];
  const hash = await pbkdf2(password, salt);
  // constant-time-ish compare
  const a = toB64(hash);
  if (a.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return toB64(bytes.buffer).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" }[c]!));
}

export async function createSession(env: Env, userId: string): Promise<string> {
  const token = generateToken();
  const now = Date.now();
  await env.DB.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(token, userId, now, now + SESSION_TTL_MS)
    .run();
  return token;
}

export function setSessionCookie(c: { header: (k: string, v: string) => void } & any, token: string, env: Env) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure: env.ENVIRONMENT === "production",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(c: any) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export async function getUserFromSession(c: any, env: Env): Promise<UserRow | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.status, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?`
  )
    .bind(token, Date.now())
    .first<UserRow>();
  return row ?? null;
}

export async function destroySession(c: any, env: Env): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  }
  clearSessionCookie(c);
}

/** Require an authenticated, active user. Optionally restrict to roles. */
export function requireAuth(...roles: Array<UserRow["role"]>): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c, next) => {
    const user = await getUserFromSession(c, c.env);
    if (!user) return c.json({ error: "غير مصرح. الرجاء تسجيل الدخول." }, 401);
    if (user.status === "suspended") return c.json({ error: "تم إيقاف هذا الحساب." }, 403);
    if (roles.length && !roles.includes(user.role)) {
      return c.json({ error: "لا تملك صلاحية الوصول." }, 403);
    }
    c.set("user", user);
    await next();
  };
}
