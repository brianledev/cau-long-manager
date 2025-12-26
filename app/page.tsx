// app/page.tsx
import { prisma } from '@/lib/db'
import CreateSessionForm from '@/components/CreateSessionForm'
import { TopName } from '@/components/TopName'
import { getGlobalTop3 } from '@/lib/getGlobalTop3'
import PassGate from '@/components/PassGate'


export default async function HomePage() {
  const globalTop3Ids = await getGlobalTop3();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [groups, allMembers, openSessions, recentSessions, participations] = await Promise.all([
    prisma.group.findMany({
      orderBy: { createdAt: 'asc' },
    }),
    prisma.member.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, groupId: true },
    }),
    prisma.session.findMany({
      where: { status: 'PLANNED' },
      orderBy: { date: 'asc' },
      include: { host: true },
    }),
    prisma.session.findMany({
      orderBy: { date: 'desc' },
      take: 8,
      include: { host: true },
    }),
    prisma.participation.findMany({ where: { isGuest: false } }),
  ]);

  // Sort allMembers theo số buổi giảm dần (giữ để hiển thị đẹp, nhưng chỉ top 3 toàn cục mới có màu động)
  const memberSessionCount: Record<string, number> = {};
  for (const p of participations) {
    if (p.memberId && !p.isGuest) {
      memberSessionCount[p.memberId] = (memberSessionCount[p.memberId] || 0) + 1;
    }
  }
  const sortedMembers = [...allMembers].sort((a, b) => (memberSessionCount[b.id] || 0) - (memberSessionCount[a.id] || 0));

  return (
    //<PassGate>
    <div className="main-container">
      {/* HERO */}
      <section className="card">
        <h1 className="text-2xl font-bold tracking-tight mb-2 bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">Quản lý cầu lông</h1>
        <p className="card-subtitle">
          Tạo buổi mới, host luân phiên, chia tiền, lưu lịch sử cho cả nhóm.
        </p>
      </section>

      {/* TẠO BUỔI MỚI */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="card-title">Tạo buổi đánh mới</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
            </svg>
            {allMembers.length} thành viên
          </span>
        </div>

        <CreateSessionForm
          groups={groups}
          allMembers={allMembers}
          todayStr={todayStr}
        />
      </section>

      {/* BUỔI ĐANG MỞ */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="card-title">Buổi đang mở</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {openSessions.length} buổi
          </span>
        </div>

        {openSessions.length === 0 ? (
          <p className="card-subtitle">
            Hiện chưa có buổi nào đang mở. Tạo buổi mới ở phía trên.
          </p>
        ) : (
          <ul className="session-list">
            {openSessions.map((s: any) => {
              const total =
                s.totalAmount ?? s.courtFee + s.shuttleFee + s.fundFee

              return (
                <li key={s.id} className="session-item group">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        {new Date(s.date).toLocaleDateString('vi-VN')}
                      </span>
                      {s.host && (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                          🏸 {s.host.name}
                        </span>
                      )}
                    </div>
                    {s.courtAddress && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <svg className="h-3.5 w-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{s.courtAddress}</span>
                      </div>
                    )}
                    <div className="session-status font-semibold">
                      💰 {total.toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                  <a 
                    href={`/sessions/${s.id}`} 
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Vào buổi
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* BUỔI GẦN ĐÂY */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="card-title">Buổi gần đây</h2>
          <a
            href="/history"
            className="group inline-flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Xem tất cả
            <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {recentSessions.length === 0 ? (
          <p className="card-subtitle">Chưa có buổi nào.</p>
        ) : (
          <ul className="session-list">
            {recentSessions.map((s: any) => {
              const statusConfig = {
                PLANNED: { label: 'Đang mở', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: '⏳' },
                COMPLETED: { label: 'Đã hoàn thành', color: 'bg-blue-50 text-blue-700 ring-blue-200', icon: '✅' },
                CANCELED: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-600 ring-slate-200', icon: '❌' },
              }
              const status = statusConfig[s.status as keyof typeof statusConfig] || statusConfig.PLANNED
              
              return (
                <li key={s.id} className="session-item group">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900">
                        {new Date(s.date).toLocaleDateString('vi-VN')}
                      </span>
                      {s.host && (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                          🏸 {s.host.name}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${status.color}`}>
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                    </div>
                    {s.courtAddress && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                        <svg className="h-3.5 w-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{s.courtAddress}</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={`/sessions/${s.id}`}
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:text-blue-600 hover:ring-blue-200"
                  >
                    Chi tiết
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
