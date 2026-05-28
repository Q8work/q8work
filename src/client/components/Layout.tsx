import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../lib/auth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-soft bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/jobs" className="btn-ghost hidden sm:inline-flex">
            الوظائف
          </Link>
          {user ? (
            <>
              <Link to="/app" className="btn-ghost">
                لوحتي
              </Link>
              <button onClick={onLogout} className="btn-secondary">
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                دخول
              </Link>
              <Link to="/register" className="btn-primary">
                إنشاء حساب
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-soft bg-brand-darkest text-brand-soft">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm">
        <Logo light />
        <p className="mt-2">منصة الكويتيين للعمل الجزئي · اشتغل بشروطك واختار ساعاتك</p>
        <p className="text-brand-light">q8work.com · info@q8work.com</p>
        <p className="text-xs text-brand-light/70">© 2025 Q8Work · جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}

export function Layout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`mx-auto w-full flex-1 px-4 py-8 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>{children}</main>
      <Footer />
    </div>
  );
}
