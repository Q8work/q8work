import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "../lib/auth";

function NavItem({ to, children, end }: { to: string; children: ReactNode; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
          isActive ? "bg-brand-soft text-brand-darkest" : "text-brand-dark hover:bg-brand-bg"
        }`
      }
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
    <header className="sticky top-0 z-40 border-b border-brand-soft bg-white/95 backdrop-blur">
      <div className="h-1 w-full bg-brand-darkest" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/" end>الرئيسية</NavItem>
            <NavItem to="/jobs">فرص العمل</NavItem>
            {user && <NavItem to="/app">لوحتي</NavItem>}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {(user.role === "worker" || user.role === "company") && <NotificationBell />}
              <Link to="/app" className="btn-ghost hidden sm:inline-flex">لوحتي</Link>
              <button onClick={onLogout} className="btn-secondary">خروج</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">دخول</Link>
              <Link to="/register" className="btn-primary">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-extrabold text-white">{title}</h4>
      <ul className="space-y-2 text-sm text-brand-light">{children}</ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 bg-brand-darkest text-brand-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand-light">
            منصة كويتية تربط الباحثين عن عمل جزئي بأصحاب العمل بمرونة واحترافية.
          </p>
        </div>
        <FooterCol title="روابط سريعة">
          <li><Link to="/" className="hover:text-white">الرئيسية</Link></li>
          <li><Link to="/jobs" className="hover:text-white">فرص العمل</Link></li>
          <li><Link to="/register" className="hover:text-white">إنشاء حساب</Link></li>
          <li><Link to="/login" className="hover:text-white">تسجيل الدخول</Link></li>
        </FooterCol>
        <FooterCol title="للباحثين والشركات">
          <li><Link to="/register" className="hover:text-white">سجّل كباحث عن عمل</Link></li>
          <li><Link to="/register" className="hover:text-white">سجّل كشركة</Link></li>
          <li><Link to="/jobs" className="hover:text-white">تصفّح الفرص</Link></li>
        </FooterCol>
        <FooterCol title="تواصل معنا">
          <li data-latin>q8work.com</li>
          <li data-latin>info@q8work.com</li>
        </FooterCol>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-brand-light/70">
          <span data-latin>© 2025 Q8Work</span> · جميع الحقوق محفوظة
        </div>
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
