# MVP — Pharmacy Accounts Lite

## الهدف

نسخة MVP صغيرة لإدارة حسابات الصيدلية فقط:

```txt
موردين
عملاء
شركات أدوية
أطراف أخرى
حركات حساب
كشف حساب
تقرير له / عليه
```

هذه النسخة ليست نظام مخزون، وليست POS، وليست ERP كامل.

## الفكرة الأساسية

```txt
الطرف + حركات الحساب = كشف حساب + رصيد حالي
```

الرصيد لا يتم تعديله يدويًا. الرصيد يُحسب من الحركات.

## داخل النطاق

```txt
Login
Dashboard
Parties
Account Transactions
Party Statement
Receivables Report
Payables Report
Basic Search / Filters
Simple Roles
```

## خارج النطاق الآن

```txt
مخزون
فروع
مخازن
أصناف
باركود
فواتير شراء تفصيلية
فواتير بيع تفصيلية
POS
Cashbox
Stock Count
COGS
تقارير محاسبية كبيرة
قيود يومية كاملة
```

## أنواع الأطراف

```txt
SUPPLIER           مورد
CUSTOMER           عميل
MEDICINE_COMPANY   شركة أدوية
OTHER              طرف آخر
```

## أنواع الحركات

```txt
OPENING_BALANCE    رصيد افتتاحي
DEBT               مديونية / فاتورة مختصرة
PAYMENT_OUT        دفع
COLLECTION_IN      تحصيل
ADJUSTMENT         تسوية
DISCOUNT           خصم
```

## Tech Stack

```txt
Next.js App Router
TypeScript
Prisma
PostgreSQL
Server Actions
Zod
Tailwind / shadcn
Auth.js أو auth بسيط
```

## القاعدة النهائية

```txt
Keep it small: Parties + Transactions + Statements.
```
