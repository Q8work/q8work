import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Avatar, PageLoader, EmptyState, StarRating, VerifiedBadge } from "../components/ui";
import { api, fileUrl } from "../lib/api";
import { WORK_TYPES, DURATIONS, labelOf } from "../lib/constants";

interface Company {
  user_id: string;
  company_name: string;
  logo_key: string | null;
  description: string;
  sector: string;
  verified: number;
  created_at: number;
  rating: number | null;
  rating_count: number;
}

interface CompanyJob {
  id: string;
  title: string;
  description: string;
  area: string;
  work_type: string;
  duration: string;
  salary: string;
  skills_required: string[];
  headcount: number;
}

export function CompanyProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<{ company: Company; jobs: CompanyJob[] }>(`/companies/${id}`)
      .then((r) => { setCompany(r.company); setJobs(r.jobs); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><PageLoader /></Layout>;
  if (notFound || !company) {
    return (
      <Layout>
        <EmptyState title="الشركة غير موجودة" />
        <div className="mt-4 text-center"><Link to="/companies" className="btn-secondary">كل الشركات</Link></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link to="/companies" className="text-sm font-bold text-brand-dark hover:underline">← كل الشركات</Link>

      {/* Header */}
      <div className="mt-4 card">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar src={fileUrl(company.logo_key)} name={company.company_name} size={80} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-brand-darkest">{company.company_name}</h1>
              <VerifiedBadge verified={company.verified} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-brand">
              {company.sector && <span>{company.sector}</span>}
              {company.rating != null && <StarRating value={company.rating} count={company.rating_count} />}
            </div>
          </div>
        </div>
        {company.description && (
          <p className="mt-4 whitespace-pre-line leading-relaxed text-brand-dark">{company.description}</p>
        )}
      </div>

      {/* Jobs */}
      <h2 className="mt-8 text-xl font-extrabold text-brand-darkest">
        فرص العمل المتاحة {jobs.length > 0 && <span className="text-brand">({jobs.length})</span>}
      </h2>
      {jobs.length === 0 ? (
        <div className="mt-4"><EmptyState title="لا توجد فرص متاحة حالياً" hint="تابع الشركة لاحقاً." /></div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {jobs.map((j) => (
            <Link key={j.id} to={`/jobs/${j.id}`} className="card flex flex-col transition-shadow hover:shadow-md">
              <h3 className="font-bold text-brand-darkest">{j.title}</h3>
              {j.description && <p className="mt-1 line-clamp-2 text-sm text-brand-dark">{j.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {j.area && <span className="chip">📍 {j.area}</span>}
                {j.work_type && <span className="chip">{labelOf(WORK_TYPES, j.work_type)}</span>}
                {j.duration && <span className="chip">{labelOf(DURATIONS, j.duration)}</span>}
                {j.salary && <span className="chip">{j.salary} د.ك</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
