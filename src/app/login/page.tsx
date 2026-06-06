"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {
  success: false,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">صيدلية حسابات</h1>
          <p className="text-sm text-zinc-500 mt-1">Pharmacy Accounts Lite</p>
        </div>

        {/* Form card */}
        <div className="card">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            تسجيل الدخول
          </h2>

          <form action={formAction}>
            {/* Error alert */}
            {state.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {state.error.message}
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="example@domain.com"
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full mt-2"
            >
              {isPending ? "جاري التحميل..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-400 mt-4">
          الإصدار 0.1.0 — MVP
        </p>
      </div>
    </div>
  );
}