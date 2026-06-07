import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Avatar, PageLoader, EmptyState, StarRating } from "../components/ui";
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
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-l from-brand-dark to-[#6c83ff] px-6 py-10 text-white sm:px-10 sm:py-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">المواهب</h1>
        <p className="mt-2 max-w-2xl text-white/80">
          تصفّح الباحثين عن الفرص على <span data-latin>Q8Work</span>، واطّلع على مهاراتهم وتقييماتهم وشهادات التوصية.
        </p>
        {workers && (
          <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-bold backdrop-blur">
            <span data-latin>{workers.length}</span><span className="font-semibold">موهبة</span>
          </p>
        )}
      </div>

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
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <Link
              key={w.user_id}
              to={profileTo(w.user_id)}
              className="group flex flex-col rounded-2xl border border-brand-soft bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-light hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="shrink-0 rounded-full bg-white p-0.5 ring-1 ring-brand-soft">
                  <Avatar src={fileUrl(w.photo_key)} name={w.full_name} size={52} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate font-extrabold text-brand-darkest">{w.full_name || "باحث عن فرص"}</h3>
                  </div>
                  <div className="mt-1">
                    {w.avg_rating != null
                      ? <StarRating value={w.avg_rating} count={w.rating_count} />
                      : <span className="text-xs text-brand">لا توجد توصيات بعد</span>}
                  </div>
                </div>
              </div>

              {w.bio && <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-brand-dark">{w.bio}</p>}

              {w.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {w.skills.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-dark">{s}</span>
                  ))}
                  {w.skills.length > 4 && <span className="px-1 text-xs text-brand">+{w.skills.length - 4}</span>}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-brand-soft pt-3 text-xs">
                <span className="font-semibold text-brand-dark">{w.area || "—"}</span>
                <span className="inline-flex items-center gap-1 font-bold text-brand-dark">
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
