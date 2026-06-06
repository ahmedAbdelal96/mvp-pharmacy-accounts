# Architecture Cleanup Report

**Date:** 2026-06-06
**Project:** Pharmacy Accounts Lite — MVP Foundation
**Phase:** Pre-implementation Architecture Review

---

## 1. Current State Assessment

### What Was Already Implemented

| Layer | Status | Notes |
|-------|--------|-------|
| Next.js App Router + TypeScript | ✅ Good | App Router, strict TypeScript, src directory |
| Tailwind CSS | ✅ Good | RTL-ready, Arabic utility classes defined |
| Prisma Schema | ✅ Good | User, Party, AccountTransaction, AuditLog with correct enums |
| Prisma 7 + pg Adapter | ✅ Good | `@prisma/adapter-pg` + `pg` Pool correctly wired |
| Decimal for money | ✅ Good | `Decimal @db.Decimal(18,2)`, `decimal.js` library used |
| Dashboard Layout | ⚠️ Needs work | Entire layout is `"use client"` — too broad |
| `src/lib/` utilities | ⚠️ 1 issue | `money.ts` imports Prisma runtime type |
| Module structure | ❌ Missing | No `src/modules/` folders yet |
| ESLint / Build | ✅ Passed | Build was clean before this review |

### Architecture Problems Identified

#### Problem 1 — `money.ts` imports Prisma runtime type (HIGH)
**File:** `src/lib/money.ts:7`

```typescript
import { AccountTransactionDirection } from "@/generated/prisma";
```

**Risk:** The `client.ts` file imports from `@prisma/client/runtime/client` which uses Node.js built-ins (`path`, `fs`, `process`). If `money.ts` is imported from a client component (e.g., a dashboard card that formats a balance), the entire Prisma runtime leaks into the client bundle.

**Fix:** Create local domain string-literal types for `AccountTransactionDirection` in `src/modules/account-transactions/account-transaction.types.ts`. Update `money.ts` to import from that instead.

#### Problem 2 — Dashboard layout is fully client-side (MEDIUM)
**File:** `src/app/(dashboard)/layout.tsx`

```typescript
"use client";
```

The entire dashboard shell (sidebar, header, navigation) is a client component. `usePathname()` is the only reason for the `"use client"` directive.

**Fix:** Split into:
- `layout.tsx` — Server component (renders shell HTML)
- `SidebarNav.tsx` — `"use client"` (only the interactive nav with `usePathname`)

#### Problem 3 — `permissions.ts` imports `UserRole` from Prisma (LOW)
**File:** `src/lib/permissions.ts:20`

```typescript
import { UserRole } from "@/generated/prisma";
```

This is less risky than `money.ts` because permissions are typically server-side only. However, it couples the lib to Prisma. For cleanliness, `UserRole` should be defined locally in `src/modules/auth/auth.types.ts`.

#### Problem 4 — `AuthError` exists but auth is not implemented (INFO)
**File:** `src/lib/errors.ts`

`AuthError` is defined but there is no login/logout, no session, no protected routes. This is expected for MVP foundation — auth is Phase 3. No action needed.

#### Problem 5 — `Party.name` has no unique constraint (LOW / Acceptable)
**File:** `prisma/schema.prisma`

```prisma
model Party {
  name String  // No @unique
  @@index([name])
}
```

Two parties could have the same name. For a single-pharmacy MVP this is acceptable. In production, you'd want a unique constraint + case-insensitive index. No action needed for MVP.

#### Problem 6 — `reversalTransactionId` self-relation is correct (INFO)
The self-referencing `reversalOf` / `reversedTransaction` relation is correctly modeled. No issue.

---

## 2. Schema Review (No Tenant)

### Confirmed: Single-Pharmacy MVP ✅

- No `tenantId` anywhere ✅
- No `Tenant` model ✅
- `Party` has no `balance` field ✅
- `AccountTransaction.amount` uses `Decimal @db.Decimal(18, 2)` ✅
- `transactionNumber` is `@unique` (server-generated) ✅
- Indexes support statements and reports ✅

### Index Coverage for Reports

| Report Query | Index Used |
|---|---|
| Party statement (by partyId) | `@@index([partyId])` ✅ |
| Transactions by date range | `@@index([transactionDate])` ✅ |
| Receivables (PARTY_OWES_US) | `@@index([direction])` ✅ |
| Payables (WE_OWE_PARTY) | `@@index([direction])` ✅ |
| By type | `@@index([type])` ✅ |
| By status | `@@index([status])` ✅ |

**Missing index:** For the balances report (all parties), we need to aggregate by `partyId`. An index on `(partyId, direction, status)` would be ideal for efficient balance calculation. This is a recommended addition.

### Recommended Schema Addition

```prisma
// In AccountTransaction model, replace individual indexes with a compound index:
@@index([partyId, direction, status])  // For balance calculation queries
```

---

## 3. Performance & Maintainability Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Prisma runtime in client bundle | HIGH | Fix `money.ts` to use local types |
| Large client bundle from unused imports | MEDIUM | Ensure tree-shaking works; use `type` imports |
| No pagination on party/transaction lists | LOW | Plan for cursor/offset pagination in CRUD phase |
| No caching strategy | LOW | Add `revalidatePath` / `unstable_cache` in CRUD phase |
| `Decimal` serialization in JSON | LOW | Prisma 7 handles `Decimal` as `object` not `string` — ensure JSON serializability in API layer |

---

## 4. Migration Discipline

- Project uses `prisma.config.ts` (Prisma 7 style) ✅
- `prisma db push` was used for initial setup ✅
- No migration history yet ✅
- Recommendation: switch to `prisma migrate dev` for proper migration history
- `npx prisma migrate dev --name init` should be the next database command

---

## 5. Module Structure Plan

```
src/modules/
├── auth/                    # Auth (login, session, protected routes)
│   ├── auth.types.ts        # UserRole, SessionUser, Permission types
│   ├── auth.service.ts      # (pending: implement in phase 3)
│   ├── auth.actions.ts      # (pending: implement in phase 3)
│   └── index.ts
│
├── parties/                 # Parties CRUD
│   ├── party.types.ts      # Party entity types (no balance!)
│   ├── party.validators.ts # Zod schemas
│   ├── party.repository.ts # (pending)
│   ├── party.service.ts    # (pending)
│   ├── party.actions.ts    # (pending)
│   └── index.ts
│
├── account-transactions/    # Account transactions
│   ├── account-transaction.types.ts  # Domain types + local enums
│   ├── account-transaction.validators.ts
│   ├── account-transaction.repository.ts  # (pending)
│   ├── account-transaction.service.ts    # (pending)
│   ├── account-transaction.actions.ts    # (pending)
│   └── index.ts
│
├── statements/              # Party statement service
│   ├── statement.types.ts
│   ├── statement.service.ts  # calculateBalance, calculateRunningBalance
│   ├── statement.actions.ts
│   └── index.ts
│
└── reports/                  # Receivables, Payables, Balances
    ├── report.types.ts
    ├── report.service.ts
    ├── report.actions.ts
    └── index.ts
```

---

## 6. Recommended Fixes (This Session)

1. **Fix `money.ts`** — Create `src/modules/account-transactions/account-transaction.types.ts` with local `AccountTransactionDirection` type; update `money.ts` to import from there.

2. **Split dashboard layout** — Create `SidebarNav.tsx` as `"use client"`; keep `layout.tsx` as server component.

3. **Create domain types** — `auth.types.ts`, `party.types.ts`, `account-transaction.types.ts` with local enums that don't depend on Prisma runtime.

4. **Add compound index** — `(partyId, direction, status)` on `AccountTransaction` for efficient balance queries.

5. **Validate** — Run `npm run lint`, `npm run build`, `npx prisma validate`, `npx prisma generate`.

---

## 7. Next Implementation Phases (Reminder)

```
Phase 3 — Auth and Permissions       (login, logout, session, protected routes)
Phase 4 — Party Module                (CRUD + search + filters)
Phase 5 — Account Transactions       (create, reverse, list)
Phase 6 — Statements                  (statement service + page)
Phase 7 — Reports                     (receivables, payables, balances)
Phase 8 — UI Polish + QA
```

---

## 8. Confirmed Scope Boundaries

| Forbidden | Status |
|-----------|--------|
| Tenant / tenantId | ❌ NOT added ✅ |
| Inventory | ❌ NOT added ✅ |
| POS | ❌ NOT added ✅ |
| Products | ❌ NOT added ✅ |
| Branches / Warehouses | ❌ NOT added ✅ |
| Full double-entry accounting | ❌ NOT added ✅ |
| `Party.balance` source of truth | ❌ NOT added ✅ |
| `AccountTransaction` as balance source | ✅ Correct ✅ |
| Decimal for money | ✅ Correct ✅ |
| Posted transactions immutable | ✅ Correct ✅ |
| Reversal corrections only | ✅ Correct ✅ |