// Convert Arabic-Indic / Eastern-Arabic digits to Latin (Western) digits for display.
export function toLatinDigits(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
