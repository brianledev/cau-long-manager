// app/sessions/[id]/page.tsx
import { prisma } from '@/lib/db'
import {
  joinSessionAction,
  joinGuestAction,
  leaveSessionAction,
  calculateFeeAction,
  togglePaidAction,
  completeSessionAction,
  cancelSessionAction,
} from '@/app/actions'
import { notFound } from 'next/navigation'

const DEFAULT_BANK_ID = process.env.NEXT_PUBLIC_BANK_ID ?? 'MB'
const DEFAULT_ACCOUNT_NO = process.env.NEXT_PUBLIC_ACCOUNT_NO ?? ''

export default async function SessionPage(props: any) {
  // Next 16: params có thể là Promise, nên luôn await
  const params = await props.params
  const id = params?.id as string | undefined

  if (!id) {
    throw new Error('Missing session id')
  }

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      host: true,
      participations: {
        include: { member: true },
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!session) return notFound()

  const members = await prisma.member.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  })

  const participants = session.participations
  const perFee = participants.length ? participants[0].customFee ?? 0 : 0

  const dateLabel = new Date(session.date).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const totalAmount = session.totalAmount ?? 0
  const canEdit = session.status === 'PLANNED'

  return (
    <div className="main-container space-y-4">
      {/* HEADER */}
      <section className="card flex items-start justify-between gap-4">
        <div>
          <h1 className="card-title">
            Buổi cầu lông {dateLabel}
          </h1>
          <p className="card-subtitle">
            Trạng thái:{' '}
            <span className="font-semibold text-slate-800">
              {session.status === 'PLANNED' && 'Đang mở'}
              {session.status === 'COMPLETED' && 'Đã hoàn thành'}
              {session.status === 'CANCELED' && 'Đã hủy'}
            </span>
          </p>
          {session.host && (
            <p className="card-subtitle">
              Host: <span className="font-medium">{session.host.name}</span>
            </p>
          )}
          {session.note && (
            <p className="card-subtitle">
              Ghi chú: <span className="font-medium">{session.note}</span>
            </p>
          )}
        </div>
        <a href="/" className="text-xs text-blue-600 hover:underline">
          ← Về trang chính
        </a>
      </section>

      {/* JOIN / GUEST */}
      {canEdit && (
        <section className="card space-y-3 text-sm">
          <h2 className="card-title">Tham gia buổi này</h2>
          <p className="card-subtitle">
            Thành viên tự chọn tên mình hoặc host thêm khách vãng lai.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Join as member */}
            <form
              action={joinSessionAction}
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <input type="hidden" name="sessionId" value={session.id} />
              <div className="field md:flex-1">
                <span className="field-label">Chọn tên</span>
                <select
                  name="memberId"
                  className="field-select"
                  defaultValue=""
                >
                  <option value="">-- Chọn tên --</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit">Tham gia</button>
            </form>

            {/* Join as guest */}
            <form
              action={joinGuestAction}
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <input type="hidden" name="sessionId" value={session.id} />
              <div className="field md:flex-1">
                <span className="field-label">Khách vãng lai</span>
                <input
                  name="guestName"
                  placeholder="Tên khách vãng lai"
                  className="field-input"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-slate-800 border border-slate-300"
              >
                Thêm khách
              </button>
            </form>
          </div>
        </section>
      )}

      {/* DANH SÁCH THAM GIA */}
      <section className="card space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="card-title">
            Danh sách tham gia ({participants.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-slate-200 rounded-md overflow-hidden">
            <thead className="bg-slate-50">
              <tr className="text-left text-[11px] text-slate-500">
                <th className="px-2 py-1">Tên</th>
                <th className="px-2 py-1 text-right">Số tiền</th>
                <th className="px-2 py-1 text-center">Đã đóng</th>
                {canEdit && (
                  <th className="px-2 py-1 text-center">Xóa</th>
                )}
              </tr>
            </thead>
            <tbody>
              {participants.map((p: any) => {
                const name = p.isGuest
                  ? `Khách: ${p.guestName}`
                  : p.member?.name || 'N/A'
                return (
                  <tr
                    key={p.id}
                    className={`border-t border-slate-100 ${
                      p.paid ? 'bg-emerald-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-2 py-1">{name}</td>
                    <td className="px-2 py-1 text-right">
                      {(p.customFee ?? 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-2 py-1 text-center">
                      <form
                        action={togglePaidAction}
                        className="inline-flex items-center gap-1"
                      >
                        <input
                          type="hidden"
                          name="sessionId"
                          value={session.id}
                        />
                        <input
                          type="hidden"
                          name="participationId"
                          value={p.id}
                        />
                        <input
                          type="checkbox"
                          name="paid"
                          defaultChecked={p.paid}
                        />
                        <button
                          type="submit"
                          className="text-[10px] underline text-slate-500"
                        >
                          Lưu
                        </button>
                      </form>
                    </td>
                    {canEdit && (
                      <td className="px-2 py-1 text-center">
                        <form action={leaveSessionAction}>
                          <input
                            type="hidden"
                            name="sessionId"
                            value={session.id}
                          />
                          <input
                            type="hidden"
                            name="participationId"
                            value={p.id}
                          />
                          <button
                            type="submit"
                            className="text-[10px] underline text-red-500 bg-transparent shadow-none"
                          >
                            Xóa
                          </button>
                        </form>
                      </td>
                    )}
                  </tr>
                )
              })}
              {!participants.length && (
                <tr>
                  <td
                    colSpan={canEdit ? 4 : 3}
                    className="px-2 py-3 text-center text-slate-500"
                  >
                    Chưa có ai tham gia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FORM "TÍNH TIỀN" */}
      {canEdit && (
        <section className="card space-y-3 text-sm">
          <h2 className="card-title">Tính tiền</h2>
          <p className="card-subtitle">
            Sau khi chốt số người, nhập tổng tiền và thông tin chuyển khoản
            để chia đều cho mọi người.
          </p>

          <form
            action={calculateFeeAction}
            className="grid gap-2 max-w-md text-sm"
          >
            <input type="hidden" name="sessionId" value={session.id} />

            <label className="field">
              <span className="field-label">
                Tổng tiền buổi này (VND)
              </span>
              <input
                type="number"
                name="totalAmount"
                defaultValue={
                  session.totalAmount ??
                  session.courtFee +
                    session.shuttleFee +
                    session.fundFee
                }
                className="field-input"
              />
            </label>

            <label className="field">
              <span className="field-label">Nội dung chuyển khoản</span>
              <input
                type="text"
                name="qrContent"
                defaultValue={
                  session.qrContent ||
                  `Cau long ${new Date(
                    session.date,
                  ).toLocaleDateString('vi-VN')}`
                }
                className="field-input"
              />
            </label>

            <label className="field">
              <span className="field-label">Mã ngân hàng (MB, VCB...)</span>
              <input
                type="text"
                name="qrBankId"
                defaultValue={session.qrBankId || DEFAULT_BANK_ID}
                className="field-input"
              />
            </label>

            <label className="field">
              <span className="field-label">
                Số tài khoản nhận tiền
              </span>
              <input
                type="text"
                name="qrAccountNo"
                defaultValue={session.qrAccountNo || DEFAULT_ACCOUNT_NO}
                className="field-input"
              />
            </label>

            <div className="mt-1">
              <button type="submit">Tính tiền &amp; cập nhật</button>
            </div>
          </form>
        </section>
      )}

      {/* QR + TỔNG TIỀN (khi đã tính) */}
      {totalAmount > 0 && participants.length > 0 && (
        <section className="card flex flex-col gap-4 text-xs md:flex-row md:items-center">
          <div className="space-y-1">
            <div>
              <span className="font-semibold">Tổng tiền: </span>
              {totalAmount.toLocaleString('vi-VN')}đ
            </div>
            <div>
              <span className="font-semibold">Mỗi người: </span>
              {perFee.toLocaleString('vi-VN')}đ
            </div>
            <div>
              <span className="font-semibold">Nội dung: </span>
              {session.qrContent}
            </div>
            <div>
              <span className="font-semibold">STK: </span>
              {session.qrAccountNo} ({session.qrBankId})
            </div>
          </div>

          <img
            className="h-32 w-auto border border-slate-200 rounded-md bg-white"
            src={
              `https://img.vietqr.io/image/${
                session.qrBankId || DEFAULT_BANK_ID
              }-${session.qrAccountNo || DEFAULT_ACCOUNT_NO}-compact2.jpg?` +
              `amount=${perFee}&addInfo=${encodeURIComponent(
                session.qrContent || '',
              )}`
            }
            alt="VietQR"
          />
        </section>
      )}

      {/* HOÀN THÀNH / HỦY BUỔI */}
      {canEdit && (
        <section className="card flex flex-wrap gap-2 text-xs">
          <form action={completeSessionAction}>
            <input type="hidden" name="sessionId" value={session.id} />
            <button
              type="submit"
              className="bg-emerald-600 text-white"
            >
              Hoàn thành buổi đánh
            </button>
          </form>

          <form
            action={cancelSessionAction}
            className="flex flex-1 flex-col gap-2 md:flex-row md:items-center"
          >
            <input type="hidden" name="sessionId" value={session.id} />
            <input
              name="note"
              placeholder="Lý do hủy (ít người, mưa, ...)"
              className="field-input md:flex-1"
            />
            <button
              type="submit"
              className="bg-red-600 text-white"
            >
              Hủy buổi
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
