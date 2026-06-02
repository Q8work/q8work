import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";

const follows = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/follows/:companyId — is the current user following this company?
follows.get("/:companyId", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const companyId = c.req.param("companyId");
  const row = await c.env.DB.prepare(
    "SELECT 1 FROM follows WHERE follower_user_id = ? AND company_user_id = ?"
  )
    .bind(user.id, companyId)
    .first();
  return c.json({ following: !!row });
});

// POST /api/follows/:companyId — follow a company
follows.post("/:companyId", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const companyId = c.req.param("companyId");

  const company = await c.env.DB.prepare(
    "SELECT id FROM users WHERE id = ? AND role = 'company' AND status = 'active'"
  )
    .bind(companyId)
    .first();
  if (!company) return c.json({ error: "الشركة غير موجودة." }, 404);

  const now = Date.now();
  await c.env.DB.prepare(
    "INSERT OR IGNORE INTO follows (follower_user_id, company_user_id, created_at, seen_at) VALUES (?, ?, ?, ?)"
  )
    .bind(user.id, companyId, now, now)
    .run();
  return c.json({ following: true });
});

// DELETE /api/follows/:companyId — unfollow
follows.delete("/:companyId", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const companyId = c.req.param("companyId");
  await c.env.DB.prepare("DELETE FROM follows WHERE follower_user_id = ? AND company_user_id = ?")
    .bind(user.id, companyId)
    .run();
  return c.json({ following: false });
});

// POST /api/follows/seen — mark the followed-jobs feed as seen (clears the bell count)
follows.post("/seen/all", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  await c.env.DB.prepare("UPDATE follows SET seen_at = ? WHERE follower_user_id = ?")
    .bind(Date.now(), user.id)
    .run();
  return c.json({ ok: true });
});

export default follows;
