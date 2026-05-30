import { Hono } from "hono";
import type { Env, Variables } from "../types";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  destroySession,
  requireAuth,
} from "../lib/auth";
import { genId, isEmail, isNonEmptyString } from "../lib/util";

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/auth/register
auth.post("/register", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password, role, name, phone } = body as Record<string, unknown>;

  if (!isEmail(email)) return c.json({ error: "بريد إلكتروني غير صالح." }, 400);
  if (!isNonEmptyString(password) || (password as string).length < 6)
    return c.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." }, 400);
  if (role !== "worker" && role !== "company")
    return c.json({ error: "نوع الحساب غير صالح." }, 400);
  // رقم الهاتف إلزامي للباحث عن عمل
  if (role === "worker" && !isNonEmptyString(phone))
    return c.json({ error: "رقم الهاتف مطلوب." }, 400);

  const emailLc = (email as string).toLowerCase();
  const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(emailLc).first();
  if (existing) return c.json({ error: "هذا البريد مسجّل مسبقاً." }, 409);

  const id = genId("u_");
  const now = Date.now();
  const passwordHash = await hashPassword(password as string);

  await c.env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, 'active', ?)"
  )
    .bind(id, emailLc, passwordHash, role, now)
    .run();

  const displayName = isNonEmptyString(name) ? (name as string) : "";
  if (role === "worker") {
    await c.env.DB.prepare(
      "INSERT INTO worker_profiles (user_id, full_name, phone, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(id, displayName, (phone as string).trim(), now)
      .run();
  } else {
    await c.env.DB.prepare(
      "INSERT INTO company_profiles (user_id, company_name, created_at) VALUES (?, ?, ?)"
    )
      .bind(id, displayName, now)
      .run();
  }

  const token = await createSession(c.env, id);
  setSessionCookie(c, token, c.env);
  return c.json({ user: { id, email: emailLc, role, status: "active" } }, 201);
});

// POST /api/auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { email, password } = body as Record<string, unknown>;
  if (!isEmail(email) || !isNonEmptyString(password))
    return c.json({ error: "البريد أو كلمة المرور غير صحيحة." }, 400);

  const emailLc = (email as string).toLowerCase();
  const row = await c.env.DB.prepare(
    "SELECT id, email, password_hash, role, status FROM users WHERE email = ?"
  )
    .bind(emailLc)
    .first<{ id: string; email: string; password_hash: string; role: string; status: string }>();

  if (!row || !(await verifyPassword(password as string, row.password_hash)))
    return c.json({ error: "البريد أو كلمة المرور غير صحيحة." }, 401);
  if (row.status === "suspended") return c.json({ error: "تم إيقاف هذا الحساب." }, 403);

  const token = await createSession(c.env, row.id);
  setSessionCookie(c, token, c.env);
  return c.json({ user: { id: row.id, email: row.email, role: row.role, status: row.status } });
});

// POST /api/auth/logout
auth.post("/logout", async (c) => {
  await destroySession(c, c.env);
  return c.json({ ok: true });
});

// GET /api/auth/me
auth.get("/me", requireAuth(), (c) => {
  const user = c.get("user");
  return c.json({ user });
});

export default auth;
