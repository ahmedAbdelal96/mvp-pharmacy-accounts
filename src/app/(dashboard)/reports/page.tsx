export default function ReportsPage() {
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">التقارير</h2>
        <p className="page-description">تقارير الحسابات والمديونيات</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/reports/receivables" className="card hover:border-blue-300 transition-colors">
          <h3 className="font-semibold text-zinc-900 mb-1">الأطراف التي عليها</h3>
          <p className="text-sm text-zinc-500">تقرير العملاء والموردين الذين عليهم فلوس</p>
        </a>
        <a href="/reports/payables" className="card hover:border-blue-300 transition-colors">
          <h3 className="font-semibold text-zinc-900 mb-1">الأطراف التي لها</h3>
          <p className="text-sm text-zinc-500">تقرير الأطراف الذين لهم فلوس عندنا</p>
        </a>
        <a href="/reports/balances" className="card hover:border-blue-300 transition-colors">
          <h3 className="font-semibold text-zinc-900 mb-1">أرصدة الأطراف</h3>
          <p className="text-sm text-zinc-500">كشف أرصدة جميع الأطراف</p>
        </a>
      </div>
    </div>
  );
}