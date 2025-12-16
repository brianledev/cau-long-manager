// app/members/page.tsx
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import PassGate from '@/components/PassGate'

async function addMember(formData: FormData) {
  'use server'
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  await prisma.member.create({
    data: {
      name,
      active: true,
    },
  })
  revalidatePath('/members')
    // Thêm: reload luôn trang /
  revalidatePath('/')
}

async function toggleMemberActive(formData: FormData) {
  'use server'
  const id = String(formData.get('id') ?? '')
  const active = String(formData.get('active') ?? '') === 'true'
  if (!id) return

  await prisma.member.update({
    where: { id },
    data: { active: !active },
  })
  revalidatePath('/members')
    // Thêm: reload luôn trang /
  revalidatePath('/')
}

export default async function MembersPage() {
  // const members = await prisma.member.findMany({
  //   orderBy: { createdAt: 'asc' },
  //   include: { participations: true },
  // })
  
  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      participations: {
        where: {
          // loại guest nếu cần
          isGuest: false,
          // chỉ lấy participation thuộc buổi đã hoàn thành
          session: { is: { status: 'COMPLETED' } },
        },
        // vì chỉ cần đếm, giảm payload cho nhẹ
        select: { id: true },
      },
     },
    })

  const activeCount = members.filter((m) => m.active).length

  return (
    //<PassGate>
    <div className="main-container space-y-4">
      <section className="card">
        <h1 className="card-title text-xl bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">Thành viên</h1>
        <p className="card-subtitle">
          Quản lý danh sách thành viên và trạng thái hoạt động trong nhóm cầu
          lông.
        </p>
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="card-title">Thêm thành viên</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {activeCount}/{members.length} đang hoạt động
          </span>
        </div>

        <form
          action={addMember}
          className="flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="field md:flex-1 mb-0">
            <span className="field-label">Tên thành viên</span>
            <input
              name="name"
              className="field-input"
              placeholder="Ví dụ: QuýTNTK"
            />
          </div>
          <button type="submit" className="h-[42px]">Thêm</button>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title mb-3">Danh sách thành viên</h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Số buổi tham gia</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m.id} className="group transition-colors hover:bg-blue-50/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-900">{m.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
                      m.active
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'
                        : 'bg-slate-50 text-slate-600 ring-slate-900/10 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20'
                      }`}
                    >
                      {m.active ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Đang hoạt động
                      </>
                      ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                        Ẩn / nghỉ
                      </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold">{m.participations.length}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleMemberActive}>
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(m.active)}
                      />
                        <button 
                        type="submit"
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          m.active
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:ring-slate-700'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 dark:ring-emerald-500/20'
                        }`}
                        >
                        {m.active ? 'Ẩn' : 'Kích hoạt'}
                        </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
    //</PassGate>
  )
}
