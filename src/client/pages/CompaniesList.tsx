import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { Avatar, PageLoader, EmptyState, VerifiedTick } from "../components/ui";
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
      <PageHeader
        title="الشركات المسجّلة"
        subtitle={<>تصفّح الشركات والمؤسسات الموثوقة على <span data-latin>Q8Work</span> واطّلع على فرصها المتاحة.</>}
        badge={companies ? <><span data-latin>{companies.length}</span><span className="font-semibold">شركة</span></> : undefined}
      />

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
        <div className="mt-6 space-y-3">
          {filtered.map((c) => (
            <Link
              key={c.user_id}
              to={`/companies/${c.user_id}`}
              className="group flex items-center gap-4 rounded-2xl border border-brand-soft bg-white p-4 shadow-sm transition duration-200 hover:border-brand-light hover:shadow-md"
            >
              <span className="shrink-0">
                <Avatar src={fileUrl(c.logo_key)} name={c.company_name} size={52} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="truncate text-base font-bold text-brand-darkest sm:text-lg">{c.company_name}</h3>
                  <VerifiedTick verified={c.verified} size={15} />
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-brand">
                  {c.sector && <span className="font-semibold">{c.sector}</span>}
                  {c.rating != null && <span className="inline-flex items-center gap-0.5 font-bold text-amber-600">★ {c.rating}</span>}
                  {c.description && <span className="hidden truncate text-brand md:inline">· {c.description}</span>}
                </div>
              </div>

              <span
                className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:inline ${
                  c.open_jobs > 0 ? "bg-emerald-50 text-emerald-700" : "bg-brand-soft text-brand"
                }`}
              >
                {c.open_jobs > 0 ? `${c.open_jobs} فرصة متاحة` : "لا فرص حالياً"}
              </span>

              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-brand-dark">
                <span className="hidden sm:inline">عرض الملف</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:-translate-x-1"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </span>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
