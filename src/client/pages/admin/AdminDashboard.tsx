import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Tabs, Spinner, EmptyState, Badge } from "../../components/ui";
import { api, fileUrl } from "../../lib/api";

type Tab = "overview" | "users" | "companies";

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
      <StatCard value={s.workers} label="باحث عن عمل" />
      <StatCard value={s.companies} label="شركة" />
      <StatCard value={s.jobs} label="وظيفة منشورة" />
      <StatCard value={s.open_jobs} label="وظيفة مفتوحة" />
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
  company_name: string | null; company_verified: number | null;
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [role, setRole] = useState("");
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
  const verifyWorker = async (u: AdminUser) => {
    await api.patch(`/admin/workers/${u.id}/verify`, { verified: true });
    load();
  };

  const roleLabel = (r: string) => ({ worker: "كويتي", company: "شركة", admin: "إدارة" }[r] || r);

  return (
    <div className="space-y-4">
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
                  <td className="p-3">{roleLabel(u.role)}</td>
                  <td className="p-3">
                    <Badge className={u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}>
                      {u.status === "active" ? "نشط" : "موقوف"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {u.role !== "admin" && (
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => toggleStatus(u)} className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-bold text-brand-darkest cursor-pointer hover:bg-brand-light">
                          {u.status === "active" ? "إيقاف" : "تفعيل"}
                        </button>
                        {u.role === "worker" && u.civil_id_image_key && (
                          <a href={fileUrl(u.civil_id_image_key)} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-bold text-brand-darkest cursor-pointer hover:bg-brand-light">
                            عرض الهوية
                          </a>
                        )}
                        {u.role === "worker" && (
                          <button onClick={() => verifyWorker(u)} className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800 cursor-pointer hover:bg-emerald-200">
                            توثيق الجنسية
                          </button>
                        )}
                      </div>
                    )}
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

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <Layout wide>
      <h1 className="mb-1 text-2xl font-extrabold text-brand-darkest">لوحة الإدارة</h1>
      <p className="mb-6 text-brand-dark">إدارة المستخدمين والتوثيق والإحصائيات</p>
      <div className="mb-6">
        <Tabs active={tab} onChange={setTab}
          tabs={[
            { id: "overview", label: "نظرة عامة" },
            { id: "users", label: "المستخدمون" },
            { id: "companies", label: "توثيق الشركات" },
          ]} />
      </div>
      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "companies" && <CompaniesTab />}
    </Layout>
  );
}
