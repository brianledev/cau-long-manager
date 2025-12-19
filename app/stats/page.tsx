// app/stats/page.tsx
import { prisma } from '@/lib/db'

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const params = await searchParams
  const selectedGroupId = params?.group

  const now = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(now.getMonth() - 1)

  // Lấy group filter members
  const filterMemberIds = await prisma.member.findMany({
    where:
      selectedGroupId === '__non_group__'
        ? { groupId: null }
        : selectedGroupId
          ? { groupId: selectedGroupId }
          : undefined,
    select: { id: true },
  })
  const memberIds = filterMemberIds.map((m) => m.id)

  const [sessions, groups, allMembers, participations, nonGroupMembersCount] = await Promise.all([
    prisma.session.findMany(),
    prisma.group.findMany({
      orderBy: { createdAt: 'asc' },
    }),
    prisma.member.findMany({
      where:
        selectedGroupId === '__non_group__'
          ? { groupId: null }
          : selectedGroupId
            ? { groupId: selectedGroupId }
            : undefined,
      select: { id: true, name: true },
    }),
    prisma.participation.findMany({
      where:
        memberIds.length > 0
          ? {
              isGuest: false,
              memberId: { in: memberIds },
            }
          : {
              isGuest: false,
              memberId: { not: null },
            },
      include: {
        member: true,
        session: true,
      },
    }),
    // Đếm số members không có group
    prisma.member.count({ where: { groupId: null } }),
  ])

  // Lấy session IDs từ participations đã filter (để tính số buổi theo group)
  const groupSessionIds = new Set(
    participations
      .filter((p: any) => p.session?.status === 'COMPLETED')
      .map((p: any) => p.session.id)
  )
  
  const totalSessions = selectedGroupId ? groupSessionIds.size : sessions.length
  const completedSessions = selectedGroupId 
    ? groupSessionIds.size 
    : sessions.filter((s: any) => s.status === 'COMPLETED').length

  // Tính tổng chi phí từ participations đã filter theo group
  const totalMembersPaid = participations
    .filter((p: any) => p.session?.status === 'COMPLETED')
    .reduce((sum: number, p: any) => sum + (p.customFee ?? 0), 0)

  type MemberAgg = {
    id: string
    name: string
    sessions: number
    totalPaid: number
  }

  const allTimeMap = new Map<string, MemberAgg>()

  for (const p of participations) {
    if (!p.memberId || !p.member) continue
    if (p.session.status !== 'COMPLETED') continue // ✅ chỉ tính buổi hoàn thành
    const key = p.memberId
    const existing = allTimeMap.get(key) ?? {
      id: key,
      name: p.member.name,
      sessions: 0,
      totalPaid: 0,
    }
    existing.sessions += 1
    if (p.customFee != null && p.session?.status === 'COMPLETED') {
      existing.totalPaid += p.customFee
    }
    allTimeMap.set(key, existing)
  }

  // const allTimeStats = Array.from(allTimeMap.values()).sort(
  //   (a, b) => b.sessions - a.sessions,
  // )

  const allTimeStats = Array.from(allTimeMap.values()).sort((a, b) =>
    (b.sessions - a.sessions) ||
    ((b.totalPaid ?? 0) - (a.totalPaid ?? 0))
  );

  const topAll = allTimeStats[0]

  const monthMap = new Map<
    string,
    { id: string; name: string; sessions: number }
  >()

  for (const p of participations) {
    if (!p.memberId || !p.member || !p.session) continue
    if (p.session.date < monthAgo) continue
    if (p.session.status !== 'COMPLETED') continue // ✅ chỉ tính buổi hoàn thành

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

  // Tên group hiện tại đang filter
  const groupLabel = selectedGroupId === '__non_group__'
    ? 'NON GROUP'
    : selectedGroupId
      ? groups.find((g: any) => g.id === selectedGroupId)?.name || 'Nhóm không xác định'
      : 'Tất cả'

  return (
    <div className="main-container space-y-4">
      <div className="card">
        <h1 className="text-xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Thống kê</h1>
        <p className="card-subtitle">
          Tổng quan buổi đánh, người đi chăm, tổng tiền đã chia.
        </p>
      </div>

      {/* GROUP FILTER */}
      <section className="card">
        <label className="field-label mb-2">Chọn nhóm để xem thống kê</label>
        <div className="flex flex-wrap gap-2">
          <a
            href="/stats"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              !selectedGroupId
                ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200'
            }`}
          >
            Tất cả
          </a>
          {groups.map((group: any) => (
            <a
              key={group.id}
              href={`/stats?group=${group.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedGroupId === group.id
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200'
              }`}
            >
              {group.name}
            </a>
          ))}
          {nonGroupMembersCount > 0 && (
            <a
              href="/stats?group=__non_group__"
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedGroupId === '__non_group__'
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200'
              }`}
            >
              NON GROUP
            </a>
          )}
        </div>
      </section>

      {/* TỔNG QUAN */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 p-5 ring-1 ring-blue-200 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-200/30"></div>
          <div className="relative space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tổng số buổi
            </div>
            <div className="text-3xl font-bold text-blue-700">{totalSessions}</div>
            <div className="flex items-center gap-1 text-[11px] text-blue-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hoàn thành: {completedSessions}
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-50 to-emerald-100 p-5 ring-1 ring-emerald-200 transition-all hover:shadow-lg hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-200/30"></div>
          <div className="relative space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              Tổng chi phí đã chia
            </div>
            <div className="text-2xl font-bold text-emerald-700 truncate">{totalMembersPaid.toLocaleString('vi-VN')}đ</div>
            <div className="text-[11px] text-emerald-600">
              Thành viên trong [{groupLabel}]
            </div>
          </div>
        </div>

        {topAll && (
          <div className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-amber-50 to-amber-100 p-5 ring-1 ring-amber-200 transition-all hover:shadow-lg hover:-translate-y-0.5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-200/30"></div>
            <div className="relative space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Đi chăm nhất
              </div>
              <div className="text-xl font-bold text-amber-700 truncate">{topAll.name}</div>
              <div className="text-[11px] text-amber-600 truncate">
                {topAll.sessions} buổi · {(topAll.totalPaid || 0).toLocaleString('vi-VN')}đ
              </div>
            </div>
          </div>
        )}
      </section>

      {/* TOP 30 NGÀY GẦN NHẤT */}
      <section className="card space-y-3">
        <h2 className="card-title text-base">
          Top tham gia [{groupLabel}] · {monthLabel}
        </h2>
        {monthStats.length ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Thành viên</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Số buổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthStats.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-blue-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {idx < 3 && (
                          <span className="text-lg">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-medium text-slate-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {row.sessions}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 py-8">
            Chưa có dữ liệu trong 30 ngày gần nhất.
          </p>
        )}
      </section>

      {/* BẢNG ALL TIME */}
      <section className="card space-y-3">
        <h2 className="card-title text-base">
          Thống kê [{groupLabel}] · all time
        </h2>
        {allTimeStats.length ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Thành viên</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Số buổi</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">Tổng đã chia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allTimeStats.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-blue-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {idx < 3 && (
                          <span className="text-lg">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="font-medium text-slate-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {row.sessions}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-emerald-700">
                        {(row.totalPaid || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 py-8">
            Chưa có ai tham gia buổi nào.
          </p>
        )}
      </section>
    </div>
  )
}
