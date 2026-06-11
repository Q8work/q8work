import type { ReactNode } from "react";

// Consistent gradient page header band used across directory pages.
export function PageHeader({
  title,
  subtitle,
  badge,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-l from-brand-dark to-[#6c83ff] px-6 py-10 text-white sm:px-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-white/80">{subtitle}</p>}
          {badge && (
            <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-bold backdrop-blur">
              {badge}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
