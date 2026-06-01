import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { EmptyState, Spinner } from "./ui";
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

export function MessagesPanel({ onChanged }: { onChanged?: () => void }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const loadThreads = () =>
    api.get<{ threads: Thread[] }>("/messages/threads").then((r) => {
      setThreads(r.threads);
      return r.threads;
    });

  useEffect(() => {
    loadThreads()
      .then((t) => {
        if (t.length && !active) setActive(t[0].offer_id);
      })
      .finally(() => setLoading(false));
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
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      {/* Thread list */}
      <div className="space-y-2">
        {threads.map((t) => (
          <button
            key={t.offer_id}
            onClick={() => setActive(t.offer_id)}
            className={`w-full rounded-xl border p-3 text-right transition-colors cursor-pointer ${
              active === t.offer_id ? "border-brand-dark bg-brand-soft" : "border-brand-soft bg-white hover:bg-brand-bg"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-darkest">{otherName(t)}</span>
              {t.unread > 0 && (
                <span className="rounded-full bg-brand-dark px-1.5 text-xs text-white">{t.unread}</span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-brand">{t.last_body || "—"}</p>
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div className="flex h-[60vh] flex-col rounded-2xl bg-white shadow-sm ring-1 ring-brand-soft">
        {activeThread && (
          <div className="flex items-center gap-2 border-b border-brand-soft px-4 py-3">
            {user?.role === "company" ? (
              <button
                type="button"
                onClick={() => setProfileId(activeThread.worker_user_id)}
                className="font-bold text-brand-darkest hover:text-brand-dark hover:underline"
              >
                {otherName(activeThread)}
              </button>
            ) : (
              <Link
                to={`/companies/${activeThread.company_user_id}`}
                className="font-bold text-brand-darkest hover:text-brand-dark hover:underline"
              >
                {otherName(activeThread)}
              </Link>
            )}
          </div>
        )}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((m) => {
            const mine = m.sender_user_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    mine ? "bg-brand-dark text-white" : "bg-brand-bg text-brand-darkest"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-brand-soft p-3">
          <input
            className="input flex-1"
            placeholder="اكتب رسالة..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="btn-primary" disabled={sending || !body.trim()}>
            {sending ? <Spinner /> : "إرسال"}
          </button>
        </form>
      </div>

      {profileId && <WorkerProfileModal workerId={profileId} onClose={() => setProfileId(null)} />}
    </div>
  );
}
