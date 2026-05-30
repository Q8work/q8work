import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageLoader, EmptyState, VerifiedBadge, Badge, ErrorText, Spinner } from "../components/ui";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { WORK_TYPES, DURATIONS, labelOf } from "../lib/constants";

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
  company_name: string;
  company_verified: number;
  sector: string;
  created_at: number;
}

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

  return (
    <Layout>
      <Link to="/jobs" className="text-sm font-bold text-brand-dark underline">← كل الفرص</Link>

      <div className="mt-4 card">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-darkest">{job.title}</h1>
            <p className="mt-1 font-semibold text-brand">{job.company_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <VerifiedBadge verified={job.company_verified} />
            <Badge className={job.status === "open" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"}>
              {job.status === "open" ? "مفتوحة" : "مغلقة"}
            </Badge>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {job.area && <span className="chip">📍 {job.area}</span>}
          {job.work_type && <span className="chip">{labelOf(WORK_TYPES, job.work_type)}</span>}
          {job.duration && <span className="chip">{labelOf(DURATIONS, job.duration)}</span>}
          {job.salary && <span className="chip">{job.salary} د.ك</span>}
          {job.sector && <span className="chip bg-brand-bg">{job.sector}</span>}
          <span className="chip bg-brand-bg">العدد المطلوب: {job.headcount}</span>
        </div>

        {job.description && (
          <div className="mt-4">
            <h2 className="section-title mb-2">تفاصيل الفرصة</h2>
            <p className="whitespace-pre-line text-brand-dark">{job.description}</p>
          </div>
        )}

        {job.skills_required.length > 0 && (
          <div className="mt-4">
            <h2 className="section-title mb-2">المهارات المطلوبة</h2>
            <div className="flex flex-wrap gap-1">
              {job.skills_required.map((s) => (
                <span key={s} className="chip bg-brand-bg">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <ApplyBox job={job} onApplied={() => {}} />
      </div>
    </Layout>
  );
}
