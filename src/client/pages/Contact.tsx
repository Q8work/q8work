import { useState } from "react";
import { Layout } from "../components/Layout";
import { ErrorText, Spinner } from "../components/ui";
import { api, ApiError } from "../lib/api";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/contact", { name, email, message });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّر إرسال الرسالة.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-brand-darkest">تواصل معنا</h1>
        <p className="mt-2 text-brand-dark">
          عندك سؤال أو اقتراح؟ أرسل لنا رسالة وسنردّ عليك في أقرب وقت.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {/* Info */}
          <div className="space-y-4 sm:col-span-1">
            <div className="card">
              <h3 className="text-sm font-bold text-brand-dark">البريد الإلكتروني</h3>
              <p className="mt-1 text-sm text-brand-darkest" data-latin>info@q8work.com</p>
            </div>
            <div className="card">
              <h3 className="text-sm font-bold text-brand-dark">الموقع</h3>
              <p className="mt-1 text-sm text-brand-darkest" data-latin>q8work.com</p>
            </div>
          </div>

          {/* Form */}
          <div className="card sm:col-span-2">
            {sent ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div>
                <h2 className="text-lg font-bold text-brand-darkest">تم إرسال رسالتك</h2>
                <p className="mt-1 text-sm text-brand-dark">شكراً لتواصلك معنا، سنردّ عليك قريباً.</p>
                <button className="btn-secondary mt-4" onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <ErrorText>{error}</ErrorText>
                <div>
                  <label className="label">الاسم</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="label">الرسالة</label>
                  <textarea className="input" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <button className="btn-primary w-full" disabled={busy}>
                  {busy ? <Spinner /> : "إرسال الرسالة"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
