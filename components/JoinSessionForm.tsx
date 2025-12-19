'use client'

import { useState } from 'react'
import { joinSessionAction, joinGuestAction } from '@/app/actions'

export default function JoinSessionForm({
  sessionId,
  members,
  groups,
}: {
  sessionId: string
  members: any[]
  groups: any[]
}) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [joinType, setJoinType] = useState<'member' | 'guest'>('member')

  const filteredMembers = selectedGroupId
    ? members.filter((m) =>
        selectedGroupId === '__non_group__' ? !m.groupId : m.groupId === selectedGroupId
      )
    : members

  return (
    <div className="space-y-3">
      {joinType === 'member' && (
        <>
          <div className="field">
            <span className="field-label">Chọn nhóm của bạn</span>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="field-select"
            >
              <option value="">-- Tất cả --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
              <option value="__non_group__">NON GROUP</option>
            </select>
          </div>

          <form action={joinSessionAction} className="flex flex-col gap-2 md:flex-row md:items-end">
            <input type="hidden" name="sessionId" value={sessionId} />
            <div className="field md:flex-1 mb-0">
              <span className="field-label">Chọn tên</span>
              <select name="memberId" className="field-select" defaultValue="">
                <option value="">-- Chọn tên --</option>
                {filteredMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="shrink-0">
              <button type="submit" className="h-[42px] w-full md:w-auto">Tham gia</button>
            </div>
          </form>
        </>
      )}

      {joinType === 'guest' && (
        <form action={joinGuestAction} className="flex flex-col gap-2 md:flex-row md:items-end">
          <input type="hidden" name="sessionId" value={sessionId} />
          <div className="field md:flex-1 mb-0">
            <span className="field-label">Nhập tên</span>
            <input name="guestName" placeholder="Tên của bạn" className="field-input" />
          </div>
          <div className="shrink-0">
            <button type="submit" className="h-[42px] w-full md:w-auto">Tham gia</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => setJoinType('member')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            joinType === 'member'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Thành viên
        </button>
        <button
          type="button"
          onClick={() => setJoinType('guest')}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
            joinType === 'guest'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Khách vãng lai
        </button>
      </div>
    </div>
  )
}
