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
  website: string;
  public_email: string;
  instagram: string;
  twitter: string;
  linkedin: string;
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

const withHttp = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
const handleUrl = (base: string, v: string) =>
  /^https?:\/\//i.test(v) ? v : `${base}/${v.replace(/^@/, "")}`;
const joinedDate = (ms?: number) =>
  ms ? new Intl.DateTimeFormat("ar-KW-u-nu-latn", { year: "numeric", month: "long" }).format(new Date(ms)) : "";

function ContactLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl bg-brand-bg px-3 py-2 text-sm font-bold text-brand-dark ring-1 ring-brand-soft transition-colors hover:bg-brand-soft"
    >
      <span aria-hidden>{icon}</span>
      <span className="truncate">{label}</span>
    </a>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-brand">{label}</span>
      <span className="text-sm font-bold text-brand-darkest">{children}</span>
    </div>
  );
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

  if (loading) return <Layout wide><PageLoader /></Layout>;
  if (notFound || !company) {
    return (
      <Layout wide>
        <EmptyState title="الشركة غير موجودة" />
        <div className="mt-4 text-center"><Link to="/companies" className="btn-secondary">كل الشركات</Link></div>
      </Layout>
    );
  }

  const hasContact = company.website || company.public_email || company.instagram || company.twitter || company.linkedin;

  return (
    <Layout wide>
      <Link to="/companies" className="text-sm font-bold text-brand-dark hover:underline">← كل الشركات</Link>

      {/* Header with cover */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-brand-soft bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-l from-brand-dark to-brand-darkest sm:h-32" />
        <div className="px-6 pb-6 sm:px-8">
          <span className="-mt-12 inline-block rounded-3xl bg-white p-1.5 shadow-sm ring-1 ring-brand-soft">
            <Avatar src={fileUrl(company.logo_key)} name={company.company_name} size={88} />
          </span>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-brand-darkest sm:text-3xl">{company.company_name}</h1>
                <VerifiedBadge verified={company.verified} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-brand">
                {company.sector && <span>{company.sector}</span>}
                {company.rating != null && <StarRating value={company.rating} count={company.rating_count} />}
              </div>
            </div>
            {company.website && (
              <a href={withHttp(company.website)} target="_blank" rel="noopener noreferrer" className="btn-primary self-start sm:self-auto">
                زيارة الموقع
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Body: main + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          {company.description && (
            <div className="card">
              <h2 className="mb-2 text-lg font-extrabold text-brand-darkest">نبذة عن الشركة</h2>
              <p className="whitespace-pre-line leading-relaxed text-brand-dark">{company.description}</p>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-lg font-extrabold text-brand-darkest">
              فرص العمل المتاحة {jobs.length > 0 && <span className="text-brand">({jobs.length})</span>}
            </h2>
            {jobs.length === 0 ? (
              <EmptyState title="لا توجد فرص متاحة حالياً" hint="تابع الشركة لاحقاً." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card">
            <h2 className="mb-1 text-sm font-extrabold text-brand-darkest">معلومات</h2>
            <div className="divide-y divide-brand-soft">
              {company.sector && <Fact label="القطاع">{company.sector}</Fact>}
              <Fact label="التوثيق">{company.verified ? "✓ موثّقة" : "غير موثّقة"}</Fact>
              <Fact label="التقييم">
                {company.rating != null ? <StarRating value={company.rating} count={company.rating_count} /> : "—"}
              </Fact>
              <Fact label="الفرص المتاحة">{jobs.length}</Fact>
              {company.created_at ? <Fact label="عضو منذ">{joinedDate(company.created_at)}</Fact> : null}
            </div>
          </div>

          {hasContact && (
            <div className="card">
              <h2 className="mb-3 text-sm font-extrabold text-brand-darkest">تواصل مع الشركة</h2>
              <div className="grid gap-2">
                {company.website && <ContactLink icon="🌐" label="الموقع الإلكتروني" href={withHttp(company.website)} />}
                {company.public_email && <ContactLink icon="✉️" label={company.public_email} href={`mailto:${company.public_email}`} />}
                {company.instagram && <ContactLink icon="📷" label="إنستغرام" href={handleUrl("https://instagram.com", company.instagram)} />}
                {company.twitter && <ContactLink icon="𝕏" label="إكس (تويتر)" href={handleUrl("https://x.com", company.twitter)} />}
                {company.linkedin && <ContactLink icon="in" label="لينكدإن" href={withHttp(company.linkedin)} />}
              </div>
            </div>
          )}
        </aside>
      </div>
    </Layout>
  );
}
