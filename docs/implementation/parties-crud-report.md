# Parties CRUD — Implementation Report

**Date:** 2026-06-06
**Commit:** `2c6dd12`
**Phase:** Parties CRUD

---

## What Was Implemented

### Module Structure (`src/modules/parties/`)

| File | Purpose |
|------|---------|
| `party.types.ts` | Local enums (`PartyType`, `PartyStatus`) + domain types — no Prisma runtime coupling |
| `party.validators.ts` | Zod schemas with Arabic error messages |
| `party.mappers.ts` | Prisma `Party` ↔ domain type mapping |
| `party.repository.ts` | Direct Prisma CRUD operations |
| `party.service.ts` | Business logic + `requirePermission` enforcement |
| `party.actions.ts` | Server Actions (create, update, setStatus) |
| `index.ts` | Clean barrel exports |

### Pages

| Route | Component | Notes |
|-------|-----------|-------|
| `/parties` | Server page | Real list, search, type/status filters |
| `/parties/new` | Client form | `useActionState` + Zod validation |
| `/parties/[id]` | Server page | Party details + balance placeholder |
| `/parties/[id]/edit` | Server + Client | Edit form with `useActionState` |

---

## Security Model

### Permissions Enforced

| Permission | OWNER | ACCOUNTANT | VIEWER |
|---|---|---|---|
| `party.view` | ✅ | ✅ | ✅ |
| `party.create` | ✅ | ✅ | ❌ |
| `party.update` | ✅ | ✅ | ❌ |

### Server-Side Trust

- `createdById` comes from `requirePermission("party.create")` → server session → **never from client**
- `createdById` passed from `requireAuth()` in service layer, not from request
- Zod validation on all inputs with Arabic error messages
- `id` of party being updated is read from DB, not trusted from client

### Server Actions Pattern

```typescript
// redirect() must be OUTSIDE try/catch — it throws internally
let partyId: string;
try {
  const result = await createParty(parsed.data);
  partyId = result.id;
} catch (err) {
  return { success: false, error: { code, message } };
}
redirect(`/parties/${partyId}`); // throws — never returns
```

---

## Party.balance — NOT Added

**Confirmed: `Party` model has NO `balance` field.**

Balance is always calculated from `AccountTransaction` records:
```
netBalance = sum(PARTY_OWES_US where status=POSTED)
           - sum(WE_OWE_PARTY where status=POSTED)
```

The party detail page shows a placeholder:
> "سيتم حساب الرصيد من الحركات لاحقاً"

---

## Balance Placeholder

Party detail page displays two placeholder cards:

1. **الرصيد الحالي** — "سيتم حساب الرصيد من الحركات لاحقاً" (pending implementation)
2. **إضافة حركة / كشف حساب** — dashed border placeholder (disabled until Transactions module)

These are wired with `balancePending: true` from the service layer — ready to be replaced once Account Transactions are implemented.

---

## Filter Validation

Search params are validated with `partyFiltersSchema.safeParse()`:

```typescript
const parsed = partyFiltersSchema.safeParse({
  search: params.search,
  type: params.type,
  status: params.status,
});

const filters = parsed.success ? parsed.data : {};
```

Invalid `type` / `status` values fall back to safe empty filters — Prisma never receives invalid enum values.

---

## Static Build Protection

All DB-backed pages export `dynamic = "force-dynamic"`:

```typescript
// Opt out of static generation — requires DB
export const dynamic = "force-dynamic";
```

This prevents Next.js from running Prisma queries at build time when the DB is not available.

Protected pages:
- `/dashboard`
- `/parties`
- `/parties/[id]`
- `/parties/[id]/edit`

---

## Zod Validation Errors

All validation errors return Arabic messages:
- `"اسم الطرف مطلوب"` — required name
- `"النوع مطلوب"` — required type
- `"كلمة المرور طويلة جداً"` — too long

---

## Manual QA Checklist

### Create
- [ ] Create a supplier (مورد)
- [ ] Create a customer (عميل)
- [ ] Create a medicine company (شركة أدوية)
- [ ] Create a party with phone and address
- [ ] Create with INACTIVE status
- [ ] VIEWER cannot see "إضافة طرف" button

### Read
- [ ] Parties list shows correct type badges
- [ ] Parties list shows correct status badges
- [ ] Search by name works
- [ ] Search by phone works
- [ ] Filter by type works
- [ ] Filter by status works
- [ ] Filter by type + status works
- [ ] Empty state shown when no results

### Update
- [ ] Edit page loads with correct data
- [ ] Update name works
- [ ] Update phone works
- [ ] Update address works
- [ ] Update type works
- [ ] Update status (activate/deactivate) works
- [ ] VIEWER cannot access edit page (redirect or not-found)
- [ ] ACCOUNTANT can edit

### Delete / Status
- [ ] Deactivate party works
- [ ] Activate party works
- [ ] Deactivated party appears in list with inactive badge
- [ ] Deactivated party filtered out of default view

### Permissions
- [ ] VIEWER: no create button
- [ ] VIEWER: no edit button on party detail
- [ ] VIEWER: edit URL returns not-found
- [ ] ACCOUNTANT: can create and edit

### Edge Cases
- [ ] Very long name truncated/handled
- [ ] Special characters in phone handled
- [ ] Empty search returns all active parties
- [ ] Invalid type/status URL params fall back gracefully

---

## Pending: Account Transactions

Next phase implements:

```
src/modules/account-transactions/
├── account-transaction.repository.ts  — createTransaction, reverseTransaction, listByParty
├── account-transaction.service.ts    — balance calc, reversal logic
├── account-transaction.actions.ts    — create, reverse Server Actions
└── statements/statement.service.ts  — calculateBalance, calculateRunningBalance
```

Once implemented:
- Party detail page: real balance + running balance
- Party detail page: "إضافة حركة" → active link
- Party detail page: "كشف حساب" → active link
- Dashboard: real receivables/payables summary cards

---

## Confirmed Scope

| Rule | Status |
|------|--------|
| No `Party.balance` field | ✅ Confirmed |
| `AccountTransaction` is balance source of truth | ✅ Confirmed |
| No `Tenant` / `tenantId` | ✅ Confirmed |
| No inventory / POS / products | ✅ Confirmed |
| No branches / warehouses | ✅ Confirmed |
| No full double-entry accounting | ✅ Confirmed |
| `createdById` from server session | ✅ Confirmed |
| Zod validation on all inputs | ✅ Confirmed |
| `dynamic = "force-dynamic"` on DB pages | ✅ Confirmed |