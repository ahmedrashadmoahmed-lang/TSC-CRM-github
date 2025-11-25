# 🐘 دليل تثبيت وإعداد PostgreSQL

## الخطوة 1: تحميل PostgreSQL

### للويندوز:
1. اذهب إلى: https://www.postgresql.org/download/windows/
2. حمل **PostgreSQL Installer** من EnterpriseDB
3. اختر آخر إصدار (مثلاً PostgreSQL 16)

## الخطوة 2: تثبيت PostgreSQL

1. شغل ملف التثبيت الذي حملته
2. اتبع الخطوات التالية:

### أثناء التثبيت:
- **Installation Directory**: اترك الافتراضي `C:\Program Files\PostgreSQL\16`
- **Components**: اختر الكل (PostgreSQL Server, pgAdmin 4, Command Line Tools)
- **Data Directory**: اترك الافتراضي
- **Password**: ⚠️ **مهم جداً** - اختر كلمة مرور قوية واحفظها (مثلاً: `postgres123`)
- **Port**: اترك `5432` (الافتراضي)
- **Locale**: اختر `Default locale`

3. اضغط Next حتى يبدأ التثبيت
4. انتظر حتى ينتهي التثبيت (قد يأخذ 5-10 دقائق)

## الخطوة 3: التحقق من التثبيت

افتح Command Prompt وجرب:

```bash
psql --version
```

يجب أن تشوف رقم الإصدار (مثلاً: `psql (PostgreSQL) 16.x`)

## الخطوة 4: إنشاء قاعدة البيانات

### الطريقة 1: باستخدام pgAdmin (سهلة)

1. افتح **pgAdmin 4** من قائمة Start
2. أدخل كلمة المرور اللي اخترتها
3. من الشجرة على اليسار: Servers → PostgreSQL 16 → Databases
4. كليك يمين على Databases → Create → Database
5. اسم القاعدة: `erp_database`
6. اضغط Save

### الطريقة 2: باستخدام Command Line

```bash
# افتح Command Prompt كـ Administrator
psql -U postgres

# بعد ما تدخل كلمة المرور، اكتب:
CREATE DATABASE erp_database;

# للخروج:
\q
```

## الخطوة 5: إعداد ملف .env

أنشئ ملف `.env` في مجلد المشروع:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/erp_database?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Google Gemini (اختياري)
GOOGLE_GEMINI_API_KEY=your-api-key-here
```

⚠️ **غير `postgres123` بكلمة المرور اللي اخترتها!**

## الخطوة 6: تشغيل Prisma

في مجلد المشروع، نفذ:

```bash
# 1. تثبيت المكتبات
npm install

# 2. إنشاء Prisma Client
npx prisma generate

# 3. إنشاء الجداول في قاعدة البيانات
npx prisma db push

# 4. (اختياري) فتح Prisma Studio لمشاهدة البيانات
npx prisma studio
```

## الخطوة 7: تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح: http://localhost:3000

---

## 🔧 حل المشاكل الشائعة

### المشكلة: "psql: command not found"

**الحل:**
1. افتح System Properties → Advanced → Environment Variables
2. في System Variables، ابحث عن `Path`
3. اضغط Edit → New
4. أضف: `C:\Program Files\PostgreSQL\16\bin`
5. اضغط OK وأعد تشغيل Command Prompt

### المشكلة: "password authentication failed"

**الحل:**
- تأكد أن كلمة المرور في `.env` صحيحة
- جرب إعادة تعيين كلمة مرور postgres

### المشكلة: "Port 5432 already in use"

**الحل:**
- افتح Services (services.msc)
- ابحث عن "postgresql"
- كليك يمين → Restart

### المشكلة: "relation does not exist"

**الحل:**
```bash
npx prisma db push --force-reset
```

---

## ✅ التحقق من نجاح الإعداد

جرب هذا الأمر:

```bash
npx prisma studio
```

إذا فتح متصفح وشفت واجهة Prisma Studio، معناها كل شيء تمام! 🎉

---

## 📞 محتاج مساعدة؟

إذا واجهت أي مشكلة، أرسل لي:
1. رسالة الخطأ الكاملة
2. الخطوة اللي وقفت عندها
3. نظام التشغيل اللي تستخدمه

وسأساعدك فوراً! 🚀
