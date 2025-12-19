'use client'

import { useState } from 'react'
import { deleteGroupAction, updateGroupAction } from '@/app/actions'

export default function GroupActions({
  group,
}: {
  group: { id: string; name: string }
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(group.name)

  const handleDelete = async () => {
    if (!confirm(`Xóa nhóm "${group.name}"? Thành viên sẽ chuyển về NON GROUP.`)) {
      return
    }
    const formData = new FormData()
    formData.append('groupId', group.id)
    await deleteGroupAction(formData)
  }

  const handleUpdate = async () => {
    const formData = new FormData()
    formData.append('groupId', group.id)
    formData.append('name', name)
    await updateGroupAction(formData)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-input text-xs py-1 px-2 w-32"
        />
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
            setName(group.name)
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
      <span className="mr-2">{group.name}</span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200"
        title="Sửa"
      >
        ✏️
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
        title="Xóa"
      >
        🗑️
      </button>
    </div>
  )
}
