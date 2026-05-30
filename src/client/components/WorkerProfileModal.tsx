import { useEffect, useState } from "react";
import { api, fileUrl } from "../lib/api";
import { Avatar, Badge, Spinner, StarRating, VerifiedBadge } from "./ui";
import { WORK_TYPES, COMMITMENTS, AVAILABILITY, labelOf } from "../lib/constants";

interface WorkerProfile {
  user_id: string;
  full_name: string;
  photo_key: string | null;
  bio: string;
  skills: string[];
  area: string;
  availability: string[];
  work_type: string;
  commitment: string;
  expected_salary: string;
  civil_id_verified: number;
  avg_rating: number | null;
  rating_count: number;
  phone_visible?: boolean;
  phone?: string;
}

interface RatingItem {
  stars: number;
  comment: string;
  created_at: number;
}

const fmtDate = (ms?: number) =>
  ms ? new Intl.DateTimeFormat("ar-KW-u-nu-latn", { dateStyle: "medium" }).format(new Date(ms)) : "";

const availabilityLabel = (v: string) => AVAILABILITY.find((a) => a.value === v)?.label || v;

export function WorkerProfileModal({ workerId, onClose }: { workerId: string; onClose: () => void }) {
  const [p, setP] = useState<WorkerProfile | null>(null);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<{ profile: WorkerProfile; ratings: RatingItem[] }>(`/workers/${workerId}`)
      .then((r) => {
        setP(r.profile);
        setRatings(r.ratings || []);
      })
      .finally(() => setLoading(false));
  }, [workerId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-brand-darkest">بروفايل الباحث عن عمل</h3>
          <button onClick={onClose} className="btn-ghost px-3 py-1">إغلاق</button>
        </div>

        {loading || !p ? (
          <div className="py-10 text-center"><Spinner /></div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Avatar src={fileUrl(p.photo_key)} name={p.full_name} size={72} />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-brand-darkest">{p.full_name || "باحث عن عمل"}</h4>
                  {p.civil_id_verified ? <VerifiedBadge verified={1} /> : null}
                </div>
                <div className="mt-1"><StarRating value={p.avg_rating} count={p.rating_count} /></div>
                {p.area && <p className="mt-1 text-sm text-brand">📍 {p.area}</p>}
              </div>
            </div>

            {p.bio && <p className="rounded-lg bg-brand-bg p-3 text-sm text-brand-dark">{p.bio}</p>}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {p.work_type && (
                <div><span className="font-semibold text-brand-dark">نوع العمل: </span>{labelOf(WORK_TYPES, p.work_type)}</div>
              )}
              {p.commitment && (
                <div><span className="font-semibold text-brand-dark">الالتزام: </span>{labelOf(COMMITMENTS, p.commitment)}</div>
              )}
              {p.expected_salary && (
                <div><span className="font-semibold text-brand-dark">الراتب المتوقع: </span>{p.expected_salary} د.ك</div>
              )}
              {p.phone_visible && p.phone && (
                <div><span className="font-semibold text-brand-dark">رقم التواصل: </span><span data-latin>{p.phone}</span></div>
              )}
            </div>

            {p.skills.length > 0 && (
              <div>
                <h5 className="mb-2 font-bold text-brand-darkest">المهارات</h5>
                <div className="flex flex-wrap gap-1">
                  {p.skills.map((s) => <span key={s} className="chip">{s}</span>)}
                </div>
              </div>
            )}

            {p.availability.length > 0 && (
              <div>
                <h5 className="mb-2 font-bold text-brand-darkest">أوقات التوفّر</h5>
                <div className="flex flex-wrap gap-1">
                  {p.availability.map((a) => <span key={a} className="chip bg-brand-bg">{availabilityLabel(a)}</span>)}
                </div>
              </div>
            )}

            {!p.phone_visible && (
              <p className="text-center text-xs text-brand">رقم التواصل يظهر بعد قبول الباحث لعرضك.</p>
            )}

            {/* Ratings */}
            <div>
              <h5 className="mb-2 font-bold text-brand-darkest">التقييمات ({p.rating_count})</h5>
              {ratings.length === 0 ? (
                <p className="text-sm text-brand">لا توجد تقييمات بعد.</p>
              ) : (
                <div className="space-y-2">
                  {ratings.map((r, i) => (
                    <div key={i} className="rounded-lg border border-brand-soft p-3">
                      <div className="flex items-center justify-between">
                        <StarRating value={r.stars} />
                        <span className="text-xs text-brand">{fmtDate(r.created_at)}</span>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-brand-dark">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
