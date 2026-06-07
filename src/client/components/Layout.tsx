import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "../lib/auth";

function NavItem({ to, children, end, onClick }: { to: string; children: ReactNode; end?: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
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
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Return to the current page after auth (except from the auth pages themselves).
  const here = location.pathname + location.search;
  const ret = ["/login", "/register"].includes(location.pathname) ? "" : `?redirect=${encodeURIComponent(here)}`;
  const loginTo = `/login${ret}`;
  const registerTo = `/register${ret}`;

  const onLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  const links = (
    <>
      <NavItem to="/" end onClick={() => setOpen(false)}>الرئيسية</NavItem>
      <NavItem to="/jobs" onClick={() => setOpen(false)}>فرص العمل</NavItem>
      <NavItem to="/companies" onClick={() => setOpen(false)}>الشركات</NavItem>
      <NavItem to="/talents" onClick={() => setOpen(false)}>المواهب</NavItem>
      <NavItem to="/about" onClick={() => setOpen(false)}>من نحن</NavItem>
      <NavItem to="/contact" onClick={() => setOpen(false)}>تواصل معنا</NavItem>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-brand-soft bg-white/95 backdrop-blur">
      <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#030D4F,#1F6FEB,#10B5A4,#FFC52C,#FB0C06)" }} />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" onClick={() => setOpen(false)}><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {(user.role === "worker" || user.role === "company") && <NotificationBell />}
              <Link to="/app" className="btn-ghost">لوحتي</Link>
              <button onClick={onLogout} className="btn-secondary">خروج</button>
            </>
          ) : (
            <>
              <Link to={loginTo} className="btn-ghost hidden sm:inline-flex">دخول</Link>
              <Link to={registerTo} className="btn-primary hidden sm:inline-flex">إنشاء حساب</Link>
            </>
          )}
          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
            aria-expanded={open}
            className="btn-ghost px-2 md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-brand-soft bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {links}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-brand-soft pt-3">
                <Link to={loginTo} onClick={() => setOpen(false)} className="btn-secondary justify-center">دخول</Link>
                <Link to={registerTo} onClick={() => setOpen(false)} className="btn-primary justify-center">إنشاء حساب</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-extrabold text-brand-darkest">{title}</h4>
      <ul className="space-y-2 text-sm text-brand">{children}</ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-soft bg-[#f8f9fa] text-brand">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-brand">
            منصة كويتية تربط الباحثين عن فرص مرنة بأصحاب العمل بمرونة واحترافية.
          </p>
        </div>
        <FooterCol title="روابط سريعة">
          <li><Link to="/" className="hover:text-brand-dark">الرئيسية</Link></li>
          <li><Link to="/jobs" className="hover:text-brand-dark">فرص العمل</Link></li>
          <li><Link to="/companies" className="hover:text-brand-dark">الشركات</Link></li>
          <li><Link to="/about" className="hover:text-brand-dark">من نحن</Link></li>
          <li><Link to="/register" className="hover:text-brand-dark">إنشاء حساب</Link></li>
          <li><Link to="/login" className="hover:text-brand-dark">تسجيل الدخول</Link></li>
        </FooterCol>
        <FooterCol title="للباحثين والشركات">
          <li><Link to="/register" className="hover:text-brand-dark">سجّل كباحث عن فرص</Link></li>
          <li><Link to="/register" className="hover:text-brand-dark">سجّل كشركة</Link></li>
          <li><Link to="/jobs" className="hover:text-brand-dark">تصفّح الفرص</Link></li>
        </FooterCol>
        <FooterCol title="تواصل معنا">
          <li><Link to="/contact" className="hover:text-brand-dark">صفحة التواصل</Link></li>
          <li data-latin>info@q8work.com</li>
        </FooterCol>
      </div>
      <div className="border-t border-brand-soft">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-brand">
          <span data-latin>© 2026 Q8Work</span> · جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children, wide = false, bare = false }: { children: ReactNode; wide?: boolean; bare?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={bare ? "w-full flex-1" : `mx-auto w-full flex-1 px-4 py-8 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
