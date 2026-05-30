import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

interface NotiItem {
  type: string;
  label: string;
  count: number;
  tab: string;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<NotiItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => {
    api
      .get<{ total: number; items: NotiItem[] }>("/notifications")
      .then((r) => {
        setTotal(r.total);
        setItems(r.items);
      })
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Close the dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const go = (tab: string) => {
    setOpen(false);
    navigate(`/app?tab=${tab}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); refresh(); }}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-brand-dark hover:bg-brand-soft"
        aria-label="الإشعارات"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {total > 0 && (
          <span className="absolute -top-0.5 -left-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-[18px] text-white">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-lg border border-brand-soft bg-white shadow-xl">
          <div className="border-b border-brand-soft px-4 py-2.5 text-sm font-bold text-brand-darkest">الإشعارات</div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-brand">لا توجد إشعارات جديدة</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((it) => (
                <li key={it.type}>
                  <button
                    onClick={() => go(it.tab)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm hover:bg-brand-bg"
                  >
                    <span className="font-semibold text-brand-darkest">{it.label}</span>
                    <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-brand-soft px-1.5 text-xs font-bold text-brand-darkest">
                      {it.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
