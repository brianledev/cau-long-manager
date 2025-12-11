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
    <PassGate>
    <div className="main-container">
      <section className="card">
        <h1 className="card-title">Lịch sử buổi đánh</h1>
        <p className="card-subtitle">
          Xem lại tất cả các buổi đánh cầu đã tạo, trạng thái và số người tham
          gia.
        </p>

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
          <span>Tổng: {total}</span>
          <span>Hoàn thành: {completed}</span>
          <span>Đã hủy: {canceled}</span>
        </div>

      </section>

      <section className="card">
        <h2 className="card-title mb-2">Danh sách buổi</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="pb-2">Ngày</th>
                <th className="pb-2">Trạng thái</th>
                <th className="pb-2">Host</th>
                <th className="pb-2">Số người</th>
                <th className="pb-2">Tổng chi</th>
                <th className="pb-2 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const totalCost =
                  (s.courtFee || 0) + (s.shuttleFee || 0) + (s.fundFee || 0)

                return (
                  <tr key={s.id} className="border-b last:border-b-0">
                    <td className="py-2">
                      {new Date(s.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-2">
                      <span className="session-status">
                        {statusLabel(s.status)}
                      </span>
                    </td>
                    <td className="py-2">{s.host?.name ?? '-'}</td>
                    <td className="py-2">{s.participations.length}</td>
                    <td className="py-2">
                      {totalCost.toLocaleString('vi-VN')}
                      đ
                    </td>
                    <td className="py-2 text-right">
                      <a
                        href={`/sessions/${s.id}`}
                        className="text-xs text-blue-600"
                      >
                        Chi tiết
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
    </PassGate>
  )
}
