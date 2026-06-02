import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PageLoader, EmptyState } from "../components/ui";
import { useAuth } from "../lib/auth";
import { useWorkerProfile, WorkerProfileBody } from "../components/WorkerProfileModal";

export function WorkerProfile() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { p, ratings, loading, error } = useWorkerProfile(id || "");

  if (authLoading) return <Layout><PageLoader /></Layout>;
  // Worker profiles (incl. recommendations) are visible to companies and admins.
  if (!user || (user.role !== "company" && user.role !== "admin")) {
    return (
      <Layout>
        <EmptyState title="هذه الصفحة للشركات" hint="سجّل دخولك بحساب شركة لعرض ملفات الباحثين وتوصياتهم." />
        <div className="mt-4 text-center"><Link to="/login" className="btn-primary">تسجيل الدخول</Link></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <Link to="/app?tab=talent" className="text-sm font-bold text-brand-dark hover:underline">← العودة</Link>
        <div className="mt-3 overflow-hidden rounded-3xl border border-brand-soft bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-l from-brand-dark to-[#6c83ff]" />
          {loading ? (
            <div className="px-6 pb-10 pt-6 text-center"><PageLoader /></div>
          ) : error || !p ? (
            <div className="px-6 py-10"><EmptyState title="الملف غير موجود" /></div>
          ) : (
            <WorkerProfileBody p={p} ratings={ratings} />
          )}
        </div>
      </div>
    </Layout>
  );
}
