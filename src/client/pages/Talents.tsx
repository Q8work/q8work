import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { Avatar, PageLoader, EmptyState } from "../components/ui";
import { api, fileUrl } from "../lib/api";
import { useAuth } from "../lib/auth";
import { AREAS } from "../lib/constants";

interface WorkerCard {
  user_id: string;
  full_name: string;
  photo_key: string | null;
  bio: string;
  skills: string[];
  area: string;
  civil_id_verified: number;
  avg_rating: number | null;
  rating_count: number;
}

export function Talents() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<WorkerCard[] | null>(null);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    api.get<{ workers: WorkerCard[] }>("/workers").then((r) => setWorkers(r.workers)).catch(() => setWorkers([]));
  }, []);

  const profileTo = (uid: string) =>
    user ? `/workers/${uid}` : `/register?redirect=${encodeURIComponent(`/workers/${uid}`)}`;

  const filtered = useMemo(() => {
    if (!workers) return [];
    const term = q.trim();
    return workers.filter(
      (w) =>
        (!area || w.area === area) &&
        (!term ||
          w.full_name.includes(term) ||
          (w.bio || "").includes(term) ||
          w.skills.some((s) => s.includes(term)))
    );
  }, [workers, q, area]);

  return (
    <Layout wide>
      <PageHeader
        title="المواهب"
        subtitle={<>تصفّح الباحثين عن الفرص على <span data-latin>Q8Work</span>، واطّلع على مهاراتهم وتقييماتهم وشهادات التوصية.</>}
        badge={workers ? <><span data-latin>{workers.length}</span><span className="font-semibold">موهبة</span></> : undefined}
      />

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-soft">
        <input className="input flex-1 min-w-[200px]" placeholder="ابحث بالاسم أو المهارة..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input w-auto" value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="">كل المحافظات</option>
          {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {!workers ? (
        <div className="mt-8"><PageLoader /></div>
      ) : filtered.length === 0 ? (
        <div className="mt-8"><EmptyState title="لا توجد مواهب مطابقة" hint="جرّب تعديل البحث أو المحافظة." /></div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((w) => (
            <Link
              key={w.user_id}
              to={profileTo(w.user_id)}
              className="group flex items-center gap-4 rounded-2xl border border-brand-soft bg-white p-4 shadow-sm transition duration-200 hover:border-brand-light hover:shadow-md"
            >
              <span className="shrink-0">
                <Avatar src={fileUrl(w.photo_key)} name={w.full_name} size={52} />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-brand-darkest sm:text-lg">{w.full_name || "باحث عن فرص"}</h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-brand">
                  {w.avg_rating != null && <span className="inline-flex items-center gap-0.5 font-bold text-amber-600">★ {w.avg_rating}</span>}
                  {w.area && <span className="font-semibold">{w.area}</span>}
                  {w.skills.length > 0 && <span className="hidden truncate md:inline">· {w.skills.slice(0, 3).join("، ")}</span>}
                </div>
              </div>

              <span
                className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-bold sm:inline ${
                  w.avg_rating != null ? "bg-amber-50 text-amber-700" : "bg-brand-soft text-brand-dark"
                }`}
              >
                {w.avg_rating != null ? `★ ${w.avg_rating} (${w.rating_count})` : "موهبة جديدة"}
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
