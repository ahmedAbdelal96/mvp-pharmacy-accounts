export default function ReceivablesReportPage() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">تقرير الأطراف التي عليها</h2>
        <p className="page-description">الأطراف التي عليها مديونية (عليه)</p>
      </div>

      <div className="card max-w-2xl">
        <p className="text-zinc-500 text-sm mb-4">
          هذا التقرير يعرض جميع الأطراف التي عليهم فلوس (موجب).
        </p>
        <div className="empty-state py-8">
          <svg
            className="w-12 h-12 text-zinc-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-base font-semibold">لا توجد بيانات</h3>
          <p className="text-sm text-zinc-500 mt-1">أضف حركات حساب لعرض التقرير</p>
        </div>
      </div>
    </div>
  );
}