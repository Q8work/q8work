import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { SECTORS } from "../lib/constants";

interface Stats {
  companies: number;
  workers: number;
  jobs: number;
  open_jobs: number;
}

const Icon = {
  building: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></svg>,
  users: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  briefcase: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  clock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>,
  bolt: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h8l-1 8 10-12h-8z"/></svg>,
};

function StatTile({ value, label, icon, color }: { value: string; label: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
      <span className={`mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full ${color}`}>{icon}</span>
      <div className="text-3xl font-extrabold text-brand-darkest">{value}</div>
      <div className="mt-1 text-sm font-semibold text-brand">{label}</div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand-dark">{icon}</span>
      <h3 className="font-bold text-brand-darkest">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-brand">{body}</p>
    </div>
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
    <Layout wide>
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-brand-darkest px-6 py-28 text-center text-white sm:py-40">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">Q8WORK</span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
            اشتغل بشروطك،<br /> واختار ساعاتك
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg text-white/60 sm:text-xl">
            منصة العمل الجزئي للكويتيين — مرونة، احترافية، وبدون تعقيدات العقود.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}
            className="mx-auto mt-10 flex max-w-lg gap-2 rounded-full bg-white p-1.5"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن فرصة عمل..."
              className="flex-1 bg-transparent px-5 text-sm text-brand-darkest placeholder:text-brand/60 focus:outline-none"
            />
            <button type="submit" className="btn-primary">ابحث</button>
          </form>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link to="/app" className="btn-secondary">الذهاب إلى لوحتي</Link>
            ) : (
              <>
                <Link to="/register" className="btn-secondary">سجّل كباحث عن عمل</Link>
                <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                  سجّل كشركة
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatTile value={num(stats?.companies)} label="شركة مسجّلة" icon={Icon.building} color="bg-brand-soft text-brand-dark" />
        <StatTile value={num(stats?.workers)} label="باحث عن عمل مسجّل" icon={Icon.users} color="bg-gold-soft text-gold" />
        <StatTile value={num(stats?.open_jobs)} label="فرصة عمل متاحة" icon={Icon.briefcase} color="bg-brand-soft text-brand-dark" />
      </section>

      {/* Big tiles */}
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-2xl border border-brand-soft bg-white p-8 sm:p-10">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-darkest sm:text-3xl">للباحث عن عمل</h2>
            <p className="mt-3 max-w-sm text-brand">أنشئ ملفك، قدّم على الفرص، واستقبل عروض الشركات — بدخل إضافي يناسب وقتك.</p>
          </div>
          <Link to="/register" className="btn-primary mt-6 self-start">ابدأ الآن</Link>
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-brand-darkest p-8 text-white sm:p-10">
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">للشركة صاحبة العمل</h2>
            <p className="mt-3 max-w-sm text-brand-light">انشر فرصك، ابحث عن الكفاءات الكويتية، واستقبل المتقدمين وأرسل عروضك مباشرة.</p>
          </div>
          <Link to="/register" className="btn-secondary mt-6 self-start">انشر فرصة</Link>
        </div>
      </section>

      {/* Sectors */}
      <section className="mt-24 text-center">
        <h2 className="text-2xl font-extrabold text-brand-darkest sm:text-3xl">قطاعات متنوّعة</h2>
        <p className="mt-2 text-brand">فرص عمل في مختلف المجالات حول الكويت</p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SECTORS.map((s) => (
            <div key={s} className="rounded-2xl border border-brand-soft bg-white p-6 text-center font-bold text-brand-darkest">
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mt-24">
        <h2 className="text-center text-2xl font-extrabold text-brand-darkest sm:text-3xl">لماذا Q8Work؟</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Icon.clock} title="مرونة كاملة" body="اختر ساعاتك ونوع العمل الذي يناسب التزاماتك." />
          <Feature icon={Icon.check} title="كفاءات موثّقة" body="توثيق الجنسية والشركات لبناء ثقة بين الطرفين." />
          <Feature icon={Icon.shield} title="خصوصية محمية" body="رقم تواصلك لا يظهر للشركة إلا بعد قبول العرض." />
          <Feature icon={Icon.bolt} title="بدون تعقيدات" body="تواصل مباشر وعروض سريعة بدون أعباء العقود." />
        </div>
      </section>

      {/* How it works */}
      <section className="mt-24">
        <h2 className="text-center text-2xl font-extrabold text-brand-darkest sm:text-3xl">كيف تعمل المنصة؟</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["1", "سجّل ملفك", "أنشئ بروفايلك وحدّد مهاراتك وأوقات توفرك."],
            ["2", "قدّم أو استقبل العروض", "قدّم على الفرص أو تصلك عروض من الشركات."],
            ["3", "اعمل وقيّم", "أنجز العمل وتبادل التقييمات لبناء سمعتك."],
          ].map(([n, t, b]) => (
            <div key={n} className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-sm font-extrabold text-white">{n}</span>
              <h3 className="font-bold text-brand-darkest">{t}</h3>
              <p className="mt-1 text-sm text-brand">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-24 rounded-[2rem] bg-brand-darkest px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-extrabold">جاهز تبدأ؟</h2>
        <p className="mt-3 text-white/70">انضم اليوم — التسجيل مجاني بالكامل في المرحلة الأولى.</p>
        <Link to={user ? "/app" : "/register"} className="btn-secondary mt-7">ابدأ الآن</Link>
      </section>
    </Layout>
  );
}
