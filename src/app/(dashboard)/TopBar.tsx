"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions";
import type { SessionUser } from "@/modules/auth/auth.types";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "مدير النظام",
  ACCOUNTANT: "محاسب",
  VIEWER: "مشاهد",
};

export default function TopBar({ user }: { user: SessionUser }) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
  }

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-left">
          <div className="text-sm font-medium text-zinc-900">{user.name}</div>
          <div className="text-xs text-zinc-500">{ROLE_LABELS[user.role] ?? user.role}</div>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
          {user.name.charAt(0)}
        </div>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="btn btn-ghost text-xs text-zinc-500 hover:text-zinc-700"
          title="تسجيل الخروج"
        >
          {isPending ? "..." : "خروج"}
        </button>
      </div>
    </header>
  );
}