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
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.user_id}
              to={`/companies/${c.user_id}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-brand-soft bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* cover */}
              <div className="h-16 bg-gradient-to-l from-brand-dark to-[#6c83ff]" />
              <div className="flex flex-1 flex-col items-center px-5 pb-5 text-center">
                <span className="-mt-10 rounded-2xl bg-white p-1 shadow-md ring-1 ring-brand-soft">
                  <Avatar src={fileUrl(c.logo_key)} name={c.company_name} size={72} />
                </span>
                <div className="mt-3 flex items-center gap-1">
                  <h3 className="truncate text-lg font-extrabold text-brand-darkest">{c.company_name}</h3>
                  <VerifiedTick verified={c.verified} size={16} />
                </div>
                {c.sector && (
                  <span className="mt-1.5 inline-block rounded-full bg-brand-soft px-3 py-0.5 text-xs font-semibold text-brand-dark">{c.sector}</span>
                )}
                {c.rating != null && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                    ★ {c.rating} <span className="text-xs font-semibold text-amber-700/70">({c.rating_count})</span>
                  </span>
                )}

                <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-brand-dark">
                  {c.description || "شركة مسجّلة على المنصة."}
                </p>

                <span
                  className={`mt-3 rounded-full px-3 py-1 text-xs font-bold ${
                    c.open_jobs > 0 ? "bg-emerald-50 text-emerald-700" : "bg-brand-soft text-brand"
                  }`}
                >
                  {c.open_jobs > 0 ? `${c.open_jobs} فرصة متاحة` : "لا فرص حالياً"}
                </span>

                <span className="btn-secondary mt-4 w-full justify-center group-hover:bg-brand-dark group-hover:text-white">
                  عرض الملف
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
