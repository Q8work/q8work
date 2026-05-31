import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { SECTORS } from "../lib/constants";

interface Stats { companies: number; workers: number; jobs: number; open_jobs: number; }

const Icon = {
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-40 w-40"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-40 w-40"><path d="M3 21h18M6 21V7l6-4 6 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></svg>,
};

function ArrowLink({ to, children, light }: { to: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link to={to} className={`group mt-8 inline-flex items-center gap-3 text-sm font-bold ${light ? "text-white" : "text-brand-darkest"}`}>
      <span className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform group-hover:-translate-x-1 ${light ? "border-white/40" : "border-brand-darkest/30"}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </span>
      {children}
    </Link>
  );
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { api.get<Stats>("/stats").then(setStats).catch(() => {}); }, []);
  const num = (v?: number) => (v == null ? "—" : v.toLocaleString("en-US"));

  return (
    <Layout bare>
      {/* Hero — full viewport */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-brand-darkest px-6 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/45">Q8WORK</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-8xl">
            اشتغل بشروطك،<br /> واختار ساعاتك
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg text-white/60 sm:text-xl">
            منصة العمل الجزئي للكويتيين — مرونة، احترافية، وبدون تعقيدات العقود.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}
            className="mx-auto mt-10 flex max-w-lg gap-2 rounded-full bg-white p-1.5"
          >
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن فرصة عمل..."
              className="flex-1 bg-transparent px-5 text-sm text-brand-darkest placeholder:text-brand/60 focus:outline-none" />
            <button type="submit" className="btn-primary">ابحث</button>
          </form>
          {!user && (
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="btn-secondary">سجّل كباحث عن عمل</Link>
              <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/10">سجّل كشركة</Link>
            </div>
          )}
        </div>
        <span className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        </span>
      </section>

      {/* Stats band — full bleed */}
      <section className="border-y border-brand-soft bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-brand-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
          {[
            [num(stats?.companies), "شركة مسجّلة"],
            [num(stats?.workers), "باحث عن عمل مسجّل"],
            [num(stats?.open_jobs), "فرصة عمل متاحة"],
          ].map(([v, l]) => (
            <div key={l} className="px-6 py-14 text-center">
              <div className="text-5xl font-extrabold tracking-tight text-brand-darkest sm:text-6xl">{v}</div>
              <div className="mt-3 text-sm font-semibold uppercase tracking-widest text-brand">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Band 1 — job seekers */}
      <section className="grid md:grid-cols-2">
        <div className="flex min-h-[70vh] items-center justify-center bg-brand-darkest text-white/15">{Icon.users}</div>
        <div className="flex min-h-[70vh] items-center bg-white px-8 py-20 sm:px-16">
          <div className="max-w-md">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand">للباحث عن عمل</span>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight text-brand-darkest sm:text-5xl">دخل إضافي يناسب وقتك</h2>
            <p className="mt-5 text-lg text-brand">أنشئ ملفك، قدّم على الفرص، واستقبل عروض الشركات مباشرة — أنت من يختار متى وأين تعمل.</p>
            <ArrowLink to="/register">سجّل كباحث عن عمل</ArrowLink>
          </div>
        </div>
      </section>

      {/* Band 2 — companies (reversed) */}
      <section className="grid md:grid-cols-2">
        <div className="order-1 flex min-h-[70vh] items-center bg-brand-darkest px-8 py-20 text-white sm:px-16 md:order-none">
          <div className="max-w-md">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">للشركة صاحبة العمل</span>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">وظّف الكفاءات الكويتية</h2>
            <p className="mt-5 text-lg text-white/60">انشر فرصك، ابحث وفلتر حسب المهارة والمحافظة والتقييم، واستقبل المتقدمين وأرسل عروضك مباشرة.</p>
            <ArrowLink to="/register" light>انشر فرصة عمل</ArrowLink>
          </div>
        </div>
        <div className="flex min-h-[70vh] items-center justify-center bg-brand-soft text-brand-darkest/15">{Icon.building}</div>
      </section>

      {/* How it works — full bleed light */}
      <section className="bg-brand-bg px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-extrabold text-brand-darkest sm:text-4xl">كيف تعمل المنصة؟</h2>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {[
              ["01", "سجّل ملفك", "أنشئ بروفايلك وحدّد مهاراتك وأوقات توفرك ونوع العمل المفضل."],
              ["02", "قدّم أو استقبل العروض", "قدّم على الفرص المنشورة أو تصلك عروض من الشركات مباشرة."],
              ["03", "اعمل وقيّم", "تواصل، أنجز العمل، وتبادل التقييمات لبناء سمعتك."],
            ].map(([n, t, b]) => (
              <div key={n}>
                <div className="text-5xl font-extrabold text-brand-light">{n}</div>
                <div className="mt-4 h-px w-12 bg-brand-darkest" />
                <h3 className="mt-4 text-xl font-bold text-brand-darkest">{t}</h3>
                <p className="mt-2 text-brand">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors — horizontal scroll */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold text-brand-darkest sm:text-4xl">قطاعات متنوّعة</h2>
            <Link to="/jobs" className="text-sm font-bold text-brand-darkest underline">كل الفرص</Link>
          </div>
          <div className="mt-10 flex gap-4 overflow-x-auto pb-4">
            {SECTORS.map((s) => (
              <div key={s} className="flex h-40 w-56 shrink-0 items-end rounded-2xl border border-brand-soft bg-white p-6 text-xl font-extrabold text-brand-darkest">
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — full bleed dark */}
      <section className="bg-brand-darkest px-6 py-28 text-center text-white">
        <h2 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl">جاهز تبدأ رحلتك مع Q8Work؟</h2>
        <p className="mt-5 text-white/60">انضم اليوم — التسجيل مجاني بالكامل في المرحلة الأولى.</p>
        <Link to={user ? "/app" : "/register"} className="btn-secondary mt-8">ابدأ الآن</Link>
      </section>
    </Layout>
  );
}
