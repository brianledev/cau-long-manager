// app/members/page.tsx
import { prisma } from '@/lib/db'
import { createGroupAction, createMemberAction, updateMemberGroupsBulkAction } from '@/app/actions'
import PassGate from '@/components/PassGate'
import GroupSelector from '@/components/GroupSelector'
import GroupActions from '@/components/GroupActions'
import MemberActions from '@/components/MemberActions'

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const params = await searchParams
  const selectedGroupId = params?.group

  // Lấy toàn bộ groups
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: 'asc' },
  })

  // Lấy members theo filter
  let members = await prisma.member.findMany({
    where:
      selectedGroupId === '__non_group__'
        ? { groupId: null }
        : selectedGroupId
          ? { groupId: selectedGroupId }
          : undefined,
    orderBy: { createdAt: 'asc' },
    include: {
      group: true,
      participations: {
        where: {
          isGuest: false,
          session: { is: { status: 'COMPLETED' } },
        },
        select: { id: true },
      },
    },
  })

  const activeCount = members.filter((m) => m.active).length
  const isNonGroupSelected = selectedGroupId === '__non_group__'
  const currentGroupName = selectedGroupId
    ? groups.find((g: any) => g.id === selectedGroupId)?.name || 'Không xác định'
    : 'Tất cả'

  return (
    <div className="main-container space-y-4">
      <section className="card">
        <h1 className="card-title text-xl bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Thành viên
        </h1>
        <p className="card-subtitle">
          Quản lý danh sách thành viên, phân nhóm, và trạng thái hoạt động.
        </p>
      </section>

      {/* CREATE GROUP SECTION */}
      <section className="card">
        <h2 className="card-title">Tạo nhóm mới</h2>
        <form
          action={createGroupAction}
          className="flex flex-col gap-4 md:flex-row md:items-end"
        >
          <div className="field md:flex-1 mb-0">
            <span className="field-label">Tên nhóm</span>
            <input
              name="name"
              className="field-input"
              placeholder="Ví dụ: Sáng thứ 2, Chiều thứ 4, ..."
            />
          </div>
          <button type="submit" className="h-[42px]">
            Tạo nhóm
          </button>
        </form>
      </section>

      {/* GROUP FILTER */}
      <section className="card">
        <h2 className="card-title mb-3">Chọn nhóm</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <a
            href="/members"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              !selectedGroupId
                ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200'
            }`}
          >
            Tất cả ({members.filter((m) => !m.groupId || selectedGroupId === undefined).length})
          </a>
          {groups.map((group: any) => (
            <a
              key={group.id}
              href={`/members?group=${group.id}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                selectedGroupId === group.id
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                  : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200'
              }`}
            >
              {group.name} ({members.filter((m) => m.groupId === group.id).length})
            </a>
          ))}
          <a
            href="/members?group=__non_group__"
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              isNonGroupSelected
                ? 'bg-blue-600 text-white ring-2 ring-blue-600'
                : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200'
            }`}
          >
            NON GROUP ({members.filter((m) => !m.groupId).length})
          </a>
        </div>

        {/* Group Management List */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Quản lý nhóm</h3>
          <div className="space-y-2">
            {groups.map((group: any) => (
              <div
                key={group.id}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
              >
                <GroupActions group={group} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADD MEMBER SECTION */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="card-title">Thêm thành viên</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {activeCount}/{members.length} đang hoạt động
          </span>
        </div>

        <form
          action={createMemberAction}
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
          <button type="submit" className="h-[42px]">
            Thêm
          </button>
        </form>
      </section>

      {/* MEMBERS TABLE */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="card-title mb-0">
            Danh sách thành viên {isNonGroupSelected ? 'NON GROUP' : currentGroupName}
          </h2>
        </div>

        <form action={updateMemberGroupsBulkAction}>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3">Tên</th>
                  <th className="px-4 py-3">Nhóm</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Số buổi</th>
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
                      <GroupSelector
                        memberId={m.id}
                        currentGroupId={m.groupId}
                        groups={groups}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
                          m.active
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                          : 'bg-slate-50 text-slate-600 ring-slate-900/10'
                      }`}
                    >
                      {m.active ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                          Ẩn
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-700">
                      <svg
                        className="h-4 w-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-semibold">{m.participations.length}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MemberActions member={{ id: m.id, name: m.name, active: m.active }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 hover:shadow-md active:translate-y-0.5 transition-all"
            >
              💾 Lưu thay đổi nhóm
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
