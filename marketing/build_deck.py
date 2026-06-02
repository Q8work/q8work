#!/usr/bin/env python3
# Generates a brand-styled HTML deck (companies pitch) with embedded Thmanyah fonts.
import base64, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"
OUT = ROOT / "marketing" / "q8work-companies.html"

def b64(name):
    return base64.b64encode((FONTS / name).read_bytes()).decode()

faces = ""
for fname, weight in [
    ("thmanyahsans-Regular.woff2", 400),
    ("thmanyahsans-Medium.woff2", 500),
    ("thmanyahsans-Bold.woff2", 700),
    ("thmanyahsans-Black.woff2", 900),
]:
    faces += f"""
@font-face {{ font-family:'Thmanyah'; font-weight:{weight}; font-style:normal;
  src:url(data:font/woff2;base64,{b64(fname)}) format('woff2'); }}"""

GRAD = "linear-gradient(90deg,#030D4F,#1F6FEB,#10B5A4,#FFC52C,#FB0C06)"
BLUE = "#3b5bfd"
INK = "#0b0b0d"
GRAY = "#5b616e"
SOFT = "#eef0f2"

def slide(inner, cls=""):
    return f'<section class="slide {cls}"><div class="bar"></div>{inner}</section>'

def check_item(title, desc=""):
    d = f'<div class="bi-d">{desc}</div>' if desc else ""
    return f'<div class="bi"><span class="bi-c">✓</span><div><div class="bi-t">{title}</div>{d}</div></div>'

def step(n, title, desc):
    return f'<div class="step"><span class="step-n">{n}</span><div class="step-t">{title}</div><div class="step-d">{desc}</div></div>'

# ---- Slides ----
cover = slide(f"""
  <div class="cover">
    <div class="eyebrow light">عرض تعريفي للشركات</div>
    <div class="wordmark">Q8Work</div>
    <h1 class="cover-h">منصة الفرص المرنة في الكويت</h1>
    <p class="cover-p">وظّف الكفاءات عند الحاجة فقط — لفترات محددة ومشاريع مؤقتة، دون أعباء التوظيف التقليدي طويل الأمد.</p>
    <div class="cover-foot">q8work.com · info@q8work.com</div>
  </div>
""", "cover-slide")

problem = slide(f"""
  <div class="pad">
    <div class="eyebrow">التحدّي</div>
    <h2>التوظيف التقليدي لا يناسب كل احتياج</h2>
    <div class="grid2">
      {check_item("تكلفة والتزام دائم", "رواتب ومزايا وعقود طويلة حتى للمهام المؤقتة.")}
      {check_item("احتياجات موسمية ومشاريع", "ذروة مبيعات، فعاليات، أو مشروع لفترة محددة.")}
      {check_item("بطء الوصول للكفاءة", "إجراءات توظيف طويلة لإيجاد شخص لأيام أو أسابيع.")}
      {check_item("مرونة محدودة", "صعوبة توسيع أو تقليص الفريق حسب الحاجة.")}
    </div>
  </div>
""")

solution = slide(f"""
  <div class="pad center-col">
    <div class="eyebrow">الحل</div>
    <h2 class="big">منصة كويتية تربط شركتك بالكفاءات<br/><span class="accent">للعمل المرن</span></h2>
    <p class="lead">تنشر فرصتك وتحدّد المدة والمكافأة، فنوصلك بالأشخاص المناسبين بسرعة — وتدفع مقابل العمل الذي تحتاجه فقط.</p>
  </div>
""")

how = slide(f"""
  <div class="pad">
    <div class="eyebrow">كيف تعمل للشركات</div>
    <h2>أربع خطوات بسيطة</h2>
    <div class="steps">
      {step("1","سجّل شركتك","إنشاء حساب مجاني وبروفايل لشركتك.")}
      {step("2","انشر فرصة","حدّد المهارة والمدة وعدد الأيام والمكافأة.")}
      {step("3","استقبل أو ابحث","راجع المتقدمين أو ابحث في الكفاءات مباشرة.")}
      {step("4","أرسل عرضاً وقيّم","أكمل العمل وقيّم الأداء لبناء الثقة.")}
    </div>
  </div>
""")

benefits = slide(f"""
  <div class="pad">
    <div class="eyebrow">القيمة لشركتك</div>
    <h2>ماذا تستفيد الشركات؟</h2>
    <div class="grid3">
      {check_item("وظّف عند الحاجة فقط","فرق مؤقتة أو موسمية بلا التزام دائم.")}
      {check_item("خفّض التكاليف","ادفع مقابل العمل المنجز فقط.")}
      {check_item("وصول سريع","كفاءات جاهزة خلال وقت قصير.")}
      {check_item("كفاءات كويتية","دعم المواهب الوطنية وتعزيز التوطين.")}
      {check_item("تقييمات وموثوقية","حسابات موثّقة وتقييمات متبادلة.")}
      {check_item("تواصل مباشر وآمن","محادثة داخل المنصة بعد قبول العرض.")}
    </div>
  </div>
""")

features = slide(f"""
  <div class="pad">
    <div class="eyebrow">مزايا المنصة</div>
    <h2>أدوات تجعل التوظيف المرن أسهل</h2>
    <div class="grid2">
      {check_item("بروفايل شركة عام","يبرز نشاطك وفرصك المتاحة وتقييماتك.")}
      {check_item("إشعارات للمتابعين","يصل إشعار لمتابعي شركتك عند نشر فرصة جديدة.")}
      {check_item("فلاتر ذكية","تصفية حسب المحافظة والمدة وقيمة المكافأة.")}
      {check_item("لوحة تحكم متكاملة","إدارة الفرص والمتقدمين والعروض من مكان واحد.")}
    </div>
  </div>
""")

cta = slide(f"""
  <div class="cover">
    <div class="wordmark sm">Q8Work</div>
    <h1 class="cover-h">ابدأ اليوم — التسجيل مجاني</h1>
    <p class="cover-p">انشر أول فرصة لشركتك وتواصل مع الكفاءات المناسبة خلال دقائق.</p>
    <div class="cta-pills">
      <span class="pill">سجّل شركتك</span>
      <span class="pill">انشر فرصة</span>
      <span class="pill">وظّف بمرونة</span>
    </div>
    <div class="cover-foot big-foot">q8work.com<br/><span>info@q8work.com</span></div>
  </div>
""", "cover-slide")

slides = cover + problem + solution + how + benefits + features + cta

html = f"""<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/>
<style>
{faces}
*{{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
@page {{ size:1280px 720px; margin:0; }}
html,body{{font-family:'Thmanyah',sans-serif;color:{INK};}}
.slide{{position:relative;width:1280px;height:720px;overflow:hidden;background:#fff;page-break-after:always;}}
.bar{{height:10px;width:100%;background:{GRAD};}}
.pad{{padding:64px 80px;}}
.eyebrow{{font-weight:700;font-size:20px;letter-spacing:2px;color:{BLUE};margin-bottom:14px;}}
.eyebrow.light{{color:rgba(255,255,255,.85);}}
h2{{font-weight:900;font-size:52px;line-height:1.15;color:{INK};margin-bottom:36px;}}
h2.big{{font-size:62px;}}
.accent{{color:{BLUE};}}
.lead{{font-size:30px;line-height:1.7;color:{GRAY};max-width:980px;}}
.center-col{{height:710px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;}}
.center-col .lead{{text-align:center;}}
/* benefit items */
.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:26px;}}
.grid3{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;}}
.bi{{display:flex;gap:16px;align-items:flex-start;background:{SOFT};border-radius:20px;padding:24px;}}
.bi-c{{flex:none;width:40px;height:40px;border-radius:999px;background:{BLUE};color:#fff;font-weight:900;font-size:20px;display:flex;align-items:center;justify-content:center;}}
.bi-t{{font-weight:800;font-size:24px;color:{INK};}}
.bi-d{{font-size:19px;color:{GRAY};margin-top:4px;line-height:1.55;}}
/* steps */
.steps{{display:grid;grid-template-columns:repeat(4,1fr);gap:22px;}}
.step{{background:#fff;border:2px solid {SOFT};border-radius:22px;padding:28px 24px;}}
.step-n{{display:flex;width:54px;height:54px;border-radius:999px;background:{BLUE};color:#fff;font-weight:900;font-size:26px;align-items:center;justify-content:center;margin-bottom:18px;}}
.step-t{{font-weight:900;font-size:25px;margin-bottom:8px;}}
.step-d{{font-size:19px;color:{GRAY};line-height:1.55;}}
/* cover / cta */
.cover-slide{{background:linear-gradient(135deg,#030D4F 0%,{BLUE} 55%,#6c83ff 100%);color:#fff;}}
.cover{{height:710px;display:flex;flex-direction:column;justify-content:center;padding:0 90px;}}
.wordmark{{font-family:'Poppins','Arial Black','Thmanyah',sans-serif;font-weight:900;font-size:84px;letter-spacing:-1px;color:#fff;margin-bottom:10px;}}
.wordmark.sm{{font-size:60px;}}
.cover-h{{font-weight:900;font-size:60px;line-height:1.15;margin-bottom:22px;}}
.cover-p{{font-size:28px;line-height:1.7;color:rgba(255,255,255,.85);max-width:900px;}}
.cover-foot{{position:absolute;bottom:54px;right:90px;font-size:20px;color:rgba(255,255,255,.7);font-weight:700;}}
.big-foot{{font-size:26px;line-height:1.5;}}
.big-foot span{{color:rgba(255,255,255,.6);font-weight:500;}}
.cta-pills{{display:flex;gap:16px;margin-top:38px;}}
.pill{{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:12px 26px;font-weight:800;font-size:22px;}}
</style></head><body>{slides}</body></html>"""

OUT.write_text(html, encoding="utf-8")
print("wrote", OUT, f"({len(html)//1024} KB)")
