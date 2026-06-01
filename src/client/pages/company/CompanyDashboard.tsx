import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Tabs, Spinner, EmptyState, StarRating, StarInput, ErrorText, Avatar, Badge, VerifiedBadge } from "../../components/ui";
import { MessagesPanel } from "../../components/Messages";
import { WorkerProfileModal } from "../../components/WorkerProfileModal";
import { IconPin, IconClock, IconCash } from "../../components/icons";
import { api, fileUrl } from "../../lib/api";
import { toLatinDigits } from "../../lib/format";
import {
  SKILLS,
  AREAS,
  WORK_TYPES,
  AVAILABILITY,
  DURATIONS,
  SECTORS,
  labelOf,
  OFFER_STATUS,
  APPLICATION_STATUS,
} from "../../lib/constants";

type Tab = "profile" | "jobs" | "talent" | "offers" | "messages";

// ---------------- Profile ----------------
interface CompanyProfile {
  company_name: string;
  logo_key: string | null;
  description: string;
  commercial_registry_key: string | null;
  contact_name: string;
  contact_phone: string;
  sector: string;
  website: string;
  public_email: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  verified: number;
}

function ProfileTab() {
  const [p, setP] = useState<CompanyProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [customSector, setCustomSector] = useState(false);

  useEffect(() => { api.get<{ profile: CompanyProfile }>("/profile/company").then((r) => setP(r.profile)); }, []);
  if (!p) return <div className="py-10 text-center"><Spinner /></div>;
  const set = (patch: Partial<CompanyProfile>) => setP({ ...p, ...patch });
  const sectorIsCustom = customSector || (!!p.sector && !SECTORS.includes(p.sector));

  const save = async () => {
    setBusy(true); setError("");
    try {
      await api.put("/profile/company", p);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const upload = async (kind: "logo" | "registry", file?: File) => {
    if (!file) return;
    const r = await api.upload<{ key: string }>(`/profile/upload?kind=${kind}`, file);
    set(kind === "logo" ? { logo_key: r.key } : { commercial_registry_key: r.key });
  };

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center gap-4">
        <Avatar src={fileUrl(p.logo_key)} name={p.company_name} size={72} />
        <div className="flex-1">
          <label className="btn-secondary cursor-pointer">
            شعار الشركة
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload("logo", e.target.files?.[0])} />
          </label>
          <div className="mt-2"><VerifiedBadge verified={p.verified} /></div>
        </div>
      </div>

      <div className="card space-y-4">
        <ErrorText>{error}</ErrorText>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">اسم الشركة</label>
            <input className="input" value={p.company_name} onChange={(e) => set({ company_name: e.target.value })} />
          </div>
          <div>
            <label className="label">القطاع</label>
            <select
              className="input"
              value={sectorIsCustom ? "__other__" : p.sector}
              onChange={(e) => {
                if (e.target.value === "__other__") { setCustomSector(true); set({ sector: "" }); }
                else { setCustomSector(false); set({ sector: e.target.value }); }
              }}
            >
              <option value="">اختر القطاع</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              <option value="__other__">قطاع آخر…</option>
            </select>
            {sectorIsCustom && (
              <input
                className="input mt-2"
                placeholder="اكتب اسم القطاع"
                value={p.sector}
                onChange={(e) => set({ sector: e.target.value })}
              />
            )}
          </div>
        </div>
        <div>
          <label className="label">نبذة تعريفية</label>
          <textarea className="input" rows={3} value={p.description} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">اسم المسؤول</label>
            <input className="input" value={p.contact_name} onChange={(e) => set({ contact_name: e.target.value })} />
          </div>
          <div>
            <label className="label">رقم التواصل</label>
            <input className="input" value={p.contact_phone} onChange={(e) => set({ contact_phone: e.target.value })} />
          </div>
        </div>
        <div className="rounded-2xl bg-brand-bg p-4">
          <h3 className="mb-3 text-sm font-extrabold text-brand-darkest">وسائل التواصل العامة <span className="font-normal text-brand">(تظهر في بروفايل شركتك للزوّار)</span></h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">الموقع الإلكتروني</label>
              <input className="input" value={p.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://example.com" dir="ltr" />
            </div>
            <div>
              <label className="label">إيميل التواصل</label>
              <input className="input" type="email" value={p.public_email} onChange={(e) => set({ public_email: e.target.value })} placeholder="info@example.com" dir="ltr" />
            </div>
            <div>
              <label className="label">إنستغرام</label>
              <input className="input" value={p.instagram} onChange={(e) => set({ instagram: e.target.value })} placeholder="@username أو رابط" dir="ltr" />
            </div>
            <div>
              <label className="label">إكس (تويتر)</label>
              <input className="input" value={p.twitter} onChange={(e) => set({ twitter: e.target.value })} placeholder="@username أو رابط" dir="ltr" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">لينكدإن</label>
              <input className="input" value={p.linkedin} onChange={(e) => set({ linkedin: e.target.value })} placeholder="رابط الصفحة" dir="ltr" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={save} disabled={busy}>{busy ? <Spinner /> : "حفظ"}</button>
          {saved && <span className="text-sm font-bold text-emerald-700">✓ تم الحفظ</span>}
        </div>
      </div>
    </div>
  );
}

// ---------------- Jobs ----------------
interface Job {
  id: string; title: string; description: string; duration: string; salary: string;
  area: string; work_type: string; skills_required: string[]; headcount: number; status: string;
}

function JobsTab() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [form, setForm] = useState<any>({ title: "", description: "", duration: "", salary: "", area: "", work_type: "", headcount: 1, skills_required: [] as string[] });
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get<{ jobs: Job[] }>("/jobs/mine").then((r) => setJobs(r.jobs));
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/jobs", form);
      setForm({ title: "", description: "", duration: "", salary: "", area: "", work_type: "", headcount: 1, skills_required: [] });
      setShowForm(false);
      await load();
    } finally { setBusy(false); }
  };

  const toggleStatus = async (job: Job) => {
    await api.patch(`/jobs/${job.id}`, { status: job.status === "open" ? "closed" : "open" });
    await load();
  };

  const toggleSkill = (s: string) =>
    setForm((f: any) => ({ ...f, skills_required: f.skills_required.includes(s) ? f.skills_required.filter((x: string) => x !== s) : [...f.skills_required, s] }));

  if (!jobs) return <div className="py-10 text-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
        {showForm ? "إغلاق" : "+ نشر فرصة عمل / مشروع"}
      </button>

      {showForm && (
        <form onSubmit={create} className="card space-y-4">
          <div>
            <label className="label">المسمى الوظيفي</label>
            <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">تفاصيل المهام</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">المدة</label>
              <select className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>
                <option value="">—</option>
                {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">المكافأة (د.ك)</label>
              <div className="relative">
                <input type="number" min={0} step="0.5" className="input pl-12" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="مثال: 30" />
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-brand">د.ك</span>
              </div>
            </div>
            <div>
              <label className="label">المحافظة</label>
              <select className="input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })}>
                <option value="">—</option>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="label">العدد المطلوب</label>
              <input type="number" min={1} className="input" value={form.headcount} onChange={(e) => setForm({ ...form, headcount: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">نوع العمل</label>
            <select className="input" value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })}>
              <option value="">—</option>
              {WORK_TYPES.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">المهارات المطلوبة</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => (
                <button type="button" key={s} onClick={() => toggleSkill(s)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold cursor-pointer ${form.skills_required.includes(s) ? "bg-brand-dark text-white" : "bg-brand-bg text-brand-dark"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary" disabled={busy}>{busy ? <Spinner /> : "نشر"}</button>
        </form>
      )}

      {jobs.length === 0 ? (
        <EmptyState title="لم تنشر أي فرصة عمل بعد" />
      ) : (
        jobs.map((j) => (
          <div key={j.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-bold text-brand-darkest">{j.title}</h3>
              <Badge className={j.status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}>
                {j.status === "open" ? "مفتوحة" : "مغلقة"}
              </Badge>
            </div>
            {j.description && <p className="mt-1 text-sm text-brand-dark">{j.description}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {j.area && <span className="chip gap-1"><IconPin className="h-3.5 w-3.5" /> {j.area}</span>}
              {j.duration && <span className="chip gap-1"><IconClock className="h-3.5 w-3.5" /> {labelOf(DURATIONS, j.duration)}</span>}
              {j.salary && <span className="chip gap-1"><IconCash className="h-3.5 w-3.5" /> {toLatinDigits(j.salary)} د.ك</span>}
              <span className="chip">العدد: {j.headcount}</span>
            </div>
            <button className="btn-ghost mt-3" onClick={() => toggleStatus(j)}>
              {j.status === "open" ? "إغلاق الفرصة" : "إعادة فتح"}
            </button>
            <JobApplicants jobId={j.id} />
          </div>
        ))
      )}
    </div>
  );
}

interface Applicant {
  id: string;
  status: keyof typeof APPLICATION_STATUS;
  message: string;
  created_at: number;
  worker_user_id: string;
  full_name: string;
  area: string;
  skills: string[];
  bio: string;
  photo_key: string | null;
  civil_id_verified: number;
  rating: number | null;
}

function JobApplicants({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[] | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const load = () => api.get<{ applicants: Applicant[] }>(`/applications/job/${jobId}`).then((r) => setApplicants(r.applicants));
  useEffect(() => { if (open && !applicants) load(); }, [open]);

  // Accepting sends an offer to the worker automatically (handled server-side).
  const act = async (a: Applicant, status: "accepted" | "rejected") => {
    await api.patch(`/applications/${a.id}`, { status });
    load();
  };

  return (
    <div className="mt-3 border-t border-brand-soft pt-3">
      {profileId && <WorkerProfileModal workerId={profileId} onClose={() => setProfileId(null)} />}
      <button className="text-sm font-bold text-brand-dark hover:underline" onClick={() => setOpen((o) => !o)}>
        {open ? "إخفاء المتقدمين ▲" : "عرض المتقدمين ▼"}
      </button>

      {open && (
        applicants === null ? (
          <div className="py-4 text-center"><Spinner /></div>
        ) : applicants.length === 0 ? (
          <p className="py-3 text-sm text-brand">لا يوجد متقدمون بعد.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="rounded-lg bg-brand-bg p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button className="flex items-center gap-3 text-right" onClick={() => setProfileId(a.worker_user_id)}>
                    <Avatar src={fileUrl(a.photo_key)} name={a.full_name} size={44} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-darkest hover:underline">{a.full_name || "باحث عن فرص"}</span>
                        {a.civil_id_verified ? <VerifiedBadge verified={1} /> : null}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-brand">
                        {a.area && <span className="inline-flex items-center gap-1"><IconPin className="h-3 w-3" /> {a.area}</span>}
                        {a.rating != null && <StarRating value={a.rating} />}
                      </div>
                    </div>
                  </button>
                  <Badge className={APPLICATION_STATUS[a.status]?.cls}>{APPLICATION_STATUS[a.status]?.label}</Badge>
                </div>

                {a.skills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.skills.map((s) => <span key={s} className="chip">{s}</span>)}
                  </div>
                )}
                {a.message && <p className="mt-2 rounded-lg bg-white p-2 text-sm text-brand-dark">{a.message}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-secondary text-xs" onClick={() => setProfileId(a.worker_user_id)}>عرض البروفايل</button>
                  {a.status === "pending" && (
                    <>
                      <button className="btn-primary text-xs" onClick={() => act(a, "accepted")}>قبول وإرسال عرض</button>
                      <button className="btn-ghost text-xs" onClick={() => act(a, "rejected")}>رفض</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ---------------- Talent search ----------------
interface WorkerCard {
  user_id: string; full_name: string; photo_key: string | null; bio: string;
  skills: string[]; area: string; availability: string[]; work_type: string;
  expected_salary: string; civil_id_verified: number; avg_rating: number | null; rating_count: number;
}

function TalentTab() {
  const [filters, setFilters] = useState({ q: "", area: "", work_type: "", availability: "" });
  const [list, setList] = useState<WorkerCard[] | null>(null);
  const [offerTo, setOfferTo] = useState<WorkerCard | null>(null);
  const [offerMsg, setOfferMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const search = () => {
    setList(null);
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && qs.set(k, v));
    api.get<{ workers: WorkerCard[] }>(`/workers?${qs.toString()}`).then((r) => setList(r.workers));
  };
  useEffect(() => { search(); }, []);

  const sendOffer = async () => {
    if (!offerTo) return;
    setBusy(true);
    try {
      await api.post("/offers", { worker_user_id: offerTo.user_id, message: offerMsg });
      setSent(true);
      setTimeout(() => { setOfferTo(null); setOfferMsg(""); setSent(false); }, 1500);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-soft">
        <input className="input flex-1 min-w-[180px]" placeholder="بحث بالمهارة أو الاسم..." value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })} onKeyDown={(e) => e.key === "Enter" && search()} />
        <select className="input w-auto" value={filters.area} onChange={(e) => setFilters({ ...filters, area: e.target.value })}>
          <option value="">كل المحافظات</option>
          {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="input w-auto" value={filters.work_type} onChange={(e) => setFilters({ ...filters, work_type: e.target.value })}>
          <option value="">كل أنواع العمل</option>
          {WORK_TYPES.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
        </select>
        <select className="input w-auto" value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}>
          <option value="">كل الأوقات</option>
          {AVAILABILITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
        <button className="btn-primary" onClick={search}>بحث</button>
      </div>

      {!list ? (
        <div className="py-10 text-center"><Spinner /></div>
      ) : list.length === 0 ? (
        <EmptyState title="لا يوجد مرشحون مطابقون" hint="جرّب توسيع معايير البحث." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((w) => (
            <div key={w.user_id} className="card flex flex-col">
              <div className="flex items-center gap-3">
                <Avatar src={fileUrl(w.photo_key)} name={w.full_name} />
                <div className="flex-1">
                  <button type="button" onClick={() => setProfileId(w.user_id)} className="font-bold text-brand-darkest hover:text-brand-dark hover:underline">
                    {w.full_name || "الشخص"}
                  </button>
                  <StarRating value={w.avg_rating} count={w.rating_count} />
                </div>
              </div>
              {w.bio && <p className="mt-2 line-clamp-2 text-sm text-brand-dark">{w.bio}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {w.skills.slice(0, 5).map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-brand">
                {w.area && <span className="inline-flex items-center gap-1"><IconPin className="h-3 w-3" /> {w.area}</span>}
                {w.work_type && <span>· {labelOf(WORK_TYPES, w.work_type)}</span>}
                {w.expected_salary && <span>· {toLatinDigits(w.expected_salary)} د.ك</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={() => setProfileId(w.user_id)}>عرض البروفايل</button>
                <button className="btn-primary" onClick={() => { setOfferTo(w); setOfferMsg(""); }}>إرسال عرض</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {profileId && <WorkerProfileModal workerId={profileId} onClose={() => setProfileId(null)} />}

      {offerTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOfferTo(null)}>
          <div className="w-full max-w-md card" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brand-darkest">إرسال عرض إلى {offerTo.full_name || "الشخص"}</h3>
            <p className="mt-1 text-sm text-brand">سيظهر رقم تواصله بعد قبوله العرض.</p>
            <textarea className="input mt-3" rows={4} placeholder="اكتب تفاصيل العرض..." value={offerMsg} onChange={(e) => setOfferMsg(e.target.value)} />
            <div className="mt-3 flex gap-2">
              <button className="btn-primary" onClick={sendOffer} disabled={busy || sent}>
                {sent ? "✓ تم الإرسال" : busy ? <Spinner /> : "إرسال"}
              </button>
              <button className="btn-ghost" onClick={() => setOfferTo(null)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Sent offers ----------------
interface Offer {
  id: string; status: keyof typeof OFFER_STATUS; message: string;
  worker_user_id: string; worker_name: string; worker_photo: string | null; job_title: string | null;
}

function OffersTab() {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [rating, setRating] = useState<{ offerId: string; stars: number; comment: string } | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const load = () => api.get<{ offers: Offer[] }>("/offers").then((r) => setOffers(r.offers));
  useEffect(() => { load(); }, []);

  const complete = async (id: string) => { await api.patch(`/offers/${id}`, { status: "completed" }); await load(); };
  const submitRating = async () => {
    if (!rating) return;
    await api.post("/ratings", { offer_id: rating.offerId, stars: rating.stars, comment: rating.comment });
    setRating(null); await load();
  };

  if (!offers) return <div className="py-10 text-center"><Spinner /></div>;
  if (offers.length === 0) return <EmptyState title="لم ترسل أي عرض بعد" hint="ابحث عن المواهب وأرسل عرضك." />;

  return (
    <div className="space-y-3">
      {offers.map((o) => (
        <div key={o.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar src={fileUrl(o.worker_photo)} name={o.worker_name} />
              <div>
                <button type="button" onClick={() => setProfileId(o.worker_user_id)} className="font-bold text-brand-darkest hover:text-brand-dark hover:underline">
                  {o.worker_name || "الشخص"}
                </button>
                {o.job_title && <p className="text-sm text-brand">{o.job_title}</p>}
              </div>
            </div>
            <Badge className={OFFER_STATUS[o.status].cls}>{OFFER_STATUS[o.status].label}</Badge>
          </div>
          {o.message && <p className="mt-2 rounded-lg bg-brand-bg p-3 text-sm text-brand-dark">{o.message}</p>}

          {o.status === "accepted" && (
            <button className="btn-primary mt-3" onClick={() => complete(o.id)}>تأكيد إكمال العمل</button>
          )}
          {o.status === "completed" && (
            <div className="mt-3">
              {rating?.offerId === o.id ? (
                <div className="rounded-xl bg-brand-bg p-3">
                  <StarInput value={rating.stars} onChange={(s) => setRating({ ...rating, stars: s })} />
                  <textarea className="input mt-2" rows={2} placeholder="تقييم الأداء..." value={rating.comment} onChange={(e) => setRating({ ...rating, comment: e.target.value })} />
                  <div className="mt-2 flex gap-2">
                    <button className="btn-primary" onClick={submitRating}>إرسال</button>
                    <button className="btn-ghost" onClick={() => setRating(null)}>إلغاء</button>
                  </div>
                </div>
              ) : (
                <button className="btn-secondary" onClick={() => setRating({ offerId: o.id, stars: 5, comment: "" })}>قيّم الشخص</button>
              )}
            </div>
          )}
        </div>
      ))}
      {profileId && <WorkerProfileModal workerId={profileId} onClose={() => setProfileId(null)} />}
    </div>
  );
}

const TABS: Tab[] = ["profile", "jobs", "talent", "offers", "messages"];

export function CompanyDashboard() {
  const [params] = useSearchParams();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState<Tab>(TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "profile");
  useEffect(() => {
    if (tabParam && TABS.includes(tabParam as Tab)) setTab(tabParam as Tab);
  }, [tabParam]);
  return (
    <Layout wide>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-darkest">لوحة الشركة</h1>
      <p className="mb-6 text-brand-dark">انشر فرص العمل وابحث عن الكفاءات الكويتية</p>
      <div className="mb-6">
        <Tabs active={tab} onChange={setTab}
          tabs={[
            { id: "profile", label: "بروفايل الشركة" },
            { id: "jobs", label: "فرص العمل" },
            { id: "talent", label: "البحث عن مواهب" },
            { id: "offers", label: "العروض المرسلة" },
            { id: "messages", label: "الرسائل" },
          ]} />
      </div>
      {tab === "profile" && <ProfileTab />}
      {tab === "jobs" && <JobsTab />}
      {tab === "talent" && <TalentTab />}
      {tab === "offers" && <OffersTab />}
      {tab === "messages" && <MessagesPanel />}
    </Layout>
  );
}
