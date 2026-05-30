import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Tabs, Spinner, EmptyState, StarRating, StarInput, ErrorText, Avatar, Badge } from "../../components/ui";
import { MessagesPanel } from "../../components/Messages";
import { api, fileUrl } from "../../lib/api";
import {
  SKILLS,
  AREAS,
  WORK_TYPES,
  AVAILABILITY,
  COMMITMENTS,
  labelOf,
  OFFER_STATUS,
} from "../../lib/constants";

type Tab = "profile" | "offers" | "messages" | "ratings";

interface WorkerProfile {
  full_name: string;
  photo_key: string | null;
  bio: string;
  skills: string[];
  area: string;
  phone: string;
  civil_id: string;
  civil_id_image_key: string | null;
  civil_id_verified: number;
  availability: string[];
  work_type: string;
  commitment: string;
  expected_salary: string;
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors cursor-pointer ${
        active ? "bg-brand-dark text-white" : "bg-brand-bg text-brand-dark hover:bg-brand-soft"
      }`}
    >
      {children}
    </button>
  );
}

function ProfileTab() {
  const [p, setP] = useState<WorkerProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ profile: WorkerProfile }>("/profile/worker").then((r) => setP(r.profile));
  }, []);

  if (!p) return <div className="py-10 text-center"><Spinner /></div>;

  const set = (patch: Partial<WorkerProfile>) => setP({ ...p, ...patch });
  const toggleIn = (key: "skills" | "availability", v: string) => {
    const arr = p[key];
    set({ [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] } as any);
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await api.put("/profile/worker", p);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message || "تعذّر الحفظ.");
    } finally {
      setBusy(false);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = await api.upload<{ key: string }>("/profile/upload?kind=photo", file);
    set({ photo_key: r.key });
  };

  const onCivilId = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = await api.upload<{ key: string }>("/profile/upload?kind=civil_id", file);
    set({ civil_id_image_key: r.key });
  };

  return (
    <div className="space-y-5">
      <div className="card flex items-center gap-4">
        <Avatar src={fileUrl(p.photo_key) } name={p.full_name} size={72} />
        <div>
          <label className="btn-secondary cursor-pointer">
            تغيير الصورة
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
          <div className="mt-2">
            {p.civil_id_verified ? (
              <Badge className="bg-emerald-100 text-emerald-800">✓ موثّق الجنسية</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800">بانتظار توثيق الجنسية</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <ErrorText>{error}</ErrorText>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">الاسم الكامل</label>
            <input className="input" value={p.full_name} onChange={(e) => set({ full_name: e.target.value })} />
          </div>
          <div>
            <label className="label">المحافظة</label>
            <select className="input" value={p.area} onChange={(e) => set({ area: e.target.value })}>
              <option value="">اختر المحافظة</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">نبذة مختصرة</label>
          <textarea className="input" rows={3} value={p.bio} onChange={(e) => set({ bio: e.target.value })} />
        </div>

        <div>
          <label className="label">المهارات والتخصصات</label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <Toggle key={s} active={p.skills.includes(s)} onClick={() => toggleIn("skills", s)}>
                {s}
              </Toggle>
            ))}
          </div>
        </div>

        <div>
          <label className="label">أوقات التوفر</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY.map((a) => (
              <Toggle key={a.value} active={p.availability.includes(a.value)} onClick={() => toggleIn("availability", a.value)}>
                {a.label}
              </Toggle>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">نوع العمل المفضل</label>
            <select className="input" value={p.work_type} onChange={(e) => set({ work_type: e.target.value })}>
              <option value="">—</option>
              {WORK_TYPES.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">مدة الالتزام</label>
            <select className="input" value={p.commitment} onChange={(e) => set({ commitment: e.target.value })}>
              <option value="">—</option>
              {COMMITMENTS.map((cm) => <option key={cm.value} value={cm.value}>{cm.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الراتب المتوقع</label>
            <input className="input" value={p.expected_salary} onChange={(e) => set({ expected_salary: e.target.value })} placeholder="مثال: 5 د/ساعة" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">رقم التواصل <span className="font-normal text-brand">(يظهر للشركة بعد قبول العرض فقط)</span></label>
            <input className="input" value={p.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="٩٦٥..." />
          </div>
          <div>
            <label className="label">الرقم المدني <span className="font-normal text-brand">(للتحقق من الجنسية)</span></label>
            <input className="input" value={p.civil_id} onChange={(e) => set({ civil_id: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">صورة الهوية المدنية <span className="font-normal text-brand">(الإدارة فقط · لا تظهر للشركات)</span></label>
          <div className="flex items-center gap-3">
            {p.civil_id_image_key ? (
              <a href={fileUrl(p.civil_id_image_key)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand-dark underline">
                عرض الصورة الحالية
              </a>
            ) : (
              <span className="text-sm text-brand">لم تُرفع صورة بعد</span>
            )}
            <label className="btn-secondary cursor-pointer">
              {p.civil_id_image_key ? "تغيير الصورة" : "رفع صورة"}
              <input type="file" accept="image/*" className="hidden" onChange={onCivilId} />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={save} disabled={busy}>
            {busy ? <Spinner /> : "حفظ التغييرات"}
          </button>
          {saved && <span className="text-sm font-bold text-emerald-700">✓ تم الحفظ</span>}
        </div>
      </div>
    </div>
  );
}

interface Offer {
  id: string;
  status: keyof typeof OFFER_STATUS;
  message: string;
  job_title: string | null;
  company_name: string;
  company_verified: number;
  created_at: number;
}

function OffersTab({ onChange }: { onChange: () => void }) {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [rating, setRating] = useState<{ offerId: string; stars: number; comment: string } | null>(null);

  const load = () => api.get<{ offers: Offer[] }>("/offers").then((r) => setOffers(r.offers));
  useEffect(() => { load(); }, []);

  const respond = async (id: string, status: "accepted" | "rejected") => {
    await api.patch(`/offers/${id}`, { status });
    await load();
    onChange();
  };

  const submitRating = async () => {
    if (!rating) return;
    await api.post("/ratings", { offer_id: rating.offerId, stars: rating.stars, comment: rating.comment });
    setRating(null);
    await load();
  };

  if (!offers) return <div className="py-10 text-center"><Spinner /></div>;
  if (offers.length === 0) return <EmptyState title="لا توجد عروض بعد" hint="أكمل ملفك لتظهر للشركات." />;

  return (
    <div className="space-y-3">
      {offers.map((o) => (
        <div key={o.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-brand-darkest">{o.job_title || "عرض عمل"}</h3>
              <p className="text-sm font-semibold text-brand">{o.company_name}</p>
            </div>
            <Badge className={OFFER_STATUS[o.status].cls}>{OFFER_STATUS[o.status].label}</Badge>
          </div>
          {o.message && <p className="mt-2 rounded-lg bg-brand-bg p-3 text-sm text-brand-dark">{o.message}</p>}

          {o.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <button className="btn-primary" onClick={() => respond(o.id, "accepted")}>قبول</button>
              <button className="btn-ghost" onClick={() => respond(o.id, "rejected")}>رفض</button>
            </div>
          )}
          {o.status === "completed" && (
            <div className="mt-3">
              {rating?.offerId === o.id ? (
                <div className="rounded-xl bg-brand-bg p-3">
                  <StarInput value={rating.stars} onChange={(s) => setRating({ ...rating, stars: s })} />
                  <textarea
                    className="input mt-2"
                    rows={2}
                    placeholder="تعليقك على التجربة..."
                    value={rating.comment}
                    onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                  />
                  <div className="mt-2 flex gap-2">
                    <button className="btn-primary" onClick={submitRating}>إرسال التقييم</button>
                    <button className="btn-ghost" onClick={() => setRating(null)}>إلغاء</button>
                  </div>
                </div>
              ) : (
                <button className="btn-secondary" onClick={() => setRating({ offerId: o.id, stars: 5, comment: "" })}>
                  قيّم الشركة
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RatingsTab() {
  const [data, setData] = useState<{ ratings: any[]; avg: number | null; count: number } | null>(null);
  useEffect(() => { api.get<any>("/ratings/me").then(setData); }, []);
  if (!data) return <div className="py-10 text-center"><Spinner /></div>;
  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <span className="font-bold text-brand-darkest">تقييمي العام</span>
        <StarRating value={data.avg} count={data.count} />
      </div>
      {data.ratings.length === 0 ? (
        <EmptyState title="لا توجد تقييمات بعد" />
      ) : (
        data.ratings.map((r, i) => (
          <div key={i} className="card">
            <StarRating value={r.stars} />
            {r.comment && <p className="mt-2 text-sm text-brand-dark">{r.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}

export function WorkerDashboard() {
  const [tab, setTab] = useState<Tab>("profile");
  const [bump, setBump] = useState(0);

  return (
    <Layout wide>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-darkest">لوحة الكويتي</h1>
      <p className="mb-6 text-brand-dark">أدر ملفك واستقبل عروض العمل</p>

      <div className="mb-6">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "profile", label: "البروفايل" },
            { id: "offers", label: "العروض الواردة" },
            { id: "messages", label: "الرسائل" },
            { id: "ratings", label: "تقييماتي" },
          ]}
        />
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "offers" && <OffersTab onChange={() => setBump((b) => b + 1)} />}
      {tab === "messages" && <MessagesPanel key={bump} />}
      {tab === "ratings" && <RatingsTab />}
    </Layout>
  );
}
