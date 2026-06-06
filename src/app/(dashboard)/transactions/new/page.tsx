import Link from "next/link";

export default function NewTransactionPage() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">إضافة حركة حساب</h2>
        <p className="page-description">تسجيل حركة مالية جديدة لطرف</p>
      </div>

      <div className="card max-w-xl">
        <p className="text-zinc-500 text-sm mb-4">
          نموذج إضافة الحركة سيأتي في المرحلة التالية.
        </p>
        <Link href="/transactions" className="btn btn-secondary">
          ← العودة للحركات
        </Link>
      </div>
    </div>
  );
}