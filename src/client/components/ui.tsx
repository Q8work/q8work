import type { ReactNode } from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-soft border-t-brand-dark ${className}`}
      aria-label="جارٍ التحميل"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function StarRating({ value, count }: { value?: number | null; count?: number }) {
  const v = value ?? 0;
  return (
    <span className="inline-flex items-center gap-1 text-sm" title={`${v} من 5`}>
      <span className="text-amber-500">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i}>{i <= Math.round(v) ? "★" : "☆"}</span>
        ))}
      </span>
      {value != null && <span className="font-bold text-brand-darkest">{v}</span>}
      {count != null && <span className="text-brand">({count})</span>}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`cursor-pointer transition-transform hover:scale-110 ${i <= value ? "text-amber-500" : "text-brand-light"}`}
          aria-label={`${i} نجوم`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`badge ${className}`}>{children}</span>;
}

export function VerifiedBadge({ verified }: { verified?: number | boolean }) {
  return verified ? (
    <Badge className="bg-emerald-100 text-emerald-800">✓ موثّق</Badge>
  ) : (
    <Badge className="bg-amber-100 text-amber-800">غير موثّق</Badge>
  );
}

// Inline verification tick — shown right next to a company name everywhere.
export function VerifiedTick({
  verified,
  size = 16,
  className = "",
}: {
  verified?: number | boolean;
  size?: number;
  className?: string;
}) {
  if (!verified) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label="موثّق"
      className={`inline-block shrink-0 align-middle ${className}`}
    >
      <title>موثّق</title>
      <circle cx="12" cy="12" r="10" fill="#3b5bfd" />
      <path
        d="M7.8 12.4l2.7 2.7 5.7-6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-light bg-white/50 p-10 text-center">
      <p className="font-bold text-brand-dark">{title}</p>
      {hint && <p className="mt-1 text-sm text-brand">{hint}</p>}
    </div>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{children}</p>;
}

export function Avatar({ src, name, size = 44 }: { src?: string; name?: string; size?: number }) {
  const initial = (name || "؟").trim().charAt(0);
  return src ? (
    <img
      src={src}
      alt={name || ""}
      style={{ width: size, height: size }}
      className="rounded-full object-cover ring-1 ring-brand-soft"
    />
  ) : (
    <span
      style={{ width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full bg-brand-soft font-bold text-brand-dark"
    >
      {initial}
    </span>
  );
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; badge?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-brand-soft">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
            active === t.id ? "bg-brand-dark text-white" : "text-brand-dark hover:bg-brand-soft"
          }`}
        >
          {t.label}
          {t.badge ? (
            <span className={`rounded-full px-1.5 text-xs ${active === t.id ? "bg-white/25" : "bg-brand-soft"}`}>
              {t.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
