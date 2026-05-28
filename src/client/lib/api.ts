// Thin fetch wrapper for the Q8Work API.

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = { method, credentials: "same-origin", headers: {} };
  if (body !== undefined) {
    (opts.headers as Record<string, string>)["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, opts);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(data?.error || "حدث خطأ غير متوقع.", res.status);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  // multipart upload
  upload: async <T>(path: string, file: File): Promise<T> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api${path}`, { method: "POST", credentials: "same-origin", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError((data as any)?.error || "فشل رفع الملف.", res.status);
    return data as T;
  },
};

export function fileUrl(key?: string | null): string | undefined {
  return key ? `/api/files/${key}` : undefined;
}
