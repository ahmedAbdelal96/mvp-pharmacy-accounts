import Link from "next/link";
import { notFound } from "next/navigation";
import { getParty } from "@/modules/parties";
import {
  PARTY_TYPE_LABELS,
  PARTY_STATUS_LABELS,
} from "@/modules/parties/party.types";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function PartyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  const partyResult = await getParty(id).catch(() => null);

  if (!partyResult || !user) {
    notFound();
  }

  const { party, balancePending } = partyResult;
  const canUpdate = hasPermission(user.role, "party.update");

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">{party.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="badge badge-primary">
              {PARTY_TYPE_LABELS[party.type]}
            </span>
            <span
              className={`badge ${
                party.status === "ACTIVE" ? "badge-success" : "badge-neutral"
              }`}
            >
              {PARTY_STATUS_LABELS[party.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {canUpdate && (
            <Link href={`/parties/${party.id}/edit`} className="btn btn-secondary">
              تعديل
            </Link>
          )}
          <Link href="/parties" className="btn btn-ghost">
            ← العودة
          </Link>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Contact Info */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">
            بيانات التواصل
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-zinc-500 w-24">الهاتف:</span>
              <span dir="ltr" className="text-zinc-900">
                {party.phone ?? "—"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-zinc-500 w-24">العنوان:</span>
              <span className="text-zinc-900">{party.address ?? "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-zinc-500 w-24">مسؤول:</span>
              <span className="text-zinc-900">
                {party.contactPerson ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Balance placeholder */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">
            الرصيد الحالي
          </h3>
          <div className="p-4 bg-zinc-50 rounded-lg text-center">
            <p className="text-sm text-zinc-500">
              {balancePending
                ? "سيتم حساب الرصيد من الحركات لاحقاً"
                : "الرصيد يُحسب من حركات الحساب"}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {party.notes && (
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-zinc-700 mb-2">
            ملاحظات
          </h3>
          <p className="text-sm text-zinc-600 whitespace-pre-wrap">
            {party.notes}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="card">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">
          معلومات الإضافة
        </h3>
        <div className="space-y-2 text-sm text-zinc-500">
          <div className="flex gap-2">
            <span>تاريخ الإضافة:</span>
            <span dir="ltr">
              {new Date(party.createdAt).toLocaleString("ar-EG")}
            </span>
          </div>
          <div className="flex gap-2">
            <span>آخر تحديث:</span>
            <span dir="ltr">
              {new Date(party.updatedAt).toLocaleString("ar-EG")}
            </span>
          </div>
        </div>
      </div>

      {/* Placeholder actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card border-dashed border-2 border-zinc-200 text-center py-6 opacity-60">
          <p className="text-sm text-zinc-400 mb-1">إضافة حركة حساب</p>
          <p className="text-xs text-zinc-300">
            سيتم تفعيله بعد تنفيذ حركات الحساب
          </p>
        </div>
        <div className="card border-dashed border-2 border-zinc-200 text-center py-6 opacity-60">
          <p className="text-sm text-zinc-400 mb-1">كشف حساب</p>
          <p className="text-xs text-zinc-300">
            سيتم تفعيله بعد تنفيذ حركات الحساب
          </p>
        </div>
      </div>
    </div>
  );
}