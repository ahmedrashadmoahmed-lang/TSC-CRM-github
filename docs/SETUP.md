# دليل الإعداد والتثبيت - Enterprise SaaS ERP

## المتطلبات الأساسية

### 1. تثبيت البرامج المطلوبة

#### Node.js
```bash
# تحميل وتثبيت Node.js 18 أو أحدث
# من https://nodejs.org/
node --version  # يجب أن يكون 18.0.0 أو أحدث
```

#### PostgreSQL
```bash
# Windows: تحميل من https://www.postgresql.org/download/windows/
# أو استخدام Chocolatey:
choco install postgresql

# التحقق من التثبيت
psql --version
```

---

## خطوات الإعداد

### الخطوة 1: إعداد قاعدة البيانات

#### 1.1 إنشاء قاعدة بيانات PostgreSQL

```bash
# فتح PostgreSQL shell
psql -U postgres

# إنشاء قاعدة بيانات
CREATE DATABASE erp_database;

# إنشاء مستخدم (اختياري)
CREATE USER erp_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE erp_database TO erp_user;

# الخروج
\q
```

#### 1.2 إعداد ملف البيئة

```bash
# نسخ ملف المثال
copy .env.example .env.local

# تعديل .env.local وإضافة:
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/erp_database?schema=public"
```

### الخطوة 2: تثبيت المكتبات

```bash
# تثبيت جميع المكتبات
npm install

# تثبيت Prisma CLI
npm install -D prisma

# تثبيت Prisma Client
npm install @prisma/client
```

### الخطوة 3: تهيئة قاعدة البيانات

```bash
# إنشاء الجداول في قاعدة البيانات
npx prisma db push

# أو استخدام migrations (مفضل للـ production)
npx prisma migrate dev --name init

# فتح Prisma Studio لمشاهدة البيانات
npx prisma studio
```

### الخطوة 4: إضافة البيانات الأولية (Seed)

```bash
# تشغيل seed script
npm run db:seed
```

سيقوم هذا بإضافة:
- ✅ Tenant تجريبي
- ✅ مستخدم Admin
- ✅ الأدوار والصلاحيات
- ✅ دليل الحسابات
- ✅ بيانات تجريبية

### الخطوة 5: إنشاء مفتاح NextAuth

```bash
# Windows PowerShell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# أو استخدام موقع
# https://generate-secret.vercel.app/32

# إضافة المفتاح في .env.local
NEXTAUTH_SECRET="المفتاح_المولد_هنا"
```

### الخطوة 6: إعداد Google Gemini (للـ AI Chatbot)

1. الذهاب إلى https://makersuite.google.com/app/apikey
2. إنشاء API Key
3. إضافته في `.env.local`:

```bash
GEMINI_API_KEY="your-api-key-here"
```

### الخطوة 7: تشغيل التطبيق

```bash
# Development mode
npm run dev

# فتح المتصفح على
# http://localhost:3000
```

---

## البيانات الافتراضية للدخول

بعد تشغيل seed:

```
Email: admin@example.com
Password: Admin@123
```

---

## الميزات الاختيارية

### Real-time Notifications (Pusher)

```bash
# التسجيل في https://pusher.com
# الحصول على credentials
# إضافتها في .env.local:

PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="eu"
```

### Payment Gateways

#### Stripe
```bash
# التسجيل في https://stripe.com
# الحصول على API keys من Dashboard

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

#### PayPal
```bash
# التسجيل في https://developer.paypal.com
# إنشاء App والحصول على credentials

PAYPAL_CLIENT_ID="..."
PAYPAL_CLIENT_SECRET="..."
```

### Monitoring (Sentry)

```bash
# التسجيل في https://sentry.io
# إنشاء مشروع والحصول على DSN

SENTRY_DSN="https://...@sentry.io/..."
```

---

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات

```bash
# التحقق من تشغيل PostgreSQL
# Windows:
Get-Service postgresql*

# إذا لم يكن يعمل:
Start-Service postgresql-x64-14  # أو الإصدار المثبت لديك
```

### خطأ في Prisma

```bash
# إعادة توليد Prisma Client
npx prisma generate

# إعادة تعيين قاعدة البيانات (تحذير: يحذف جميع البيانات)
npx prisma migrate reset
```

### خطأ في Port 3000 مستخدم

```bash
# تغيير Port في package.json
"dev": "next dev -p 3001"

# أو إيقاف العملية المستخدمة للـ port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## الخطوات التالية

بعد الإعداد الناجح:

1. ✅ **استكشاف Dashboard** - تصفح الواجهة الرئيسية
2. ✅ **إنشاء فاتورة** - اختبار نظام الفواتير
3. ✅ **تجربة AI Chatbot** - اختبار المساعد الذكي
4. ✅ **إعداد Tenant جديد** - للـ multi-tenancy
5. ✅ **تخصيص الإعدادات** - في صفحة Settings

---

## الأوامر المفيدة

```bash
# تشغيل Development
npm run dev

# بناء Production
npm run build

# تشغيل Production
npm start

# اختبار الكود
npm test

# فحص الأخطاء
npm run lint

# Prisma Studio
npx prisma studio

# إنشاء migration جديد
npx prisma migrate dev --name migration_name

# تطبيق migrations على production
npx prisma migrate deploy

# إعادة توليد Prisma Client
npx prisma generate
```

---

## الدعم

إذا واجهت أي مشاكل:

1. تحقق من ملف `.env.local`
2. تأكد من تشغيل PostgreSQL
3. راجع logs في terminal
4. افتح issue في GitHub

---

## الأمان

⚠️ **مهم للـ Production:**

1. غيّر `NEXTAUTH_SECRET` لمفتاح قوي
2. استخدم كلمات مرور قوية لقاعدة البيانات
3. لا تشارك ملف `.env.local`
4. فعّل HTTPS
5. استخدم environment variables في hosting
6. فعّل rate limiting
7. راجع security checklist

---

## الترقية من SQLite

إذا كان لديك بيانات في SQLite:

```bash
# 1. Backup البيانات الحالية
npm run db:backup

# 2. Export من SQLite
npm run db:export

# 3. Import إلى PostgreSQL
npm run db:import

# 4. التحقق من البيانات
npx prisma studio
```

---

تم الإعداد بنجاح! 🎉

الآن يمكنك البدء في استخدام النظام.
