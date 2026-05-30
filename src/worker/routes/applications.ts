import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId, parseJsonArray } from "../lib/util";

const applications = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/applications — worker applies to a job
applications.post("/", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const jobId = String(b.job_id ?? "");
  const message = String(b.message ?? "");
  if (!jobId) return c.json({ error: "يجب تحديد الفرصة." }, 400);

  const job = await c.env.DB.prepare("SELECT id, status FROM jobs WHERE id = ?").bind(jobId).first<any>();
  if (!job) return c.json({ error: "فرصة العمل غير موجودة." }, 404);
  if (job.status !== "open") return c.json({ error: "هذه الفرصة مغلقة." }, 409);

  const existing = await c.env.DB.prepare(
    "SELECT id FROM applications WHERE job_id = ? AND worker_user_id = ?"
  )
    .bind(jobId, user.id)
    .first();
  if (existing) return c.json({ error: "لقد تقدّمت لهذه الفرصة مسبقاً." }, 409);

  const id = genId("a_");
  await c.env.DB.prepare(
    "INSERT INTO applications (id, job_id, worker_user_id, message, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)"
  )
    .bind(id, jobId, user.id, message, Date.now())
    .run();
  return c.json({ id }, 201);
});

// GET /api/applications/mine — the worker's own applications
applications.get("/mine", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare(
    `SELECT a.id, a.status, a.message, a.created_at,
            j.id AS job_id, j.title AS job_title, j.area, j.salary, j.status AS job_status,
            cp.company_name, cp.verified AS company_verified
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       LEFT JOIN company_profiles cp ON cp.user_id = j.company_user_id
      WHERE a.worker_user_id = ?
      ORDER BY a.created_at DESC`
  )
    .bind(user.id)
    .all();
  return c.json({ applications: rows.results ?? [] });
});

// GET /api/applications/mine/ids — set of job ids the worker already applied to
applications.get("/mine/ids", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare("SELECT job_id FROM applications WHERE worker_user_id = ?")
    .bind(user.id)
    .all();
  return c.json({ job_ids: (rows.results ?? []).map((r: any) => r.job_id) });
});

// GET /api/applications/job/:jobId — company views applicants for its own job
//   Phone is intentionally excluded; it's only revealed once an offer is accepted.
applications.get("/job/:jobId", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const jobId = c.req.param("jobId");

  const job = await c.env.DB.prepare("SELECT company_user_id FROM jobs WHERE id = ?").bind(jobId).first<any>();
  if (!job) return c.json({ error: "فرصة العمل غير موجودة." }, 404);
  if (job.company_user_id !== user.id) return c.json({ error: "لا تملك صلاحية الوصول." }, 403);

  const rows = await c.env.DB.prepare(
    `SELECT a.id, a.status, a.message, a.created_at,
            wp.user_id AS worker_user_id, wp.full_name, wp.area, wp.skills,
            wp.bio, wp.photo_key, wp.civil_id_verified,
            (SELECT ROUND(AVG(stars),1) FROM ratings WHERE ratee_user_id = wp.user_id) AS rating
       FROM applications a
       JOIN worker_profiles wp ON wp.user_id = a.worker_user_id
      WHERE a.job_id = ?
      ORDER BY a.created_at DESC`
  )
    .bind(jobId)
    .all();
  return c.json({
    applicants: (rows.results ?? []).map((w: any) => ({ ...w, skills: parseJsonArray(w.skills) })),
  });
});

// PATCH /api/applications/:id — company accepts/rejects an application to its job
applications.patch("/:id", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const status = String(b.status ?? "");
  if (status !== "accepted" && status !== "rejected")
    return c.json({ error: "حالة غير صالحة." }, 400);

  const app = await c.env.DB.prepare(
    `SELECT a.id, a.job_id, a.worker_user_id, a.message
       FROM applications a JOIN jobs j ON j.id = a.job_id
      WHERE a.id = ? AND j.company_user_id = ?`
  )
    .bind(id, user.id)
    .first<any>();
  if (!app) return c.json({ error: "الطلب غير موجود." }, 404);

  await c.env.DB.prepare("UPDATE applications SET status = ? WHERE id = ?").bind(status, id).run();

  // Accepting an application sends an offer to the worker (existing accept →
  // phone-reveal flow), unless one already exists for this job + worker.
  if (status === "accepted") {
    const existing = await c.env.DB.prepare(
      "SELECT id FROM offers WHERE company_user_id = ? AND worker_user_id = ? AND job_id = ?"
    )
      .bind(user.id, app.worker_user_id, app.job_id)
      .first();
    if (!existing) {
      const now = Date.now();
      await c.env.DB.prepare(
        `INSERT INTO offers (id, job_id, company_user_id, worker_user_id, message, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
      )
        .bind(genId("o_"), app.job_id, user.id, app.worker_user_id, "تم قبول طلبك للفرصة. بانتظار تأكيدك.", now, now)
        .run();
    }
  }
  return c.json({ ok: true });
});

export default applications;
