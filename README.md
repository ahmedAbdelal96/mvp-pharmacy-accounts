# Pharmacy Accounts Lite — MVP

نظام بسيط لإدارة حسابات الأطراف في الصيدلية.

> **Scope:** Parties + Account Transactions + Party Statements + Simple Receivables/Payables Reports
>
> **Forbidden:** Inventory, POS, Products, Branches, Full Accounting

---

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM**
- **PostgreSQL**
- **Server Actions**
- **Zod validation**
- **Arabic RTL UI**

---

## MVP Scope

### Included ✅

- **Parties** — Suppliers, Customers, Medicine Companies, Other
- **Account Transactions** — Opening Balance, Debt, Payment Out, Collection In, Adjustment, Discount
- **Party Statements** — Running balance by transaction date
- **Receivables Report** — Parties with balance > 0 (عليه)
- **Payables Report** — Parties with balance < 0 (له)
- **Balances Report** — All party balances
- **Roles** — OWNER, ACCOUNTANT, VIEWER

### Excluded 🚫

- Inventory / Stock
- Products / Barcodes
- POS
- Branches / Warehouses
- Purchase/Sales item lines
- Full double-entry accounting
- Cashbox
- Tax / COGS
- Reconciliation

---

## Core Rules

1. **Party has NO balance field.** Balance is calculated from `AccountTransaction` records only.
2. **AccountTransaction is the source of truth.** Balance = `sum(PARTY_OWES_US) - sum(WE_OWE_PARTY)`.
3. **Posted transactions are immutable.** Corrections via reversal only.
4. **Never use float for money.** Always use `Decimal`.
5. **Never trust `createdBy` from client.** Always use server-side trusted user context.

---

## Installation

### 1. Clone / Navigate

```bash
cd mvp-pharmacy-accounts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set your PostgreSQL connection string
# DATABASE_URL="postgresql://user:password@localhost:5432/pharmacy_accounts"
```

### 4. Run Database Migration

```bash
# Push schema to database (first time)
npx prisma db push

# Or run migrations
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed the Database

```bash
# The seed script creates an OWNER user:
# Email:    owner@pharmacy.local
# Password: owner123
# Role:     OWNER

npx prisma db seed
```

> If `db seed` fails, run manually:
> ```bash
> npx tsx prisma/seed.ts
> ```
> (You may need: `npm install -D tsx`)

### 7. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Dashboard layout group
│   │   ├── layout.tsx        # Sidebar + topbar shell
│   │   ├── dashboard/       # Dashboard home
│   │   ├── parties/         # Parties CRUD (pending)
│   │   ├── transactions/   # Transactions (pending)
│   │   ├── reports/         # Receivables, Payables, Balances
│   │   └── settings/       # Settings (pending)
│   ├── globals.css          # RTL Arabic styles
│   ├── layout.tsx          # Root layout (RTL html)
│   └── page.tsx            # Redirects to /dashboard
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── action-result.ts    # Server Action result wrapper
│   ├── money.ts            # Decimal money utilities
│   ├── permissions.ts     # Role-based permission helper
│   └── errors.ts           # Typed AppError classes
└── generated/
    └── prisma/             # Generated Prisma client

prisma/
├── schema.prisma           # Database schema
├── config.ts               # Prisma config (URL from env)
└── seed.ts                 # Seed script
```

---

## Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String | CUID, PK |
| name | String | |
| email | String | Unique |
| passwordHash | String | |
| role | UserRole | OWNER, ACCOUNTANT, VIEWER |
| isActive | Boolean | Default true |

### Party
| Field | Type | Notes |
|-------|------|-------|
| id | String | CUID, PK |
| name | String | Required |
| type | PartyType | SUPPLIER, CUSTOMER, MEDICINE_COMPANY, OTHER |
| phone | String? | Optional |
| address | String? | Optional |
| contactPerson | String? | Optional |
| notes | String? | Optional |
| status | PartyStatus | ACTIVE, INACTIVE |
| createdById | String | FK → User |
| **NO balance field** | | Balance is calculated from transactions |

### AccountTransaction
| Field | Type | Notes |
|-------|------|-------|
| id | String | CUID, PK |
| partyId | String | FK → Party |
| transactionNumber | String | Unique, server-generated |
| type | AccountTransactionType | OPENING_BALANCE, DEBT, PAYMENT_OUT, COLLECTION_IN, ADJUSTMENT, DISCOUNT |
| direction | AccountTransactionDirection | PARTY_OWES_US (عليه), WE_OWE_PARTY (له) |
| status | AccountTransactionStatus | POSTED, REVERSED |
| amount | Decimal(18,2) | Always > 0 |
| transactionDate | DateTime | |
| description | String | |
| referenceNumber | String? | Optional |
| notes | String? | Optional |
| reversedById | String? | FK → User who reversed |
| reversedAt | DateTime? | |
| reversalReason | String? | Required for reversal |
| reversalTransactionId | String? | FK → reversal transaction |
| createdById | String | FK → User (server-trusted) |

### Enums

```prisma
UserRole         — OWNER, ACCOUNTANT, VIEWER
PartyType        — SUPPLIER, CUSTOMER, MEDICINE_COMPANY, OTHER
PartyStatus      — ACTIVE, INACTIVE
AccountTransactionType      — OPENING_BALANCE, DEBT, PAYMENT_OUT, COLLECTION_IN, ADJUSTMENT, DISCOUNT
AccountTransactionDirection  — PARTY_OWES_US (عليه), WE_OWE_PARTY (له)
AccountTransactionStatus     — POSTED, REVERSED
```

---

## Balance Display

| Balance | Label | Meaning |
|---------|-------|---------|
| Positive | عليه | Party owes us |
| Negative | له | We owe party |
| Zero | متوازن | Balanced |

---

## UI Labels (Arabic)

| Concept | Arabic |
|---------|--------|
| Debit | عليه |
| Credit | له |
| Party owes us | الطرف عليه |
| We owe party | الطرف له |
| Opening balance | رصيد افتتاحي |
| Debt | مديونية |
| Payment out | دفع |
| Collection in | تحصيل |
| Adjustment | تسوية |
| Discount | خصم |
| Balance | الرصيد الحالي |
| Statement | كشف حساب |
| Receivables | الأطراف التي عليها |
| Payables | الأطراف التي لها |

---

## Pending Implementation

- [ ] Auth (login/logout, session)
- [ ] Party CRUD
- [ ] Transaction creation
- [ ] Transaction reversal
- [ ] Party statement page
- [ ] Reports (receivables, payables, balances)
- [ ] Validation (Zod schemas)
- [ ] Tests

These will be implemented in subsequent phases.

---

## License

MVP — Internal use only.