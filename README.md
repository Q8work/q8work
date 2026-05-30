# Q8Work — منصة العمل الجزئي للكويتيين

منصة رقمية كويتية تربط الكويتيين الباحثين عن عمل جزئي بأصحاب العمل من الشركات والمؤسسات.

A Kuwaiti gig/part-time work marketplace connecting Kuwaitis seeking extra income
with employers who need flexible national talent.

## ✨ الميزات (MVP)

- **ثلاث لوحات تحكم**: الكويتي (worker) · الشركة (company) · الإدارة (admin)
- **لوحة الكويتي**: البروفايل، المهارات، أوقات التوفر، العروض الواردة، التقييمات
- **لوحة الشركة**: بروفايل الشركة ورفع السجل التجاري، نشر فرص العمل، البحث والفلترة عن المواهب، إرسال العروض، التقييم
- **لوحة الإدارة**: إدارة المستخدمين، توثيق الشركات والجنسية، الإحصائيات
- **نظام رسائل داخلي** بين الطرفين
- **تقييمات بالنجوم** (١–٥) بعد كل تجربة
- **الخصوصية**: رقم تواصل الكويتي يظهر للشركة **بعد قبول العرض فقط**
- واجهة عربية بالكامل (RTL) بهوية Q8Work البصرية

## 🛠 البنية التقنية (Cloudflare-native)

| الطبقة | التقنية |
|--------|---------|
| الواجهة | React 18 + Vite + TypeScript + Tailwind v4 (RTL) |
| الخادم (API) | Hono على Cloudflare Workers |
| قاعدة البيانات | Cloudflare D1 (SQLite) |
| تخزين الملفات | Cloudflare R2 (الصور، السجل التجاري) |
| المصادقة | جلسات (sessions) + تجزئة كلمة المرور PBKDF2 (Web Crypto) |

كل شيء يُخدَم من Worker واحد: مسارات `/api/*` عبر Hono، وبقية المسارات تُخدَم
كتطبيق صفحة واحدة (SPA) عبر الأصول الثابتة.

## 🚀 التشغيل محلياً

```bash
npm install

# إنشاء قاعدة البيانات المحلية وتطبيق المخطط + البيانات الأولية
npm run db:migrate:local
npm run db:seed:local

npm run dev          # http://localhost:5173
```

**حساب الإدارة الافتراضي (محلي):** `admin@q8work.com` / `admin1234`
> ⚠️ غيّر كلمة المرور هذه قبل الإطلاق.

## 🏗 البناء

```bash
npm run build        # ينتج dist/
npm run typecheck    # فحص الأنواع
```

## ☁️ النشر على Cloudflare

```bash
# 1) أنشئ قاعدة D1 وحدّث database_id في wrangler.jsonc
wrangler d1 create q8work-db

# 2) أنشئ حاوية R2
wrangler r2 bucket create q8work-uploads

# 3) طبّق المخطط على القاعدة البعيدة
npm run db:migrate:remote

# 4) انشر
npm run deploy
```

> ملاحظة: عيّن `ENVIRONMENT = "production"` في `wrangler.jsonc` لتفعيل
> كوكيز الجلسة الآمنة (Secure) في الإنتاج.

## 📁 هيكل المشروع

```
schema.sql               مخطط قاعدة البيانات D1
seed.sql                 بيانات أولية (حساب الإدارة)
wrangler.jsonc           إعداد Cloudflare (D1, R2, assets)
src/
  worker/                خادم Hono
    index.ts             نقطة الدخول + توجيه /api
    types.ts             أنواع البيئة (Env)
    lib/auth.ts          الجلسات وتجزئة كلمات المرور
    lib/util.ts          أدوات مساعدة
    routes/              auth · profile · jobs · workers · offers · messages · ratings · admin · files
  client/                واجهة React
    main.tsx · App.tsx   نقطة الدخول والتوجيه
    lib/                 api · auth (context) · constants
    components/          Logo · Layout · ui · Messages
    pages/               Home · JobsList · Auth · worker/ · company/ · admin/
```

## 🔌 ملخص واجهة الـ API

| المسار | الوصف |
|--------|-------|
| `POST /api/auth/register \| login \| logout`, `GET /api/auth/me` | المصادقة |
| `GET/PUT /api/profile/worker \| company`, `POST /api/profile/upload` | الملفات الشخصية والرفع |
| `GET/POST /api/jobs`, `GET /api/jobs/mine`, `PATCH /api/jobs/:id` | فرص العمل |
| `GET /api/workers`, `GET /api/workers/:id` | البحث عن المواهب (للشركات) |
| `POST /api/offers`, `GET /api/offers`, `PATCH /api/offers/:id` | العروض |
| `GET /api/messages/threads`, `GET/POST /api/messages/:offerId` | الرسائل |
| `POST /api/ratings`, `GET /api/ratings/me` | التقييمات |
| `GET /api/admin/stats \| users`, `PATCH /api/admin/...` | الإدارة |
| `GET /api/files/*` | تحميل الملفات (مع تحقق الصلاحيات) |

---
© 2025 Q8Work · q8work.com · info@q8work.com
