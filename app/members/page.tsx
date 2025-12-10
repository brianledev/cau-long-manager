// app/members/page.tsx
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

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
}

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'asc' },
    include: { participations: true },
  })

  const activeCount = members.filter((m) => m.active).length

  return (
    <div className="main-container">
      <section className="card">
        <h1 className="card-title">Thành viên</h1>
        <p className="card-subtitle">
          Quản lý danh sách thành viên và trạng thái hoạt động trong nhóm cầu
          lông.
        </p>
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title">Thêm thành viên</h2>
          <span className="text-[11px] text-slate-500">
            {activeCount}/{members.length} đang hoạt động
          </span>
        </div>

        <form
          action={addMember}
          className="flex flex-col gap-2 md:flex-row md:items-end"
        >
          <div className="field md:flex-1">
            <span className="field-label">Tên thành viên</span>
            <input
              name="name"
              className="field-input"
              placeholder="Ví dụ: QuýTNTK"
            />
          </div>
          <button type="submit">Thêm</button>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title mb-2">Danh sách thành viên</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="pb-2">Tên</th>
                <th className="pb-2">Trạng thái</th>
                <th className="pb-2">Số buổi tham gia</th>
                <th className="pb-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0">
                  <td className="py-2">{m.name}</td>
                  <td className="py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-[2px] text-[11px] ${
                        m.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {m.active ? 'Đang hoạt động' : 'Ẩn / nghỉ'}
                    </span>
                  </td>
                  <td className="py-2">{m.participations.length}</td>
                  <td className="py-2 text-right">
                    <form action={toggleMemberActive}>
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={String(m.active)}
                      />
                      <button type="submit">
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
  )
}
