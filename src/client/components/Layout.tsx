import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../lib/auth";

function todayArabic(): string {
  try {
    return new Intl.DateTimeFormat("ar-KW-u-nu-latn", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
}

function SectionLink({ to, children, end }: { to: string; children: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
    >
      {children}
    </NavLink>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* Utility bar */}
      <div className="bg-brand-darkest text-brand-soft">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <span className="font-semibold">منصة الكويتيين للعمل الجزئي</span>
          <span className="hidden text-brand-light sm:inline">{todayArabic()}</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b border-brand-soft bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <button onClick={onLogout} className="btn-secondary">
                خروج
              </button>
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
      </div>

      {/* Section navigation */}
      <div className="border-b border-brand-soft bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4">
          <SectionLink to="/" end>
            الرئيسية
          </SectionLink>
          <SectionLink to="/jobs">فرص العمل</SectionLink>
          {user && <SectionLink to="/app">لوحتي</SectionLink>}
        </div>
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
        <p className="text-brand-light" data-latin>q8work.com · info@q8work.com</p>
        <p className="text-xs text-brand-light/70">
          <span data-latin>© 2025 Q8Work</span> · جميع الحقوق محفوظة
        </p>
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
