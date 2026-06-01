import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

const VALUES = [
  "الموثوقية والشفافية",
  "دعم الكفاءات الوطنية",
  "المرونة في العمل",
  "سهولة الوصول إلى الفرص",
  "تعزيز الإنتاجية والاستفادة من المهارات",
];

const WHY = [
  "منصة كويتية صُممت لتلبية احتياجات سوق العمل المحلي.",
  "فرص عمل مرنة تناسب مختلف الفئات.",
  "سهولة الوصول إلى الفرص والتقديم عليها.",
  "تمكين الشركات من الوصول إلى الكفاءات المناسبة بسرعة.",
  "بيئة رقمية موثوقة تجمع بين أصحاب الفرص والباحثين عنها.",
];

function Check() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

export function About() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-4xl font-extrabold leading-tight text-brand-darkest sm:text-5xl">من نحن</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand">
            منصة كويتية للعمل المرن تربط الكفاءات بالفرص
          </p>
        </section>

        {/* Who we are */}
        <section className="card mt-12 space-y-4 leading-relaxed text-brand-dark">
          <h2 className="text-2xl font-extrabold text-brand-darkest">من نحن؟</h2>
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
        </section>

        {/* Vision & Mission */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="card">
            <h2 className="text-xl font-extrabold text-brand-darkest">رؤيتنا</h2>
            <p className="mt-3 leading-relaxed text-brand-dark">
              أن نكون المنصة الرائدة في الكويت للعمل المرن، وأن نساهم في بناء بيئة عمل حديثة تتيح للأفراد
              فرصاً أكبر لتحقيق دخل إضافي، وتمكّن الشركات من الوصول إلى الكفاءات بسهولة وسرعة.
            </p>
          </div>
          <div className="card">
            <h2 className="text-xl font-extrabold text-brand-darkest">رسالتنا</h2>
            <p className="mt-3 leading-relaxed text-brand-dark">
              تمكين الأفراد من تحويل مهاراتهم وأوقاتهم إلى فرص حقيقية، وتوفير منصة موثوقة تجمع بين أصحاب
              الفرص والكفاءات في بيئة احترافية وآمنة.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="card mt-6">
          <h2 className="text-2xl font-extrabold text-brand-darkest">قيمنا</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v} className="flex items-center gap-3 rounded-2xl bg-brand-soft p-4">
                <Check />
                <span className="font-bold text-brand-darkest">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why Q8Work */}
        <section className="card mt-6">
          <h2 className="text-2xl font-extrabold text-brand-darkest">
            لماذا <span data-latin>Q8Work</span>؟
          </h2>
          <ul className="mt-4 space-y-3">
            {WHY.map((w) => (
              <li key={w} className="flex items-start gap-3">
                <Check />
                <span className="pt-1 leading-relaxed text-brand-dark">{w}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing statement */}
        <section className="mt-10 rounded-3xl bg-brand-soft px-6 py-10 text-center">
          <p className="mx-auto max-w-2xl text-lg font-semibold leading-relaxed text-brand-darkest">
            في <span data-latin>Q8Work</span> نؤمن بأن الفرص لا يجب أن تكون مرتبطة بمكان أو وقت محدد،
            بل يجب أن تكون متاحة لكل من يمتلك الرغبة والمهارة لتحقيق طموحه وزيادة دخله.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-10 rounded-3xl bg-brand-dark px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-extrabold sm:text-3xl">جاهز تبدأ معنا؟</h2>
          <p className="mt-2 text-white/70">انضم اليوم واكتشف الفرص المرنة التي تناسبك.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-brand-darkest hover:bg-white/90">أنشئ حساباً</Link>
            <Link to="/jobs" className="inline-flex rounded-lg border border-white/40 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/10">استكشف الفرص</Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
