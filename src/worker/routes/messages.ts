import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId } from "../lib/util";

const messages = new Hono<{ Bindings: Env; Variables: Variables }>();

// Find the offer relationship between the current user and a peer (any role pairing).
async function relationship(env: Env, meId: string, peerId: string) {
  return env.DB.prepare(
    `SELECT id, company_user_id, worker_user_id FROM offers
      WHERE (company_user_id = ? AND worker_user_id = ?)
         OR (company_user_id = ? AND worker_user_id = ?)
      ORDER BY created_at DESC LIMIT 1`
  )
    .bind(meId, peerId, peerId, meId)
    .first<any>();
}

// GET /api/messages/threads — one conversation per (company, worker) pair, merged across offers
messages.get("/threads", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare(
    `SELECT p.company_user_id, p.worker_user_id,
            cp.company_name, wp.full_name AS worker_name,
            (SELECT body FROM messages m
               WHERE (m.sender_user_id = p.company_user_id AND m.recipient_user_id = p.worker_user_id)
                  OR (m.sender_user_id = p.worker_user_id AND m.recipient_user_id = p.company_user_id)
               ORDER BY m.created_at DESC LIMIT 1) AS last_body,
            (SELECT created_at FROM messages m
               WHERE (m.sender_user_id = p.company_user_id AND m.recipient_user_id = p.worker_user_id)
                  OR (m.sender_user_id = p.worker_user_id AND m.recipient_user_id = p.company_user_id)
               ORDER BY m.created_at DESC LIMIT 1) AS last_at,
            (SELECT COUNT(*) FROM messages m
               WHERE m.recipient_user_id = ? AND m.read = 0
                 AND ((m.sender_user_id = p.company_user_id AND m.recipient_user_id = p.worker_user_id)
                   OR (m.sender_user_id = p.worker_user_id AND m.recipient_user_id = p.company_user_id))) AS unread
       FROM (SELECT DISTINCT company_user_id, worker_user_id FROM offers
              WHERE company_user_id = ? OR worker_user_id = ?) p
       LEFT JOIN company_profiles cp ON cp.user_id = p.company_user_id
       LEFT JOIN worker_profiles wp ON wp.user_id = p.worker_user_id
      ORDER BY last_at DESC`
  )
    .bind(user.id, user.id, user.id)
    .all();
  return c.json({ threads: rows.results ?? [] });
});

// GET /api/messages/with/:peerId — all messages with a peer (across offers); marks read
messages.get("/with/:peerId", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const peerId = c.req.param("peerId");
  const rel = await relationship(c.env, user.id, peerId);
  if (!rel) return c.json({ error: "المحادثة غير موجودة." }, 404);

  const rows = await c.env.DB.prepare(
    `SELECT id, sender_user_id, recipient_user_id, body, read, created_at FROM messages
      WHERE (sender_user_id = ? AND recipient_user_id = ?)
         OR (sender_user_id = ? AND recipient_user_id = ?)
      ORDER BY created_at ASC`
  )
    .bind(user.id, peerId, peerId, user.id)
    .all();

  await c.env.DB.prepare("UPDATE messages SET read = 1 WHERE recipient_user_id = ? AND sender_user_id = ?")
    .bind(user.id, peerId)
    .run();

  return c.json({ messages: rows.results ?? [] });
});

// POST /api/messages/with/:peerId — send a message to a peer
messages.post("/with/:peerId", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const peerId = c.req.param("peerId");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const body = String(b.body ?? "").trim().slice(0, 4000);
  if (!body) return c.json({ error: "الرسالة فارغة." }, 400);

  const rel = await relationship(c.env, user.id, peerId);
  if (!rel) return c.json({ error: "لا تملك محادثة مع هذا المستخدم." }, 403);

  await c.env.DB.prepare(
    "INSERT INTO messages (id, offer_id, sender_user_id, recipient_user_id, body, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)"
  )
    .bind(genId("m_"), rel.id, user.id, peerId, body, Date.now())
    .run();
  return c.json({ ok: true }, 201);
});

export default messages;
