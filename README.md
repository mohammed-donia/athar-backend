# أثر — Backend

Express + MongoDB + JWT

## التشغيل

1. انسخ الإعدادات:
   ```bash
   cp .env.example .env
   ```
   وعدّل `MONGODB_URI` و `JWT_SECRET` (32 حرف على الأقل).

2. ثبّت الحزم وشغّل:
   ```bash
   npm install
   npm run dev
   ```

السيرفر يعمل على `http://localhost:4000`

## API

كل المسارات المحمية تحتاج هيدر:
`Authorization: Bearer <token>`

| Method | Path | وصف |
|--------|------|-----|
| POST | /api/auth/register | تسجيل |
| POST | /api/auth/login | دخول |
| GET | /api/auth/me | المستخدم الحالي |
| GET | /api/data | كل البيانات |
| POST | /api/data/import | استيراد |
| DELETE | /api/data | مسح البيانات |
| GET/POST | /api/trackers | قائمة / إنشاء |
| PATCH/DELETE | /api/trackers/:id | تعديل / حذف |
| GET/POST | /api/entries | قائمة / إنشاء |
| PATCH/DELETE | /api/entries/:id | تعديل / حذف |
| GET | /api/health | فحص |
