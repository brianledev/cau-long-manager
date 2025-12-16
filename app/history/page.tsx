// app/history/page.tsx
import { prisma } from '@/lib/db'
import PassGate from '@/components/PassGate'

function statusLabel(status: string) {
  switch (status) {
    case 'PLANNED':
      return 'Đang mở'
    case 'COMPLETED':
      return 'Đã hoàn thành'
    case 'CANCELED':
      return 'Đã hủy'
    default:
      return status
  }
}

export default async function HistoryPage() {
  const sessions = await prisma.session.findMany({
    orderBy: { date: 'desc' },
    include: {
      host: true,
      participations: true,
    },
  })

  const total = sessions.length
  const completed = sessions.filter((s) => s.status === 'COMPLETED').length
  const canceled = sessions.filter((s) => s.status === 'CANCELED').length

  return (
    // <PassGate>
    <div className="main-container space-y-4">
      <section className="card">
        <h1 className="card-title text-xl bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Lịch sử buổi đánh</h1>
        <p className="card-subtitle">
          Xem lại tất cả các buổi đánh cầu đã tạo, trạng thái và số người tham
          gia.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-inset ring-blue-200 transition-all hover:shadow-md hover:bg-blue-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600">Tổng</p>
                <p className="text-2xl font-bold text-blue-700">{total}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-inset ring-emerald-200 transition-all hover:shadow-md hover:bg-emerald-100/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-emerald-700">{completed}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4 ring-1 ring-inset ring-slate-200 transition-all hover:shadow-md hover:bg-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Đã hủy</p>
                <p className="text-2xl font-bold text-slate-700">{canceled}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title mb-3">Danh sách buổi</h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
            <th className="px-4 py-3">Ngày</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Host</th>
            <th className="px-4 py-3">Số người</th>
            <th className="px-4 py-3">Tổng chi</th>
            <th className="px-4 py-3 text-right">Chi tiết</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sessions.map((s) => {
            const totalCost =
          (s.courtFee || 0) + (s.shuttleFee || 0) + (s.fundFee || 0)

            const statusConfig = {
          PLANNED: { label: 'Đang mở', color: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
          COMPLETED: { label: 'Đã hoàn thành', color: 'bg-blue-50 text-blue-600 ring-blue-200' },
          CANCELED: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-400' },
            }
            const status = statusConfig[s.status as keyof typeof statusConfig]

            return (
          <tr key={s.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-4 py-3">
              <span className="font-medium text-slate-950">
            {new Date(s.date).toLocaleDateString('vi-VN')}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${status.color}`}>
            {status.label}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className="text-slate-950">{s.host?.name ?? '-'}</span>
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-950">
            <svg className="h-4 w-4 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
            {s.participations.length}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className="font-semibold text-slate-950">
            {totalCost.toLocaleString('vi-VN')}đ
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <a
            href={`/sessions/${s.id}`}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-200 transition-all hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:ring-blue-800 dark:hover:bg-blue-900/30"
              >
            Chi tiết
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
              </a>
            </td>
          </tr>
            )
          })}
        </tbody>
          </table>
        </div>
      </section>
    </div>
    // </PassGate>
  )
}
