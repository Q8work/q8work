import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

const VALUES = [
  { t: "الموثوقية والشفافية", d: "تعامل واضح وآمن بين جميع الأطراف." },
  { t: "دعم الكفاءات الوطنية", d: "تمكين الكويتيين من فرص حقيقية." },
  { t: "المرونة في العمل", d: "فرص تناسب وقتك وظروفك." },
  { t: "سهولة الوصول للفرص", d: "تجربة سلسة من البحث حتى التقديم." },
  { t: "الاستفادة من المهارات", d: "تحويل المهارات إلى دخل وإنتاجية." },
];

const WHY = [
  "منصة كويتية صُممت لتلبية احتياجات سوق العمل المحلي.",
  "فرص عمل مرنة تناسب مختلف الفئات.",
  "سهولة الوصول إلى الفرص والتقديم عليها.",
  "تمكين الشركات من الوصول إلى الكفاءات المناسبة بسرعة.",
  "بيئة رقمية موثوقة تجمع بين أصحاب الفرص والباحثين عنها.",
];

const STATS = [
  { v: "+100", l: "فرصة" },
  { v: "+50", l: "شركة" },
  { v: "+500", l: "مستخدم" },
];

function Check({ className = "" }: { className?: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5" /></svg>;
}
function IconEye() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function IconTarget() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand-dark">{children}</span>;
}

export function About() {
  return (
    <Layout wide>
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-brand-dark to-[#6c83ff] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold backdrop-blur">
            تعرّف علينا
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">من نحن</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/80">
            منصة كويتية للعمل المرن تربط الكفاءات بالفرص
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 py-5 backdrop-blur">
                <div className="text-3xl font-extrabold sm:text-4xl" data-latin>{s.v}</div>
                <div className="mt-1 text-sm font-semibold text-white/70">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Who we are */}
        <section className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Eyebrow>قصتنا</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-brand-darkest sm:text-4xl">
              من نحن؟
            </h2>
            <span className="mt-4 block h-1 w-14 rounded-full bg-brand-dark" />
          </div>
          <div className="space-y-4 text-right leading-loose text-brand-dark md:col-span-2">
            <p>
              <span data-latin>Q8Work</span> منصة كويتية متخصصة في ربط الأفراد الباحثين عن فرص عمل مرنة
              بالشركات والمؤسسات التي تحتاج إلى كفاءات ومهارات لفترات محددة أو مشاريع مؤقتة.
            </p>
            <p>
              انطلقت فكرة <span data-latin>Q8Work</span> من إيماننا بأهمية توفير فرص دخل إضافي للكويتيين،
              وتمكينهم من الاستفادة من أوقاتهم ومهاراتهم وخبراتهم بطريقة مرنة تتناسب مع ظروفهم اليومية،
              سواء كانوا طلبة، موظفين، أو باحثين عن فرص جديدة لتطوير مهاراتهم وزيادة دخلهم.
            </p>
            <p>
              في المقابل، نوفر للشركات والمؤسسات حلاً عملياً وفعالاً للوصول إلى الكفاءات المناسبة عند الحاجة،
              دون تحمل التكاليف والالتزامات المرتبطة بالتوظيف التقليدي طويل الأمد، مما يساهم في رفع كفاءة
              الأعمال وتسريع تنفيذ المشاريع والمهام المختلفة.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-brand-soft bg-white p-8 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><IconEye /></span>
            <h3 className="mt-4 text-xl font-extrabold text-brand-darkest">رؤيتنا</h3>
            <p className="mt-3 leading-relaxed text-brand-dark">
              أن نكون المنصة الرائدة في الكويت للعمل المرن، وأن نساهم في بناء بيئة عمل حديثة تتيح للأفراد
              فرصاً أكبر لتحقيق دخل إضافي، وتمكّن الشركات من الوصول إلى الكفاءات بسهولة وسرعة.
            </p>
          </div>
          <div className="rounded-3xl border border-brand-soft bg-white p-8 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark"><IconTarget /></span>
            <h3 className="mt-4 text-xl font-extrabold text-brand-darkest">رسالتنا</h3>
            <p className="mt-3 leading-relaxed text-brand-dark">
              تمكين الأفراد من تحويل مهاراتهم وأوقاتهم إلى فرص حقيقية، وتوفير منصة موثوقة تجمع بين أصحاب
              الفرص والكفاءات في بيئة احترافية وآمنة.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mt-16 text-center">
          <Eyebrow>ما يميّزنا</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold text-brand-darkest sm:text-4xl">قيمنا</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.t} className="rounded-2xl border border-brand-soft bg-white p-6 text-right shadow-sm transition-shadow hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-white"><Check /></span>
                <h3 className="mt-4 font-extrabold text-brand-darkest">{v.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand">{v.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Q8Work */}
        <section className="mt-16 rounded-3xl bg-brand-soft p-8 sm:p-12">
          <h2 className="text-3xl font-extrabold text-brand-darkest sm:text-4xl">
            لماذا <span data-latin>Q8Work</span>؟
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {WHY.map((w) => (
              <div key={w} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white"><Check className="h-3.5 w-3.5" /></span>
                <span className="leading-relaxed text-brand-dark">{w}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Closing statement */}
        <section className="mt-16 text-center">
          <p className="mx-auto max-w-3xl text-2xl font-extrabold leading-relaxed text-brand-darkest sm:text-3xl">
            «في <span data-latin>Q8Work</span> نؤمن بأن الفرص لا يجب أن تكون مرتبطة بمكان أو وقت محدد،
            بل متاحة لكل من يمتلك الرغبة والمهارة لتحقيق طموحه وزيادة دخله.»
          </p>
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-3xl bg-brand-dark px-6 py-14 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">جاهز تبدأ معنا؟</h2>
          <p className="mt-2 text-white/70">انضم اليوم واكتشف الفرص المرنة التي تناسبك.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-darkest hover:bg-white/90">أنشئ حساباً</Link>
            <Link to="/jobs" className="inline-flex rounded-lg border border-white/40 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/10">استكشف الفرص</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
