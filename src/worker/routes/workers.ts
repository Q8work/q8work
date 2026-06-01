import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { parseJsonArray } from "../lib/util";

const workers = new Hono<{ Bindings: Env; Variables: Variables }>();

// Average rating subquery helper baked into the SELECT below.

// GET /api/workers — search/filter worker profiles (companies + admin)
workers.get("/", requireAuth("company", "admin"), async (c) => {
  const area = c.req.query("area");
  const workType = c.req.query("work_type");
  const availability = c.req.query("availability"); // single token match
  const q = c.req.query("q"); // matches name/bio/skills

  const clauses: string[] = ["1=1"];
  const binds: any[] = [];
  if (area) { clauses.push("wp.area = ?"); binds.push(area); }
  if (workType) { clauses.push("wp.work_type = ?"); binds.push(workType); }
  if (availability) { clauses.push("wp.availability LIKE ?"); binds.push(`%"${availability}"%`); }
  if (q) {
    clauses.push("(wp.full_name LIKE ? OR wp.bio LIKE ? OR wp.skills LIKE ?)");
    binds.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const rows = await c.env.DB.prepare(
    `SELECT wp.user_id, wp.full_name, wp.photo_key, wp.bio, wp.skills, wp.area,
            wp.availability, wp.work_type, wp.commitment, wp.expected_salary, wp.civil_id_verified,
            (SELECT ROUND(AVG(stars),1) FROM ratings r WHERE r.ratee_user_id = wp.user_id) AS avg_rating,
            (SELECT COUNT(*) FROM ratings r WHERE r.ratee_user_id = wp.user_id) AS rating_count
       FROM worker_profiles wp
       JOIN users u ON u.id = wp.user_id
      WHERE u.status = 'active' AND ${clauses.join(" AND ")}
      ORDER BY avg_rating DESC NULLS LAST, wp.created_at DESC
      LIMIT 100`
  )
    .bind(...binds)
    .all();

  // Note: phone & civil_id are intentionally NOT returned in search results.
  const list = (rows.results ?? []).map((r: any) => ({
    ...r,
    skills: parseJsonArray(r.skills),
    availability: parseJsonArray(r.availability),
  }));
  return c.json({ workers: list });
});

// GET /api/workers/:id — single worker public profile (companies + admin)
workers.get("/:id", requireAuth("company", "admin"), async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const r = await c.env.DB.prepare(
    `SELECT wp.*,
            (SELECT ROUND(AVG(stars),1) FROM ratings rt WHERE rt.ratee_user_id = wp.user_id) AS avg_rating,
            (SELECT COUNT(*) FROM ratings rt WHERE rt.ratee_user_id = wp.user_id) AS rating_count
       FROM worker_profiles wp WHERE wp.user_id = ?`
  )
    .bind(id)
    .first<any>();
  if (!r) return c.json({ error: "الملف غير موجود." }, 404);

  // Phone is revealed only if there is an accepted/completed offer between this company and the worker.
  let phoneVisible = user.role === "admin";
  if (user.role === "company") {
    const accepted = await c.env.DB.prepare(
      "SELECT 1 FROM offers WHERE company_user_id = ? AND worker_user_id = ? AND status IN ('accepted','completed') LIMIT 1"
    )
      .bind(user.id, id)
      .first();
    phoneVisible = !!accepted;
  }

  const profile: any = {
    ...r,
    skills: parseJsonArray(r.skills),
    availability: parseJsonArray(r.availability),
  };
  if (!phoneVisible) {
    delete profile.phone;
    delete profile.email;
    delete profile.civil_id;
  }
  profile.phone_visible = phoneVisible;

  // recent rating comments
  const ratings = await c.env.DB.prepare(
    "SELECT stars, comment, created_at FROM ratings WHERE ratee_user_id = ? ORDER BY created_at DESC LIMIT 10"
  )
    .bind(id)
    .all();

  return c.json({ profile, ratings: ratings.results ?? [] });
});

export default workers;
