import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Avatar, PageLoader, EmptyState, StarRating, VerifiedTick } from "../components/ui";
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
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    api.get<{ companies: CompanyCard[] }>("/companies").then((r) => setCompanies(r.companies));
  }, []);

  const sectors = useMemo(
    () => Array.from(new Set((companies ?? []).map((c) => c.sector).filter(Boolean))),
    [companies]
  );

  const filtered = useMemo(() => {
    if (!companies) return [];
    const term = q.trim();
    return companies.filter(
      (c) =>
        (!sector || c.sector === sector) &&
        (!term || c.company_name.includes(term) || (c.description || "").includes(term))
    );
  }, [companies, q, sector]);

  return (
    <Layout wide>
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-l from-brand-dark to-[#6c83ff] px-6 py-10 text-white sm:px-10 sm:py-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">الشركات المسجّلة</h1>
        <p className="mt-2 max-w-2xl text-white/80">
          تصفّح الشركات والمؤسسات الموثوقة على <span data-latin>Q8Work</span> واطّلع على فرصها المتاحة.
        </p>
        {companies && (
          <p className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-bold backdrop-blur" data-latin>
            {companies.length} <span className="font-semibold"> شركة</span>
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-soft">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="ابحث عن شركة..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input w-auto" value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="">كل القطاعات</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {!companies ? (
        <div className="mt-8"><PageLoader /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-8"><EmptyState title="لا توجد شركات مطابقة" hint="جرّب تعديل البحث أو القطاع." /></div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.user_id}
              to={`/companies/${c.user_id}`}
              className="group flex flex-col rounded-2xl border border-brand-soft bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-light hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 rounded-2xl bg-white p-0.5 ring-1 ring-brand-soft">
                  <Avatar src={fileUrl(c.logo_key)} name={c.company_name} size={56} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate text-lg font-extrabold text-brand-darkest">{c.company_name}</h3>
                    <VerifiedTick verified={c.verified} size={16} />
                  </div>
                  {c.sector && (
                    <span className="mt-1 inline-block rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
                      {c.sector}
                    </span>
                  )}
                </div>
              </div>

              {c.rating != null && (
                <div className="mt-3"><StarRating value={c.rating} count={c.rating_count} /></div>
              )}

              <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-brand-dark">
                {c.description || "شركة مسجّلة على المنصة."}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-brand-soft pt-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    c.open_jobs > 0 ? "bg-emerald-50 text-emerald-700" : "bg-brand-soft text-brand"
                  }`}
                >
                  {c.open_jobs > 0 ? `${c.open_jobs} فرصة متاحة` : "لا فرص حالياً"}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-dark">
                  عرض الملف
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
