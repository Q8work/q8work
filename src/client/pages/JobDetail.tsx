import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageLoader, EmptyState, VerifiedTick, Badge, ErrorText, Spinner } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { WORK_TYPES, DURATIONS, labelOf } from "../lib/constants";
import { IconPin, IconBriefcase, IconClock, IconUsers } from "../components/icons";
import { toLatinDigits } from "../lib/format";

interface Job {
  id: string;
  title: string;
  description: string;
  duration: string;
  salary: string;
  area: string;
  work_type: string;
  skills_required: string[];
  headcount: number;
  status: string;
  company_user_id: string;
  company_name: string;
  company_verified: number;
  sector: string;
  created_at: number;
}

function Fact({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-dark">{icon}</span>
      <div>
        <div className="text-xs text-brand">{label}</div>
        <div className="text-sm font-bold text-brand-darkest">{value}</div>
      </div>
    </div>
  );
}

const postedDate = (ms?: number) =>
  ms ? new Intl.DateTimeFormat("ar-KW-u-nu-latn", { dateStyle: "medium" }).format(new Date(ms)) : "";

function ApplyBox({ job, onApplied }: { job: Job; onApplied: () => void }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [applied, setApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "worker") {
      api.get<{ job_ids: string[] }>("/applications/mine/ids").then((r) => {
        if (r.job_ids.includes(job.id)) setApplied(true);
      });
    }
  }, [user, job.id]);

  if (loading) return null;

  const redirect = `/jobs/${job.id}`;

  if (job.status !== "open") {
    return <div className="card text-center text-brand-dark">هذه الفرصة مغلقة حالياً.</div>;
  }

  // Guest → register/login then come back to apply
  if (!user) {
    return (
      <div className="card space-y-3 text-center">
        <p className="font-bold text-brand-darkest">سجّل دخولك كباحث عن عمل للتقديم على هذه الفرصة</p>
        <div className="flex justify-center gap-2">
          <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="btn-primary">
            سجّل وقدّم
          </Link>
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="btn-ghost">
            لديك حساب؟ دخول
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "worker") {
    return <div className="card text-center text-brand-dark">التقديم متاح للباحثين عن عمل فقط.</div>;
  }

  if (applied) {
    return (
      <div className="card text-center">
        <Badge className="bg-emerald-100 text-emerald-800">✓ تم التقديم على هذه الفرصة</Badge>
        <p className="mt-2 text-sm text-brand-dark">يمكنك متابعة حالة طلبك من «تقديماتي» في لوحتك.</p>
        <Link to="/app" className="btn-secondary mt-3">الذهاب إلى لوحتي</Link>
      </div>
    );
  }

  const apply = async () => {
    setBusy(true);
    setError("");
    try {
      await api.post("/applications", { job_id: job.id, message });
      setApplied(true);
      onApplied();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "تعذّر إرسال الطلب.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card space-y-3">
      <h3 className="font-bold text-brand-darkest">التقديم على الفرصة</h3>
      <ErrorText>{error}</ErrorText>
      <textarea
        className="input"
        rows={3}
        placeholder="رسالة مختصرة للشركة (اختياري): لماذا أنت مناسب لهذه الفرصة؟"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className="btn-primary w-full" onClick={apply} disabled={busy}>
        {busy ? <Spinner /> : "تقديم الطلب"}
      </button>
      <p className="text-center text-xs text-brand">
        رقم تواصلك يبقى خاصاً ولا يظهر للشركة إلا بعد قبول العرض.
      </p>
    </div>
  );
}

export function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<{ job: Job }>(`/jobs/${id}`)
      .then((r) => setJob(r.job))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><PageLoader /></Layout>;
  if (notFound || !job) {
    return (
      <Layout>
        <EmptyState title="فرصة العمل غير موجودة" hint="ربما أُغلقت أو حُذفت." />
        <div className="mt-4 text-center">
          <Link to="/jobs" className="btn-secondary">العودة لفرص العمل</Link>
        </div>
      </Layout>
    );
  }

  const isOpen = job.status === "open";

  return (
    <Layout wide>
      <Link to="/jobs" className="text-sm font-bold text-brand-dark hover:underline">← كل الفرص</Link>

      {/* Header */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-brand-soft bg-white shadow-sm">
        <div className="h-2 w-full bg-gradient-to-l from-brand-dark to-brand-darkest" />
        <div className="flex flex-wrap items-start justify-between gap-3 p-6 sm:p-8">
          <div>
            <Badge className={isOpen ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}>
              {isOpen ? "مفتوحة للتقديم" : "مغلقة"}
            </Badge>
            <h1 className="mt-3 text-2xl font-extrabold text-brand-darkest sm:text-3xl">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Link to={`/companies/${job.company_user_id}`} className="inline-flex items-center gap-1 font-bold text-brand-dark hover:underline">
                {job.company_name}
                <VerifiedTick verified={job.company_verified} size={16} />
              </Link>
              {job.sector && <span className="text-brand">· {job.sector}</span>}
            </div>
            {job.created_at ? <p className="mt-2 text-xs text-brand">نُشرت في {postedDate(job.created_at)}</p> : null}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h2 className="mb-3 text-lg font-extrabold text-brand-darkest">تفاصيل الفرصة</h2>
            {job.description ? (
              <p className="whitespace-pre-line leading-relaxed text-brand-dark">{job.description}</p>
            ) : (
              <p className="text-sm text-brand">لم تضف الشركة وصفاً تفصيلياً لهذه الفرصة.</p>
            )}
          </div>

          {job.skills_required.length > 0 && (
            <div className="card">
              <h2 className="mb-3 text-lg font-extrabold text-brand-darkest">المهارات المطلوبة</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="mb-1 text-lg font-extrabold text-brand-darkest">عن الشركة</h2>
            <p className="flex items-center gap-1 text-sm text-brand-dark">
              {job.company_name}
              <VerifiedTick verified={job.company_verified} size={15} />
            </p>
            <Link to={`/companies/${job.company_user_id}`} className="btn-secondary mt-3">عرض بروفايل الشركة</Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card">
            {job.salary && (
              <div className="mb-2 border-b border-brand-soft pb-3">
                <div className="text-xs text-brand">المكافأة</div>
                <div className="text-2xl font-extrabold text-brand-darkest">
                  {toLatinDigits(job.salary)} <span className="text-base font-bold">د.ك</span>
                </div>
                {job.duration && <div className="text-xs text-brand">{labelOf(DURATIONS, job.duration)}</div>}
              </div>
            )}
            <div className="divide-y divide-brand-soft">
              <Fact label="المحافظة" value={job.area} icon={<IconPin />} />
              <Fact label="نوع العمل" value={job.work_type ? labelOf(WORK_TYPES, job.work_type) : ""} icon={<IconBriefcase />} />
              <Fact label="المدة" value={job.duration ? labelOf(DURATIONS, job.duration) : ""} icon={<IconClock />} />
              <Fact label="العدد المطلوب" value={String(job.headcount)} icon={<IconUsers />} />
            </div>
          </div>

          <ApplyBox job={job} onApplied={() => {}} />
        </aside>
      </div>
    </Layout>
  );
}
