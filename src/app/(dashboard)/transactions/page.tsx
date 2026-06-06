export default function TransactionsPage() {
  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">حركات الحساب</h2>
          <p className="page-description">سجل جميع الحركات المالية</p>
        </div>
        <a href="/transactions/new" className="btn btn-primary">
          + حركة حساب
        </a>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="بحث بالوصف أو رقم مرجعي..."
            className="form-input flex-1 min-w-[200px]"
          />
          <select className="form-select w-auto">
            <option value="">الكل الأنواع</option>
            <option value="OPENING_BALANCE">رصيد افتتاحي</option>
            <option value="DEBT">مديونية</option>
            <option value="PAYMENT_OUT">دفع</option>
            <option value="COLLECTION_IN">تحصيل</option>
            <option value="ADJUSTMENT">تسوية</option>
            <option value="DISCOUNT">خصم</option>
          </select>
          <select className="form-select w-auto">
            <option value="">الكل الاتجهات</option>
            <option value="PARTY_OWES_US">عليه</option>
            <option value="WE_OWE_PARTY">له</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card p-0 overflow-hidden">
        <div className="empty-state py-12">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 className="text-base font-semibold">لا توجد حركات حساب بعد</h3>
          <p className="text-sm text-zinc-500 mt-1">ابدأ بإضافة أول حركة</p>
          <a href="/transactions/new" className="btn btn-primary mt-4">
            + إضافة حركة
          </a>
        </div>
      </div>
    </div>
  );
}