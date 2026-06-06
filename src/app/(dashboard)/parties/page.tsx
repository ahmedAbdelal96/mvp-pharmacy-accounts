export default function PartiesPage() {
  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">الأطراف</h2>
          <p className="page-description">إدارة العملاء والموردين وشركات الأدوية</p>
        </div>
        <a href="/parties/new" className="btn btn-primary">
          + إضافة طرف
        </a>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف..."
            className="form-input flex-1 min-w-[200px]"
          />
          <select className="form-select w-auto">
            <option value="">الكل الأنواع</option>
            <option value="CUSTOMER">عميل</option>
            <option value="SUPPLIER">مورد</option>
            <option value="MEDICINE_COMPANY">شركة أدوية</option>
            <option value="OTHER">طرف آخر</option>
          </select>
          <select className="form-select w-auto">
            <option value="">الكل الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
          </select>
        </div>
      </div>

      {/* Parties Table */}
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-base font-semibold">لا توجد أطراف بعد</h3>
          <p className="text-sm text-zinc-500 mt-1">ابدأ بإضافة أول طرف</p>
          <a href="/parties/new" className="btn btn-primary mt-4">
            + إضافة طرف
          </a>
        </div>
      </div>
    </div>
  );
}