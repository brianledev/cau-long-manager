// app/stats/page.tsx
import { prisma } from '@/lib/db'

export default async function StatsPage() {
  const now = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(now.getMonth() - 1)

  const [sessions, participations] = await Promise.all([
    prisma.session.findMany(),
    prisma.participation.findMany({
      where: {
        isGuest: false,
        memberId: { not: null },
      },
      include: {
        member: true,
        session: true,
      },
    }),
  ])

  const totalSessions = sessions.length
  const completedSessions = sessions.filter(
    (s) => s.status === 'COMPLETED',
  ).length

  const totalCourt = sessions.reduce(
    (sum, s) => sum + (s.courtFee ?? 0),
    0,
  )
  const totalShuttle = sessions.reduce(
    (sum, s) => sum + (s.shuttleFee ?? 0),
    0,
  )
  const totalFund = sessions.reduce(
    (sum, s) => sum + (s.fundFee ?? 0),
    0,
  )
  const totalCharged = sessions.reduce(
    (sum, s) => sum + (s.totalAmount ?? 0),
    0,
  )

  type MemberAgg = {
    id: string
    name: string
    sessions: number
    totalPaid: number
  }

  const allTimeMap = new Map<string, MemberAgg>()

  for (const p of participations) {
    if (!p.memberId || !p.member) continue
    const key = p.memberId
    const existing = allTimeMap.get(key) ?? {
      id: key,
      name: p.member.name,
      sessions: 0,
      totalPaid: 0,
    }
    existing.sessions += 1
    if (p.customFee != null) {
      existing.totalPaid += p.customFee
    }
    allTimeMap.set(key, existing)
  }

  const allTimeStats = Array.from(allTimeMap.values()).sort(
    (a, b) => b.sessions - a.sessions,
  )

  const topAll = allTimeStats[0]

  const monthMap = new Map<
    string,
    { id: string; name: string; sessions: number }
  >()

  for (const p of participations) {
    if (!p.memberId || !p.member || !p.session) continue
    if (p.session.date < monthAgo) continue

    const key = p.memberId
    const existing = monthMap.get(key) ?? {
      id: key,
      name: p.member.name,
      sessions: 0,
    }
    existing.sessions += 1
    monthMap.set(key, existing)
  }

  const monthStats = Array.from(monthMap.values()).sort(
    (a, b) => b.sessions - a.sessions,
  )

  const monthLabel =
    monthAgo.toLocaleDateString('vi-VN') +
    ' - ' +
    now.toLocaleDateString('vi-VN')

  return (
    <div className="main-container">
      <div className="card">
        <h1 className="text-xl font-semibold mb-1">Thống kê</h1>
        <p className="text-sm text-gray-600">
          Tổng quan buổi đánh, người đi chăm, tổng tiền đã chia.
        </p>
      </div>

      {/* TỔNG QUAN */}
      <section className="grid gap-3 md:grid-cols-3 text-sm">
        <div className="card">
          <div className="text-xs text-gray-500">Tổng số buổi</div>
          <div className="text-2xl font-semibold">{totalSessions}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Hoàn thành: {completedSessions}
          </div>
        </div>

        <div className="card">
          <div className="text-xs text-gray-500">Tổng chi phí</div>
          <div className="text-lg font-semibold">
            {totalCharged.toLocaleString('vi-VN')}đ
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Sân: {totalCourt.toLocaleString('vi-VN')}đ · Cầu:{' '}
            {totalShuttle.toLocaleString('vi-VN')}đ · Quỹ:{' '}
            {totalFund.toLocaleString('vi-VN')}đ
          </div>
        </div>

        {topAll && (
          <div className="card">
            <div className="text-xs text-gray-500">Đi chăm nhất (all time)</div>
            <div className="text-lg font-semibold">{topAll.name}</div>
            <div className="text-[11px] text-gray-500 mt-1">
              {topAll.sessions} buổi · đã chia khoảng{' '}
              {(topAll.totalPaid || 0).toLocaleString('vi-VN')}đ
            </div>
          </div>
        )}
      </section>

      {/* TOP 30 NGÀY GẦN NHẤT */}
      <section className="card text-sm space-y-2">
        <h2 className="font-semibold text-sm">
          Top tham gia {monthLabel}
        </h2>
        {monthStats.length ? (
          <table className="w-full text-xs border rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Thành viên</th>
                <th className="px-2 py-1 text-right">Số buổi</th>
              </tr>
            </thead>
            <tbody>
              {monthStats.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 1 ? 'bg-gray-50 border-t' : 'border-t'}
                >
                  <td className="px-2 py-1">{row.name}</td>
                  <td className="px-2 py-1 text-right">
                    {row.sessions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-gray-500">
            Chưa có dữ liệu trong 30 ngày gần nhất.
          </p>
        )}
      </section>

      {/* BẢNG ALL TIME */}
      <section className="card text-sm space-y-2">
        <h2 className="font-semibold text-sm">
          Thống kê theo thành viên (all time)
        </h2>
        {allTimeStats.length ? (
          <table className="w-full text-xs border rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-1 text-left">Thành viên</th>
                <th className="px-2 py-1 text-right">Số buổi</th>
                <th className="px-2 py-1 text-right">Tổng đã chia</th>
              </tr>
            </thead>
            <tbody>
              {allTimeStats.map((row, idx) => (
                <tr
                  key={row.id}
                  className={idx % 2 === 1 ? 'bg-gray-50 border-t' : 'border-t'}
                >
                  <td className="px-2 py-1">{row.name}</td>
                  <td className="px-2 py-1 text-right">
                    {row.sessions}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {(row.totalPaid || 0).toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs text-gray-500">
            Chưa có ai tham gia buổi nào.
          </p>
        )}
      </section>
    </div>
  )
}
