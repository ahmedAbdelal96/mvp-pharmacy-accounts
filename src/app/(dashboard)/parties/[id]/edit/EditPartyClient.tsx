"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  updatePartyAction,
  type ActionState,
} from "@/modules/parties/party.actions";
import type { PartyDetails } from "@/modules/parties/party.mappers";

export default function EditPartyClient({
  party,
}: {
  party: PartyDetails;
}) {
  const [state, formAction, isPending] = useActionState<
    ActionState | null,
    FormData
  >(updatePartyAction, null);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">تعديل طرف</h2>
        <p className="page-description">تعديل بيانات: {party.name}</p>
      </div>

      <div className="card max-w-xl">
        {state?.success === false && state.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {state.error.message}
          </div>
        )}

        <form action={formAction}>
          {/* Hidden ID field */}
          <input type="hidden" name="id" value={party.id} />

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              اسم الطرف <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={party.name}
              className="form-input"
              dir="rtl"
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label htmlFor="type" className="form-label">
              النوع <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={party.type}
              className="form-select"
            >
              <option value="SUPPLIER">مورد</option>
              <option value="CUSTOMER">عميل</option>
              <option value="MEDICINE_COMPANY">شركة أدوية</option>
              <option value="OTHER">طرف آخر</option>
            </select>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">الهاتف</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={party.phone ?? ""}
              className="form-input"
              dir="ltr"
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address" className="form-label">العنوان</label>
            <input
              id="address"
              name="address"
              type="text"
              defaultValue={party.address ?? ""}
              className="form-input"
              dir="rtl"
            />
          </div>

          {/* Contact Person */}
          <div className="form-group">
            <label htmlFor="contactPerson" className="form-label">
              مسؤول التواصل
            </label>
            <input
              id="contactPerson"
              name="contactPerson"
              type="text"
              defaultValue={party.contactPerson ?? ""}
              className="form-input"
              dir="rtl"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes" className="form-label">ملاحظات</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={party.notes ?? ""}
              className="form-textarea"
              dir="rtl"
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status" className="form-label">الحالة</label>
            <select
              id="status"
              name="status"
              defaultValue={party.status}
              className="form-select"
            >
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary"
            >
              {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
            <Link href={`/parties/${party.id}`} className="btn btn-secondary">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}