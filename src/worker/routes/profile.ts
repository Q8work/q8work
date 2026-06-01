import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { requireAuth } from "../lib/auth";
import { genId, parseJsonArray } from "../lib/util";

const profile = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---- Worker profile ----

// GET /api/profile/worker  (own profile)
profile.get("/worker", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const row = await c.env.DB.prepare("SELECT * FROM worker_profiles WHERE user_id = ?")
    .bind(user.id)
    .first<any>();
  if (!row) return c.json({ error: "الملف غير موجود." }, 404);
  return c.json({ profile: { ...row, skills: parseJsonArray(row.skills), availability: parseJsonArray(row.availability) } });
});

// PUT /api/profile/worker
profile.put("/worker", requireAuth("worker"), async (c) => {
  const user = c.get("user");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const skills = JSON.stringify(Array.isArray(b.skills) ? b.skills.map(String) : []);
  const availability = JSON.stringify(Array.isArray(b.availability) ? b.availability.map(String) : []);
  const firstName = String(b.first_name ?? "").trim();
  const lastName = String(b.last_name ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim() || String(b.full_name ?? "");

  const clamp = (v: unknown, max: number) => String(v ?? "").slice(0, max);
  await c.env.DB.prepare(
    `UPDATE worker_profiles SET
       full_name = ?, first_name = ?, last_name = ?, bio = ?, skills = ?, area = ?, phone = ?, email = ?, civil_id = ?,
       availability = ?
     WHERE user_id = ?`
  )
    .bind(
      clamp(fullName, 120),
      clamp(firstName, 60),
      clamp(lastName, 60),
      clamp(b.bio, 2000),
      skills,
      clamp(b.area, 60),
      clamp(b.phone, 30),
      clamp(b.email, 160),
      clamp(b.civil_id, 20),
      availability,
      user.id
    )
    .run();
  return c.json({ ok: true });
});

// ---- Company profile ----

// GET /api/profile/company  (own profile)
profile.get("/company", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const row = await c.env.DB.prepare("SELECT * FROM company_profiles WHERE user_id = ?")
    .bind(user.id)
    .first<any>();
  if (!row) return c.json({ error: "الملف غير موجود." }, 404);
  return c.json({ profile: row });
});

// PUT /api/profile/company
profile.put("/company", requireAuth("company"), async (c) => {
  const user = c.get("user");
  const b = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  const clamp = (v: unknown, max: number) => String(v ?? "").slice(0, max);
  await c.env.DB.prepare(
    `UPDATE company_profiles SET
       company_name = ?, description = ?, contact_name = ?, contact_phone = ?, sector = ?,
       website = ?, public_email = ?, instagram = ?, twitter = ?, linkedin = ?
     WHERE user_id = ?`
  )
    .bind(
      clamp(b.company_name, 120),
      clamp(b.description, 5000),
      clamp(b.contact_name, 80),
      clamp(b.contact_phone, 30),
      clamp(b.sector, 80),
      clamp(b.website, 200),
      clamp(b.public_email, 160),
      clamp(b.instagram, 120),
      clamp(b.twitter, 120),
      clamp(b.linkedin, 200),
      user.id
    )
    .run();
  return c.json({ ok: true });
});

// ---- File uploads (R2) ----
// POST /api/profile/upload?kind=photo|logo|civil_id
const ALLOWED_UPLOAD_TYPES: Record<string, string[]> = {
  photo: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  logo: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  civil_id: ["image/png", "image/jpeg", "image/webp", "application/pdf"],
};
profile.post("/upload", requireAuth("worker", "company"), async (c) => {
  const user = c.get("user");
  const kind = c.req.query("kind");
  const allowed: Record<string, "worker" | "company"> = {
    photo: "worker",
    civil_id: "worker",
    logo: "company",
  };
  if (!kind || !(kind in allowed)) return c.json({ error: "نوع الملف غير صالح." }, 400);
  if (allowed[kind] !== user.role) return c.json({ error: "لا تملك صلاحية رفع هذا الملف." }, 403);

  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return c.json({ error: "لم يتم إرفاق ملف." }, 400);
  if (file.size > 5 * 1024 * 1024) return c.json({ error: "حجم الملف يتجاوز 5 ميجابايت." }, 400);
  // Reject anything that isn't an explicitly allowed image/pdf type (blocks SVG/HTML → stored-XSS).
  if (!ALLOWED_UPLOAD_TYPES[kind].includes(file.type)) {
    return c.json({ error: "صيغة الملف غير مسموحة. الرجاء رفع صورة (PNG/JPG) أو PDF." }, 400);
  }

  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${kind}/${user.id}/${genId()}.${ext}`;
  await c.env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  // Persist key on the relevant profile
  if (kind === "photo") {
    await c.env.DB.prepare("UPDATE worker_profiles SET photo_key = ? WHERE user_id = ?").bind(key, user.id).run();
  } else if (kind === "civil_id") {
    await c.env.DB.prepare("UPDATE worker_profiles SET civil_id_image_key = ? WHERE user_id = ?").bind(key, user.id).run();
  } else if (kind === "logo") {
    await c.env.DB.prepare("UPDATE company_profiles SET logo_key = ? WHERE user_id = ?").bind(key, user.id).run();
  }
  return c.json({ key });
});

export default profile;
