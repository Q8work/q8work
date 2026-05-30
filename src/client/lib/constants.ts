// Shared option lists (Arabic-first) used across forms and filters.

export const SKILLS = [
  "مبيعات",
  "خدمة عملاء",
  "تسويق",
  "إدارة",
  "كاشير",
  "استقبال",
  "تنظيم فعاليات",
  "إدخال بيانات",
  "تصوير",
  "تصميم",
  "ترجمة",
  "توصيل",
  "دعم فني",
  "محاسبة",
];

// Kuwait governorates
export const AREAS = [
  "العاصمة",
  "حولي",
  "الفروانية",
  "الأحمدي",
  "الجهراء",
  "مبارك الكبير",
];

export const WORK_TYPES: { value: string; label: string }[] = [
  { value: "field", label: "ميداني" },
  { value: "office", label: "مكتبي" },
  { value: "remote", label: "عن بُعد" },
];

export const AVAILABILITY: { value: string; label: string }[] = [
  { value: "morning", label: "صباحاً" },
  { value: "evening", label: "مساءً" },
  { value: "weekend", label: "عطلة نهاية الأسبوع" },
];

export const COMMITMENTS: { value: string; label: string }[] = [
  { value: "daily", label: "يومي" },
  { value: "weekly", label: "أسبوعي" },
  { value: "project", label: "مشروع محدد" },
];

export const DURATIONS: { value: string; label: string }[] = [
  { value: "day", label: "يوم" },
  { value: "week", label: "أسبوع" },
  { value: "month", label: "شهر" },
  { value: "project", label: "مشروع" },
];

export const SECTORS = [
  "مطاعم وكافيهات",
  "تجزئة",
  "فعاليات ومؤتمرات",
  "تقنية",
  "خدمات",
  "تعليم",
  "صحة",
  "أخرى",
];

export function labelOf(list: { value: string; label: string }[], value?: string): string {
  return list.find((x) => x.value === value)?.label || value || "—";
}

export const OFFER_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "معلّق", cls: "bg-amber-100 text-amber-800" },
  accepted: { label: "مقبول", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "مرفوض", cls: "bg-red-100 text-red-700" },
  completed: { label: "مكتمل", cls: "bg-brand-soft text-brand-darkest" },
};

export const APPLICATION_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-800" },
  accepted: { label: "مقبول", cls: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "غير مناسب", cls: "bg-red-100 text-red-700" },
};
