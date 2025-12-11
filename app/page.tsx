// app/page.tsx
import { prisma } from '@/lib/db'
import { createSessionAction } from '@/app/actions'
import PassGate from '@/components/PassGate'


export default async function HomePage() {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const [members, openSessions, recentSessions] = await Promise.all([
    prisma.member.findMany({
      orderBy: { createdAt: 'asc' },
    }),
    prisma.session.findMany({
      where: { status: 'PLANNED' },
      orderBy: { date: 'asc' },
      include: { host: true }, // Chi tiet host
    }),
    prisma.session.findMany({
      orderBy: { date: 'desc' },
      take: 8,
      include: { host: true }, 
    }),
  ])

  return (
    <PassGate>
    <div className="main-container">
      {/* HERO */}
      <section className="card">
        <h1 className="text-2xl font-bold mb-1">Quản lý cầu lông</h1>
        <p className="card-subtitle">
          Tạo buổi mới, host luân phiên, chia tiền, lưu lịch sử cho cả nhóm.
        </p>
      </section>

      {/* TẠO BUỔI MỚI */}
      <section className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title">Tạo buổi đánh mới</h2>
          <span className="text-[11px] text-slate-500">
            {members.length} thành viên
          </span>
        </div>

        <form
          action={createSessionAction}
          className="grid gap-2 md:grid-cols-2"
        >
          <div className="field max-w-[200px]">
            <span className="field-label">Ngày</span>
            <input
              type="date"
              name="date"
              defaultValue={todayStr}
              className="field-input"
            />
          </div>

          <div className="field max-w-[200px]">
            <span className="field-label">Host (optional)</span>
            <select
              name="hostId"
              defaultValue=""
              className="field-select"
            >
              <option value="">-- Chọn host --</option>
              {members.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

           {/* ĐỊA CHỈ SÂN CẦU */}
          <div className="field md:col-span-2">
            <span className="field-label">Địa chỉ sân cầu / Ngày giờ</span>
            <input
              type="text"
              name="courtAddress"
              placeholder="Ví dụ: 17:30 ~ 19:30 Sân ABC, 123 Lê Lợi, Q.1"
              className="field-input"
            />
          </div>         

          <div className="field max-w-[200px]">
            <span className="field-label">Tiền sân</span>
            <input
              type="number"
              name="courtFee"
              defaultValue={0}
              className="field-input"
            />
          </div>

          <div className="field max-w-[200px]">
            <span className="field-label">Tiền cầu</span>
            <input
              type="number"
              name="shuttleFee"
              defaultValue={0}
              className="field-input"
            />
          </div>

          <div className="field max-w-[200px]">
            <span className="field-label">Tiền quỹ / nước</span>
            <input
              type="number"
              name="fundFee"
              defaultValue={0}
              className="field-input"
            />
          </div>

          <div className="flex items-end">
            <button type="submit">Tạo buổi</button>
          </div>
        </form>
      </section>

      {/* BUỔI ĐANG MỞ */}
      <section className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="card-title">Buổi đang mở</h2>
          <span className="text-[11px] text-slate-500">
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
                <li key={s.id} className="session-item">
                  <div>
                    <div className="font-medium">
                      {new Date(s.date).toLocaleDateString('vi-VN')}
                      {s.host && ` - Host by ${s.host.name}`}   {/* 👈 thêm host */}
                    </div>
                    {/* hiển thị địa chỉ nếu có */}
                    {s.courtAddress && (
                      <div className="text-[11px] text-slate-600">
                        Sân: {s.courtAddress}
                      </div>
                    )}
                    <div className="session-status">
                      Tổng tạm:{' '}
                      {total.toLocaleString('vi-VN')}
                      đ
                    </div>
                  </div>
                  <a href={`/sessions/${s.id}`} className="text-blue-600 text-xs">
                    Vào buổi
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* BUỔI GẦN ĐÂY */}
      <section className="card">
        <div className="flex items-center justify-between mb-1">
          <h2 className="card-title">Buổi gần đây</h2>
          <a
            href="/history"
            className="text-xs text-blue-600"
          >
            Xem tất cả
          </a>
        </div>

        {recentSessions.length === 0 ? (
          <p className="card-subtitle">Chưa có buổi nào.</p>
        ) : (
          <ul className="session-list">
            {recentSessions.map((s: any) => (
              <li key={s.id} className="session-item">
                <div>
                  <span className="font-medium">
                    {new Date(s.date).toLocaleDateString('vi-VN')}
                    {s.host && ` - Host by ${s.host.name}`}
                  </span>{' '}
                  <span className="session-status">
                    ·{' '}
                    {s.status === 'PLANNED' && 'Đang mở'}
                    {s.status === 'COMPLETED' && 'Đã hoàn thành'}
                    {s.status === 'CANCELED' && 'Đã hủy'}
                  </span>
                  {/* thêm địa chỉ ở recent nếu muốn */}
                  {s.courtAddress && (
                    <div className="text-[11px] text-slate-600">
                      Sân: {s.courtAddress}
                    </div>
                  )}
                </div>
                <a
                  href={`/sessions/${s.id}`}
                  className="text-blue-600 text-xs"
                >
                  Chi tiết
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
    </PassGate>
  )
}
