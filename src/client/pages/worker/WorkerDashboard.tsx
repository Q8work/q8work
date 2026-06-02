import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Tabs, Spinner, EmptyState, StarRating, ErrorText, Avatar, Badge } from "../../components/ui";
import { MessagesPanel } from "../../components/Messages";
import { api, fileUrl } from "../../lib/api";
import { IconPin, IconCash } from "../../components/icons";
import { toLatinDigits } from "../../lib/format";
import {
  SKILLS,
  AREAS,
  AVAILABILITY,
  OFFER_STATUS,
  APPLICATION_STATUS,
} from "../../lib/constants";

type Tab = "profile" | "applications" | "offers" | "messages" | "ratings";

interface WorkerProfile {
  full_name: string;
  first_name: string;
  last_name: string;
  photo_key: string | null;
  bio: string;
  skills: string[];
  area: string;
  phone: string;
  email: string;
  civil_id: string;
  civil_id_image_key: string | null;
  civil_id_verified: number;
  availability: string[];
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
  const [customSkill, setCustomSkill] = useState("");

  useEffect(() => {
    api.get<{ profile: WorkerProfile }>("/profile/worker").then((r) => {
      const prof = r.profile;
      // backfill first/last from full_name for older records
      if (!prof.first_name && !prof.last_name && prof.full_name) {
        const idx = prof.full_name.indexOf(" ");
        prof.first_name = idx > 0 ? prof.full_name.slice(0, idx) : prof.full_name;
        prof.last_name = idx > 0 ? prof.full_name.slice(idx + 1) : "";
      }
      setP(prof);
    });
  }, []);

  if (!p) return <div className="py-10 text-center"><Spinner /></div>;

  const set = (patch: Partial<WorkerProfile>) => setP({ ...p, ...patch });
  const toggleIn = (key: "skills" | "availability", v: string) => {
    const arr = p[key];
    set({ [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] } as any);
  };
  const addCustomSkill = () => {
    const v = customSkill.trim();
    if (!v || p.skills.includes(v)) {
      setCustomSkill("");
      return;
    }
    set({ skills: [...p.skills, v] });
    setCustomSkill("");
  };
  const removeSkill = (v: string) => set({ skills: p.skills.filter((x) => x !== v) });

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
        </div>
      </div>

      <div className="card space-y-4">
        <ErrorText>{error}</ErrorText>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">الاسم الأول</label>
            <input
              className="input"
              value={p.first_name}
              onChange={(e) => set({ first_name: e.target.value, full_name: `${e.target.value} ${p.last_name}`.trim() })}
            />
          </div>
          <div>
            <label className="label">اسم العائلة</label>
            <input
              className="input"
              value={p.last_name}
              onChange={(e) => set({ last_name: e.target.value, full_name: `${p.first_name} ${e.target.value}`.trim() })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">المحافظة</label>
            <select className="input" value={p.area} onChange={(e) => set({ area: e.target.value })}>
              <option value="">اختر المحافظة</option>
              <option value="جميع المحافظات">جميع المحافظات</option>
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

          {/* Add a custom skill / specialization not in the list */}
          <div className="mt-3 flex gap-2">
            <input
              className="input flex-1"
              placeholder="أضف مهارة أو تخصص غير موجود..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSkill();
                }
              }}
            />
            <button type="button" className="btn-secondary" onClick={addCustomSkill}>إضافة</button>
          </div>

          {/* Custom skills the user added */}
          {p.skills.filter((s) => !SKILLS.includes(s)).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {p.skills
                .filter((s) => !SKILLS.includes(s))
                .map((s) => (
                  <span key={s} className="chip gap-1.5">
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      aria-label={`إزالة ${s}`}
                      className="text-brand hover:text-red-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
            </div>
          )}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">رقم التواصل <span className="font-normal text-brand">(يظهر للشركة بعد قبول العرض فقط)</span></label>
            <input className="input" value={p.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="965..." />
          </div>
          <div>
            <label className="label">البريد الإلكتروني <span className="font-normal text-brand">(يظهر للشركة بعد قبول العرض فقط)</span></label>
            <input type="email" className="input" value={p.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@example.com" data-latin />
          </div>
        </div>

        <div>
          <label className="label">الرقم المدني <span className="font-normal text-brand">(الإدارة فقط · لا تظهر للشركات)</span></label>
          <input className="input" value={p.civil_id} onChange={(e) => set({ civil_id: e.target.value })} />
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

  const load = () => api.get<{ offers: Offer[] }>("/offers").then((r) => setOffers(r.offers));
  useEffect(() => { load(); }, []);

  const respond = async (id: string, status: "accepted" | "rejected") => {
    await api.patch(`/offers/${id}`, { status });
    await load();
    onChange();
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
        <span className="font-bold text-brand-darkest">متوسط التوصيات</span>
        <StarRating value={data.avg} count={data.count} />
      </div>
      {data.ratings.length === 0 ? (
        <EmptyState title="لا توجد توصيات بعد" hint="ستظهر هنا شهادات التوصية من الشركات بعد إكمال العمل." />
      ) : (
        data.ratings.map((r, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-brand-darkest">{r.rater_name || "شركة"}</span>
              <StarRating value={r.stars} />
            </div>
            {r.comment && <p className="mt-2 border-r-2 border-brand-soft pr-3 text-sm leading-relaxed text-brand-dark">«{r.comment}»</p>}
          </div>
        ))
      )}
    </div>
  );
}

interface Application {
  id: string;
  status: keyof typeof APPLICATION_STATUS;
  message: string;
  created_at: number;
  job_id: string;
  job_title: string;
  area: string;
  salary: string;
  job_status: string;
  company_name: string;
  company_verified: number;
}

function ApplicationsTab() {
  const [apps, setApps] = useState<Application[] | null>(null);
  useEffect(() => { api.get<{ applications: Application[] }>("/applications/mine").then((r) => setApps(r.applications)); }, []);

  if (!apps) return <div className="py-10 text-center"><Spinner /></div>;
  if (apps.length === 0)
    return <EmptyState title="لم تتقدّم لأي فرصة بعد" hint="تصفّح فرص العمل وقدّم على ما يناسبك." />;

  return (
    <div className="space-y-3">
      {apps.map((a) => (
        <div key={a.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link to={`/jobs/${a.job_id}`} className="font-bold text-brand-darkest hover:underline">
                {a.job_title}
              </Link>
              <p className="text-sm font-semibold text-brand">{a.company_name}</p>
            </div>
            <Badge className={APPLICATION_STATUS[a.status]?.cls}>{APPLICATION_STATUS[a.status]?.label}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {a.area && <span className="chip gap-1"><IconPin className="h-3.5 w-3.5" /> {a.area}</span>}
            {a.salary && <span className="chip gap-1"><IconCash className="h-3.5 w-3.5" /> {toLatinDigits(a.salary)} د.ك</span>}
          </div>
          {a.message && <p className="mt-2 rounded-lg bg-brand-bg p-3 text-sm text-brand-dark">{a.message}</p>}
        </div>
      ))}
    </div>
  );
}

const TABS: Tab[] = ["profile", "applications", "offers", "messages", "ratings"];

export function WorkerDashboard() {
  const [params] = useSearchParams();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState<Tab>(TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "profile");
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (tabParam && TABS.includes(tabParam as Tab)) setTab(tabParam as Tab);
  }, [tabParam]);

  return (
    <Layout wide>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-darkest">حسابي الشخصي</h1>
      <p className="mb-6 text-brand-dark">أدر ملفك وقدّم على الفرص واستقبل العروض</p>

      <div className="mb-6">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "profile", label: "البروفايل" },
            { id: "applications", label: "تقديماتي" },
            { id: "offers", label: "العروض الواردة" },
            { id: "messages", label: "الرسائل" },
            { id: "ratings", label: "التوصيات" },
          ]}
        />
      </div>

      {tab === "profile" && <ProfileTab />}
      {tab === "applications" && <ApplicationsTab />}
      {tab === "offers" && <OffersTab onChange={() => setBump((b) => b + 1)} />}
      {tab === "messages" && <MessagesPanel key={bump} />}
      {tab === "ratings" && <RatingsTab />}
    </Layout>
  );
}
