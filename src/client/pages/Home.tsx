import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

interface Stats {
  companies: number;
  workers: number;
  jobs: number;
  open_jobs: number;
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-brand-soft bg-white p-5 shadow-sm">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
        {icon}
      </span>
      <div>
        <div className="text-2xl font-extrabold leading-none text-brand-darkest">{value}</div>
        <div className="mt-1 text-sm font-semibold text-brand">{label}</div>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-lg font-extrabold text-white">
        {n}
      </div>
      <h3 className="text-lg font-bold text-brand-darkest">{title}</h3>
      <p className="mt-1 text-sm text-brand-dark">{body}</p>
    </div>
  );
}

const I = {
  building: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M6 21V7l6-4 6 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/></svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  briefcase: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
};

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/stats").then(setStats).catch(() => {});
  }, []);

  const num = (v?: number) => (v == null ? "—" : v.toLocaleString("en-US"));

  return (
    <Layout wide>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-darkest via-brand-darkest to-brand-dark px-6 py-16 text-center text-white sm:py-20">
        <div className="relative mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-brand-light ring-1 ring-white/15">
            منصة العمل الجزئي للكويتيين
          </span>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            اشتغل بشروطك واختار ساعاتك
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-light">
            نربط الباحثين عن دخل إضافي بأصحاب العمل بمرونة واحترافية وبدون تعقيدات العقود.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`);
            }}
            className="mx-auto mt-8 flex max-w-lg gap-2 rounded-xl bg-white p-2 shadow-lg"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن فرصة عمل... مبيعات، كاشير، تسويق"
              className="flex-1 bg-transparent px-3 text-sm text-brand-darkest placeholder:text-brand focus:outline-none"
            />
            <button type="submit" className="btn-primary">ابحث</button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link to="/app" className="btn-secondary">الذهاب إلى لوحتي</Link>
            ) : (
              <>
                <Link to="/register" className="btn-secondary">سجّل كباحث عن عمل</Link>
                <Link to="/register" className="btn-ghost text-white ring-1 ring-white/25 hover:bg-white/10">
                  سجّل كشركة
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
        <StatCard value={num(stats?.companies)} label="شركة مسجّلة" icon={I.building} />
        <StatCard value={num(stats?.workers)} label="باحث عن عمل مسجّل" icon={I.users} />
        <StatCard value={num(stats?.open_jobs)} label="فرصة عمل متاحة" icon={I.briefcase} />
      </section>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-brand-darkest">كيف تعمل المنصة؟</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Step n="1" title="سجّل ملفك" body="أنشئ بروفايلك، حدد مهاراتك وأوقات توفرك ونوع العمل المفضل." />
          <Step n="2" title="قدّم أو استقبل العروض" body="قدّم على الفرص المنشورة أو تصلك عروض من الشركات مباشرة." />
          <Step n="3" title="اعمل وقيّم" body="تواصل عبر الرسائل، أنجز العمل، وتبادل التقييمات لبناء سمعتك." />
        </div>
      </section>

      {/* Audience */}
      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h3 className="text-xl font-bold text-brand-darkest">للباحث عن دخل إضافي</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-dark">
            <li>• طلاب جامعيون يبحثون عن دخل بعد الدوام</li>
            <li>• موظفون متاحون بعد ساعات العمل الرسمية</li>
            <li>• خريجون يبحثون عن فرص مؤقتة لبناء الخبرة</li>
          </ul>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold text-brand-darkest">للشركة صاحبة العمل</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-dark">
            <li>• مطاعم وكافيهات تحتاج كاشير أو موظف استقبال</li>
            <li>• شركات تحتاج تكويت نسبة موظفين لمشروع</li>
            <li>• فعاليات ومؤتمرات تحتاج موظفين ليوم أو أسبوع</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 overflow-hidden rounded-2xl bg-brand-darkest px-6 py-12 text-center text-white">
        <h2 className="text-2xl font-extrabold">جاهز تبدأ؟</h2>
        <p className="mt-2 text-brand-light">انضم اليوم — التسجيل مجاني بالكامل في المرحلة الأولى.</p>
        <Link to={user ? "/app" : "/register"} className="btn-secondary mt-6">ابدأ الآن</Link>
      </section>
    </Layout>
  );
}
