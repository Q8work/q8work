import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
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
              className="group flex flex-col overflow-hidden rounded-3xl border border-brand-soft bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* cover */}
              <div className="h-16 bg-gradient-to-l from-brand-dark to-[#6c83ff]" />
              <div className="flex flex-1 flex-col items-center px-5 pb-5 text-center">
                <span className="-mt-10 rounded-full bg-white p-1 shadow-md ring-1 ring-brand-soft">
                  <Avatar src={fileUrl(w.photo_key)} name={w.full_name} size={72} />
                </span>
                <h3 className="mt-3 truncate text-lg font-extrabold text-brand-darkest">{w.full_name || "باحث عن فرص"}</h3>

                {/* rating */}
                <div className="mt-1.5">
                  {w.avg_rating != null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                      ★ {w.avg_rating}
                      <span className="text-xs font-semibold text-amber-700/70">({w.rating_count})</span>
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">موهبة جديدة</span>
                  )}
                </div>

                {/* area */}
                {w.area && (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    {w.area}
                  </span>
                )}

                {/* skills */}
                {w.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {w.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-dark">{s}</span>
                    ))}
                    {w.skills.length > 3 && <span className="px-1 text-xs text-brand">+{w.skills.length - 3}</span>}
                  </div>
                )}

                <span className="btn-secondary mt-5 w-full justify-center group-hover:bg-brand-dark group-hover:text-white">
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
