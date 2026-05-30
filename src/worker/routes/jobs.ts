import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth, getUserFromSession } from "../lib/auth";
import { genId, parseJsonArray, isNonEmptyString } from "../lib/util";

const jobs = new Hono<{ Bindings: Env; Variables: Variables }>();

function shapeJob(row: any) {
  return { ...row, skills_required: parseJsonArray(row.skills_required) };
}

// GET /api/jobs  — public listing of open jobs (with optional filters)
jobs.get("/", async (c) => {
  const area = c.req.query("area");
  const workType = c.req.query("work_type");
  const q = c.req.query("q");

  const clauses = ["j.status = 'open'"];
  const binds: any[] = [];
  if (area) { clauses.push("j.area = ?"); binds.push(area); }
  if (workType) { clauses.push("j.work_type = ?"); binds.push(workType); }
  if (q) { clauses.push("(j.title LIKE ? OR j.description LIKE ?)"); binds.push(`%${q}%`, `%${q}%`); }

  const rows = await c.env.DB.prepare(
    `SELECT j.*, cp.company_name, cp.verified AS company_verified
       FROM jobs j JOIN company_profiles cp ON cp.user_id = j.company_user_id
      WHERE ${clauses.join(" AND ")}
      ORDER BY j.created_at DESC LIMIT 100`
  )
    .bind(...binds)
    .all();
  return c.json({ jobs: (rows.results ?? []).map(shapeJob) });
});

// GET /api/jobs/mine — company's own jobs
jobs.get("/mine", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare("SELECT * FROM jobs WHERE company_user_id = ? ORDER BY created_at DESC")
    .bind(user.id)
    .all();
  return c.json({ jobs: (rows.results ?? []).map(shapeJob) });
});

// GET /api/jobs/:id
jobs.get("/:id", async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT j.*, cp.company_name, cp.verified AS company_verified, cp.sector
       FROM jobs j JOIN company_profiles cp ON cp.user_id = j.company_user_id
      WHERE j.id = ?`
  )
    .bind(c.req.param("id"))
    .first<any>();
  if (!row) return c.json({ error: "فرصة العمل غير موجودة." }, 404);
  return c.json({ job: shapeJob(row) });
});

// POST /api/jobs — create
jobs.post("/", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  if (!isNonEmptyString(b.title)) return c.json({ error: "عنوان فرصة العمل مطلوب." }, 400);

  const id = genId("j_");
  const now = Date.now();
  const skills = JSON.stringify(Array.isArray(b.skills_required) ? b.skills_required.map(String) : []);
  await c.env.DB.prepare(
    `INSERT INTO jobs (id, company_user_id, title, description, duration, salary, area, work_type, skills_required, headcount, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)`
  )
    .bind(
      id, user.id, String(b.title), String(b.description ?? ""), String(b.duration ?? ""),
      String(b.salary ?? ""), String(b.area ?? ""), String(b.work_type ?? ""), skills,
      Math.max(1, parseInt(String(b.headcount ?? "1"), 10) || 1), now
    )
    .run();
  return c.json({ id }, 201);
});

// PATCH /api/jobs/:id — update status (open/closed) by owner
jobs.patch("/:id", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const owned = await c.env.DB.prepare("SELECT company_user_id FROM jobs WHERE id = ?").bind(id).first<any>();
  if (!owned) return c.json({ error: "فرصة العمل غير موجودة." }, 404);
  if (owned.company_user_id !== user.id) return c.json({ error: "لا تملك صلاحية التعديل." }, 403);
  if (b.status === "open" || b.status === "closed") {
    await c.env.DB.prepare("UPDATE jobs SET status = ? WHERE id = ?").bind(b.status, id).run();
  }
  return c.json({ ok: true });
});

export default jobs;
