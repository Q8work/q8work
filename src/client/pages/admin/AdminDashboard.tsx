import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Tabs, Spinner, EmptyState, Badge, StarRating } from "../../components/ui";
import { api, fileUrl } from "../../lib/api";

type Tab = "overview" | "users" | "companies" | "jobs" | "ratings" | "contact";

const fmtDate = (ms?: number) =>
  ms ? new Intl.DateTimeFormat("ar-KW-u-nu-latn", { dateStyle: "medium" }).format(new Date(ms)) : "—";

const roleLabel = (r: string) => ({ worker: "باحث", company: "شركة", admin: "إدارة" }[r] || r);

interface Stats {
  workers: number; companies: number; jobs: number; open_jobs: number;
  offers: number; completed_offers: number; pending_companies: number; suspended: number;
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="card text-center">
      <div className="text-3xl font-extrabold text-brand-darkest">{value}</div>
      <div className="mt-1 text-sm font-semibold text-brand">{label}</div>
    </div>
  );
}

function OverviewTab() {
  const [s, setS] = useState<Stats | null>(null);
  useEffect(() => { api.get<{ stats: Stats }>("/admin/stats").then((r) => setS(r.stats)); }, []);
  if (!s) return <div className="py-10 text-center"><Spinner /></div>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard value={s.workers} label="باحث عن فرص" />
      <StatCard value={s.companies} label="شركة" />
      <StatCard value={s.jobs} label="فرصة عمل منشورة" />
      <StatCard value={s.open_jobs} label="فرصة عمل مفتوحة" />
      <StatCard value={s.offers} label="عرض عمل" />
      <StatCard value={s.completed_offers} label="عمل مكتمل" />
      <StatCard value={s.pending_companies} label="شركة بانتظار التوثيق" />
      <StatCard value={s.suspended} label="حساب موقوف" />
    </div>
  );
}

interface AdminUser {
  id: string; email: string; role: string; status: string; created_at: number;
  worker_name: string | null; worker_phone: string | null;
  civil_id_image_key: string | null; civil_id_verified: number | null;
  company_name: string | null; company_verified: number | null; company_phone: string | null;
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [role, setRole] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const load = () => {
    setUsers(null);
    const qs = new URLSearchParams();
    if (role) qs.set("role", role);
    api.get<{ users: AdminUser[] }>(`/admin/users?${qs.toString()}`).then((r) => setUsers(r.users));
  };
  useEffect(() => { load(); }, [role]);

  const toggleStatus = async (u: AdminUser) => {
    await api.patch(`/admin/users/${u.id}`, { status: u.status === "active" ? "suspended" : "active" });
    load();
  };

  return (
    <div className="space-y-4">
      {detailId && <UserDetailModal id={detailId} onClose={() => setDetailId(null)} />}
      <div className="flex gap-2">
        {["", "worker", "company"].map((r) => (
          <button key={r} onClick={() => setRole(r)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold cursor-pointer ${role === r ? "bg-brand-dark text-white" : "bg-white text-brand-dark ring-1 ring-brand-soft"}`}>
            {r === "" ? "الكل" : roleLabel(r)}
          </button>
        ))}
      </div>
      {!users ? <div className="py-10 text-center"><Spinner /></div> : users.length === 0 ? (
        <EmptyState title="لا يوجد مستخدمون" />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-soft">
          <table className="w-full text-sm">
            <thead className="bg-brand-bg text-brand-dark">
              <tr>
                <th className="p-3 text-right">الاسم</th>
                <th className="p-3 text-right">البريد</th>
                <th className="p-3 text-right">الهاتف</th>
                <th className="p-3 text-right">النوع</th>
                <th className="p-3 text-right">الحالة</th>
                <th className="p-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-brand-soft">
                  <td className="p-3 font-semibold text-brand-darkest">{u.worker_name || u.company_name || "—"}</td>
                  <td className="p-3 text-brand-dark">{u.email}</td>
                  <td className="p-3 text-brand-dark"><span data-latin>{u.worker_phone || u.company_phone || "—"}</span></td>
                  <td className="p-3">{roleLabel(u.role)}</td>
                  <td className="p-3">
                    <Badge className={u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}>
                      {u.status === "active" ? "نشط" : "موقوف"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => setDetailId(u.id)} className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-bold text-brand-darkest cursor-pointer hover:bg-brand-light">
                        تفاصيل
                      </button>
                    {u.role !== "admin" && (
                      <>
                        <button onClick={() => toggleStatus(u)} className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-bold text-brand-darkest cursor-pointer hover:bg-brand-light">
                          {u.status === "active" ? "إيقاف" : "تفعيل"}
                        </button>
                        {u.role === "worker" && u.civil_id_image_key && (
                          <a href={fileUrl(u.civil_id_image_key)} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-bold text-brand-darkest cursor-pointer hover:bg-brand-light">
                            عرض الهوية
                          </a>
                        )}
                      </>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompaniesTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const load = () => api.get<{ users: AdminUser[] }>("/admin/users?role=company").then((r) => setUsers(r.users));
  useEffect(() => { load(); }, []);

  const setVerified = async (u: AdminUser, verified: boolean) => {
    await api.patch(`/admin/companies/${u.id}/verify`, { verified });
    load();
  };

  if (!users) return <div className="py-10 text-center"><Spinner /></div>;
  if (users.length === 0) return <EmptyState title="لا توجد شركات" />;

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div key={u.id} className="card flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-brand-darkest">{u.company_name || "شركة"}</h3>
            <p className="text-sm text-brand">{u.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={u.company_verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
              {u.company_verified ? "موثّقة" : "غير موثّقة"}
            </Badge>
            {u.company_verified ? (
              <button className="btn-ghost" onClick={() => setVerified(u, false)}>إلغاء التوثيق</button>
            ) : (
              <button className="btn-primary" onClick={() => setVerified(u, true)}>توثيق</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Account detail modal ----

interface AccountDetail {
  user: { id: string; email: string; role: string; status: string; created_at: number };
  profile: any;
  avg: number | null;
  stats: Record<string, number>;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-brand-soft py-1.5 text-sm last:border-0">
      <span className="font-semibold text-brand-dark">{label}</span>
      <span className="text-left text-brand-darkest">{value}</span>
    </div>
  );
}

function UserDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [d, setD] = useState<AccountDetail | null>(null);
  useEffect(() => { api.get<AccountDetail>(`/admin/users/${id}`).then(setD); }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-brand-darkest">تفاصيل الحساب</h3>
          <button onClick={onClose} className="btn-ghost px-3 py-1">إغلاق</button>
        </div>
        {!d ? (
          <div className="py-10 text-center"><Spinner /></div>
        ) : (
          <div className="space-y-4">
            <div>
              <Row label="النوع" value={roleLabel(d.user.role)} />
              <Row label="البريد" value={<span data-latin>{d.user.email}</span>} />
              <Row label="الحالة" value={d.user.status === "active" ? "نشط" : "موقوف"} />
              <Row label="تاريخ التسجيل" value={fmtDate(d.user.created_at)} />
              <Row label="متوسط التقييم" value={<StarRating value={d.avg} count={d.stats.rating_count} />} />
            </div>

            {d.user.role === "worker" && d.profile && (
              <div className="rounded-lg bg-brand-bg p-3">
                <Row label="الاسم" value={d.profile.full_name} />
                <Row label="المحافظة" value={d.profile.area} />
                <Row label="الهاتف" value={d.profile.phone ? <span data-latin>{d.profile.phone}</span> : ""} />
                <Row label="الرقم المدني" value={d.profile.civil_id ? <span data-latin>{d.profile.civil_id}</span> : ""} />
                <Row label="المهارات" value={(d.profile.skills || []).join("، ")} />
                <Row label="عروض مستلمة" value={d.stats.offers_received} />
                {d.profile.civil_id_image_key && (
                  <Row label="صورة الهوية" value={<a className="font-bold text-brand-dark underline" href={fileUrl(d.profile.civil_id_image_key)} target="_blank" rel="noopener noreferrer">عرض</a>} />
                )}
              </div>
            )}

            {d.user.role === "company" && d.profile && (
              <div className="rounded-lg bg-brand-bg p-3">
                <Row label="اسم الشركة" value={d.profile.company_name} />
                <Row label="القطاع" value={d.profile.sector} />
                <Row label="مسؤول التواصل" value={d.profile.contact_name} />
                <Row label="هاتف التواصل" value={d.profile.contact_phone ? <span data-latin>{d.profile.contact_phone}</span> : ""} />
                <Row label="موثّقة" value={d.profile.verified ? "✓ نعم" : "لا"} />
                <Row label="فرص منشورة" value={d.stats.jobs_posted} />
                <Row label="عروض مُرسلة" value={d.stats.offers_sent} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Jobs moderation ----

interface AdminJob {
  id: string; title: string; area: string; status: string; headcount: number;
  created_at: number; company_name: string | null; company_verified: number | null;
}

function JobsTab() {
  const [jobs, setJobs] = useState<AdminJob[] | null>(null);
  const [status, setStatus] = useState("");
  const load = () => {
    setJobs(null);
    const qs = status ? `?status=${status}` : "";
    api.get<{ jobs: AdminJob[] }>(`/admin/jobs${qs}`).then((r) => setJobs(r.jobs));
  };
  useEffect(() => { load(); }, [status]);

  const toggle = async (j: AdminJob) => {
    await api.patch(`/admin/jobs/${j.id}`, { status: j.status === "open" ? "closed" : "open" });
    load();
  };
  const remove = async (j: AdminJob) => {
    if (!window.confirm(`حذف فرصة العمل «${j.title}»؟ لا يمكن التراجع.`)) return;
    await api.del(`/admin/jobs/${j.id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[["", "الكل"], ["open", "مفتوحة"], ["closed", "مغلقة"]].map(([v, label]) => (
          <button key={v} onClick={() => setStatus(v)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold cursor-pointer ${status === v ? "bg-brand-dark text-white" : "bg-white text-brand-dark ring-1 ring-brand-soft"}`}>
            {label}
          </button>
        ))}
      </div>
      {!jobs ? <div className="py-10 text-center"><Spinner /></div> : jobs.length === 0 ? (
        <EmptyState title="لا توجد فرص عمل" />
      ) : (
        jobs.map((j) => (
          <div key={j.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-brand-darkest">{j.title}</h3>
                <Badge className={j.status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}>
                  {j.status === "open" ? "مفتوحة" : "مغلقة"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-brand">
                {j.company_name || "—"} · {j.area || "—"} · {fmtDate(j.created_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => toggle(j)}>
                {j.status === "open" ? "إغلاق" : "إعادة فتح"}
              </button>
              <button className="btn-danger" onClick={() => remove(j)}>حذف</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ---- Ratings moderation ----

interface AdminRating {
  id: string; stars: number; comment: string; created_at: number;
  rater_name: string; ratee_name: string;
}

function RatingsTab() {
  const [ratings, setRatings] = useState<AdminRating[] | null>(null);
  const load = () => {
    setRatings(null);
    api.get<{ ratings: AdminRating[] }>("/admin/ratings").then((r) => setRatings(r.ratings));
  };
  useEffect(() => { load(); }, []);

  const remove = async (r: AdminRating) => {
    if (!window.confirm("حذف هذا التقييم؟ لا يمكن التراجع.")) return;
    await api.del(`/admin/ratings/${r.id}`);
    load();
  };

  if (!ratings) return <div className="py-10 text-center"><Spinner /></div>;
  if (ratings.length === 0) return <EmptyState title="لا توجد تقييمات" />;

  return (
    <div className="space-y-3">
      {ratings.map((r) => (
        <div key={r.id} className="card flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StarRating value={r.stars} />
              <span className="text-xs text-brand">{fmtDate(r.created_at)}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-brand-dark">
              {r.rater_name} ← {r.ratee_name}
            </p>
            {r.comment && <p className="mt-1 text-sm text-brand-darkest">{r.comment}</p>}
          </div>
          <button className="btn-danger" onClick={() => remove(r)}>حذف</button>
        </div>
      ))}
    </div>
  );
}

interface ContactMessage {
  id: string; name: string; email: string; message: string; delivered: number; created_at: number;
}

function ContactTab() {
  const [msgs, setMsgs] = useState<ContactMessage[] | null>(null);
  useEffect(() => { api.get<{ messages: ContactMessage[] }>("/contact").then((r) => setMsgs(r.messages)); }, []);

  if (!msgs) return <div className="py-10 text-center"><Spinner /></div>;
  if (msgs.length === 0) return <EmptyState title="لا توجد رسائل تواصل بعد" />;

  return (
    <div className="space-y-3">
      {msgs.map((m) => (
        <div key={m.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-brand-darkest">{m.name}</h3>
              <a href={`mailto:${m.email}`} className="text-sm font-semibold text-brand-dark underline" data-latin>{m.email}</a>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={m.delivered ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                {m.delivered ? "أُرسل بالبريد" : "محفوظ"}
              </Badge>
              <span className="text-xs text-brand">{fmtDate(m.created_at)}</span>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-brand-bg p-3 text-sm text-brand-dark">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const changeTab = (t: Tab) => { setTab(t); window.scrollTo(0, 0); };
  return (
    <Layout wide>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-darkest">لوحة الإدارة</h1>
      <p className="mb-6 text-brand-dark">إدارة المستخدمين والمحتوى والتوثيق والإحصائيات</p>
      <div className="mb-6">
        <Tabs active={tab} onChange={changeTab}
          tabs={[
            { id: "overview", label: "نظرة عامة" },
            { id: "users", label: "المستخدمون" },
            { id: "companies", label: "توثيق الشركات" },
            { id: "jobs", label: "فرص العمل" },
            { id: "ratings", label: "التقييمات" },
            { id: "contact", label: "تواصل" },
          ]} />
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "companies" && <CompaniesTab />}
      {tab === "jobs" && <JobsTab />}
      {tab === "ratings" && <RatingsTab />}
      {tab === "contact" && <ContactTab />}
    </Layout>
  );
}
