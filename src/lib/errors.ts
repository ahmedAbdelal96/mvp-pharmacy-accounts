/**
 * Application errors — typed error classes for the app domain.
 *
 * Use these instead of generic Error to get typed, user-friendly
 * Arabic error messages from Server Actions.
 */

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ─── Validation Errors ───────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super("VALIDATION_ERROR", message, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    const msg = id ? `${entity} برقم ${id} غير موجود` : `${entity} غير موجود`;
    super("NOT_FOUND", msg);
    this.name = "NotFoundError";
  }
}

// ─── Permission Errors ───────────────────────────────────────

export class ForbiddenError extends AppError {
  constructor(action: string) {
    super("FORBIDDEN", `ليس لديك صلاحية: ${action}`);
    this.name = "ForbiddenError";
  }
}

// ─── Transaction Errors ─────────────────────────────────────

export class TransactionError extends AppError {
  constructor(message: string) {
    super("TRANSACTION_ERROR", message);
    this.name = "TransactionError";
  }
}

export class AlreadyReversedError extends TransactionError {
  constructor() {
    super("هذه الحركة تم عكسها بالفعل");
    this.name = "AlreadyReversedError";
  }
}

export class InvalidReversalError extends TransactionError {
  constructor() {
    super("لا يمكن عكس هذه الحركة");
    this.name = "InvalidReversalError";
  }
}

// ─── Party Errors ───────────────────────────────────────────

export class PartyError extends AppError {
  constructor(message: string) {
    super("PARTY_ERROR", message);
    this.name = "PartyError";
  }
}

// ─── Auth Errors ─────────────────────────────────────────────

export class AuthError extends AppError {
  constructor(message = "يجب تسجيل الدخول أولاً") {
    super("AUTH_ERROR", message);
    this.name = "AuthError";
  }
}

/**
 * Map AppError to ActionResult.failure-compatible shape
 */
export function toActionResultError(
  error: unknown
): { code: string; message: string; details?: Record<string, string> } {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }
  if (error instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: "حدث خطأ غير متوقع",
    };
  }
  return {
    code: "INTERNAL_ERROR",
    message: "حدث خطأ غير متوقع",
  };
}