import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/util";

const ratings = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/ratings — rate the other party after a completed offer
//   company rates worker, worker rates company
ratings.post("/", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const offerId = String(b.offer_id ?? "");
  const stars = parseInt(String(b.stars ?? ""), 10);
  if (!offerId) return c.json({ error: "يجب تحديد العرض." }, 400);
  if (!(stars >= 1 && stars <= 5)) return c.json({ error: "التقييم من 1 إلى 5." }, 400);

  const offer = await c.env.DB.prepare("SELECT * FROM offers WHERE id = ?").bind(offerId).first<any>();
  if (!offer) return c.json({ error: "العرض غير موجود." }, 404);
  if (offer.company_user_id !== user.id && offer.worker_user_id !== user.id)
    return c.json({ error: "لا تملك صلاحية." }, 403);
  if (offer.status !== "completed") return c.json({ error: "لا يمكن التقييم قبل إكمال العمل." }, 409);

  const rateeId = offer.company_user_id === user.id ? offer.worker_user_id : offer.company_user_id;

  const existing = await c.env.DB.prepare("SELECT id FROM ratings WHERE offer_id = ? AND rater_user_id = ?")
    .bind(offerId, user.id)
    .first();
  if (existing) return c.json({ error: "تم التقييم مسبقاً." }, 409);

  await c.env.DB.prepare(
    "INSERT INTO ratings (id, offer_id, rater_user_id, ratee_user_id, stars, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(genId("r_"), offerId, user.id, rateeId, stars, String(b.comment ?? ""), Date.now())
    .run();
  return c.json({ ok: true }, 201);
});

// GET /api/ratings/me — ratings received by current user
ratings.get("/me", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare(
    "SELECT stars, comment, created_at FROM ratings WHERE ratee_user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.id)
    .all();
  const agg = await c.env.DB.prepare(
    "SELECT ROUND(AVG(stars),1) AS avg, COUNT(*) AS count FROM ratings WHERE ratee_user_id = ?"
  )
    .bind(user.id)
    .first<any>();
  return c.json({ ratings: rows.results ?? [], avg: agg?.avg ?? null, count: agg?.count ?? 0 });
});

export default ratings;
