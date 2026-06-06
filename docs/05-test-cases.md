# MVP — 05 Test Cases

## Core Test Rule

```txt
If the balance cannot be explained by statement rows, the MVP is wrong.
```

## Test Data

```txt
Owner
Accountant
Viewer
Supplier A
Customer A
Medicine Company A
Inactive Party
```

## Database Tests

### Create Party

Expected:

```txt
Party created with name/type/status.
```

### Required Name

Expected:

```txt
اسم الطرف مطلوب.
```

### Required Type

Expected:

```txt
نوع الطرف مطلوب.
```

### Create Transaction

Expected:

```txt
Transaction created
amount > 0
status POSTED
transactionNumber generated server-side
```

### Reject Zero / Negative Amount

Expected:

```txt
المبلغ يجب أن يكون أكبر من صفر.
```

## Balance Tests

### Customer Debt

```txt
PARTY_OWES_US 1000
```

Expected:

```txt
عليه 1000
```

### Customer Collection

```txt
PARTY_OWES_US 1000
WE_OWE_PARTY 400
```

Expected:

```txt
عليه 600
```

### Supplier Debt

```txt
WE_OWE_PARTY 5000
```

Expected:

```txt
له 5000
```

### Supplier Payment

```txt
WE_OWE_PARTY 5000
PARTY_OWES_US 2000
```

Expected:

```txt
له 3000
```

### Balanced Account

```txt
PARTY_OWES_US 1000
WE_OWE_PARTY 1000
```

Expected:

```txt
متوازن
```

## Statement Tests

Order:

```txt
transactionDate ASC
createdAt ASC
```

Running example:

```txt
عليه 1000 => balance 1000
له 400 => balance 600
عليه 200 => balance 800
```

## Reversal Tests

Original:

```txt
PARTY_OWES_US 1000
```

Reversal:

```txt
WE_OWE_PARTY 1000
```

Expected:

```txt
Original marked REVERSED
Reversal created
Net effect zero
Reason required
Cannot reverse twice
```

## Permission Tests

OWNER:

```txt
Can create parties
Can create transactions
Can reverse transactions
Can view reports
```

ACCOUNTANT:

```txt
Can create transactions
Can view statements/reports
```

VIEWER:

```txt
Can view only
Cannot create transaction
Cannot reverse transaction
```

## Server Action Tests

Actions:

```txt
createPartyAction
updatePartyAction
createTransactionAction
reverseTransactionAction
getPartyStatementAction
getReceivablesReportAction
getPayablesReportAction
```

Expected:

```txt
Zod validation
Trusted user context
No client-createdBy trust
No client balance trust
Arabic errors
```

## UI Tests

Verify:

```txt
Parties page renders
Add party form works
Add transaction form works
Direction helper visible
Statement running balance visible
Reports display correct parties
Mobile has no horizontal scroll
```

## Manual QA

Supplier flow:

```txt
Create supplier
Add له 5000
Add عليه 2000
Final: له 3000
```

Customer flow:

```txt
Create customer
Add عليه 1000
Add له 400
Final: عليه 600
```

Reversal flow:

```txt
Create عليه 1000
Reverse it
Net effect removed
```

## Release Blockers

Do not release if:

```txt
Balance can be edited manually
Transaction can have negative amount
Posted transaction can be edited
Reversal does not require reason
Receivables/payables classification wrong
Statement running balance wrong
Client balance trusted
Viewer can create transaction
Mobile statement unusable
```
