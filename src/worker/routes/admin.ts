import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { parseJsonArray } from "../lib/util";

const admin = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/admin/stats — platform overview
admin.get("/stats", requireAuth("admin"), async (c) => {
  const q = async (sql: string) => (await c.env.DB.prepare(sql).first<any>())?.n ?? 0;
  const stats = {
    workers: await q("SELECT COUNT(*) AS n FROM users WHERE role = 'worker'"),
    companies: await q("SELECT COUNT(*) AS n FROM users WHERE role = 'company'"),
    jobs: await q("SELECT COUNT(*) AS n FROM jobs"),
    open_jobs: await q("SELECT COUNT(*) AS n FROM jobs WHERE status = 'open'"),
    offers: await q("SELECT COUNT(*) AS n FROM offers"),
    completed_offers: await q("SELECT COUNT(*) AS n FROM offers WHERE status = 'completed'"),
    pending_companies: await q("SELECT COUNT(*) AS n FROM company_profiles WHERE verified = 0"),
    suspended: await q("SELECT COUNT(*) AS n FROM users WHERE status = 'suspended'"),
  };
  return c.json({ stats });
});

// GET /api/admin/users?role=&status=
admin.get("/users", requireAuth("admin"), async (c) => {
  const role = c.req.query("role");
  const status = c.req.query("status");
  const clauses: string[] = ["1=1"];
  const binds: any[] = [];
  if (role) { clauses.push("u.role = ?"); binds.push(role); }
  if (status) { clauses.push("u.status = ?"); binds.push(status); }

  const rows = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.status, u.created_at,
            wp.full_name AS worker_name, wp.phone AS worker_phone,
            wp.civil_id_image_key, wp.civil_id_verified,
            cp.company_name, cp.verified AS company_verified
       FROM users u
       LEFT JOIN worker_profiles wp ON wp.user_id = u.id
       LEFT JOIN company_profiles cp ON cp.user_id = u.id
      WHERE ${clauses.join(" AND ")}
      ORDER BY u.created_at DESC LIMIT 500`
  )
    .bind(...binds)
    .all();
  return c.json({ users: rows.results ?? [] });
});

// PATCH /api/admin/users/:id — suspend/activate
admin.patch("/users/:id", requireAuth("admin"), async (c) => {
  const id = c.req.param("id");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  if (b.status !== "active" && b.status !== "suspended")
    return c.json({ error: "حالة غير صالحة." }, 400);
  await c.env.DB.prepare("UPDATE users SET status = ? WHERE id = ? AND role != 'admin'")
    .bind(b.status, id)
    .run();
  return c.json({ ok: true });
});

// PATCH /api/admin/companies/:id/verify — toggle company verification
admin.patch("/companies/:id/verify", requireAuth("admin"), async (c) => {
  const id = c.req.param("id");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const verified = b.verified ? 1 : 0;
  await c.env.DB.prepare("UPDATE company_profiles SET verified = ? WHERE user_id = ?")
    .bind(verified, id)
    .run();
  return c.json({ ok: true });
});

// PATCH /api/admin/workers/:id/verify — toggle civil-id verification
admin.patch("/workers/:id/verify", requireAuth("admin"), async (c) => {
  const id = c.req.param("id");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const verified = b.verified ? 1 : 0;
  await c.env.DB.prepare("UPDATE worker_profiles SET civil_id_verified = ? WHERE user_id = ?")
    .bind(verified, id)
    .run();
  return c.json({ ok: true });
});

// GET /api/admin/users/:id — full account detail (profile + activity stats)
admin.get("/users/:id", requireAuth("admin"), async (c) => {
  const id = c.req.param("id");
  const user = await c.env.DB.prepare(
    "SELECT id, email, role, status, created_at FROM users WHERE id = ?"
  )
    .bind(id)
    .first<any>();
  if (!user) return c.json({ error: "المستخدم غير موجود." }, 404);

  const agg = await c.env.DB.prepare(
    "SELECT ROUND(AVG(stars),1) AS avg, COUNT(*) AS count FROM ratings WHERE ratee_user_id = ?"
  )
    .bind(id)
    .first<any>();

  let profile: any = null;
  const stats: Record<string, number> = { rating_count: agg?.count ?? 0 };
  if (user.role === "worker") {
    const row = await c.env.DB.prepare("SELECT * FROM worker_profiles WHERE user_id = ?").bind(id).first<any>();
    profile = row ? { ...row, skills: parseJsonArray(row.skills), availability: parseJsonArray(row.availability) } : null;
    stats.offers_received = ((await c.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM offers WHERE worker_user_id = ?"
    ).bind(id).first<any>())?.n) ?? 0;
  } else if (user.role === "company") {
    profile = await c.env.DB.prepare("SELECT * FROM company_profiles WHERE user_id = ?").bind(id).first<any>();
    stats.jobs_posted = ((await c.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM jobs WHERE company_user_id = ?"
    ).bind(id).first<any>())?.n) ?? 0;
    stats.offers_sent = ((await c.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM offers WHERE company_user_id = ?"
    ).bind(id).first<any>())?.n) ?? 0;
  }

  return c.json({ user, profile, avg: agg?.avg ?? null, stats });
});

// ---- Content moderation: jobs (فرص العمل) ----

// GET /api/admin/jobs?status=
admin.get("/jobs", requireAuth("admin"), async (c) => {
  const status = c.req.query("status");
  const clauses = ["1=1"];
  const binds: any[] = [];
  if (status === "open" || status === "closed") { clauses.push("j.status = ?"); binds.push(status); }
  const rows = await c.env.DB.prepare(
    `SELECT j.id, j.title, j.area, j.status, j.headcount, j.created_at, j.company_user_id,
            cp.company_name, cp.verified AS company_verified
       FROM jobs j
       LEFT JOIN company_profiles cp ON cp.user_id = j.company_user_id
      WHERE ${clauses.join(" AND ")}
      ORDER BY j.created_at DESC LIMIT 500`
  )
    .bind(...binds)
    .all();
  return c.json({ jobs: rows.results ?? [] });
});

// PATCH /api/admin/jobs/:id — open/close a job
admin.patch("/jobs/:id", requireAuth("admin"), async (c) => {
  const id = c.req.param("id");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  if (b.status !== "open" && b.status !== "closed")
    return c.json({ error: "حالة غير صالحة." }, 400);
  await c.env.DB.prepare("UPDATE jobs SET status = ? WHERE id = ?").bind(b.status, id).run();
  return c.json({ ok: true });
});

// DELETE /api/admin/jobs/:id — remove a job
admin.delete("/jobs/:id", requireAuth("admin"), async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM jobs WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

// ---- Content moderation: ratings (التقييمات) ----

// GET /api/admin/ratings
admin.get("/ratings", requireAuth("admin"), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT r.id, r.stars, r.comment, r.created_at,
            COALESCE(rwp.full_name, rcp.company_name, ru.email) AS rater_name,
            COALESCE(ewp.full_name, ecp.company_name, eu.email) AS ratee_name
       FROM ratings r
       JOIN users ru ON ru.id = r.rater_user_id
       LEFT JOIN worker_profiles rwp ON rwp.user_id = r.rater_user_id
       LEFT JOIN company_profiles rcp ON rcp.user_id = r.rater_user_id
       JOIN users eu ON eu.id = r.ratee_user_id
       LEFT JOIN worker_profiles ewp ON ewp.user_id = r.ratee_user_id
       LEFT JOIN company_profiles ecp ON ecp.user_id = r.ratee_user_id
      ORDER BY r.created_at DESC LIMIT 500`
  ).all();
  return c.json({ ratings: rows.results ?? [] });
});

// DELETE /api/admin/ratings/:id — remove an inappropriate rating
admin.delete("/ratings/:id", requireAuth("admin"), async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM ratings WHERE id = ?").bind(id).run();
  return c.json({ ok: true });
});

export default admin;
