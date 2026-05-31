// Q8Work — text wordmark (Space Grotesk), with an orange "8" accent.
export function Logo({ light = false, withText = true }: { light?: boolean; withText?: boolean }) {
  return (
    <span className="inline-flex flex-col leading-none">
      <span className={`font-logo text-[26px] font-bold tracking-tight ${light ? "text-white" : "text-brand-darkest"}`} data-latin>
        Q<span className="text-gold">8</span>Work
      </span>
      {withText && (
        <span className={`mt-1 text-[10px] font-semibold ${light ? "text-white/70" : "text-brand"}`}>
          العمل الجزئي للكويتيين
        </span>
      )}
    </span>
  );
}
