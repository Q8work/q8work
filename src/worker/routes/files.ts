import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { getUserFromSession } from "../lib/auth";

const files = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/files/* — serve an uploaded object from R2 with access control.
// Key format: <kind>/<ownerId>/<id>.<ext>
files.get("/*", async (c) => {
  const key = c.req.path.replace(/^\/api\/files\//, "");
  if (!key) return c.json({ error: "مفتاح غير صالح." }, 400);

  const [kind, ownerId] = key.split("/");
  const user = await getUserFromSession(c, c.env);
  if (!user) return c.json({ error: "غير مصرح." }, 401);

  // Registry documents (السجل التجاري) are sensitive: owner or admin only.
  if (kind === "registry" && user.role !== "admin" && user.id !== ownerId) {
    return c.json({ error: "لا تملك صلاحية الوصول لهذا الملف." }, 403);
  }

  const obj = await c.env.BUCKET.get(key);
  if (!obj) return c.json({ error: "الملف غير موجود." }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("Cache-Control", "private, max-age=3600");
  return new Response(obj.body, { headers });
});

export default files;
