"use server";

import { redirect } from "next/navigation";
import { verifyLogin } from "@/lib/auth/auth.service";
import { setSession } from "@/lib/auth/session";

export interface LoginState {
  success: boolean;
  error?: { code: string; message: string };
  email?: string;
}

/**
 * Login Server Action.
 * Returns a plain object (not ActionResult) for useActionState compatibility.
 */
export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "البريد الإلكتروني غير صالح" },
    };
  }

  if (!password || password.length < 4) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "كلمة المرور مطلوبة" },
    };
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return {
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      },
    };
  }

  // Create session cookie
  await setSession(user.id);

  // Redirect to dashboard
  redirect("/dashboard");
}