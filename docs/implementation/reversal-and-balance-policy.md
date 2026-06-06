# Reversal and Balance Policy (Corrected V1)

**Date:** 2026-06-06
**Project:** Pharmacy Accounts Lite — MVP
**Status:** FINAL — V1 Simplified Reversal
**Supersedes:** Previous reversal policy that incorrectly created opposite POSTED transactions

---

## 1. Core Principle

> **AccountTransaction is the sole source of truth for balances.**
>
> **Balance filter = `status = POSTED` only.**
>
> Posted transactions are **immutable**. Corrections happen through **reversal** (status change + audit).

---

## 2. The Math Problem with "Opposite POSTED Transaction"

The previous version of this policy incorrectly stated:
> "Create an opposite POSTED transaction during reversal"

This produces a **non-zero net balance**, which is wrong:

```
Original: PARTY_OWES_US 1000, status → REVERSED (excluded)
New reversal: WE_OWE_PARTY 1000, status = POSTED (included)
Balance = -1000  ← NOT ZERO — policy was WRONG
```

The correct reversal for `PARTY_OWES_US` is **not** `WE_OWE_PARTY` as a POSTED transaction.
The correct reversal is a **status-only change**.

---

## 3. Reversal Policy (V1 — Simplified)

### 3.1 What Happens During Reversal

When a transaction is reversed in V1:

1. **Original transaction** — `status` changes from `POSTED` → `REVERSED`
2. **No new transaction is created**
3. **Reversal fields are populated:**
   - `reversedById` = user who performed the reversal
   - `reversedAt` = timestamp
   - `reversalReason` = required reason text

### 3.2 Reversal Fields

```
original.status            = REVERSED
original.reversedById      = user who performed reversal
original.reversedAt        = timestamp of reversal
original.reversalReason    = required reason text
original.reversalTransactionId = (optional, for future use / manual links)
```

### 3.3 Rules

| Rule | Detail |
|------|--------|
| Reason required | Reversal must include a `reversalReason`. No reversals without a reason. |
| Status changes only | No new transaction is created. Only `status` and audit fields change. |
| REVERSED excluded from balance | `status = REVERSED` transactions are excluded from ALL balance calculations. |
| REVERSED visible in statement | Original transaction remains visible in the statement with a REVERSED badge for audit. |
| Running balance unaffected | REVERSED rows appear in statement but do not contribute to the running balance column. |
| Cannot reverse twice | An already REVERSED transaction cannot be reversed again. |
| Immutability | No field on a POSTED transaction is ever modified except for reversal. |

### 3.4 Why This Works

```
Original: PARTY_OWES_US 1000, status = POSTED
  → Included in balance: +1000 → balance = +1000 (عليه)

Original reversed: status → REVERSED
  → Excluded from balance: +0
  → Balance = 0 → متوازن ✓
```

```
Original: WE_OWE_PARTY 5000, status = POSTED
  → Included in balance: -5000 → balance = -5000 (له)

Original reversed: status → REVERSED
  → Excluded from balance: +0
  → Balance = 0 → متوازن ✓
```

The `reversalTransactionId` field in the schema is kept for:
- Future: linking to a manually-created accounting reversal entry
- Current: optional audit reference (can be left null)

It is **NOT required** for balance calculation and **does not affect** the balance formula.

---

## 4. Balance Policy

### 4.1 Balance Formula

```
netBalance = sum(amount where direction=PARTY_OWES_US AND status=POSTED)
           - sum(amount where direction=WE_OWE_PARTY AND status=POSTED)
```

**Only `status = POSTED` transactions are included in balance calculation.**

### 4.2 Balance Display

| netBalance | BalanceSide | Arabic | Meaning |
|-----------|-------------|--------|---------|
| > 0 | `PARTY_OWES_US` | عليه | Party owes us — we have a receivable |
| < 0 | `WE_OWE_PARTY` | له | We owe the party — we have a payable |
| = 0 | `ZERO` | متوازن | Fully settled |

### 4.3 Statement Display

In the party statement (كشف حساب):

- **All transactions appear** — both POSTED and REVERSED
- **REVERSED rows** show a badge (e.g., "تم العكس") and are excluded from running balance
- **Running balance column** uses only POSTED transactions
- **Status column** clearly shows `POSTED` or `REVERSED`

### 4.4 Why `status` is the Sole Filter

- REVERSED transactions are excluded by `status = POSTED`
- No need to check `reversalTransactionId` for balance calculation
- Complete audit trail: both original and its REVERSED status are visible

---

## 5. Future Extension (Outside V1 Scope)

If a future version needs full double-entry accounting with a proper journal:

- A reversal would create a new `POSTED` transaction with the **opposite direction**
- Both original and reversal would be `POSTED` and would **both** appear in balance
- The **net** of the two would be zero
- This requires a proper accounting module design before implementing
- The current schema's `reversalTransactionId` can support this when needed

**For V1, this is out of scope.**

---

## 6. Domain Type Mapping

| Concept | Type | Value |
|---------|------|-------|
| Transaction: party owes us | `AccountTransactionDirection` | `PARTY_OWES_US` |
| Transaction: we owe party | `AccountTransactionDirection` | `WE_OWE_PARTY` |
| Transaction active | `AccountTransactionStatus` | `POSTED` |
| Transaction reversed | `AccountTransactionStatus` | `REVERSED` |
| Balance: party owes us | `BalanceSide` | `PARTY_OWES_US` (عليه) |
| Balance: we owe party | `BalanceSide` | `WE_OWE_PARTY` (له) |
| Balance: settled | `BalanceSide` | `ZERO` (متوازن) |

**Naming rationale:** `BalanceSide` uses the same labels as `AccountTransactionDirection` to avoid confusion. `PARTY_OWES_US` means "the balance says the party owes us" (the party is in debt to us).

---

## 7. Test Cases

### 7.1 Customer — Initial Debt

```
1. Customer bought items, owes 1000
   Transaction: PARTY_OWES_US 1000, POSTED
   Balance: PARTY_OWES_US 1000 → عليه 1000 ✓
```

### 7.2 Customer — Partial Payment

```
2. Customer paid 400
   Transaction: WE_OWE_PARTY 400, POSTED
   Balance: PARTY_OWES_US 600 → عليه 600 ✓
```

### 7.3 Customer — Full Settlement

```
3. Customer paid remaining 600
   Transaction: WE_OWE_PARTY 600, POSTED
   Balance: ZERO → متوازن ✓
```

### 7.4 Customer — REVERSED Row in Statement (Audit Trail)

```
1. Customer owes 1000
   Transaction: PARTY_OWES_US 1000, POSTED
   Running balance: عليه 1000

2. Wrong amount! Reverse it
   status → REVERSED, reversalReason = "wrong amount"
   Statement shows:
   Row 1: PARTY_OWES_US 1000 [REVERSED badge] ← excluded from running balance
   Balance: ZERO → متوازن ✓
   Audit: both original and its REVERSED status are visible
```

### 7.5 Supplier — Initial Debt (We Owe Supplier)

```
1. Bought from supplier, owe 5000
   Transaction: WE_OWE_PARTY 5000, POSTED
   Balance: WE_OWE_PARTY 5000 → له 5000 ✓
```

### 7.6 Supplier — Partial Payment

```
2. Paid supplier 2000
   Transaction: PARTY_OWES_US 2000, POSTED
   Balance: WE_OWE_PARTY 3000 → له 3000 ✓
```

### 7.7 Supplier — REVERSED Row in Statement

```
1. Supplier له 5000
   Transaction: WE_OWE_PARTY 5000, POSTED
   Balance: له 5000

2. Wrong invoice! Reverse it
   status → REVERSED, reversalReason = "wrong invoice"
   Statement shows:
   Row 1: WE_OWE_PARTY 5000 [REVERSED badge] ← excluded from running balance
   Balance: ZERO → متوازن ✓
```

### 7.8 Double-Reversal Prevention

```
1. Transaction A: PARTY_OWES_US 1000, POSTED
2. Reverse A → status = REVERSED
3. Try to reverse A again → MUST REJECT (already REVERSED) ✓
4. Try to reverse the "reversal" (there is no separate reversal transaction) → N/A
```

### 7.9 Cannot Reverse a REVERSED Transaction

```
1. Transaction A: PARTY_OWES_US 1000, POSTED
2. Reverse A → REVERSED
3. Attempt to reverse A again → Error: "هذه الحركة تم عكسها بالفعل" ✓
```

---

## 8. Confirmed Scope

| Rule | Status |
|------|--------|
| No `Party.balance` field | ✅ Confirmed |
| Balance from `AccountTransaction` only | ✅ Confirmed |
| `status = POSTED` is balance filter | ✅ Confirmed |
| Reversal is status change only (V1) | ✅ Confirmed |
| No opposite POSTED transaction created on reversal | ✅ Confirmed |
| REVERSED transactions visible in statement | ✅ Confirmed |
| REVERSED transactions do not affect running balance | ✅ Confirmed |
| No Tenant / tenantId | ✅ Confirmed |
| No inventory / POS / products | ✅ Confirmed |
| No full double-entry accounting | ✅ Confirmed |