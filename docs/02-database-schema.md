# MVP — 02 Database Schema

## الهدف

قاعدة بيانات صغيرة جدًا:

```txt
User
Party
AccountTransaction
AuditLog optional
Attachment optional
```

## Enums

```prisma
enum UserRole {
  OWNER
  ACCOUNTANT
  VIEWER
}

enum PartyType {
  SUPPLIER
  CUSTOMER
  MEDICINE_COMPANY
  OTHER
}

enum PartyStatus {
  ACTIVE
  INACTIVE
}

enum AccountTransactionType {
  OPENING_BALANCE
  DEBT
  PAYMENT_OUT
  COLLECTION_IN
  ADJUSTMENT
  DISCOUNT
}

enum AccountTransactionDirection {
  PARTY_OWES_US
  WE_OWE_PARTY
}

enum AccountTransactionStatus {
  POSTED
  REVERSED
}
```

## User

```txt
id
name
email
passwordHash
role
isActive
createdAt
updatedAt
```

لو هتعمله SaaS من البداية أضف:

```txt
tenantId
```

## Party

```txt
id
tenantId optional
name
type
phone
address
contactPerson
notes
status
createdBy
createdAt
updatedAt
```

Indexes:

```txt
tenantId + type
tenantId + name
tenantId + phone
tenantId + status
```

ممنوع يكون فيه:

```txt
Party.balance كمصدر حقيقة
```

## AccountTransaction

```txt
id
tenantId optional
partyId
transactionNumber
type
direction
status
amount
transactionDate
description
referenceNumber
notes
reversedBy
reversedAt
reversalReason
reversalTransactionId
createdBy
createdAt
updatedAt
```

Rules:

```txt
amount > 0
transactionNumber generated server-side
status starts POSTED
POSTED transaction is immutable
reversal creates opposite transaction
```

Indexes:

```txt
tenantId + transactionNumber unique
tenantId + partyId
tenantId + transactionDate
tenantId + type
tenantId + direction
tenantId + status
```

## Balance Formula

```txt
netBalance =
sum(PARTY_OWES_US POSTED)
-
sum(WE_OWE_PARTY POSTED)
```

Display:

```txt
netBalance > 0  => عليه
netBalance < 0  => له
netBalance = 0  => متوازن
```

## Running Balance

```txt
runningBalance += PARTY_OWES_US amount
runningBalance -= WE_OWE_PARTY amount
```

Order:

```txt
transactionDate ASC
createdAt ASC
```

## Money

Use Decimal:

```txt
Decimal @db.Decimal(18, 2)
```

Never use float for money.

## القاعدة النهائية

```txt
AccountTransaction is the source of truth for balances.
```
