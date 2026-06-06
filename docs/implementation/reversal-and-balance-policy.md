# Reversal and Balance Policy

**Date:** 2026-06-06
**Project:** Pharmacy Accounts Lite — MVP
**Status:** FINAL — Must be implemented exactly as specified

---

## 1. Core Principle

> **AccountTransaction is the sole source of truth for balances.**
>
> **Balance filter = `status = POSTED` only.**
>
> Posted transactions are **immutable**. Corrections happen through reversal transactions.

---

## 2. Reversal Policy

### 2.1 What Happens During Reversal

When a transaction is reversed:

1. **Original transaction** — `status` changes from `POSTED` → `REVERSED`. The record is **never deleted or modified** in any other way.
2. **Reversal transaction** — A **new** transaction is created with the **opposite direction** and the **same amount**. It starts with `status = POSTED`.
3. **Both transactions remain visible** in the party statement (for full audit trail).
4. **The `reversalTransactionId`** on the original points to the reversal transaction (for UI linking purposes).
5. **Reversal is one-way.** A reversal transaction itself **cannot be reversed** again. The system rejects any attempt to reverse an already-reversed transaction.

### 2.2 Reversal Fields

```
original.status            = REVERSED
original.reversedById      = user who performed reversal
original.reversedAt        = timestamp of reversal
original.reversalReason    = required reason text
original.reversalTransactionId = FK → reversal transaction

reversal.status            = POSTED
reversal.reversalTransactionId = FK → original transaction (self-reference)
```

### 2.3 Rules

| Rule | Detail |
|------|--------|
| Reason required | Reversal must include a `reversalReason`. No reversals without a reason. |
| Reversal creates opposite | If original is `PARTY_OWES_US`, reversal is `WE_OWE_PARTY` (and vice versa). |
| Same amount | Reversal amount equals original amount. |
| Reversal is POSTED | The reversal transaction itself has `status = POSTED` and affects balance. |
| Original is REVERSED | The original transaction has `status = REVERSED` and does NOT affect balance. |
| No double-reversal | An already-reversed transaction cannot be reversed again. |
| Reversal transaction is not reversible | The reversal transaction itself cannot be reversed. |
| Both visible in statement | Original (REVERSED) and reversal (POSTED) both appear in the statement for audit. |

### 2.4 Reversal Examples

#### Customer — Payment Reversal

```
Step 1: Customer pays 1000 (PARTY_OWES_US, 1000, POSTED)
  → Balance: عليه 1000

Step 2: Reverse the payment (WE_OWE_PARTY, 1000, POSTED)
  → Original becomes REVERSED (no balance effect)
  → Reversal is POSTED (adds له 1000)
  → Net effect: 1000 - 1000 = 0 → متوازن
```

#### Supplier — Debt Reversal

```
Step 1: Supplier has له 5000 (WE_OWE_PARTY, 5000, POSTED)
  → Balance: له 5000

Step 2: Reverse the debt (PARTY_OWES_US, 5000, POSTED)
  → Original becomes REVERSED (no balance effect)
  → Reversal is POSTED (adds عليه 5000)
  → Net effect: 5000 - 5000 = 0 → متوازن
```

---

## 3. Balance Policy

### 3.1 Balance Formula

```
netBalance = sum(amount where direction=PARTY_OWES_US AND status=POSTED)
           - sum(amount where direction=WE_OWE_PARTY AND status=POSTED)
```

**Only `status = POSTED` transactions are included in balance calculation.**

The `reversalTransactionId` field is **not used** in balance calculation. It exists only for UI linking (showing "This transaction was reversed by #X").

### 3.2 Balance Display

| netBalance | Side | Arabic Label | Meaning |
|-----------|------|-------------|---------|
| > 0 | `PAYABLE` | عليه | Party owes us (receivable) |
| < 0 | `RECEIVABLE` | له | We owe party (payable) |
| = 0 | `ZERO` | متوازن | Fully settled |

### 3.3 Why `status` is the Filter (Not Just Exclusion)

Using `status = POSTED` as the filter is the safest approach because:

- **Original transaction** (`status = REVERSED`) — filtered out by status
- **Reversal transaction** (`status = POSTED`) — included, adds opposite amount
- **Net effect** — exactly zero, as required

This means:
- You do NOT need to check `reversalTransactionId` to calculate balances correctly
- If a reversal transaction exists without the original being marked REVERSED, the balance is WRONG — and `status` is the single source of truth for that check
- The audit trail is complete: both transactions appear in the statement

### 3.4 Statement Display

In the party statement (كشف حساب):

- **All transactions appear** — both original and reversal, regardless of status
- **Running balance** is calculated per-row using the same `status = POSTED` filter
- **Status column** shows `POSTED` or `REVERSED` per transaction
- **REVERSED transactions** appear with a visual indicator (e.g., strikethrough or badge) but are **not excluded** from the statement

### 3.5 Receivables vs Payables

```
Receivables (تقرير الأطراف التي عليها) = parties where netBalance > 0 (PAYABLE)
Payables    (تقرير الأطراف التي لها)   = parties where netBalance < 0 (RECEIVABLE)
```

---

## 4. Schema Implementation Note

In `prisma/schema.prisma`:

```prisma
// Balance = sum(PARTY_OWES_US where status=POSTED)
//         - sum(WE_OWE_PARTY where status=POSTED)
// Only status=POSTED transactions affect balance.
// The reversalTransactionId link is for UI purposes only,
// not for balance calculation.
```

---

## 5. Domain Type Mapping

| Concept | Type | Value |
|---------|------|-------|
| Transaction owes us | `AccountTransactionDirection` | `PARTY_OWES_US` |
| Transaction we owe | `AccountTransactionDirection` | `WE_OWE_PARTY` |
| Transaction active | `AccountTransactionStatus` | `POSTED` |
| Transaction reversed | `AccountTransactionStatus` | `REVERSED` |
| Balance: party owes us | `BalanceSide` | `PAYABLE` (عليه) |
| Balance: we owe party | `BalanceSide` | `RECEIVABLE` (له) |
| Balance: settled | `BalanceSide` | `ZERO` (متوازن) |

---

## 6. Test Cases

### 6.1 Customer Debt Flow

```
1. Customer bought items, owes 1000
   Transaction: PARTY_OWES_US 1000, POSTED
   Balance: عليه 1000 ✓

2. Customer paid 400
   Transaction: WE_OWE_PARTY 400, POSTED
   Balance: عليه 600 ✓

3. Customer paid remaining 600
   Transaction: WE_OWE_PARTY 600, POSTED
   Balance: متوازن ✓
```

### 6.2 Supplier Debt Flow

```
1. Bought from supplier, owe 5000
   Transaction: WE_OWE_PARTY 5000, POSTED
   Balance: له 5000 ✓

2. Paid supplier 2000
   Transaction: PARTY_OWES_US 2000, POSTED
   Balance: له 3000 ✓
```

### 6.3 Reversal — Customer Payment

```
1. Customer paid 1000
   Transaction: PARTY_OWES_US 1000, POSTED
   Balance: عليه 1000

2. Mistake! Reverse the payment
   Original: status → REVERSED, reversalReason = "wrong amount"
   Reversal: WE_OWE_PARTY 1000, POSTED
   Balance: متوازن ✓
   Statement shows BOTH transactions (for audit)
```

### 6.4 Reversal — Supplier Debt

```
1. Supplier invoice له 5000
   Transaction: WE_OWE_PARTY 5000, POSTED
   Balance: له 5000

2. Wrong invoice! Reverse it
   Original: status → REVERSED
   Reversal: PARTY_OWES_US 5000, POSTED
   Balance: متوازن ✓
```

### 6.5 Double-Reversal Prevention

```
1. Transaction A: PARTY_OWES_US 1000, POSTED
2. Reverse A → REVERSED, reversal B: WE_OWE_PARTY 1000, POSTED
3. Try to reverse B → MUST REJECT (B is a reversal transaction)
4. Try to reverse A again → MUST REJECT (A already REVERSED)
```

---

## 7. Confirmed Scope

| Rule | Status |
|------|--------|
| No `Party.balance` field | ✅ Confirmed |
| Balance from `AccountTransaction` only | ✅ Confirmed |
| `status = POSTED` is balance filter | ✅ Confirmed |
| `reversalTransactionId` for UI only | ✅ Confirmed |
| Posted transactions immutable | ✅ Confirmed |
| Corrections via reversal only | ✅ Confirmed |
| Both original and reversal visible in statement | ✅ Confirmed |
| No Tenant / tenantId | ✅ Confirmed |
| No inventory / POS / products | ✅ Confirmed |