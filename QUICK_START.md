# 🚀 دليل البدء السريع

## المتطلبات الأساسية

- ✅ Node.js 18+ مثبت
- ✅ PostgreSQL 14+ مثبت ومشغل
- ✅ npm أو yarn

---

## خطوات التشغيل (5 دقائق)

### 1️⃣ تثبيت المكتبات
```bash
npm install
```

### 2️⃣ إعداد قاعدة البيانات

**أ) إنشاء قاعدة بيانات PostgreSQL:**
```sql
CREATE DATABASE erp_database;
```

**ب) إنشاء ملف `.env`:**
```bash
# انسخ ملف المثال
copy .env.example .env

# أو في Linux/Mac
cp .env.example .env
```

**ج) تعديل `.env`:**
افتح ملف `.env` وغير:
- `YOUR_PASSWORD` → كلمة مرور PostgreSQL
- `NEXTAUTH_SECRET` → مفتاح عشوائي

### 3️⃣ إعداد Prisma
```bash
# إنشاء Prisma Client
npx prisma generate

# إنشاء الجداول
npx prisma db push
```

### 4️⃣ تشغيل المشروع
```bash
npm run dev
```

### 5️⃣ فتح المتصفح
افتح: **http://localhost:3000**

---

## 🎯 الصفحات المتاحة

| الصفحة | الرابط |
|--------|--------|
| الرئيسية | http://localhost:3000 |
| لوحة التحكم | http://localhost:3000/dashboard-example |
| العملاء | http://localhost:3000/examples/customers |
| المنتجات | http://localhost:3000/products |
| الموظفين | http://localhost:3000/employees |
| التقارير | http://localhost:3000/reports |

---

## 🛠️ أوامر مفيدة

```bash
# مشاهدة قاعدة البيانات
npx prisma studio

# إعادة تعيين قاعدة البيانات
npx prisma db push --force-reset

# فحص الأخطاء
npm run lint

# بناء للإنتاج
npm run build

# تشغيل الإنتاج
npm start
```

---

## ❓ مشاكل شائعة

### "Cannot connect to database"
✅ تأكد أن PostgreSQL مشغل
✅ تحقق من كلمة المرور في `.env`

### "Module not found"
✅ نفذ: `npm install`

### "Port 3000 already in use"
✅ غير PORT في `.env` أو أوقف التطبيق الآخر

---

## 📚 المزيد من المساعدة

- [دليل تثبيت PostgreSQL](./POSTGRESQL_SETUP.md)
- [ملخص المشروع](./ULTIMATE_SUMMARY.md)
- [توثيق المكونات](./src/components/COMPONENTS_EXTENDED.md)

---

**جاهز؟ ابدأ الآن! 🚀**
