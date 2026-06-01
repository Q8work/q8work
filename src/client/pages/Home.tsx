import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { VerifiedTick } from "../components/ui";
import { IconPin, IconBriefcase, IconCash } from "../components/icons";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { labelOf, WORK_TYPES } from "../lib/constants";
import { toLatinDigits } from "../lib/format";
import { JobBigCard, JOB_SCHEMES as SCHEMES } from "../components/JobBigCard";

interface Stats { companies: number; workers: number; jobs: number; open_jobs: number; }
interface Job {
  id: string; title: string; area: string; work_type: string; salary: string;
  company_name: string; company_verified: number; logo_key: string | null;
}
interface CompanyCard {
  user_id: string; company_name: string; logo_key: string | null; sector: string;
  verified: number; open_jobs: number;
}


// ---- mini job card used in previews & hero ----
function MiniJob({ job }: { job: Job }) {
  return (
    <div className="rounded-xl border border-brand-soft bg-white p-4 text-right shadow-sm">
      <h4 className="text-sm font-bold text-brand-darkest">{job.title}</h4>
      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-brand">
        {job.company_name}
        <VerifiedTick verified={job.company_verified} size={13} />
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        {job.area && <span className="chip gap-1"><IconPin className="h-3 w-3" /> {job.area}</span>}
        {job.work_type && <span className="chip gap-1"><IconBriefcase className="h-3 w-3" /> {labelOf(WORK_TYPES, job.work_type)}</span>}
        {job.salary && <span className="chip gap-1"><IconCash className="h-3 w-3" /> {toLatinDigits(job.salary)} د.ك</span>}
      </div>
    </div>
  );
}

function FeatureRow({ reverse, eyebrow, title, body, cta, to, preview }: {
  reverse?: boolean; eyebrow?: string; title: string; body: string; cta: string; to: string; preview: React.ReactNode;
}) {
  return (
    <section className="grid items-center gap-10 md:grid-cols-2">
      <div className={reverse ? "md:order-2" : ""}>
        {eyebrow && <span className="text-xs font-bold uppercase tracking-widest text-brand">{eyebrow}</span>}
        <h2 className="mt-3 text-3xl font-extrabold leading-tight text-brand-darkest sm:text-4xl">{title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-brand">{body}</p>
        <Link to={to} className="btn-primary mt-6">{cta}</Link>
      </div>
      <div className={reverse ? "md:order-1" : ""}>{preview}</div>
    </section>
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
    api.get<{ jobs: Job[] }>("/jobs").then((r) => setJobs(r.jobs)).catch(() => {});
    api.get<{ companies: CompanyCard[] }>("/companies").then((r) => setCompanies(r.companies)).catch(() => {});
  }, []);

  const num = (v?: number) => (v == null ? "—" : v.toLocaleString("en-US"));

  return (
    <Layout wide>
      {/* Hero */}
      <section className="px-2 pt-10 text-center sm:pt-16">
        <h1 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-brand-darkest sm:text-5xl">
          منصة كويتية <span className="whitespace-nowrap text-brand-dark">للفرص والعمل المرن</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-brand sm:text-lg">
          اعمل وقت ما تريد، واختر الفرص المناسبة لمهاراتك، واحصل على دخل إضافي من شركات تبحث عن كفاءات لفترات محددة.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}
          className="mx-auto mt-8 flex max-w-xl gap-2 rounded-xl border border-brand-soft bg-white p-2 shadow-sm"
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن فرصة تناسب وقتك"
            className="flex-1 bg-transparent px-3 text-sm text-brand-darkest placeholder:text-brand/60 focus:outline-none" />
          <button type="submit" className="btn-primary">ابحث</button>
        </form>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link to="/jobs" className="btn-primary">استكشف الفرص</Link>
          <Link to="/register" className="btn-secondary">أضف فرصة لشركتك</Link>
        </div>

        {/* Assurance bar */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-brand-dark">
          {["منصة كويتية", "فرص مرنة ومكافآت واضحة", "شركات موثوقة", "تسجيل مجاني"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Stat strip */}
      <section className="mt-12 grid grid-cols-3 gap-4 text-center">
        {[[`+${num(stats?.open_jobs)}`, "فرصة"], [`+${num(stats?.companies)}`, "شركة"], [`+${num(stats?.workers)}`, "مستخدم"]].map(([v, l]) => (
          <div key={l} className="rounded-2xl border border-brand-soft bg-white py-8">
            <div className="text-3xl font-extrabold text-brand-darkest sm:text-4xl">{v}</div>
            <div className="mt-1 text-sm font-semibold text-brand">{l}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="mt-20">
        <h2 className="text-center text-3xl font-extrabold text-brand-darkest sm:text-4xl">كيف تعمل المنصة؟</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "سجّل حسابك",
            "اختر الفرصة المناسبة",
            "نفّذ العمل",
            "استلم مكافأتك",
          ].map((step, i) => (
            <div key={step} className="relative rounded-2xl bg-brand-soft p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-dark text-lg font-extrabold text-white" data-latin>
                {i + 1}
              </span>
              <p className="mt-4 font-bold text-brand-darkest">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature rows */}
      <div className="mt-20 space-y-20">
        <FeatureRow
          title="حوّل وقت فراغك إلى دخل إضافي"
          body="اختر الفرص المناسبة لك وابدأ العمل بمرونة دون التزام طويل"
          cta="ابدأ كباحث عن فرص"
          to="/register"
          preview={
            <div className="space-y-3 rounded-3xl bg-flame-soft p-5">
              {(jobs.length ? jobs.slice(0, 2) : Array.from({ length: 2 })).map((j, i) =>
                j ? <MiniJob key={(j as Job).id} job={j as Job} /> : <div key={i} className="h-24 rounded-xl bg-white" />
              )}
            </div>
          }
        />
        <FeatureRow
          reverse
          title="لا توظّف بدوام كامل إذا لم تكن بحاجة لذلك"
          body="اعرض فرصاً مؤقتة أو موسمية أو جزئية، وحدد عدد الأيام أو الساعات والمكافأة، وسنساعدك في الوصول إلى الأشخاص المناسبين بسرعة."
          cta="انشر فرصة عمل"
          to="/register"
          preview={
            <div className="space-y-3 rounded-3xl bg-gold-soft p-5">
              {(companies.length ? companies.slice(0, 3) : Array.from({ length: 3 }, () => null)).map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft font-bold text-brand-dark">{c ? (c as CompanyCard).company_name.charAt(0) : "؟"}</span>
                  <div className="flex-1">
                    <div className="h-2.5 w-2/3 rounded bg-brand-soft" />
                    <div className="mt-1.5 h-2 w-1/3 rounded bg-brand-soft" />
                  </div>
                  <span className="rounded-md bg-brand-darkest px-2 py-1 text-[11px] font-bold text-white">عرض</span>
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* Current jobs — coolors-style colorful cards */}
      {jobs.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-extrabold text-brand-darkest sm:text-4xl">فرص مرنة بمكافآت مباشرة</h2>
            <Link to="/jobs" className="text-sm font-bold text-brand-dark hover:underline">عرض الكل ←</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {jobs.slice(0, 6).map((j, i) => <JobBigCard key={j.id} job={j} scheme={SCHEMES[i % SCHEMES.length]} />)}
          </div>
        </section>
      )}

      {/* Trusted by — resource-style cards */}
      {companies.length > 0 && (
        <section className="mt-20">
          <p className="text-center text-sm font-bold uppercase tracking-[0.25em] text-brand">شركات تثق بـ Q8WORK</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.slice(0, 6).map((c) => (
              <Link
                key={c.user_id}
                to={`/companies/${c.user_id}`}
                className="rounded-2xl bg-brand-soft p-8 transition-colors hover:bg-brand-light/50"
              >
                <h3 className="text-2xl font-extrabold text-brand-darkest">{c.company_name}</h3>
                <p className="mt-2 leading-relaxed text-brand">
                  {c.open_jobs > 0 ? `${c.open_jobs} فرصة عمل متاحة الآن` : (c.sector || "شركة مسجّلة على المنصة")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="mt-20">
        <h2 className="text-center text-3xl font-extrabold text-brand-darkest sm:text-4xl">بيئة عمل موثوقة للطرفين</h2>
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {[
            "حسابات موثقة",
            "تقييمات متبادلة",
            "فرص حقيقية من شركات معتمدة",
            "مكافآت واضحة قبل بدء العمل",
          ].map((t) => (
            <div key={t} className="flex items-center gap-3 rounded-2xl bg-brand-soft p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </span>
              <span className="font-bold text-brand-darkest">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 rounded-3xl bg-brand-dark px-6 py-16 text-center text-white">
        <h2 className="text-3xl font-extrabold sm:text-4xl">جاهز تبدأ؟</h2>
        <p className="mt-3 text-white/60">انضم اليوم — التسجيل مجاني بالكامل في المرحلة الأولى.</p>
        <Link to={user ? "/app" : "/register"} className="mt-7 inline-flex rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-darkest hover:bg-white/90">
          {user ? "الذهاب إلى لوحتي" : "أنشئ حساباً"}
        </Link>
      </section>
    </Layout>
  );
}
