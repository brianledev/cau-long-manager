import { TopName } from '@/components/TopName'
import { getGlobalTop3 } from '@/lib/getGlobalTop3'
// app/sessions/[id]/page.tsx
import { prisma } from '@/lib/db'
import {
  leaveSessionAction,
  calculateFeeAction,
  togglePaidAction,
  completeSessionAction,
  cancelSessionAction,
  updateSessionAction,
  verifySessionEditPasscodeAction,
  lockSessionAction,
} from '@/app/actions'
import { notFound } from 'next/navigation'
import PassGate from '@/components/PassGate'
import PaidToggle from '@/components/PaidToggle'
import JoinSessionForm from '@/components/JoinSessionForm'
import { cookies } from 'next/headers'
import { verifySessionPasscodeAction } from '@/app/actions'
import { getSessionAccessFlags } from '@/lib/sessionAccess'
import JoinCountdown from '@/components/JoinCountdown'
import UnlockButton from '@/components/UnlockButton'
import LockButton from '@/components/LockButton'

// Always fetch fresh data from database (disable caching)
export const revalidate = 0
export const dynamic = 'force-dynamic'

const DEFAULT_BANK_ID = process.env.NEXT_PUBLIC_BANK_ID ?? 'MB'
const DEFAULT_ACCOUNT_NO = process.env.NEXT_PUBLIC_ACCOUNT_NO ?? ''

export default async function SessionPage(props: any) {
  // Next 16: params có thể là Promise, nên luôn await
  const params = await props.params
  const searchParams = await props.searchParams  // ✅ thêm dòng này
  const saved = searchParams?.saved === '1'      // ✅ thêm dòng này
  const id = params?.id as string | undefined

  if (!id) {
    throw new Error('Missing session id')
  }

  const [session, groups] = await Promise.all([
    prisma.session.findUnique({
      where: { id },
      include: {
        host: true,
        participations: {
          include: { member: true },
          orderBy: { id: 'asc' },
        },
      },
    }),
    prisma.group.findMany({
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // Lấy tất cả member và participation để xác định top
  const allMembers = await prisma.member.findMany({ select: { id: true, name: true } })
  const participations = await prisma.participation.findMany({ where: { isGuest: false } })
  const globalTop3Ids = await getGlobalTop3();

  if (!session) return notFound()

  const needPass = !!session.passcode && session.passcode.trim() !== ''
  const cookieStore = await cookies()   // ✅ BẮT BUỘC await
  const access = cookieStore.get(`session_access_${id}`)?.value === '1'

  if (needPass && !access) {
    const err = searchParams?.err === '1'

    return (
      <div className="main-container space-y-4">
        <section className="card">
          <h1 className="card-title">Buổi này có đặt mật khẩu</h1>
          <p className="card-subtitle">Nhập đúng mật khẩu để tiếp tục.</p>

          {err && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              ❌ Mật khẩu sai, thử lại nhé.
            </div>
          )}

          <form action={verifySessionPasscodeAction} className="mt-4 grid gap-3 max-w-sm">
            <input type="hidden" name="sessionId" value={id} />
            <label className="field">
              <span className="field-label">Mật khẩu buổi</span>
              <input name="passcode" className="field-input" placeholder="VD: 123456" />
            </label>
            <button type="submit">Vào buổi</button>
          </form>

          <a href="/" className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline">
            ← Về trang chính
          </a>
        </section>
      </div>
    )
  }

  const members = await prisma.member.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  })

  // **TÍNH FLAGS KHÓA/MỞ**
  const editAccess = cookieStore.get(`session_edit_access_${id}`)?.value === '1'
  const { isJoinOpen, isSessionDay, canJoin, canEdit: canEditWithTimeCheck } = getSessionAccessFlags(session, editAccess)

  // Hiển thị lỗi từ query params
  const errorCode = searchParams?.err as string | undefined
  
  const participants = session.participations
  const perFee = participants.length ? participants[0].customFee ?? 0 : 0

  const dateLabel = new Date(session.date).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const totalAmount = session.totalAmount ?? 0
  const canEdit = canEditWithTimeCheck  // **CÓ THỂ CHỈNH SỬA (theo thời gian + edit lock)**
  const canQR = ['PLANNED', 'COMPLETED'].includes(session.status)
  const inputCls = 'input w-full'
  const selectCls = 'select w-full'
  const btnPrimary = 'btn btn-primary'

  return (
    // <PassGate>

    <div className="main-container space-y-4">
      {/* Đã xoá Top thành viên theo yêu cầu */}
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
          {/* 👉 mới: địa chỉ sân */}
          {session.courtAddress && (
            <p className="text-xs text-gray-600">
              Sân: {session.courtAddress}
            </p>
          )}
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
      {saved && (
        <div className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 border border-emerald-100">
          ✅ Lưu thay đổi thành công
        </div>
      )}
      {/* **ERROR MESSAGES** */}
      {errorCode === 'join_locked' && (
        <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 border border-red-200">
          ❌ Buổi này đã khóa tham gia (còn &lt;24h đến ngày diễn ra)
        </div>
      )}
      {errorCode === 'edit_locked' && (
        <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 border border-red-200">
          ❌ Hôm nay là ngày diễn ra - cần mật khẩu unlock để chỉnh sửa
        </div>
      )}
      {errorCode === 'edit_passcode_wrong' && (
        <div className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700 border border-red-200">
          ❌ Mật khẩu unlock sai
        </div>
      )} 
        </div>
        <a href="/" className="text-xs font-medium text-blue-600 hover:underline">
          ← Về trang chính
        </a>
      </section>

      {/* COUNTDOWN - ALWAYS SHOW */}
      <section className="card">
        <JoinCountdown sessionDate={session.date} />
      </section>

      {/* UNLOCK/LOCK BUTTON - SHOW ON SESSION DAY */}
      {isSessionDay && session.status === 'PLANNED' && (
        <section className={`card border-l-4 ${editAccess ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
          <div className="flex items-center justify-between">
            <div>
              {editAccess ? (
                <>
                  <h3 className="font-semibold text-green-900">✅ Buổi này đã mở khóa</h3>
                  <p className="text-sm text-green-700 mt-1">Bạn có thể chỉnh sửa buổi. Bấm khóa khi xong.</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-amber-900">🔐 Buổi này đang bị khóa</h3>
                  <p className="text-sm text-amber-700 mt-1">Nhập mật khẩu để mở khóa chỉnh sửa</p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <UnlockButton
                sessionId={id}
                isSessionDay={isSessionDay}
                editAccess={editAccess}
                sessionStatus={session.status}
              />
              <LockButton
                sessionId={id}
                isSessionDay={isSessionDay}
                editAccess={editAccess}
                sessionStatus={session.status}
              />
            </div>
          </div>
        </section>
      )}

      {/* CHỈNH SỬA BUỔI - chỉ hiện khi canEdit */}
      {canEdit && (
      <section className="card space-y-3">
          <h2 className="card-title">Chỉnh sửa buổi</h2>

          <form action={updateSessionAction} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="sessionId" value={session.id} />

            <label className="field max-w-[200px] mb-0">
              <span className="field-label">Ngày</span>
              <input
                type="date"
                name="date"
                defaultValue={new Date(session.date).toISOString().slice(0, 10)}
                className="field-input"
              />
            </label>            

            <label className="field max-w-60">
              <span className="field-label">Host</span>
              <select
                name="hostId"
                defaultValue={session.hostId ?? ''}
                className="field-select"
              >
                <option value="">-- Không chọn --</option>
                {members.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field md:col-span-2 mb-0">
              <span className="field-label">Địa chỉ sân</span>
              <input
                type="text"
                name="courtAddress"
                defaultValue={session.courtAddress ?? ''}
                className="field-input"
                placeholder="VD: Sân An Bình / 18h ~ 20h"
              />
            </label>

            <label className="field max-w-[200px] mb-0">
              <span className="field-label">Tiền sân</span>
              <input
                type="number"
                name="courtFee"
                defaultValue={session.courtFee ?? 0}
                className="field-input"
              />
            </label>

            <label className="field max-w-[200px] mb-0">
              <span className="field-label">Tiền cầu</span>
              <input
                type="number"
                name="shuttleFee"
                defaultValue={session.shuttleFee ?? 0}
                className="field-input"
              />
            </label>

            <label className="field max-w-[200px] mb-0">
              <span className="field-label">Quỹ / nước</span>
              <input
                type="number"
                name="fundFee"
                defaultValue={session.fundFee ?? 0}
                className="field-input"
              />
            </label>

            <label className="field md:col-span-2 max-w-[200px] mb-0">
              <span className="field-label">Ghi chú</span>
                <textarea
                  name="note"
                  defaultValue={session.note ?? ''}
                  className="field-input"
                  rows={4}                  // ✅ tăng chiều cao
                  placeholder="Nhập ghi chú..."
                />
            </label>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit">Lưu thay đổi</button>
            </div>
          </form>
        </section>
      )}
 
      {/* JOIN / GUEST - chỉ hiện khi canEdit */}
      {canEdit && (
        <section className="card space-y-3 text-sm">
          <h2 className="card-title">Tham gia buổi này</h2>
          {!canJoin && !isSessionDay && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              ⏰ Buổi này đã khóa tham gia vì còn &lt;24h đến ngày diễn ra
            </div>
          )}
          <p className="card-subtitle">
            Thành viên chọn nhóm rồi chọn tên mình, hoặc nhập tên khách vãng lai.
          </p>

          <JoinSessionForm sessionId={session.id} members={members} groups={groups} />
        </section>
      )}

      {/* DANH SÁCH THAM GIA */}
      <section className="card">
        <div className="px-4 py-3">
          <h2 className="card-title m-0">Danh sách tham gia ({participants.length})</h2>
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            💡 Sau khi mọi người đã thanh toán, Host chỉ cần <b>tick vào checkbox</b> (dữ liệu sẽ <b>tự động lưu</b>),
            rồi mới <b>Hoàn thành buổi</b> nhé.
          </div>
        </div>

        <div className="p-0 w-full overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full text-xs sm:text-sm border-t border-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-500">
                  <th className="px-2 sm:px-3 py-2 min-w-24">Tên</th>
                  <th className="px-2 sm:px-3 py-2 text-right min-w-20">Số tiền</th>
                  <th className="px-2 sm:px-3 py-2 text-center min-w-16">Đã đóng</th>
                  {canEdit && <th className="px-2 sm:px-3 py-2 text-center min-w-12">Xóa</th>}
                </tr>
              </thead>
              <tbody>
                {participants.map((p: any) => {
                  const name = p.isGuest ? `Khách: ${p.guestName}` : p.member?.name || 'N/A'
                  const isTop = !p.isGuest && p.member && globalTop3Ids.includes(p.member.id);
                  return (
                    <tr
                      key={p.id}
                      className={`border-t border-slate-100 even:bg-white odd:bg-slate-50 hover:bg-slate-100 transition-colors ${
                        p.paid ? 'border-l-4 border-emerald-500 bg-emerald-50/60' : ''
                      }`}
                    >
                      <td className="px-2 sm:px-3 py-2 align-middle whitespace-nowrap">
                        {isTop ? (
                          <TopName rank={globalTop3Ids.indexOf(p.member.id) + 1}>{name}</TopName>
                        ) : (
                          name
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-right align-middle whitespace-nowrap">
                        {(p.customFee ?? 0).toLocaleString('vi-VN')}đ
                      </td>
                      {/* <td className="px-2 sm:px-3 py-2 text-center align-middle">
                        <form action={togglePaidAction} className="inline-flex items-center gap-1">
                          <input type="hidden" name="sessionId" value={session.id} />
                          <input type="hidden" name="participationId" value={p.id} />
                          <input type="checkbox" name="paid" defaultChecked={p.paid} className="w-4 h-4" />
                          <button type="submit" className="text-xs underline text-slate-500">Lưu</button>
                        </form>
                      </td> */}
                      <td className="px-2 sm:px-3 py-2 text-center align-middle">
                        <PaidToggle
                          sessionId={session.id}
                          participationId={p.id}
                          defaultChecked={p.paid}
                          action={togglePaidAction}
                        />
                      </td>
                      {canEdit && (
                        <td className="px-2 sm:px-3 py-2 text-center align-middle">
                          <form action={leaveSessionAction}>
                            <input type="hidden" name="sessionId" value={session.id} />
                            <input type="hidden" name="participationId" value={p.id} />
                            <button type="submit" className="text-xs underline text-red-500">Xóa</button>
                          </form>
                        </td>
                      )}
                    </tr>
                  )
                })}
                {!participants.length && (
                  <tr>
                    <td colSpan={canEdit ? 4 : 3} className="px-2 sm:px-3 py-6 text-center text-slate-500">
                      Chưa có ai tham gia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FORM "TÍNH TIỀN" */}
      {canQR && (
        <>        
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
        </>
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
            className="h-80 w-auto border border-slate-200 rounded-md bg-white"
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
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 hover:shadow-md active:translate-y-0.5 transition-transform"
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
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 hover:shadow-md active:translate-y-0.5 transition-transform"
            >
              Hủy buổi
            </button>
          </form>
        </section>
      )}
    </div>
    // </PassGate>
  )
}
