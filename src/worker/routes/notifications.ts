import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";

const notifications = new Hono<{ Bindings: Env; Variables: Variables }>();

const countOf = async (env: Env, sql: string, ...binds: any[]) =>
  ((await env.DB.prepare(sql).bind(...binds).first<any>())?.n ?? 0) as number;

// GET /api/notifications — actionable, role-aware counts for the bell
notifications.get("/", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");

  const unreadMessages = await countOf(
    c.env,
    "SELECT COUNT(*) AS n FROM messages WHERE recipient_user_id = ? AND read = 0",
    user.id
  );

  const items: { type: string; label: string; count: number; tab: string }[] = [];
  if (unreadMessages > 0) {
    items.push({ type: "messages", label: "رسائل غير مقروءة", count: unreadMessages, tab: "messages" });
  }

  if (user.role === "worker") {
    const pendingOffers = await countOf(
      c.env,
      "SELECT COUNT(*) AS n FROM offers WHERE worker_user_id = ? AND status = 'pending'",
      user.id
    );
    if (pendingOffers > 0) {
      items.push({ type: "offer", label: "عروض عمل جديدة بانتظار ردّك", count: pendingOffers, tab: "offers" });
    }
  } else {
    const newApplications = await countOf(
      c.env,
      `SELECT COUNT(*) AS n FROM applications a JOIN jobs j ON j.id = a.job_id
        WHERE j.company_user_id = ? AND a.status = 'pending'`,
      user.id
    );
    if (newApplications > 0) {
      items.push({ type: "application", label: "متقدمون جدد على فرصك", count: newApplications, tab: "jobs" });
    }
    const acceptedOffers = await countOf(
      c.env,
      "SELECT COUNT(*) AS n FROM offers WHERE company_user_id = ? AND status = 'accepted'",
      user.id
    );
    if (acceptedOffers > 0) {
      items.push({ type: "accepted", label: "عروض قُبلت بانتظار إكمال العمل", count: acceptedOffers, tab: "offers" });
    }
  }

  // Common: completed engagements the user hasn't rated yet
  const awaitingRating = await countOf(
    c.env,
    `SELECT COUNT(*) AS n FROM offers o
      WHERE o.status = 'completed'
        AND (o.worker_user_id = ? OR o.company_user_id = ?)
        AND NOT EXISTS (SELECT 1 FROM ratings r WHERE r.offer_id = o.id AND r.rater_user_id = ?)`,
    user.id,
    user.id,
    user.id
  );
  if (awaitingRating > 0) {
    items.push({ type: "rating", label: "أعمال مكتملة بانتظار تقييمك", count: awaitingRating, tab: "offers" });
  }

  const total = items.reduce((sum, i) => sum + i.count, 0);
  return c.json({ total, unread_messages: unreadMessages, items });
});

export default notifications;
