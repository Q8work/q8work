/** Generate a short unique id (timestamp + random, URL-safe). */
export function genId(prefix = ""): string {
  const rand = crypto.getRandomValues(new Uint8Array(9));
  let s = "";
  for (const b of rand) s += b.toString(16).padStart(2, "0");
  return `${prefix}${Date.now().toString(36)}${s}`;
}

/** Parse a JSON column safely into an array of strings. */
export function parseJsonArray(v: unknown): string[] {
  if (typeof v !== "string") return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Basic email shape check. */
export function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}
