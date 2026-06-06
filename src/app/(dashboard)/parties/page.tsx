import Link from "next/link";
import { listParties, getPartySummaryForDashboard } from "@/modules/parties";
import { PARTY_TYPE_LABELS, PARTY_STATUS_LABELS, type PartyType, type PartyStatus } from "@/modules/parties/party.types";
import { hasPermission } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function PartiesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  // Dashboard layout already redirects unauthenticated users, but guard anyway
  if (!user) {
    return null;
  }

  const filters = {
    search: params.search,
    type: params.type as PartyType | undefined,
    status: params.status as PartyStatus | undefined,
  };

  const [{ parties, total }, summary] = await Promise.all([
    listParties(filters),
    getPartySummaryForDashboard(),
  ]);

  const canCreate = hasPermission(user.role, "party.create");

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h2 className="page-title">الأطراف</h2>
          <p className="page-description">
            {total} طرف — {summary.totalCustomers} عميل، {summary.totalSuppliers} مورد،{" "}
            {summary.totalMedicineCompanies} شركة أدوية
          </p>
        </div>
        {canCreate && (
          <Link href="/parties/new" className="btn btn-primary">
            + إضافة طرف
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card py-3 text-center">
          <div className="text-2xl font-bold text-zinc-900">{summary.totalParties}</div>
          <div className="text-xs text-zinc-500">إجمالي الأطراف</div>
        </div>
        <div className="card py-3 text-center">
          <div className="text-2xl font-bold text-zinc-900">{summary.totalCustomers}</div>
          <div className="text-xs text-zinc-500">عملاء</div>
        </div>
        <div className="card py-3 text-center">
          <div className="text-2xl font-bold text-zinc-900">{summary.totalSuppliers}</div>
          <div className="text-xs text-zinc-500">موردين</div>
        </div>
        <div className="card py-3 text-center">
          <div className="text-2xl font-bold text-zinc-900">{summary.totalMedicineCompanies}</div>
          <div className="text-xs text-zinc-500">شركات أدوية</div>
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="بحث بالاسم أو الهاتف..."
            className="form-input flex-1 min-w-[180px]"
          />
          <select name="type" defaultValue={params.type} className="form-select w-auto">
            <option value="">الكل الأنواع</option>
            <option value="CUSTOMER">عميل</option>
            <option value="SUPPLIER">مورد</option>
            <option value="MEDICINE_COMPANY">شركة أدوية</option>
            <option value="OTHER">طرف آخر</option>
          </select>
          <select name="status" defaultValue={params.status} className="form-select w-auto">
            <option value="">الكل الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
          </select>
          <button type="submit" className="btn btn-secondary">
            بحث
          </button>
          {(params.search || params.type || params.status) && (
            <Link href="/parties" className="btn btn-ghost text-sm">
              مسح
            </Link>
          )}
        </div>
      </form>

      {/* Parties List */}
      {parties.length === 0 ? (
        <div className="card">
          <div className="empty-state py-10">
            <svg
              className="w-12 h-12 text-zinc-300 mx-auto"
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
            <h3 className="text-base font-semibold mt-3">لا توجد أطراف</h3>
            <p className="text-sm text-zinc-500 mt-1">
              {params.search || params.type || params.status
                ? "لا توجد نتائج مطابقة للبحث"
                : "ابدأ بإضافة أول طرف"}
            </p>
            {canCreate && !params.search && !params.type && !params.status && (
              <Link href="/parties/new" className="btn btn-primary mt-4">
                + إضافة طرف
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>النوع</th>
                <th>الهاتف</th>
                <th>الحالة</th>
                <th>تاريخ الإضافة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {parties.map((party) => (
                <tr key={party.id}>
                  <td className="font-medium text-zinc-900">{party.name}</td>
                  <td>
                    <span className="badge badge-primary">
                      {PARTY_TYPE_LABELS[party.type]}
                    </span>
                  </td>
                  <td className="text-zinc-500 text-sm" dir="ltr">
                    {party.phone ?? "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        party.status === "ACTIVE"
                          ? "badge-success"
                          : "badge-neutral"
                      }`}
                    >
                      {PARTY_STATUS_LABELS[party.status]}
                    </span>
                  </td>
                  <td className="text-zinc-400 text-sm">
                    {new Date(party.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        href={`/parties/${party.id}`}
                        className="btn btn-ghost text-xs py-1 px-2"
                      >
                        عرض
                      </Link>
                      {hasPermission(user.role, "party.update") && (
                        <Link
                          href={`/parties/${party.id}/edit`}
                          className="btn btn-ghost text-xs py-1 px-2"
                        >
                          تعديل
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}