// Q8Work logo mark — inspired by the Kuwait Towers.
export function LogoMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="q8-sphere" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="q8-sphere-sm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      {/* Secondary tower */}
      <rect x="13" y="17" width="4" height="29" rx="2" fill="currentColor" opacity="0.85" />
      <path d="M15 9 L17.5 17 H12.5 Z" fill="currentColor" opacity="0.85" />
      <circle cx="15" cy="25" r="7.5" fill="url(#q8-sphere-sm)" />

      {/* Main tower */}
      <rect x="27" y="9" width="5" height="37" rx="2.5" fill="currentColor" />
      <path d="M29.5 1 L33 9 H26 Z" fill="currentColor" />
      <circle cx="29.5" cy="31" r="11" fill="url(#q8-sphere)" />
      <circle cx="29.5" cy="15.5" r="5.5" fill="url(#q8-sphere-sm)" />
      <path d="M20 31 a9.5 9.5 0 0 0 19 0" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

export function Logo({ light = false, withText = true }: { light?: boolean; withText?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${light ? "text-white" : "text-brand-darkest"}`}>
      <LogoMark size={34} />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-2xl font-extrabold tracking-tight" data-latin>
            Q8Work
          </span>
          <span className={`text-[10px] font-semibold ${light ? "text-white/70" : "text-brand"}`}>
            العمل الجزئي للكويتيين
          </span>
        </span>
      )}
    </span>
  );
}
