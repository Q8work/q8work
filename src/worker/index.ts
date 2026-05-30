import { Hono } from "hono";
import type { Env, Variables } from "./types";
import auth from "./routes/auth";
import profile from "./routes/profile";
import jobs from "./routes/jobs";
import workers from "./routes/workers";
import offers from "./routes/offers";
import messages from "./routes/messages";
import ratings from "./routes/ratings";
import applications from "./routes/applications";
import notifications from "./routes/notifications";
import admin from "./routes/admin";
import files from "./routes/files";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

const api = new Hono<{ Bindings: Env; Variables: Variables }>();
api.route("/auth", auth);
api.route("/profile", profile);
api.route("/jobs", jobs);
api.route("/workers", workers);
api.route("/offers", offers);
api.route("/messages", messages);
api.route("/ratings", ratings);
api.route("/applications", applications);
api.route("/notifications", notifications);
api.route("/admin", admin);
api.route("/files", files);

api.get("/health", (c) => c.json({ ok: true, env: c.env.ENVIRONMENT }));

// Public platform stats (for the landing page)
api.get("/stats", async (c) => {
  const q = async (sql: string) => ((await c.env.DB.prepare(sql).first<any>())?.n ?? 0) as number;
  return c.json({
    companies: await q("SELECT COUNT(*) AS n FROM users WHERE role = 'company'"),
    workers: await q("SELECT COUNT(*) AS n FROM users WHERE role = 'worker'"),
    jobs: await q("SELECT COUNT(*) AS n FROM jobs"),
    open_jobs: await q("SELECT COUNT(*) AS n FROM jobs WHERE status = 'open'"),
  });
});
api.notFound((c) => c.json({ error: "المسار غير موجود." }, 404));
api.onError((err, c) => {
  console.error("API error:", err);
  return c.json({ error: "حدث خطأ في الخادم." }, 500);
});

app.route("/api", api);

// Everything else -> static assets / SPA fallback (configured in wrangler.jsonc)
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
