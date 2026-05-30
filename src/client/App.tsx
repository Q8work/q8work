import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { PageLoader } from "./components/ui";
import { Home } from "./pages/Home";
import { JobsList } from "./pages/JobsList";
import { Login, Register } from "./pages/Auth";
import { WorkerDashboard } from "./pages/worker/WorkerDashboard";
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";

function Dashboard() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "worker") return <WorkerDashboard />;
  if (user.role === "company") return <CompanyDashboard />;
  if (user.role === "admin") return <AdminDashboard />;
  return <Navigate to="/" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<JobsList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
