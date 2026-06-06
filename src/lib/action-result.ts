/**
 * ActionResult — a typed wrapper for Server Action responses.
 *
 * Instead of throwing errors directly from actions (which can expose
 * implementation details to the client), actions return ActionResult<T>
 * which contains either success data or a typed error.
 *
 * Usage:
 *   return ActionResult.success({ id: "123" })
 *   return ActionResult.failure({ code: "VALIDATION_ERROR", message: "الاسم مطلوب" })
 */

export type ActionResultData<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: ActionResultError };

export interface ActionResultError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export class ActionResult<T = unknown> {
  private constructor(private readonly result: ActionResultData<T>) {}

  static success<T>(data: T): ActionResult<T> {
    return new ActionResult({ success: true, data });
  }

  static failure<T>(
    code: string,
    message: string,
    details?: Record<string, string>
  ): ActionResult<T> {
    return new ActionResult({
      success: false,
      error: { code, message, details },
    });
  }

  get isSuccess(): boolean {
    return this.result.success;
  }

  get isFailure(): boolean {
    return !this.result.success;
  }

  get data(): T {
    if (!this.result.success) {
      throw new Error("Cannot access data on a failed ActionResult");
    }
    return this.result.data;
  }

  get error(): ActionResultError {
    if (this.result.success) {
      throw new Error("Cannot access error on a successful ActionResult");
    }
    return this.result.error;
  }

  unwrap(): T {
    return this.data;
  }

  unwrapOr(defaultValue: T): T {
    return this.isSuccess ? this.data : defaultValue;
  }

  toJSON(): ActionResultData<T> {
    return this.result;
  }
}