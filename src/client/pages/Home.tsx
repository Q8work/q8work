import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Avatar, VerifiedBadge } from "../components/ui";
import { IconPin, IconBriefcase, IconCash } from "../components/icons";
import { useAuth } from "../lib/auth";
import { api, fileUrl } from "../lib/api";
import { WORK_TYPES, SECTORS, labelOf } from "../lib/constants";
import { toLatinDigits } from "../lib/format";

interface Stats { companies: number; workers: number; jobs: number; open_jobs: number; }
interface Job {
  id: string; title: string; area: string; work_type: string; salary: string;
  company_name: string; company_verified: number;
}
interface CompanyCard {
  user_id: string; company_name: string; logo_key: string | null; sector: string;
  verified: number; open_jobs: number;
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="group flex flex-col rounded-xl border border-brand-soft bg-white p-5 transition hover:border-brand-light hover:shadow-sm">
      <h3 className="font-bold text-brand-darkest group-hover:text-brand-dark">{job.title}</h3>
      <p className="mt-0.5 text-sm font-semibold text-brand">{job.company_name}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {job.area && <span className="chip gap-1"><IconPin className="h-3.5 w-3.5" /> {job.area}</span>}
        {job.work_type && <span className="chip gap-1"><IconBriefcase className="h-3.5 w-3.5" /> {labelOf(WORK_TYPES, job.work_type)}</span>}
        {job.salary && <span className="chip gap-1"><IconCash className="h-3.5 w-3.5" /> {toLatinDigits(job.salary)} د.ك</span>}
      </div>
    </Link>
  );
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<CompanyCard[]>([]);

  useEffect(() => {
    api.get<Stats>("/stats").then(setStats).catch(() => {});
    api.get<{ jobs: Job[] }>("/jobs").then((r) => setJobs(r.jobs.slice(0, 6))).catch(() => {});
    api.get<{ companies: CompanyCard[] }>("/companies").then((r) => setCompanies(r.companies.slice(0, 6))).catch(() => {});
  }, []);

  const num = (v?: number) => (v == null ? "—" : v.toLocaleString("en-US"));
  const popular = ["مبيعات", "كاشير", "تسويق", "تصميم", "خدمة عملاء"];

  return (
    <Layout wide>
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-b from-azure-soft to-white px-6 py-16 text-center sm:py-20">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-brand-darkest sm:text-5xl">
          فرصتك الجزئية القادمة <span className="text-gold">تبدأ هنا</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand">
          منصة العمل الجزئي للكويتيين — تصفّح آلاف الفرص وتواصل مع الشركات مباشرة.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}
          className="mx-auto mt-8 flex max-w-xl gap-2 rounded-xl border border-brand-soft bg-white p-2 shadow-sm"
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن فرصة عمل أو مهارة..."
            className="flex-1 bg-transparent px-3 text-sm text-brand-darkest placeholder:text-brand/60 focus:outline-none" />
          <button type="submit" className="btn-primary">ابحث</button>
        </form>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-brand">شائع:</span>
          {popular.map((p) => (
            <Link key={p} to={`/jobs?q=${encodeURIComponent(p)}`} className="rounded-full border border-brand-soft bg-white px-3 py-1 font-semibold text-brand-dark hover:border-brand-light">{p}</Link>
          ))}
        </div>
      </section>

      {/* Stats row */}
      <section className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-brand-soft bg-white p-6 text-center">
        {[[num(stats?.companies), "شركة"], [num(stats?.workers), "باحث عن عمل"], [num(stats?.open_jobs), "فرصة متاحة"]].map(([v, l]) => (
          <div key={l}>
            <div className="text-2xl font-extrabold text-brand-darkest sm:text-3xl">{v}</div>
            <div className="mt-1 text-xs font-semibold text-brand sm:text-sm">{l}</div>
          </div>
        ))}
      </section>

      {/* Latest jobs */}
      <section className="mt-14">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-extrabold text-brand-darkest">أحدث فرص العمل</h2>
          <Link to="/jobs" className="text-sm font-bold text-brand-dark hover:underline">عرض الكل ←</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-brand-light p-8 text-center text-brand">لا توجد فرص منشورة بعد.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        )}
      </section>

      {/* Companies hiring */}
      {companies.length > 0 && (
        <section className="mt-14">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-extrabold text-brand-darkest">شركات تُوظّف الآن</h2>
            <Link to="/companies" className="text-sm font-bold text-brand-dark hover:underline">كل الشركات ←</Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <Link key={c.user_id} to={`/companies/${c.user_id}`} className="flex items-center gap-3 rounded-xl border border-brand-soft bg-white p-4 transition hover:border-brand-light hover:shadow-sm">
                <Avatar src={fileUrl(c.logo_key)} name={c.company_name} size={48} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-bold text-brand-darkest">{c.company_name}</span>
                    {c.verified ? <VerifiedBadge verified={1} /> : null}
                  </div>
                  <span className="text-xs text-brand">{c.open_jobs > 0 ? `${c.open_jobs} فرصة متاحة` : c.sector}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="mt-14 rounded-2xl bg-brand-darkest px-6 py-14 text-white">
        <h2 className="text-center text-2xl font-extrabold">كيف تعمل المنصة؟</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-3">
          {[
            ["١", "سجّل ملفك", "أنشئ بروفايلك وحدّد مهاراتك وأوقات توفرك."],
            ["٢", "قدّم على الفرص", "قدّم مباشرة أو تصلك عروض من الشركات."],
            ["٣", "اعمل وقيّم", "أنجز العمل وتبادل التقييمات لبناء سمعتك."],
          ].map(([n, t, b]) => (
            <div key={t} className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sun font-extrabold text-brand-darkest">{n}</div>
              <h3 className="mt-4 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-white/60">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-brand-darkest">تصفّح حسب القطاع</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <Link key={s} to={`/jobs?q=${encodeURIComponent(s)}`} className="rounded-lg border border-brand-soft bg-white px-4 py-2 text-sm font-bold text-brand-darkest hover:border-brand-dark hover:text-brand-dark">{s}</Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl border border-brand-soft bg-brand-bg p-10 text-center sm:flex-row sm:text-right">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-darkest">جاهز تبدأ؟</h2>
          <p className="mt-1 text-brand">التسجيل مجاني بالكامل في المرحلة الأولى.</p>
        </div>
        <Link to={user ? "/app" : "/register"} className="btn-primary shrink-0">{user ? "الذهاب إلى لوحتي" : "أنشئ حساباً"}</Link>
      </section>
    </Layout>
  );
}
