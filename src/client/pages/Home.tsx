import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { LogoMark } from "../components/Logo";
import { useAuth } from "../lib/auth";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-brand-darkest">{value}</div>
      <div className="text-sm font-semibold text-brand">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-lg font-extrabold text-white">
        {n}
      </div>
      <h3 className="text-lg font-bold text-brand-darkest">{title}</h3>
      <p className="mt-1 text-sm text-brand-dark">{body}</p>
    </div>
  );
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <Layout wide>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-darkest px-6 py-16 text-center text-white">
        <div className="pointer-events-none absolute -left-10 -top-10 text-brand-dark/40">
          <LogoMark size={200} />
        </div>
        <div className="relative mx-auto max-w-2xl">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            اشتغل بشروطك واختار ساعاتك
          </h1>
          <p className="mt-4 text-lg text-brand-soft">
            منصة الكويتيين للعمل الجزئي — نربط الباحثين عن دخل إضافي بأصحاب العمل بمرونة وبدون تعقيدات العقود.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/jobs${q ? `?q=${encodeURIComponent(q)}` : ""}`);
            }}
            className="mx-auto mt-8 flex max-w-lg gap-2 rounded-2xl bg-white p-2 shadow-lg"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن وظيفة... مبيعات، كاشير، تسويق"
              className="flex-1 bg-transparent px-3 text-sm text-brand-darkest placeholder:text-brand focus:outline-none"
            />
            <button type="submit" className="btn-primary">
              ابحث
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link to="/app" className="btn-secondary">
                الذهاب إلى لوحتي
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-secondary">
                  سجّل كباحث عن عمل
                </Link>
                <Link to="/register" className="btn-ghost text-white hover:bg-white/10">
                  سجّل كشركة
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-soft">
        <Stat value="مجاناً" label="التسجيل للطرفين" />
        <Stat value="٦ مناطق" label="تغطية كامل الكويت" />
        <Stat value="كويتي ١٠٠٪" label="كفاءات وطنية" />
      </section>

      {/* How it works */}
      <section className="mt-14">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-brand-darkest">كيف تعمل المنصة؟</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Step n="١" title="سجّل ملفك" body="أنشئ بروفايلك، حدد مهاراتك وأوقات توفرك ونوع العمل المفضل." />
          <Step n="٢" title="استقبل العروض" body="تصلك عروض العمل من الشركات مباشرة، اقبل أو ارفض بضغطة واحدة." />
          <Step n="٣" title="اعمل وقيّم" body="تواصل عبر الرسائل، أنجز العمل، وتبادل التقييمات لبناء سمعتك." />
        </div>
      </section>

      {/* Audience */}
      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h3 className="text-xl font-bold text-brand-darkest">للكويتي الباحث عن دخل إضافي</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-dark">
            <li>• طلاب جامعيون يبحثون عن دخل بعد الدوام</li>
            <li>• موظفون متاحون بعد ساعات العمل الرسمية</li>
            <li>• خريجون يبحثون عن فرص مؤقتة لبناء الخبرة</li>
          </ul>
        </div>
        <div className="card">
          <h3 className="text-xl font-bold text-brand-darkest">للشركة صاحبة العمل</h3>
          <ul className="mt-3 space-y-2 text-sm text-brand-dark">
            <li>• مطاعم وكافيهات تحتاج كاشير أو موظف استقبال</li>
            <li>• شركات تحتاج تكويت نسبة موظفين لمشروع</li>
            <li>• فعاليات ومؤتمرات تحتاج موظفين ليوم أو أسبوع</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-3xl bg-brand-soft px-6 py-10 text-center">
        <h2 className="text-2xl font-extrabold text-brand-darkest">جاهز تبدأ؟</h2>
        <p className="mt-2 text-brand-dark">انضم اليوم — التسجيل مجاني بالكامل في المرحلة الأولى.</p>
        <Link to={user ? "/app" : "/register"} className="btn-primary mt-5">
          ابدأ الآن
        </Link>
      </section>
    </Layout>
  );
}
