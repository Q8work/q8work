import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Avatar, EmptyState, Spinner } from "./ui";
import { useAuth } from "../lib/auth";
import { WorkerProfileModal } from "./WorkerProfileModal";

interface Thread {
  offer_id: string;
  status: string;
  company_user_id: string;
  worker_user_id: string;
  company_name: string;
  worker_name: string;
  last_body: string | null;
  last_at: number | null;
  unread: number;
}

interface Message {
  id: string;
  sender_user_id: string;
  recipient_user_id: string;
  body: string;
  created_at: number;
}

const fmtTime = (ms?: number | null) =>
  ms ? new Intl.DateTimeFormat("ar-KW-u-nu-latn", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(ms)) : "";
const fmtDay = (ms?: number | null) =>
  ms ? new Intl.DateTimeFormat("ar-KW-u-nu-latn", { day: "numeric", month: "short" }).format(new Date(ms)) : "";

export function MessagesPanel({ onChanged }: { onChanged?: () => void }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [showConvo, setShowConvo] = useState(false); // mobile: list vs conversation
  const endRef = useRef<HTMLDivElement>(null);

  const loadThreads = () =>
    api.get<{ threads: Thread[] }>("/messages/threads").then((r) => {
      setThreads(r.threads);
      return r.threads;
    });

  useEffect(() => {
    loadThreads().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    api.get<{ messages: Message[] }>(`/messages/${active}`).then((r) => {
      setMessages(r.messages);
      loadThreads();
      onChanged?.();
    });
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const open = (id: string) => { setActive(id); setShowConvo(true); };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !body.trim()) return;
    setSending(true);
    try {
      await api.post(`/messages/${active}`, { body });
      setBody("");
      const r = await api.get<{ messages: Message[] }>(`/messages/${active}`);
      setMessages(r.messages);
      loadThreads();
    } finally {
      setSending(false);
    }
  };

  const otherName = (t: Thread) => (user?.role === "company" ? t.worker_name : t.company_name) || "مستخدم";
  const activeThread = threads.find((t) => t.offer_id === active);

  if (loading) return <div className="py-10 text-center"><Spinner /></div>;
  if (threads.length === 0)
    return <EmptyState title="لا توجد محادثات بعد" hint="تبدأ المحادثة عند إرسال أو استقبال عرض عمل." />;

  return (
    <div className="grid h-[68vh] overflow-hidden rounded-2xl bg-white ring-1 ring-brand-soft md:grid-cols-[320px_1fr]">
      {/* Thread list */}
      <aside className={`flex-col border-l border-brand-soft ${showConvo ? "hidden md:flex" : "flex"}`}>
        <div className="border-b border-brand-soft px-4 py-3 text-base font-extrabold text-brand-darkest">الرسائل</div>
        <div className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <button
              key={t.offer_id}
              onClick={() => open(t.offer_id)}
              className={`flex w-full items-center gap-3 border-b border-brand-soft px-4 py-3 text-right transition-colors ${
                active === t.offer_id ? "bg-brand-soft" : "hover:bg-brand-bg"
              }`}
            >
              <Avatar name={otherName(t)} size={44} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold text-brand-darkest">{otherName(t)}</span>
                  <span className="shrink-0 text-[11px] text-brand">{fmtDay(t.last_at)}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-brand">{t.last_body || "—"}</span>
                  {t.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-brand-dark px-1.5 text-[11px] font-bold text-white">
                      {t.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <section className={`flex-col ${showConvo ? "flex" : "hidden md:flex"}`}>
        {activeThread ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-brand-soft px-4 py-3">
              <button onClick={() => setShowConvo(false)} className="md:hidden text-brand-dark" aria-label="رجوع">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <Avatar name={otherName(activeThread)} size={40} />
              {user?.role === "company" ? (
                <button type="button" onClick={() => setProfileId(activeThread.worker_user_id)} className="font-extrabold text-brand-darkest hover:text-brand-dark hover:underline">
                  {otherName(activeThread)}
                </button>
              ) : (
                <Link to={`/companies/${activeThread.company_user_id}`} className="font-extrabold text-brand-darkest hover:text-brand-dark hover:underline">
                  {otherName(activeThread)}
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-1 overflow-y-auto bg-brand-bg px-4 py-4">
              {messages.map((m) => {
                const mine = m.sender_user_id === user?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${mine ? "items-start" : "items-end"}`}>
                    <div
                      className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                        mine ? "rounded-bl-md bg-brand-dark text-white" : "rounded-br-md bg-white text-brand-darkest ring-1 ring-brand-soft"
                      }`}
                    >
                      {m.body}
                    </div>
                    <span className="mt-1 px-1 text-[11px] text-brand">{fmtTime(m.created_at)}</span>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <form onSubmit={send} className="flex items-center gap-2 border-t border-brand-soft p-3">
              <input
                className="flex-1 rounded-full bg-brand-soft px-4 py-2.5 text-sm text-brand-darkest placeholder:text-brand/70 focus:outline-none focus:ring-2 focus:ring-brand-dark"
                placeholder="اكتب رسالة..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                aria-label="إرسال"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white transition-colors hover:bg-[#2c46e0] disabled:opacity-40"
              >
                {sending ? <Spinner /> : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center text-center text-brand md:flex">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <p className="mt-3 text-sm font-semibold">اختر محادثة لعرض الرسائل</p>
          </div>
        )}
      </section>

      {profileId && <WorkerProfileModal workerId={profileId} onClose={() => setProfileId(null)} />}
    </div>
  );
}
