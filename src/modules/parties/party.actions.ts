"use server";

import { redirect } from "next/navigation";
import { createPartySchema, updatePartySchema } from "./party.validators";
import { createParty, updateParty, activateParty, deactivateParty } from "./party.service";

// ─── Shared action state type ─────────────────────────────────

export type ActionState =
  | { success: true }
  | { success: false; error: { code: string; message: string; field?: string } };

// ─── Create Party ────────────────────────────────────────────

export async function createPartyAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    phone: formData.get("phone") as string | undefined,
    address: formData.get("address") as string | undefined,
    contactPerson: formData.get("contactPerson") as string | undefined,
    notes: formData.get("notes") as string | undefined,
    status: formData.get("status") as string | undefined,
  };

  const parsed = createPartySchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: firstError.message,
        field: firstError.path.join("."),
      },
    };
  }

  try {
    const result = await createParty(parsed.data);
    redirect(`/parties/${result.id}`);
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("ليس لديك صلاحية")
        ? err.message
        : "حدث خطأ أثناء إضافة الطرف";

    return { success: false, error: { code: "ACTION_ERROR", message } };
  }
}

// ─── Update Party ─────────────────────────────────────────────

export async function updatePartyAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "معرف الطرف مطلوب" },
    };
  }

  const raw = {
    name: formData.get("name") as string | undefined,
    type: formData.get("type") as string | undefined,
    phone: formData.get("phone") as string | undefined,
    address: formData.get("address") as string | undefined,
    contactPerson: formData.get("contactPerson") as string | undefined,
    notes: formData.get("notes") as string | undefined,
    status: formData.get("status") as string | undefined,
  };

  const parsed = updatePartySchema.safeParse(raw);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: firstError.message,
        field: firstError.path.join("."),
      },
    };
  }

  try {
    await updateParty(id, parsed.data);
    redirect(`/parties/${id}`);
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("ليس لديك صلاحية")
        ? err.message
        : err instanceof Error && err.message.includes("غير موجود")
        ? err.message
        : "حدث خطأ أثناء تحديث الطرف";

    return { success: false, error: { code: "ACTION_ERROR", message } };
  }
}

// ─── Set Party Status ─────────────────────────────────────────

export type SetStatusState =
  | { success: true }
  | { success: false; error: { code: string; message: string } };

export async function setPartyStatusAction(
  _prevState: SetStatusState | null,
  formData: FormData
): Promise<SetStatusState> {
  const id = formData.get("id") as string;
  const newStatus = formData.get("status") as "ACTIVE" | "INACTIVE";

  try {
    if (newStatus === "ACTIVE") {
      await activateParty(id);
    } else {
      await deactivateParty(id);
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: {
        code: "ACTION_ERROR",
        message:
          err instanceof Error ? err.message : "حدث خطأ أثناء تحديث الحالة",
      },
    };
  }
}