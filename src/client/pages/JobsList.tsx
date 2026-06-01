import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { EmptyState, PageLoader } from "../components/ui";
import { api } from "../lib/api";
import { AREAS, WORK_TYPES } from "../lib/constants";
import { JobBigCard, JOB_SCHEMES } from "../components/JobBigCard";

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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <JobBigCard key={job.id} job={job} scheme={JOB_SCHEMES[i % JOB_SCHEMES.length]} />
          ))}
        </div>
      )}
    </Layout>
  );
}
