import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/util";

const offers = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/offers — company sends an offer to a worker
offers.post("/", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const workerId = String(b.worker_user_id ?? "");
  if (!workerId) return c.json({ error: "يجب تحديد الكويتي." }, 400);

  const worker = await c.env.DB.prepare(
    "SELECT u.id FROM users u WHERE u.id = ? AND u.role = 'worker' AND u.status = 'active'"
  )
    .bind(workerId)
    .first();
  if (!worker) return c.json({ error: "الكويتي غير موجود." }, 404);

  const jobId = b.job_id ? String(b.job_id) : null;
  const id = genId("o_");
  const now = Date.now();
  await c.env.DB.prepare(
    `INSERT INTO offers (id, job_id, company_user_id, worker_user_id, message, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
  )
    .bind(id, jobId, user.id, workerId, String(b.message ?? ""), now, now)
    .run();

  // Seed the message thread with the offer message
  if (b.message) {
    await c.env.DB.prepare(
      "INSERT INTO messages (id, offer_id, sender_user_id, recipient_user_id, body, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)"
    )
      .bind(genId("m_"), id, user.id, workerId, String(b.message), now)
      .run();
  }
  return c.json({ id }, 201);
});

// GET /api/offers — list offers for the current user (worker: received, company: sent)
offers.get("/", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const isWorker = user.role === "worker";
  const rows = await c.env.DB.prepare(
    `SELECT o.*, j.title AS job_title,
            cp.company_name, cp.verified AS company_verified,
            wp.full_name AS worker_name, wp.photo_key AS worker_photo
       FROM offers o
       LEFT JOIN jobs j ON j.id = o.job_id
       LEFT JOIN company_profiles cp ON cp.user_id = o.company_user_id
       LEFT JOIN worker_profiles wp ON wp.user_id = o.worker_user_id
      WHERE ${isWorker ? "o.worker_user_id" : "o.company_user_id"} = ?
      ORDER BY o.updated_at DESC`
  )
    .bind(user.id)
    .all();
  return c.json({ offers: rows.results ?? [] });
});

// PATCH /api/offers/:id — change status
//   worker: accept | reject
//   company: complete
offers.patch("/:id", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const action = String(b.status ?? "");

  const offer = await c.env.DB.prepare("SELECT * FROM offers WHERE id = ?").bind(id).first<any>();
  if (!offer) return c.json({ error: "العرض غير موجود." }, 404);

  if (user.role === "worker") {
    if (offer.worker_user_id !== user.id) return c.json({ error: "لا تملك صلاحية." }, 403);
    if (!["accepted", "rejected"].includes(action)) return c.json({ error: "إجراء غير صالح." }, 400);
    if (offer.status !== "pending") return c.json({ error: "تم الرد على هذا العرض مسبقاً." }, 409);
  } else {
    if (offer.company_user_id !== user.id) return c.json({ error: "لا تملك صلاحية." }, 403);
    if (action !== "completed") return c.json({ error: "إجراء غير صالح." }, 400);
    if (offer.status !== "accepted") return c.json({ error: "يجب قبول العرض أولاً." }, 409);
  }

  await c.env.DB.prepare("UPDATE offers SET status = ?, updated_at = ? WHERE id = ?")
    .bind(action, Date.now(), id)
    .run();
  return c.json({ ok: true });
});

export default offers;
