import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";

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

export default admin;
