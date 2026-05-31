// Q8Work logo mark — an app-badge with the Kuwait Towers in the brand colors.
export function LogoMark({ size = 38, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="q8-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a6684" />
          <stop offset="1" stopColor="#60a9dc" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#q8-badge)" />

      {/* secondary tower */}
      <rect x="14.4" y="21" width="3" height="17" rx="1.5" fill="#ffffff" opacity="0.9" />
      <path d="M15.9 15 L17.4 21 H14.4 Z" fill="#ffffff" opacity="0.9" />
      <circle cx="15.9" cy="25" r="3.9" fill="#ffdd63" />

      {/* main tower */}
      <rect x="28" y="13" width="4" height="25" rx="2" fill="#ffffff" />
      <path d="M30 7 L33 13 H27 Z" fill="#ffffff" />
      <circle cx="30" cy="27.5" r="6.6" fill="#ffffff" />
      <circle cx="30" cy="16.5" r="3.2" fill="#ff9b65" />
    </svg>
  );
}

export function Logo({ light = false, withText = true }: { light?: boolean; withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={38} />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className={`text-2xl font-extrabold tracking-tight ${light ? "text-white" : "text-brand-darkest"}`} data-latin>
            Q8Work
          </span>
          <span className={`mt-0.5 text-[10px] font-semibold ${light ? "text-white/70" : "text-brand"}`}>
            العمل الجزئي للكويتيين
          </span>
        </span>
      )}
    </span>
  );
}
