import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { Avatar, Spinner, StarRating, VerifiedTick } from "./ui";
import { AVAILABILITY } from "../lib/constants";

export interface WorkerProfile {
  user_id: string;
  full_name: string;
  photo_key: string | null;
  bio: string;
  skills: string[];
  area: string;
  availability: string[];
  civil_id_verified: number;
  avg_rating: number | null;
  rating_count: number;
  phone_visible?: boolean;
  phone?: string;
  email?: string;
}

export interface RatingItem {
  stars: number;
  comment: string;
  created_at: number;
  rater_name?: string | null;
  rater_verified?: number;
  badges?: string[];
  rehire?: string;
}

const REHIRE_LABEL: Record<string, string> = {
  definitely: "يوصى بشدّة بإعادة توظيفه",
  yes: "يوصى بإعادة توظيفه",
  maybe: "قد يُعاد توظيفه",
  no: "لا يوصى بإعادة توظيفه",
};

const fmtDate = (ms?: number) =>
  ms ? new Intl.DateTimeFormat("ar-KW-u-nu-latn", { dateStyle: "medium" }).format(new Date(ms)) : "";

const availabilityLabel = (v: string) => AVAILABILITY.find((a) => a.value === v)?.label || v;

function IconPinSm() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
}

export function useWorkerProfile(workerId: string) {
  const [p, setP] = useState<WorkerProfile | null>(null);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get<{ profile: WorkerProfile; ratings: RatingItem[] }>(`/workers/${workerId}`)
      .then((r) => { setP(r.profile); setRatings(r.ratings || []); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [workerId]);
  return { p, ratings, loading, error };
}

// Shared profile body (used by the modal and the standalone page).
export function WorkerProfileBody({ p, ratings }: { p: WorkerProfile; ratings: RatingItem[] }) {
  return (
    <div className="px-6 pb-6">
      {/* Header — centered */}
      <div className="relative z-10 -mt-16 flex flex-col items-center text-center">
        <span className="inline-block shrink-0 rounded-full bg-white p-1 shadow-md ring-1 ring-brand-soft">
          <Avatar src={fileUrl(p.photo_key)} name={p.full_name} size={104} />
        </span>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <h4 className="text-2xl font-extrabold text-brand-darkest">{p.full_name || "باحث عن فرص"}</h4>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
          {p.avg_rating != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700">
              ★ {p.avg_rating} <span className="text-xs font-semibold text-amber-700/70">({p.rating_count})</span>
            </span>
          )}
          {p.area && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-3 py-1 font-semibold text-brand-dark">
              <IconPinSm /> {p.area}
            </span>
          )}
        </div>
      </div>

      {p.bio && <p className="mt-4 text-center leading-relaxed text-brand-dark">{p.bio}</p>}

      {/* Contact */}
      {p.phone_visible && (p.phone || p.email) ? (
        <div className="mt-4 space-y-2 rounded-2xl bg-emerald-50 p-4">
          <h5 className="text-xs font-bold text-emerald-700/80">معلومات التواصل</h5>
          {p.phone && <div className="text-sm font-semibold text-emerald-800">رقم التواصل: <span data-latin>{p.phone}</span></div>}
          {p.email && <div className="text-sm font-semibold text-emerald-800">البريد الإلكتروني: <span data-latin>{p.email}</span></div>}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-soft p-3 text-xs text-brand">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          معلومات التواصل (الهاتف والبريد) تظهر بعد قبول الباحث لعرضك.
        </div>
      )}

      {/* Skills */}
      {p.skills.length > 0 && (
        <div className="mt-5">
          <h5 className="mb-2 text-sm font-bold text-brand-darkest">المهارات والتخصصات</h5>
          <div className="flex flex-wrap gap-2">
            {p.skills.map((s) => (
              <span key={s} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {p.availability.length > 0 && (
        <div className="mt-5">
          <h5 className="mb-2 text-sm font-bold text-brand-darkest">أوقات التوفّر</h5>
          <div className="flex flex-wrap gap-2">
            {p.availability.map((a) => (
              <span key={a} className="rounded-full border border-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">{availabilityLabel(a)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-6 border-t border-brand-soft pt-5">
        <h5 className="mb-3 text-sm font-bold text-brand-darkest">شهادات التوصية ({p.rating_count})</h5>
        {ratings.length === 0 ? (
          <p className="text-sm text-brand">لا توجد توصيات بعد.</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((r, i) => (
              <div key={i} className="rounded-2xl border border-brand-soft bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-darkest">
                    {r.rater_name || "شركة"}
                    <VerifiedTick verified={r.rater_verified} size={13} />
                  </span>
                  <span className="text-xs text-brand">{fmtDate(r.created_at)}</span>
                </div>
                <div className="mt-1.5"><StarRating value={r.stars} /></div>
                {r.comment && (
                  <p className="mt-2 border-r-2 border-brand-soft pr-3 text-sm leading-relaxed text-brand-dark">«{r.comment}»</p>
                )}
                {r.badges && r.badges.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {r.badges.map((b) => (
                      <span key={b} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">🏆 {b}</span>
                    ))}
                  </div>
                )}
                {r.rehire && REHIRE_LABEL[r.rehire] && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700">✓ {REHIRE_LABEL[r.rehire]}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkerProfileModal({ workerId, onClose }: { workerId: string; onClose: () => void }) {
  const { p, ratings, loading } = useWorkerProfile(workerId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-28 bg-gradient-to-l from-brand-dark to-[#6c83ff]">
          <button onClick={onClose} aria-label="إغلاق" className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {loading || !p ? (
          <div className="px-6 pb-10 pt-6 text-center"><Spinner /></div>
        ) : (
          <>
            <WorkerProfileBody p={p} ratings={ratings} />
            <div className="px-6 pb-6">
              <Link to={`/workers/${p.user_id}`} onClick={onClose} className="btn-secondary w-full justify-center">
                فتح الملف الكامل ↗
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
