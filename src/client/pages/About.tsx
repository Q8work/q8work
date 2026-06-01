import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function About() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-4xl font-extrabold leading-tight text-brand-darkest sm:text-5xl">
            من نحن
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand">
            {/* TODO: استبدل هذا النص بالتعريف المختصر عن المنصة */}
            نص تعريفي مختصر عن المنصة يُكتب هنا.
          </p>
        </section>

        {/* Intro / story */}
        <section className="card mt-12">
          <h2 className="text-2xl font-extrabold text-brand-darkest">قصتنا</h2>
          <p className="mt-3 leading-relaxed text-brand-dark">
            {/* TODO: استبدل بنص قصة المنصة */}
            نص يُكتب هنا.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="card">
            <h2 className="text-xl font-extrabold text-brand-darkest">رسالتنا</h2>
            <p className="mt-3 leading-relaxed text-brand-dark">
              {/* TODO: رسالة المنصة */}
              نص يُكتب هنا.
            </p>
          </div>
          <div className="card">
            <h2 className="text-xl font-extrabold text-brand-darkest">رؤيتنا</h2>
            <p className="mt-3 leading-relaxed text-brand-dark">
              {/* TODO: رؤية المنصة */}
              نص يُكتب هنا.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="card mt-6">
          <h2 className="text-2xl font-extrabold text-brand-darkest">قيمنا</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              { title: "عنوان القيمة", body: "وصف مختصر." },
              { title: "عنوان القيمة", body: "وصف مختصر." },
              { title: "عنوان القيمة", body: "وصف مختصر." },
              { title: "عنوان القيمة", body: "وصف مختصر." },
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl bg-brand-soft p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-dark text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </span>
                <div>
                  <h3 className="font-bold text-brand-darkest">{v.title}</h3>
                  <p className="mt-1 text-sm text-brand-dark">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
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
