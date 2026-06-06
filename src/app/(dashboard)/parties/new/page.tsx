import Link from "next/link";

export default function NewPartyPage() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">إضافة طرف جديد</h2>
        <p className="page-description">إضافة عميل أو مورد أو شركة أدوية</p>
      </div>

      <div className="card max-w-xl">
        <p className="text-zinc-500 text-sm mb-4">
          نموذج إضافة الطرف سيأتي في المرحلة التالية.
        </p>
        <Link href="/parties" className="btn btn-secondary">
          ← العودة للأطراف
        </Link>
      </div>
    </div>
  );
}