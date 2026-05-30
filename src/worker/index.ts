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
api.notFound((c) => c.json({ error: "المسار غير موجود." }, 404));
api.onError((err, c) => {
  console.error("API error:", err);
  return c.json({ error: "حدث خطأ في الخادم." }, 500);
});

app.route("/api", api);

// Everything else -> static assets / SPA fallback (configured in wrangler.jsonc)
app.all("*", (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
