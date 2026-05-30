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
  building: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></svg>,
  users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  briefcase: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  clock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>,
  bolt: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h8l-1 8 10-12h-8z"/></svg>,
};

function HeroStat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-brand-soft py-3 last:border-0">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">{icon}</span>
      <div>
        <div className="text-2xl font-extrabold leading-none text-brand-darkest">{value}</div>
        <div className="text-xs font-semibold text-brand">{label}</div>
      </div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-brand-soft bg-white p-5 shadow-sm">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-darkest text-white">{icon}</span>
      <h3 className="font-bold text-brand-darkest">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-brand-dark">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="relative rounded-xl border border-brand-soft bg-white p-5 shadow-sm">
      <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-sm font-extrabold text-white">{n}</span>
      <h3 className="font-bold text-brand-darkest">{title}</h3>
      <p className="mt-1 text-sm text-brand-dark">{body}</p>
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
      <section className="overflow-hidden rounded-2xl bg-gradient-to-bl from-brand-darkest via-brand-darkest to-brand-dark px-6 py-12 sm:px-10 sm:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="text-white">
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-brand-light ring-1 ring-white/15">
              منصة العمل الجزئي للكويتيين
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">اشتغل بشروطك واختار ساعاتك</h1>
            <p className="mt-4 max-w-lg text-base text-brand-light sm:text-lg">
              نربط الباحثين عن دخل إضافي بأصحاب العمل بمرونة واحترافية وبدون تعقيدات العقود.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}
              className="mt-7 flex max-w-lg gap-2 rounded-xl bg-white p-2 shadow-lg"
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن فرصة عمل..."
                className="flex-1 bg-transparent px-3 text-sm text-brand-darkest placeholder:text-brand focus:outline-none"
              />
              <button type="submit" className="btn-primary">ابحث</button>
            </form>
            <div className="mt-6 flex flex-wrap gap-3">
              {user ? (
                <Link to="/app" className="btn-secondary">الذهاب إلى لوحتي</Link>
              ) : (
                <>
                  <Link to="/register" className="btn-secondary">سجّل كباحث عن عمل</Link>
                  <Link to="/register" className="btn-ghost text-white ring-1 ring-white/25 hover:bg-white/10">سجّل كشركة</Link>
                </>
              )}
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-sm font-bold text-brand">أرقام المنصة</h3>
            <HeroStat value={num(stats?.companies)} label="شركة مسجّلة" icon={Icon.building} />
            <HeroStat value={num(stats?.workers)} label="باحث عن عمل مسجّل" icon={Icon.users} />
            <HeroStat value={num(stats?.open_jobs)} label="فرصة عمل متاحة" icon={Icon.briefcase} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-extrabold text-brand-darkest">لماذا Q8Work؟</h2>
        <p className="mt-2 text-center text-brand-dark">مزايا تجعل التوظيف الجزئي أسهل وأكثر أماناً</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={Icon.clock} title="مرونة كاملة" body="اختر ساعاتك ونوع العمل الذي يناسب التزاماتك." />
          <Feature icon={Icon.check} title="كفاءات موثّقة" body="توثيق الجنسية والشركات لبناء ثقة بين الطرفين." />
          <Feature icon={Icon.shield} title="خصوصية محمية" body="رقم تواصلك لا يظهر للشركة إلا بعد قبول العرض." />
          <Feature icon={Icon.bolt} title="بدون تعقيدات" body="تواصل مباشر وعروض سريعة بدون أعباء العقود." />
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-extrabold text-brand-darkest">كيف تعمل المنصة؟</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Step n="1" title="سجّل ملفك" body="أنشئ بروفايلك، حدد مهاراتك وأوقات توفرك ونوع العمل المفضل." />
          <Step n="2" title="قدّم أو استقبل العروض" body="قدّم على الفرص المنشورة أو تصلك عروض من الشركات مباشرة." />
          <Step n="3" title="اعمل وقيّم" body="تواصل عبر الرسائل، أنجز العمل، وتبادل التقييمات لبناء سمعتك." />
        </div>
      </section>

      {/* Sectors */}
      <section className="mt-16 rounded-2xl border border-brand-soft bg-white p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-brand-darkest">قطاعات متنوّعة</h2>
        <p className="mt-1 text-sm text-brand-dark">فرص عمل في مختلف المجالات حول الكويت</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <span key={s} className="rounded-lg bg-brand-bg px-3 py-1.5 text-sm font-semibold text-brand-darkest ring-1 ring-brand-soft">{s}</span>
          ))}
        </div>
      </section>

      {/* Two audiences */}
      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-brand-soft bg-white p-7 shadow-sm">
          <h3 className="text-xl font-bold text-brand-darkest">للباحث عن دخل إضافي</h3>
          <ul className="mt-3 flex-1 space-y-2 text-sm text-brand-dark">
            <li>• طلاب وموظفون يبحثون عن دخل بعد الدوام</li>
            <li>• خريجون يبنون خبرتهم عبر فرص مؤقتة</li>
            <li>• تحكّم كامل في أوقاتك ونوع عملك</li>
          </ul>
          <Link to="/register" className="btn-primary mt-5 self-start">سجّل كباحث عن عمل</Link>
        </div>
        <div className="flex flex-col rounded-2xl bg-brand-darkest p-7 text-white shadow-sm">
          <h3 className="text-xl font-bold">للشركة صاحبة العمل</h3>
          <ul className="mt-3 flex-1 space-y-2 text-sm text-brand-light">
            <li>• وظّف كفاءات كويتية بسرعة ومرونة</li>
            <li>• ابحث وفلتر حسب المهارة والمحافظة والتقييم</li>
            <li>• استقبل المتقدمين وأرسل عروضك مباشرة</li>
          </ul>
          <Link to="/register" className="btn-secondary mt-5 self-start">سجّل كشركة</Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 rounded-2xl border border-brand-soft bg-brand-bg px-6 py-12 text-center">
        <h2 className="text-2xl font-extrabold text-brand-darkest">جاهز تبدأ؟</h2>
        <p className="mt-2 text-brand-dark">انضم اليوم — التسجيل مجاني بالكامل في المرحلة الأولى.</p>
        <Link to={user ? "/app" : "/register"} className="btn-primary mt-6">ابدأ الآن</Link>
      </section>
    </Layout>
  );
}
