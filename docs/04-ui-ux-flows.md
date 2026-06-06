# MVP — 04 UI / UX Flows

## قاعدة الواجهة

الواجهة لازم تبقى بسيطة جدًا ومفهومة لغير المحاسبين.

استخدم:

```txt
له
عليه
دفع
تحصيل
تسوية
كشف حساب
الرصيد الحالي
```

## Navigation

```txt
الرئيسية
الأطراف
حركات الحساب
كشوف الحساب
التقارير
الإعدادات
```

## Dashboard

Cards:

```txt
إجمالي العملاء عليهم
إجمالي الموردين لهم
عدد العملاء
عدد الموردين
عدد شركات الأدوية
آخر الحركات
```

Quick actions:

```txt
+ إضافة طرف
+ حركة حساب
عرض كشوف الحساب
```

## Parties List

Route:

```txt
/parties
```

Columns:

```txt
الاسم
النوع
الهاتف
الرصيد الحالي
الحالة
آخر حركة
الإجراءات
```

Actions:

```txt
عرض
كشف حساب
إضافة حركة
تعديل
```

## Create Party

Fields:

```txt
الاسم
النوع
رقم الهاتف
العنوان
مسؤول التواصل
ملاحظات
الحالة
```

Validation:

```txt
اسم الطرف مطلوب.
نوع الطرف مطلوب.
```

## Party Details

Shows:

```txt
Name
Type badge
Phone
Current balance
إجمالي له
إجمالي عليه
آخر حركة
```

Actions:

```txt
إضافة حركة
كشف الحساب
تعديل بيانات الطرف
```

## Add Transaction

Fields:

```txt
الطرف
تاريخ الحركة
نوع الحركة
الاتجاه
المبلغ
الوصف
رقم مرجعي
ملاحظات
```

Direction selector:

```txt
الطرف عليه
الطرف له
```

Helpers:

```txt
عليه = الطرف مديون لك
له = الطرف له فلوس عندك
```

Supplier helper:

```txt
لو اشتريت من المورد ولم تدفع، اختر: الطرف له.
لو دفعت للمورد، اختر: الطرف عليه.
```

Customer helper:

```txt
لو العميل اشترى ولم يدفع، اختر: الطرف عليه.
لو العميل دفع، اختر: الطرف له.
```

## Transactions List

Columns:

```txt
التاريخ
الطرف
النوع
الوصف
له
عليه
المبلغ
الحالة
المستخدم
الإجراءات
```

Allowed actions:

```txt
عرض
عكس الحركة
```

No edit for posted transaction.

## Party Statement

Route:

```txt
/parties/[id]/statement
```

Summary:

```txt
إجمالي له
إجمالي عليه
الرصيد النهائي
```

Table:

```txt
التاريخ
نوع الحركة
الوصف
له
عليه
الرصيد بعد الحركة
ملاحظات
```

Actions:

```txt
طباعة
إضافة حركة
```

## Reports

```txt
/reports/receivables
/reports/payables
/reports/balances
```

## Reversal Dialog

Title:

```txt
عكس حركة الحساب؟
```

Body:

```txt
سيتم إنشاء حركة عكسية بدل تعديل الحركة الأصلية للحفاظ على كشف الحساب.
```

Required field:

```txt
سبب العكس
```

## Mobile

Use:

```txt
Cards instead of tables
Large amount input
Sticky save button
Bottom sheet filters
Clear balance badges
```

## Empty States

```txt
لا توجد أطراف بعد.
لا توجد حركات حساب بعد.
لا توجد بيانات مطابقة للفلاتر.
```

## Final UI Rule

```txt
The UI should feel like a smart account notebook, not a full accounting ERP.
```
