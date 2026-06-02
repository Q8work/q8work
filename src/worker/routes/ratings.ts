import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/util";

const ratings = new Hono<{ Bindings: Env; Variables: Variables }>();

function safeJson<T>(s: unknown, fallback: T): T {
  try { return JSON.parse(String(s)) as T; } catch { return fallback; }
}

const CRITERIA_KEYS = ["punctuality", "quality", "communication", "professionalism", "rehire"];
const ALLOWED_BADGES = [
  "ملتزم بالمواعيد", "سريع التعلم", "محترف في التعامل", "يعمل بروح الفريق",
  "دقيق في تنفيذ المهام", "مبادر ومجتهد", "خدمة عملاء ممتازة", "موثوق ويمكن الاعتماد عليه",
];
const REHIRE_VALUES = ["definitely", "yes", "maybe", "no"];

// POST /api/ratings — a company submits a recommendation for the worker after a completed offer.
//   One-directional: only companies recommend workers.
ratings.post("/", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const offerId = String(b.offer_id ?? "");
  if (!offerId) return c.json({ error: "يجب تحديد العرض." }, 400);

  // Per-criterion stars (1-5); overall = average.
  const rawCriteria = (b.criteria && typeof b.criteria === "object") ? b.criteria : {};
  const criteria: Record<string, number> = {};
  for (const k of CRITERIA_KEYS) {
    const v = parseInt(String(rawCriteria[k] ?? ""), 10);
    if (v >= 1 && v <= 5) criteria[k] = v;
  }
  const values = Object.values(criteria);
  let stars = values.length ? Math.round(values.reduce((a, v) => a + v, 0) / values.length) : parseInt(String(b.stars ?? ""), 10);
  if (!(stars >= 1 && stars <= 5)) return c.json({ error: "الرجاء تعبئة التقييم." }, 400);

  const badges = Array.isArray(b.badges)
    ? [...new Set(b.badges.map(String))].filter((x) => ALLOWED_BADGES.includes(x)).slice(0, 8)
    : [];
  const rehire = REHIRE_VALUES.includes(String(b.rehire ?? "")) ? String(b.rehire) : "";

  const offer = await c.env.DB.prepare("SELECT * FROM offers WHERE id = ?").bind(offerId).first<any>();
  if (!offer) return c.json({ error: "العرض غير موجود." }, 404);
  if (offer.company_user_id !== user.id) return c.json({ error: "لا تملك صلاحية." }, 403);
  if (offer.status !== "completed") return c.json({ error: "لا يمكن التقييم قبل إكمال العمل." }, 409);

  const rateeId = offer.worker_user_id;
  const comment = String(b.comment ?? "").slice(0, 2000);

  // Upsert: a company can refine its recommendation for the same offer.
  const existing = await c.env.DB.prepare("SELECT id FROM ratings WHERE offer_id = ? AND rater_user_id = ?")
    .bind(offerId, user.id)
    .first<any>();
  if (existing) {
    await c.env.DB.prepare(
      "UPDATE ratings SET stars = ?, comment = ?, criteria = ?, badges = ?, rehire = ?, created_at = ? WHERE id = ?"
    )
      .bind(stars, comment, JSON.stringify(criteria), JSON.stringify(badges), rehire, Date.now(), existing.id)
      .run();
    return c.json({ ok: true, updated: true });
  }

  await c.env.DB.prepare(
    `INSERT INTO ratings (id, offer_id, rater_user_id, ratee_user_id, stars, comment, criteria, badges, rehire, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      genId("r_"), offerId, user.id, rateeId, stars,
      comment, JSON.stringify(criteria), JSON.stringify(badges), rehire, Date.now()
    )
    .run();
  return c.json({ ok: true }, 201);
});

// GET /api/ratings/me — ratings received by current user
ratings.get("/me", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare(
    `SELECT rt.stars, rt.comment, rt.criteria, rt.badges, rt.rehire, rt.created_at,
            cp.company_name AS rater_name, cp.verified AS rater_verified
       FROM ratings rt
       LEFT JOIN company_profiles cp ON cp.user_id = rt.rater_user_id
      WHERE rt.ratee_user_id = ?
      ORDER BY rt.created_at DESC`
  )
    .bind(user.id)
    .all();
  const list = (rows.results ?? []).map((r: any) => ({
    ...r,
    criteria: safeJson(r.criteria, {}),
    badges: safeJson(r.badges, []),
  }));
  const agg = await c.env.DB.prepare(
    "SELECT ROUND(AVG(stars),1) AS avg, COUNT(*) AS count FROM ratings WHERE ratee_user_id = ?"
  )
    .bind(user.id)
    .first<any>();
  return c.json({ ratings: list, avg: agg?.avg ?? null, count: agg?.count ?? 0 });
});

export default ratings;
