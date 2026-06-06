export default function DashboardPage() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">الرئيسية</h2>
        <p className="page-description">ملخص حسابات الصيدلية</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="text-sm text-zinc-500 mb-1">إجمالي العملاء عليهم</div>
          <div className="text-2xl font-bold text-zinc-900">٠ ج.م</div>
        </div>
        <div className="card">
          <div className="text-sm text-zinc-500 mb-1">إجمالي الموردين لهم</div>
          <div className="text-2xl font-bold text-zinc-900">٠ ج.م</div>
        </div>
        <div className="card">
          <div className="text-sm text-zinc-500 mb-1">عدد العملاء</div>
          <div className="text-2xl font-bold text-zinc-900">٠</div>
        </div>
        <div className="card">
          <div className="text-sm text-zinc-500 mb-1">عدد الموردين</div>
          <div className="text-2xl font-bold text-zinc-900">٠</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">إجراءات سريعة</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/parties/new" className="btn btn-primary">
            + إضافة طرف
          </a>
          <a href="/transactions/new" className="btn btn-primary">
            + حركة حساب
          </a>
          <a href="/parties" className="btn btn-secondary">
            عرض الأطراف
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">آخر الحركات</h3>
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm text-zinc-500 mt-2">لا توجد حركات حساب بعد</p>
          <a href="/transactions/new" className="btn btn-primary mt-4 text-sm">
            + إضافة أول حركة
          </a>
        </div>
      </div>
    </div>
  );
}