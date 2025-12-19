'use client'

import { useState } from 'react'
import { deleteMemberAction, updateMemberAction } from '@/app/actions'

export default function MemberActions({
  member,
}: {
  member: { id: string; name: string; active: boolean }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(member.name)
  const [active, setActive] = useState(member.active)

  const handleDelete = async () => {
    if (!confirm(`Xóa thành viên "${member.name}"?`)) {
      return
    }
    const formData = new FormData()
    formData.append('memberId', member.id)
    await deleteMemberAction(formData)
  }

  const handleUpdate = async () => {
    const formData = new FormData()
    formData.append('memberId', member.id)
    formData.append('name', name)
    formData.append('active', active ? 'true' : 'false')
    await updateMemberAction(formData)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-input text-xs py-1 px-2 w-24"
        />
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active
        </label>
        <button
          type="button"
          onClick={handleUpdate}
          className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => {
            setName(member.name)
            setActive(member.active)
            setIsEditing(false)
          }}
          className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 ring-1 ring-amber-200 transition-all"
      >
        ✏️ Sửa
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 ring-1 ring-red-200 transition-all"
      >
        🗑️ Xóa
      </button>
    </div>
  )
}
