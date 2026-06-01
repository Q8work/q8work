import { useState } from "react";
import { Layout } from "../components/Layout";
import { ErrorText, Spinner } from "../components/ui";
import { api, ApiError } from "../lib/api";

function IconMail() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>;
}
function IconClock() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}
function IconChat() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
}

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
    <Layout wide>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-4 py-1.5 text-sm font-bold text-brand-dark">
            <IconChat /> نحن هنا لمساعدتك
          </span>
          <h1 className="mt-4 text-4xl font-extrabold text-brand-darkest sm:text-5xl">تواصل معنا</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-brand">
            عندك سؤال أو اقتراح أو استفسار؟ أرسل لنا رسالة وسنردّ عليك في أقرب وقت.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          {/* Info panel */}
          <div className="flex flex-col gap-6 rounded-3xl bg-brand-dark p-8 text-white lg:col-span-2">
            <div>
              <h2 className="text-xl font-extrabold">معلومات التواصل</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                فريق <span data-latin>Q8Work</span> جاهز للرد على الشركات والباحثين عن الفرص.
              </p>
            </div>

            <a href="mailto:info@q8work.com" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15"><IconMail /></span>
              <div>
                <div className="text-xs text-white/60">البريد الإلكتروني</div>
                <div className="font-bold" data-latin>info@q8work.com</div>
              </div>
            </a>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15"><IconClock /></span>
              <div>
                <div className="text-xs text-white/60">وقت الاستجابة</div>
                <div className="font-bold">خلال ٢٤ ساعة عادةً</div>
              </div>
            </div>

            <p className="mt-auto text-xs leading-relaxed text-white/50">
              نهتم بكل رسالة ونسعى لتقديم تجربة احترافية وموثوقة لكل مستخدمي المنصة.
            </p>
          </div>

          {/* Form */}
          <div className="card lg:col-span-3">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div>
                <h2 className="text-xl font-extrabold text-brand-darkest">تم إرسال رسالتك</h2>
                <p className="mt-2 text-brand-dark">شكراً لتواصلك معنا، سنردّ عليك قريباً.</p>
                <button className="btn-secondary mt-6" onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h2 className="text-lg font-extrabold text-brand-darkest">أرسل لنا رسالة</h2>
                <ErrorText>{error}</ErrorText>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">الاسم</label>
                    <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">البريد الإلكتروني</label>
                    <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-latin />
                  </div>
                </div>
                <div>
                  <label className="label">الرسالة</label>
                  <textarea className="input" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="اكتب رسالتك هنا..." />
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
