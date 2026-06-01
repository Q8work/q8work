import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ErrorText, Spinner } from "../components/ui";
import { useAuth } from "../lib/auth";
import { ApiError, api } from "../lib/api";

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-center text-2xl font-extrabold text-brand-darkest">{title}</h1>
        <div className="card">{children}</div>
      </div>
    </Layout>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const redirect = sp.get("redirect") || "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر تسجيل الدخول.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="تسجيل الدخول">
      <form onSubmit={submit} className="space-y-4">
        <ErrorText>{error}</ErrorText>
        <div>
          <label className="label">البريد الإلكتروني</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">كلمة المرور</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "دخول"}
        </button>
        <p className="text-center text-sm text-brand-dark">
          ليس لديك حساب؟{" "}
          <Link to={`/register${redirect !== "/app" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="font-bold text-brand-dark underline">
            أنشئ حساباً
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const redirect = sp.get("redirect") || "/app";
  const [role, setRole] = useState<"worker" | "company">("worker");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [idImage, setIdImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (role === "worker" && !idImage) {
      setError("الرجاء إرفاق صورة من الهوية المدنية.");
      return;
    }
    setBusy(true);
    try {
      await register({ email, password, role, name, phone: role === "worker" ? phone : undefined });
      // ارفع صورة الهوية بعد إنشاء الحساب (الجلسة أصبحت فعّالة)
      if (role === "worker" && idImage) {
        await api.upload("/profile/upload?kind=civil_id", idImage);
      }
      navigate(redirect);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إنشاء الحساب.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="إنشاء حساب جديد">
      <form onSubmit={submit} className="space-y-4">
        <ErrorText>{error}</ErrorText>

        <div>
          <label className="label">نوع الحساب</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("worker")}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                role === "worker" ? "border-brand-dark bg-brand-soft text-brand-darkest" : "border-brand-light text-brand-dark"
              }`}
            >
              باحث عن فرص
            </button>
            <button
              type="button"
              onClick={() => setRole("company")}
              className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                role === "company" ? "border-brand-dark bg-brand-soft text-brand-darkest" : "border-brand-light text-brand-dark"
              }`}
            >
              شركة / صاحب عمل
            </button>
          </div>
        </div>

        <div>
          <label className="label">{role === "worker" ? "الاسم الكامل" : "اسم الشركة"}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">البريد الإلكتروني</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">كلمة المرور</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="mt-1 text-xs text-brand">6 أحرف على الأقل</p>
        </div>

        {role === "worker" && (
          <>
            <div>
              <label className="label">رقم الهاتف</label>
              <input
                className="input"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="965..."
                required
              />
            </div>
            <div>
              <label className="label">صورة الهوية المدنية</label>
              <input
                className="input file:ml-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-sm file:font-bold file:text-brand-darkest"
                type="file"
                accept="image/*"
                onChange={(e) => setIdImage(e.target.files?.[0] ?? null)}
                required
              />
              <p className="mt-1 text-xs text-brand">للتحقق من الجنسية · لا تظهر للشركات (الإدارة فقط)</p>
            </div>
          </>
        )}

        <button className="btn-primary w-full" disabled={busy}>
          {busy ? <Spinner /> : "إنشاء الحساب"}
        </button>
        <p className="text-center text-sm text-brand-dark">
          لديك حساب؟{" "}
          <Link to={`/login${redirect !== "/app" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="font-bold text-brand-dark underline">
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
