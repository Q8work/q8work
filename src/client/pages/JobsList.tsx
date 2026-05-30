import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { EmptyState, PageLoader, VerifiedBadge } from "../components/ui";
import { api } from "../lib/api";
import { AREAS, WORK_TYPES, DURATIONS, labelOf } from "../lib/constants";

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
  created_at: number;
}

export function JobsList() {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const q = params.get("q") || "";
  const area = params.get("area") || "";
  const workType = params.get("work_type") || "";

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

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <Layout wide>
      <h1 className="mb-2 text-3xl font-extrabold text-brand-darkest">فرص العمل المتاحة</h1>
      <p className="mb-6 text-brand-dark">تصفّح الفرص المنشورة من الشركات</p>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-soft">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="بحث بالكلمة..."
          defaultValue={q}
          onKeyDown={(e) => e.key === "Enter" && update("q", (e.target as HTMLInputElement).value)}
        />
        <select className="input w-auto" value={area} onChange={(e) => update("area", e.target.value)}>
          <option value="">كل المحافظات</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select className="input w-auto" value={workType} onChange={(e) => update("work_type", e.target.value)}>
          <option value="">كل أنواع العمل</option>
          {WORK_TYPES.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : jobs.length === 0 ? (
        <EmptyState title="لا توجد فرص عمل مطابقة" hint="جرّب تعديل عوامل التصفية." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-bold text-brand-darkest">{job.title}</h3>
                <VerifiedBadge verified={job.company_verified} />
              </div>
              <p className="text-sm font-semibold text-brand">{job.company_name}</p>
              {job.description && <p className="mt-2 line-clamp-3 text-sm text-brand-dark">{job.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {job.area && <span className="chip">📍 {job.area}</span>}
                {job.work_type && <span className="chip">{labelOf(WORK_TYPES, job.work_type)}</span>}
                {job.duration && <span className="chip">{labelOf(DURATIONS, job.duration)}</span>}
                {job.salary && <span className="chip">{job.salary} د.ك</span>}
              </div>
              {job.skills_required.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {job.skills_required.map((s) => (
                    <span key={s} className="chip bg-brand-bg">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-brand-soft pt-3">
                <span className="text-xs text-brand">المطلوب: {job.headcount}</span>
                <Link to={`/jobs/${job.id}`} className="btn-secondary text-xs">
                  عرض والتقديم
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
