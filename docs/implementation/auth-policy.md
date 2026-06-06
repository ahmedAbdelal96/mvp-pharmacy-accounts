# Auth Policy

**Date:** 2026-06-06
**Project:** Pharmacy Accounts Lite — MVP

---

## 1. Auth Strategy

**HTTP-only signed cookie session — no JWT, no external auth library.**

```
pa_session cookie (HTTP-only, SameSite=strict)
  └── Token: { userId, expiresAt } signed with HMAC-SHA256
```

- Cookie is `HTTP-only` — inaccessible from JavaScript (XSS protection)
- `SameSite=Strict` — not sent on cross-site requests
- Token is signed — tamper-proof (HMAC-SHA256)
- 7-day session expiry
- `AUTH_SECRET` env var is the signing key

### AUTH_SECRET Requirement

| Environment | AUTH_SECRET Required? |
|-------------|----------------------|
| Development | Optional (falls back to dev secret) |
| Production  | **Required — throws if missing** |

Generate a strong secret:
```bash
openssl rand -base64 32
```

---

## 2. Roles

| Role | Description |
|------|-------------|
| `OWNER` | Full access to all features |
| `ACCOUNTANT` | Full access except system settings write operations |
| `VIEWER` | Read-only access only |

---

## 3. Permissions

| Permission | OWNER | ACCOUNTANT | VIEWER |
|---|---|---|---|
| `party.view` | ✅ | ✅ | ✅ |
| `party.create` | ✅ | ✅ | ❌ |
| `party.update` | ✅ | ✅ | ❌ |
| `transaction.view` | ✅ | ✅ | ✅ |
| `transaction.create` | ✅ | ✅ | ❌ |
| `transaction.reverse` | ✅ | ✅ | ❌ |
| `statement.view` | ✅ | ✅ | ✅ |
| `report.view` | ✅ | ✅ | ✅ |
| `settings.view` | ✅ | ✅ | ✅ |

### settings.view

Read-only access to general settings. **Does NOT include:**
- settings.update
- user management
- role changes
- any write operations

---

## 4. Security Rules

### Never Trust the Client

| Client-Supplied Value | Trust Level |
|----------------------|-------------|
| `userId` / `createdBy` | **Never** — always from server session |
| `role` | **Never** — assigned at user creation, never from client |
| `password` | Only during login attempt; never logged or stored in plaintext |
| `passwordHash` | Never exposed to client in any response |

### Server-Side Only Pattern

All auth logic lives in server-only files (marked with `import "server-only"`):
- `src/lib/auth/session.ts`
- `src/lib/auth/auth.service.ts`
- `src/lib/auth/get-current-user.ts`
- `src/lib/auth/require-auth.ts`
- `src/lib/prisma.ts`

### Route Protection

```
proxy.ts → checks pa_session cookie on every request
           → unauthenticated → redirect to /login
           → authenticated   → pass through

Dashboard layout → server-side requireAuth() as safety net
                 → if no session → redirect to /login
```

### Server Actions

Every Server Action that accesses data must use:
```typescript
// Require authentication (redirects to /login if not)
const user = await requireAuth();

// Require specific permission (throws Arabic error if denied)
const user = await requirePermission("transaction.create");
```

---

## 5. Session Flow

```
1. User submits email + password to /login
2. loginAction server action:
   a. verifyLogin(email, password) → checks bcrypt hash
   b. setSession(user.id) → sets HTTP-only signed cookie
   c. redirect /dashboard
3. Every subsequent request:
   a. proxy.ts reads pa_session cookie
   b. Decodes and verifies HMAC signature
   c. Checks expiry
   d. Allows request to proceed
4. Logout: clearSession() → deletes cookie
```

---

## 6. Seed User

The seed script creates one OWNER user:

```
Email:    owner@pharmacy.local
Password: owner123  ⚠️  Change after first login
Role:     OWNER
```

---

## 7. Files Reference

| File | Purpose |
|------|---------|
| `src/lib/auth/session.ts` | Session cookie: setSession, getSession, clearSession |
| `src/lib/auth/auth.service.ts` | verifyLogin (bcryptjs, no passwordHash exposure) |
| `src/lib/auth/get-current-user.ts` | getCurrentUser (session → DB lookup) |
| `src/lib/auth/require-auth.ts` | requireAuth, requirePermission |
| `src/lib/permissions.ts` | hasPermission, role-permission map |
| `src/proxy.ts` | Route protection middleware |
| `src/app/login/page.tsx` | Login form UI |
| `src/app/login/actions.ts` | loginAction server action |
| `src/app/actions.ts` | logoutAction server action |
| `src/app/(dashboard)/TopBar.tsx` | User name + role + logout button |
| `src/app/(dashboard)/layout.tsx` | Server-side auth check |

---

## 8. Out of Scope

- User registration (only seeded users)
- Password reset
- Session refresh on activity
- Multi-factor authentication
- OAuth / SSO
- `settings.update` / `users.manage`