import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId, isEmail, isNonEmptyString } from "../lib/util";

const contact = new Hono<{ Bindings: Env; Variables: Variables }>();

const INBOX = "info@q8work.com";
const FROM = "noreply@q8work.com";

// POST /api/contact — public contact form; stores the message and emails the inbox
contact.post("/", async (c) => {
  const b = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const message = String(b.message ?? "").trim();

  if (!isNonEmptyString(name)) return c.json({ error: "الاسم مطلوب." }, 400);
  if (!isEmail(email)) return c.json({ error: "بريد إلكتروني غير صالح." }, 400);
  if (!isNonEmptyString(message)) return c.json({ error: "الرسالة مطلوبة." }, 400);
  if (message.length > 4000) return c.json({ error: "الرسالة طويلة جداً." }, 400);

  const id = genId("c_");
  let delivered = 0;

  // Try to email the inbox; never fail the request if email isn't configured yet.
  if (c.env.EMAIL) {
    try {
      const safe = (s: string) => s.replace(/[<>&]/g, (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m]!));
      await c.env.EMAIL.send({
        to: INBOX,
        from: { email: FROM, name: "Q8Work" },
        replyTo: email,
        subject: `رسالة تواصل جديدة من ${name}`,
        text: `الاسم: ${name}\nالبريد: ${email}\n\n${message}`,
        html: `<div dir="rtl" style="font-family:sans-serif">
          <p><strong>الاسم:</strong> ${safe(name)}</p>
          <p><strong>البريد:</strong> ${safe(email)}</p>
          <p><strong>الرسالة:</strong></p>
          <p style="white-space:pre-wrap">${safe(message)}</p>
        </div>`,
      });
      delivered = 1;
    } catch (err) {
      console.error("contact email failed:", err);
    }
  }

  await c.env.DB.prepare(
    "INSERT INTO contact_messages (id, name, email, message, delivered, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(id, name, email, message, delivered, Date.now())
    .run();

  return c.json({ ok: true }, 201);
});

// GET /api/contact (admin) — read submitted messages
contact.get("/", requireAuth("admin"), async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id, name, email, message, delivered, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 500"
  ).all();
  return c.json({ messages: rows.results ?? [] });
});

export default contact;
