import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { parseJsonArray } from "../lib/util";

const companies = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/companies — public directory of registered companies
companies.get("/", async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT u.id AS user_id, cp.company_name, cp.logo_key, cp.sector, cp.verified, cp.description,
            (SELECT COUNT(*) FROM jobs j WHERE j.company_user_id = u.id AND j.status = 'open') AS open_jobs,
            (SELECT ROUND(AVG(stars),1) FROM ratings r WHERE r.ratee_user_id = u.id) AS rating,
            (SELECT COUNT(*) FROM ratings r WHERE r.ratee_user_id = u.id) AS rating_count
       FROM users u
       JOIN company_profiles cp ON cp.user_id = u.id
      WHERE u.status = 'active' AND cp.company_name <> ''
      ORDER BY cp.verified DESC, open_jobs DESC, cp.company_name ASC
      LIMIT 200`
  ).all();
  return c.json({ companies: rows.results ?? [] });
});

// GET /api/companies/:id — public company profile + its open jobs
companies.get("/:id", async (c) => {
  const id = c.req.param("id");
  const company = await c.env.DB.prepare(
    `SELECT u.id AS user_id, cp.company_name, cp.logo_key, cp.description, cp.sector,
            cp.verified, cp.created_at,
            (SELECT ROUND(AVG(stars),1) FROM ratings r WHERE r.ratee_user_id = u.id) AS rating,
            (SELECT COUNT(*) FROM ratings r WHERE r.ratee_user_id = u.id) AS rating_count
       FROM users u
       JOIN company_profiles cp ON cp.user_id = u.id
      WHERE u.id = ? AND u.status = 'active'`
  )
    .bind(id)
    .first<any>();
  if (!company) return c.json({ error: "الشركة غير موجودة." }, 404);

  const jobs = await c.env.DB.prepare(
    `SELECT id, title, description, area, work_type, duration, salary, skills_required, headcount, created_at
       FROM jobs WHERE company_user_id = ? AND status = 'open' ORDER BY created_at DESC`
  )
    .bind(id)
    .all();

  return c.json({
    company,
    jobs: (jobs.results ?? []).map((j: any) => ({ ...j, skills_required: parseJsonArray(j.skills_required) })),
  });
});

export default companies;
