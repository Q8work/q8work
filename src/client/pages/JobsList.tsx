import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { EmptyState, PageLoader, VerifiedTick } from "../components/ui";
import { IconPin, IconClock, IconBriefcase } from "../components/icons";
import { api, fileUrl } from "../lib/api";
import { useAuth } from "../lib/auth";
import { AREAS, WORK_TYPES, DURATIONS, labelOf } from "../lib/constants";
import { toLatinDigits } from "../lib/format";

interface Job {
  id: string;
  title: string;
  description: string;
  duration: string;
  salary: string;
  area: string;
  work_type: string;
  skills_required: string[];
  headcount: number;
  company_name: string;
  company_verified: number;
  logo_key: string | null;
  created_at: number;
}

const REWARD_TIERS = [
  { value: "", label: "كل المكافآت" },
  { value: "50", label: "+50 د.ك" },
  { value: "100", label: "+100 د.ك" },
  { value: "200", label: "+200 د.ك" },
];

const parseReward = (s: string) => parseFloat(toLatinDigits(String(s)).replace(/[^\d.]/g, "")) || 0;

const postedAgo = (ms?: number) => {
  if (!ms) return "";
  const days = Math.floor((Date.now() - ms) / 86400000);
  if (days <= 0) return "نُشرت اليوم";
  if (days === 1) return "نُشرت أمس";
  if (days < 30) return `نُشرت منذ ${toLatinDigits(String(days))} يوم`;
  return `نُشرت في ${new Intl.DateTimeFormat("ar-KW-u-nu-latn", { dateStyle: "medium" }).format(new Date(ms))}`;
};

function JobCard({ job }: { job: Job }) {
  const { user } = useAuth();
  const logo = fileUrl(job.logo_key);
  const detailsTo = user ? `/jobs/${job.id}` : `/register?redirect=${encodeURIComponent(`/jobs/${job.id}`)}`;
  return (
    <div className="card group flex flex-col">
      {/* company */}
      <div className="flex items-center gap-2.5">
        {logo ? (
          <img src={logo} alt={job.company_name} className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-brand-soft" />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-extrabold text-brand-dark">
            {job.company_name.charAt(0)}
          </span>
        )}
        <span className="inline-flex min-w-0 items-center gap-1 text-sm font-bold text-brand-dark">
          <span className="truncate">{job.company_name}</span>
          <VerifiedTick verified={job.company_verified} size={14} />
        </span>
      </div>

      {/* title */}
      <h3 className="mt-3 text-xl font-extrabold leading-snug text-brand-darkest">{job.title}</h3>

      {/* meta */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-brand">
        {job.area && <span className="inline-flex items-center gap-1.5"><IconPin className="h-4 w-4" /> {job.area}</span>}
        {job.duration && <span className="inline-flex items-center gap-1.5"><IconClock className="h-4 w-4" /> {labelOf(DURATIONS, job.duration)}</span>}
        {job.work_type && <span className="inline-flex items-center gap-1.5"><IconBriefcase className="h-4 w-4" /> {labelOf(WORK_TYPES, job.work_type)}</span>}
      </div>

      {/* prominent reward */}
      {job.salary && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
          <span className="text-xs font-bold text-emerald-700/80">المكافأة</span>
          <span className="text-2xl font-extrabold text-emerald-700">
            {toLatinDigits(job.salary)} <span className="text-base font-bold">د.ك</span>
          </span>
        </div>
      )}

      {/* posted date */}
      {job.created_at ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          {postedAgo(job.created_at)}
        </p>
      ) : null}

      {/* action */}
      <Link to={detailsTo} className="btn-primary mt-3 w-full justify-center">
        عرض التفاصيل
      </Link>
    </div>
  );
}

export function JobsList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Viewing the jobs feed clears the "new jobs from followed companies" alert.
  useEffect(() => {
    if (user?.role === "worker") api.post("/follows/seen/all", {}).catch(() => {});
  }, [user]);

  const q = params.get("q") || "";
  const area = params.get("area") || "";
  const workType = params.get("work_type") || "";
  const duration = params.get("duration") || "";
  const reward = params.get("reward") || "";

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (area) qs.set("area", area);
    if (workType) qs.set("work_type", workType);
    api
      .get<{ jobs: Job[] }>(`/jobs?${qs.toString()}`)
      .then((r) => setJobs(r.jobs))
      .finally(() => setLoading(false));
  }, [q, area, workType]);

  // duration + reward are filtered client-side
  const filtered = useMemo(() => {
    const min = parseReward(reward);
    return jobs.filter(
      (j) => (!duration || j.duration === duration) && (!min || parseReward(j.salary) >= min)
    );
  }, [jobs, duration, reward]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <Layout wide>
      <PageHeader
        title="اكتشف الفرص المناسبة لك"
        subtitle="فرص عمل مرنة ومكافآت واضحة من شركات تبحث عن كفاءات لفترات محددة."
        badge={filtered.length > 0 ? <><span data-latin>{filtered.length}</span><span className="font-semibold">فرصة</span></> : undefined}
      />

      {/* Smart filters */}
      <div className="mb-6 mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-soft">
        <input
          className="input w-full"
          placeholder="ابحث عن فرصة تناسب وقتك"
          defaultValue={q}
          onKeyDown={(e) => e.key === "Enter" && update("q", (e.target as HTMLInputElement).value)}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select className="input" value={area} onChange={(e) => update("area", e.target.value)}>
            <option value="">المدينة (كل المحافظات)</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select className="input" value={workType} onChange={(e) => update("work_type", e.target.value)}>
            <option value="">نوع الفرصة</option>
            {WORK_TYPES.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
          <select className="input" value={duration} onChange={(e) => update("duration", e.target.value)}>
            <option value="">مدة العمل</option>
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <select className="input" value={reward} onChange={(e) => update("reward", e.target.value)}>
            {REWARD_TIERS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState title="لا توجد فرص عمل مطابقة" hint="جرّب تعديل عوامل التصفية." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-relaxed text-brand">
        جميع الفرص المعروضة يتم تحديد مدتها ومكافآتها من قبل الجهات المعلنة، وتعمل
        <span data-latin> Q8Work </span>
        كمنصة لربط أصحاب الفرص بالأفراد الباحثين عن أعمال مرنة ودخل إضافي.
      </p>
    </Layout>
  );
}
