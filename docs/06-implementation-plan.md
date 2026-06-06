# MVP — 06 Implementation Plan

## Core Implementation Rule

```txt
Build only Parties + Account Transactions + Statements.
```

Do not add inventory, POS, products, branches, or full accounting in V1.

## Stack

```txt
Next.js App Router
TypeScript
Prisma
PostgreSQL
Server Actions
Zod
Tailwind CSS
shadcn/ui
Auth.js or simple credentials auth
```

## Phases

```txt
Phase 1 — Project setup
Phase 2 — Database schema
Phase 3 — Auth and roles
Phase 4 — Shared utilities
Phase 5 — Party module
Phase 6 — Account transaction module
Phase 7 — Statement service
Phase 8 — Reports
Phase 9 — UI polish
Phase 10 — Tests and QA
```

## Phase 1 — Project Setup

```txt
Create Next.js app
Setup TypeScript
Setup Tailwind
Setup shadcn/ui
Setup Prisma
Setup PostgreSQL
Setup env variables
Setup Arabic RTL layout
```

Done:

```txt
App runs
Database connects
Dashboard shell exists
```

## Phase 2 — Database

Create:

```txt
User
Party
AccountTransaction
AuditLog optional
```

Seed:

```txt
Owner user
```

Rules:

```txt
Use Decimal
No Party.balance as source of truth
```

## Phase 3 — Auth and Roles

Roles:

```txt
OWNER
ACCOUNTANT
VIEWER
```

Permissions:

```txt
party.view
party.create
party.update
transaction.view
transaction.create
transaction.reverse
statement.view
report.view
```

## Phase 4 — Shared Utilities

Create:

```txt
src/lib/action-result.ts
src/lib/auth-context.ts
src/lib/permissions.ts
src/lib/money.ts
src/lib/pagination.ts
src/lib/errors.ts
```

Rules:

```txt
Never trust createdBy from client
Use server session user
Arabic error mapping
```

## Phase 5 — Party Module

Files:

```txt
src/modules/parties/party.types.ts
src/modules/parties/party.validators.ts
src/modules/parties/party.repository.ts
src/modules/parties/party.service.ts
src/modules/parties/party.actions.ts
src/modules/parties/party.mappers.ts
```

Routes:

```txt
/parties
/parties/new
/parties/[id]
/parties/[id]/edit
```

## Phase 6 — Account Transactions

Files:

```txt
src/modules/account-transactions/account-transaction.types.ts
src/modules/account-transactions/account-transaction.validators.ts
src/modules/account-transactions/account-transaction.repository.ts
src/modules/account-transactions/account-transaction.service.ts
src/modules/account-transactions/account-transaction.actions.ts
src/modules/account-transactions/account-transaction.mappers.ts
```

Routes:

```txt
/transactions
/transactions/new
```

Rules:

```txt
amount > 0
posted transaction immutable
reversal requires reason
```

## Phase 7 — Statements

Files:

```txt
src/modules/statements/statement.service.ts
src/modules/statements/statement.actions.ts
src/modules/statements/statement.mappers.ts
```

Methods:

```txt
getPartyStatement
calculatePartyBalance
calculateRunningBalance
getPartyBalanceSummary
```

Route:

```txt
/parties/[id]/statement
```

## Phase 8 — Reports

Reports:

```txt
Receivables
Payables
All balances
Transactions summary
```

Routes:

```txt
/reports/receivables
/reports/payables
/reports/balances
```

## Phase 9 — UI Polish

```txt
Arabic RTL
Dashboard cards
Balance badges
Mobile cards
Empty states
Loading states
Clear Arabic errors
```

## Phase 10 — Tests and QA

Test:

```txt
Balance calculation
Supplier flow
Customer flow
Statement running balance
Reversal
Permissions
Server actions
UI smoke
```

## Recommended File Structure

```txt
src/app/(dashboard)/dashboard/page.tsx
src/app/(dashboard)/parties/page.tsx
src/app/(dashboard)/parties/new/page.tsx
src/app/(dashboard)/parties/[id]/page.tsx
src/app/(dashboard)/parties/[id]/edit/page.tsx
src/app/(dashboard)/parties/[id]/statement/page.tsx
src/app/(dashboard)/transactions/page.tsx
src/app/(dashboard)/transactions/new/page.tsx
src/app/(dashboard)/reports/receivables/page.tsx
src/app/(dashboard)/reports/payables/page.tsx
src/app/(dashboard)/reports/balances/page.tsx

src/modules/parties/
src/modules/account-transactions/
src/modules/statements/
src/modules/reports/
src/lib/
```

## First Coding Prompt

```txt
Build the foundation for a simple Pharmacy Accounts MVP using Next.js only.

Read all MVP docs.

Implement only:
- Prisma schema for User, Party, AccountTransaction
- Enums
- Basic seed owner user
- Prisma client setup
- ActionResult utility
- Money utility
- Basic Arabic RTL dashboard shell

Critical rules:
- Do not implement inventory.
- Do not implement POS.
- Do not implement products.
- Do not add Party.balance as source of truth.
- AccountTransaction is the source of truth for balances.
- Use Decimal for money.
- Never trust client createdBy/userId.

After implementation, summarize files changed, migration, seed, tests, and risks.
```

## Release Checklist

```txt
Login works
Dashboard works
Party CRUD works
Transaction creation works
Reversal works
Statement works
Receivables report works
Payables report works
Permissions work
Mobile usable
No manual balance edit
Tests pass
Manual QA passes
```

## Final Rule

```txt
Ship the smallest useful accounts system first, then add inventory later.
```
