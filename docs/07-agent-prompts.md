# MVP — 07 Agent Prompts

## Global Rules

```txt
This is a small MVP.
Do not build inventory.
Do not build POS.
Do not build products.
Do not build branches/warehouses.
Do not build full accounting.
Build only Parties + Account Transactions + Statements + Simple Reports.
Balance comes from transactions only.
Do not add Party.balance as source of truth.
Posted transactions are immutable.
Corrections happen through reversal.
Use Next.js only.
Use Arabic RTL UI.
```

---

## Prompt 1 — Foundation and Schema

```txt
Build the foundation for a simple Pharmacy Accounts MVP using Next.js only.

Read:
- README.md
- 01-product-scope.md
- 02-database-schema.md
- 03-account-transaction-rules.md
- 04-ui-ux-flows.md
- 05-test-cases.md
- 06-implementation-plan.md

Implement only:
- Prisma schema for User, Party, AccountTransaction
- Enums: UserRole, PartyType, PartyStatus, AccountTransactionType, AccountTransactionDirection, AccountTransactionStatus
- Basic seed owner user
- Prisma client setup
- Shared ActionResult utility
- Money formatting utility
- Basic Arabic RTL dashboard layout

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

---

## Prompt 2 — Auth and Permissions

```txt
Implement simple auth and role permissions for the Pharmacy Accounts MVP.

Scope:
- Login
- Logout
- Protected dashboard routes
- Roles: OWNER, ACCOUNTANT, VIEWER
- Permission helper
- Server-side trusted user context

Permissions:
- party.view
- party.create
- party.update
- transaction.view
- transaction.create
- transaction.reverse
- statement.view
- report.view

Critical rules:
- Do not trust userId from client.
- VIEWER cannot create or reverse transactions.
- Keep implementation simple for MVP.
```

---

## Prompt 3 — Parties Module

```txt
Implement the Parties module.

Scope:
- Party validators
- Party repository
- Party service
- Party actions
- Party mappers
- Parties list page
- Create party page
- Edit party page
- Party details page

Fields:
- name
- type
- phone
- address
- contactPerson
- notes
- status

Critical rules:
- No Party.balance source of truth.
- Balance is calculated later from AccountTransaction.
- Use Arabic labels.
- Add search by name/phone/type/status.
- Respect permissions.
```

---

## Prompt 4 — Account Transactions

```txt
Implement Account Transactions.

Fields:
- partyId
- type
- direction
- amount
- transactionDate
- description
- referenceNumber optional
- notes optional

Critical rules:
- amount > 0
- transactionNumber generated server-side
- status starts POSTED
- posted transactions are immutable
- reversal requires reason
- reversal creates opposite transaction and links original
- do not edit/delete posted transactions
- do not trust client balance

Arabic:
- PARTY_OWES_US = عليه
- WE_OWE_PARTY = له
```

---

## Prompt 5 — Statements and Balances

```txt
Implement party statement and balance calculation.

Scope:
- Statement service
- Statement actions
- Balance calculation utility
- Running balance calculation
- Party statement page
- Balance badges
- Date range filter

Rules:
- Balance = sum(PARTY_OWES_US) - sum(WE_OWE_PARTY)
- Positive displays: عليه
- Negative displays: له
- Zero displays: متوازن
- Order by transactionDate ASC then createdAt ASC
- Reversed transactions do not affect active balance
- Do not use stored Party.balance

Test:
- Supplier له 5000, paid 2000 => له 3000
- Customer عليه 1000, collected 400 => عليه 600
- Reversal removes net effect
```

---

## Prompt 6 — Reports

```txt
Implement simple reports.

Scope:
- Receivables report
- Payables report
- All balances report
- Transaction summary report
- Filters by party type/date/search

Rules:
- Receivables = netBalance > 0
- Payables = netBalance < 0
- Balance comes from AccountTransaction only
- Do not use Party.balance
- Respect report.view permission
- Arabic RTL UI
```

---

## Prompt 7 — UI Polish and QA

```txt
Polish the MVP UI and run QA.

Scope:
- Arabic RTL fixes
- Dashboard cards
- Empty states
- Loading states
- Error messages
- Mobile cards
- Navigation cleanup

QA:
1. Supplier له 5000, payment عليه 2000, final له 3000.
2. Customer عليه 1000, collection له 400, final عليه 600.
3. Reverse transaction and confirm balance changes.
4. Viewer cannot create transaction.
5. Mobile statement page has no horizontal scroll.

Do not add features outside MVP scope.
```

---

## Final Agent Rule

```txt
When tempted to add inventory, products, POS, or full accounting, stop. This MVP is only accounts and statements.
```
