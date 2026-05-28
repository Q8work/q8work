// Compass (الفرجار) inspired mark — precision of matching workers to employers.
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      {/* hinge */}
      <circle cx="24" cy="9" r="4" fill="currentColor" />
      {/* two legs of the compass */}
      <path
        d="M24 11 L13 39"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M24 11 L35 39"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* pencil tip */}
      <path d="M35 39 l3 4 -5 -1 z" fill="currentColor" />
      {/* arc */}
      <path
        d="M14 30 A12 12 0 0 0 34 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function Logo({ light = false, withText = true }: { light?: boolean; withText?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${light ? "text-white" : "text-brand-darkest"}`}>
      <LogoMark size={30} />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-tight">Q8Work</span>
          <span className={`text-[10px] font-semibold ${light ? "text-brand-soft" : "text-brand"}`}>
            العمل الجزئي للكويتيين
          </span>
        </span>
      )}
    </span>
  );
}
