import { useMemo, useState } from "react";
import { api } from "../lib/api";
import { Spinner, StarInput, ErrorText } from "./ui";
import { RATING_CRITERIA, BADGES, REHIRE_OPTIONS, RECOMMENDATION_TEMPLATE } from "../lib/constants";

export function RecommendationForm({
  offerId,
  workerName,
  onClose,
  onDone,
}: {
  offerId: string;
  workerName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(RATING_CRITERIA.map((c) => [c.key, 0]))
  );
  const [badges, setBadges] = useState<string[]>([]);
  const [rehire, setRehire] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const avg = useMemo(() => {
    const vals = Object.values(scores).filter((v) => v >= 1);
    return vals.length ? vals.reduce((a, v) => a + v, 0) / vals.length : 0;
  }, [scores]);

  const setScore = (k: string, v: number) => setScores((s) => ({ ...s, [k]: v }));
  const toggleBadge = (b: string) =>
    setBadges((arr) => (arr.includes(b) ? arr.filter((x) => x !== b) : [...arr, b]));

  const submit = async () => {
    if (avg < 1) {
      setError("الرجاء تعبئة التقييم السريع أولاً.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api.post("/ratings", { offer_id: offerId, criteria: scores, badges, rehire, comment });
      onDone();
    } catch (e: any) {
      setError(e?.message || "تعذّر إرسال التوصية.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-soft px-6 py-4">
          <h3 className="text-lg font-extrabold text-brand-darkest">شهادة توصية لـ {workerName}</h3>
          <button onClick={onClose} aria-label="إغلاق" className="text-brand hover:text-brand-darkest">✕</button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <ErrorText>{error}</ErrorText>

          {/* 1) Quick rating */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-bold text-brand-darkest">تقييم سريع</h4>
              {avg > 0 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-700">
                  المتوسط {avg.toFixed(1)} / 5
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              {RATING_CRITERIA.map((cr) => (
                <div key={cr.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-brand-dark">{cr.label}</span>
                  <StarInput value={scores[cr.key]} onChange={(v) => setScore(cr.key, v)} />
                </div>
              ))}
            </div>
          </section>

          {/* 2) Rehire */}
          <section>
            <h4 className="mb-3 font-bold text-brand-darkest">هل توصي بتوظيفه مرة أخرى؟</h4>
            <div className="flex flex-wrap gap-2">
              {REHIRE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setRehire(o.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                    rehire === o.value ? "bg-brand-dark text-white" : "bg-brand-soft text-brand-dark hover:bg-brand-light"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* 3) Badges */}
          <section>
            <h4 className="mb-3 font-bold text-brand-darkest">الأوسمة</h4>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBadge(b)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    badges.includes(b)
                      ? "bg-brand-dark text-white"
                      : "border border-brand-soft bg-white text-brand-dark hover:bg-brand-bg"
                  }`}
                >
                  🏆 {b}
                </button>
              ))}
            </div>
          </section>

          {/* 4) Written recommendation */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-bold text-brand-darkest">توصية مكتوبة</h4>
              <button
                type="button"
                onClick={() => setComment(RECOMMENDATION_TEMPLATE)}
                className="text-xs font-bold text-brand-dark hover:underline"
              >
                استخدم النموذج الجاهز
              </button>
            </div>
            <textarea
              className="input"
              rows={4}
              placeholder="اكتب توصيتك عن أداء الشخص..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </section>
        </div>

        <div className="flex gap-2 border-t border-brand-soft px-6 py-4">
          <button className="btn-primary flex-1 justify-center" onClick={submit} disabled={busy}>
            {busy ? <Spinner /> : "نشر التوصية"}
          </button>
          <button className="btn-ghost" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
