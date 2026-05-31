import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Avatar, PageLoader, EmptyState, StarRating, VerifiedBadge } from "../components/ui";
import { api, fileUrl } from "../lib/api";

interface CompanyCard {
  user_id: string;
  company_name: string;
  logo_key: string | null;
  sector: string;
  verified: number;
  description: string;
  open_jobs: number;
  rating: number | null;
  rating_count: number;
}

export function CompaniesList() {
  const [companies, setCompanies] = useState<CompanyCard[] | null>(null);

  useEffect(() => {
    api.get<{ companies: CompanyCard[] }>("/companies").then((r) => setCompanies(r.companies));
  }, []);

  return (
    <Layout wide>
      <h1 className="text-3xl font-extrabold text-brand-darkest">الشركات المسجّلة</h1>
      <p className="mt-2 text-brand">تصفّح الشركات وأصحاب العمل على المنصة وفرصهم المتاحة</p>

      {!companies ? (
        <div className="mt-8"><PageLoader /></div>
      ) : companies.length === 0 ? (
        <div className="mt-8"><EmptyState title="لا توجد شركات بعد" /></div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.user_id} to={`/companies/${c.user_id}`} className="card flex flex-col transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <Avatar src={fileUrl(c.logo_key)} name={c.company_name} size={52} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-bold text-brand-darkest">{c.company_name}</h3>
                    {c.verified ? <VerifiedBadge verified={1} /> : null}
                  </div>
                  {c.sector && <p className="text-xs text-brand">{c.sector}</p>}
                </div>
              </div>
              {c.description && <p className="mt-3 line-clamp-2 text-sm text-brand-dark">{c.description}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-brand-soft pt-3 text-xs">
                <span className="font-semibold text-brand-dark">
                  {c.open_jobs > 0 ? `${c.open_jobs} فرصة متاحة` : "لا فرص حالياً"}
                </span>
                {c.rating != null && <StarRating value={c.rating} count={c.rating_count} />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
