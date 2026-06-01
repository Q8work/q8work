import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/util";

const messages = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/messages/threads — list offer-based conversation threads for current user
messages.get("/threads", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare(
    `SELECT o.id AS offer_id, o.status, o.company_user_id, o.worker_user_id,
            cp.company_name, wp.full_name AS worker_name,
            (SELECT body FROM messages m WHERE m.offer_id = o.id ORDER BY m.created_at DESC LIMIT 1) AS last_body,
            (SELECT created_at FROM messages m WHERE m.offer_id = o.id ORDER BY m.created_at DESC LIMIT 1) AS last_at,
            (SELECT COUNT(*) FROM messages m WHERE m.offer_id = o.id AND m.recipient_user_id = ? AND m.read = 0) AS unread
       FROM offers o
       LEFT JOIN company_profiles cp ON cp.user_id = o.company_user_id
       LEFT JOIN worker_profiles wp ON wp.user_id = o.worker_user_id
      WHERE o.company_user_id = ? OR o.worker_user_id = ?
      ORDER BY last_at DESC`
  )
    .bind(user.id, user.id, user.id)
    .all();
  return c.json({ threads: rows.results ?? [] });
});

// GET /api/messages/:offerId — messages in a thread (and mark received as read)
messages.get("/:offerId", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const offerId = c.req.param("offerId");
  const offer = await c.env.DB.prepare("SELECT company_user_id, worker_user_id FROM offers WHERE id = ?")
    .bind(offerId)
    .first<any>();
  if (!offer) return c.json({ error: "المحادثة غير موجودة." }, 404);
  if (offer.company_user_id !== user.id && offer.worker_user_id !== user.id)
    return c.json({ error: "لا تملك صلاحية." }, 403);

  const rows = await c.env.DB.prepare(
    "SELECT id, sender_user_id, recipient_user_id, body, read, created_at FROM messages WHERE offer_id = ? ORDER BY created_at ASC"
  )
    .bind(offerId)
    .all();

  await c.env.DB.prepare("UPDATE messages SET read = 1 WHERE offer_id = ? AND recipient_user_id = ?")
    .bind(offerId, user.id)
    .run();

  return c.json({ messages: rows.results ?? [] });
});

// POST /api/messages/:offerId — send a message in a thread
messages.post("/:offerId", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const offerId = c.req.param("offerId");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const body = String(b.body ?? "").trim().slice(0, 4000);
  if (!body) return c.json({ error: "الرسالة فارغة." }, 400);

  const offer = await c.env.DB.prepare("SELECT company_user_id, worker_user_id, status FROM offers WHERE id = ?")
    .bind(offerId)
    .first<any>();
  if (!offer) return c.json({ error: "المحادثة غير موجودة." }, 404);
  if (offer.company_user_id !== user.id && offer.worker_user_id !== user.id)
    return c.json({ error: "لا تملك صلاحية." }, 403);

  const recipient = offer.company_user_id === user.id ? offer.worker_user_id : offer.company_user_id;
  const id = genId("m_");
  await c.env.DB.prepare(
    "INSERT INTO messages (id, offer_id, sender_user_id, recipient_user_id, body, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)"
  )
    .bind(id, offerId, user.id, recipient, body, Date.now())
    .run();
  return c.json({ id }, 201);
});

export default messages;
