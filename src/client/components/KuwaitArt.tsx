// Custom Kuwait-themed illustrations (SVG) — no external assets, fully scalable.

/** The iconic Kuwait Towers. */
export function KuwaitTowers({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="أبراج الكويت">
      <defs>
        <linearGradient id="sphere" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="sphereSm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      {/* Third tower — thin needle */}
      <rect x="54" y="96" width="6" height="150" rx="3" fill="#cbd5e1" />
      <path d="M57 70 L60 96 H54 Z" fill="#94a3b8" />

      {/* Second tower — one sphere */}
      <rect x="92" y="78" width="9" height="168" rx="4" fill="#e2e8f0" />
      <circle cx="96.5" cy="120" r="24" fill="url(#sphereSm)" />
      <path d="M96.5 56 L101 78 H92 Z" fill="#94a3b8" />

      {/* Main tower — two spheres + spire */}
      <rect x="150" y="44" width="12" height="202" rx="5" fill="#f1f5f9" />
      <circle cx="156" cy="168" r="40" fill="url(#sphere)" />
      <circle cx="156" cy="92" r="20" fill="url(#sphereSm)" />
      {/* sphere tile bands */}
      <path d="M120 168 a36 36 0 0 0 72 0" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="3" fill="none" />
      <path d="M126 150 h60" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M156 24 L162 44 H150 Z" fill="#64748b" />

      {/* Ground */}
      <rect x="0" y="246" width="240" height="6" rx="3" fill="#e2e8f0" />
    </svg>
  );
}

/** A soft city skyline silhouette for decorative bands. */
export function Skyline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 120" className={className} preserveAspectRatio="none" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M0 120 V70 h40 v-18 h26 v38 h30 V46 h34 v74 h40 V58 h28 v62 h44 V30 l16 -14 16 14 v90 h40 V64 h30 v56 h36 V48 h30 v72 h46 V72 h40 v-22 h24 v70 h34 V56 h32 v64 h44 V38 h28 v82 h40 V66 h30 v54 h40 V52 h26 v68 h44 V60 h34 v60 h40 V44 h30 v76 h60 V74 h40 v46 H0 Z" />
    </svg>
  );
}
