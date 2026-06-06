# MVP — 03 Account Transaction Rules

## القاعدة الأساسية

```txt
الرصيد يتحسب من الحركات، ولا يتم تعديله يدويًا.
```

## معنى الاتجاه

```txt
PARTY_OWES_US = عليه
WE_OWE_PARTY = له
```

معنى "عليه":

```txt
الطرف مديون لنا.
```

معنى "له":

```txt
الطرف له فلوس عندنا.
```

## معادلة الرصيد

```txt
netBalance = عليه - له
```

لو الناتج موجب:

```txt
عليه {amount}
```

لو الناتج سالب:

```txt
له {abs(amount)}
```

لو صفر:

```txt
متوازن
```

## أمثلة المورد

اشتريت من مورد بـ 5000 ولم تدفع:

```txt
WE_OWE_PARTY 5000
Display: له 5000
```

دفعت للمورد 2000:

```txt
PARTY_OWES_US 2000
```

الرصيد النهائي:

```txt
له 3000
```

## أمثلة العميل

عميل عليه 1000:

```txt
PARTY_OWES_US 1000
Display: عليه 1000
```

العميل دفع 400:

```txt
WE_OWE_PARTY 400
```

الرصيد النهائي:

```txt
عليه 600
```

## Opening Balance

الرصيد الافتتاحي يستخدم لإدخال الأرصدة القديمة.

Required:

```txt
Party
Direction
Amount
Date
Description
```

## Payment Out

غالبًا للموردين والشركات:

```txt
direction = PARTY_OWES_US
```

لأنه يقلل اللي لهم عندنا.

## Collection In

غالبًا للعملاء:

```txt
direction = WE_OWE_PARTY
```

لأنه يقلل اللي عليهم لنا.

## Adjustment

تسوية تحتاج سبب واضح.

```txt
Reason required
```

## Immutability

الحركة المعتمدة لا يتم تعديلها.

التصحيح يتم عن طريق:

```txt
Reverse transaction
Create new correct transaction
```

## Reversal Rules

لعكس حركة:

```txt
1. require reason
2. mark original as REVERSED
3. create opposite transaction
4. link original and reversal
5. keep both visible in audit/history
```

## Validation

```txt
Party required
Amount > 0
Date required
Direction required
Type required
Description required
```

Forbidden:

```txt
Negative amount
Client balance
Client transactionNumber
Client createdBy
Edit posted amount
Delete posted transaction
```

## Reports

```txt
Receivables = netBalance > 0
Payables = netBalance < 0
```

## القاعدة النهائية

```txt
The system stores what happened, then calculates what someone owes.
```
