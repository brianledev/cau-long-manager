'use client'

import { useState } from 'react'
import { createSessionAction } from '@/app/actions'

export default function CreateSessionForm({
  groups,
  allMembers,
  todayStr,
}: {
  groups: { id: string; name: string }[]
  allMembers: { id: string; name: string; groupId: string | null }[]
  todayStr: string
}) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  // Filter members by selected group
  const filteredMembers = selectedGroupId
    ? allMembers.filter((m) =>
        selectedGroupId === '__non_group__' ? !m.groupId : m.groupId === selectedGroupId
      )
    : allMembers

  return (
    <form action={createSessionAction} className="grid gap-4 md:grid-cols-2">
      {/* GROUP SELECTOR */}
      <div className="field max-w-[200px]">
        <span className="field-label">Chọn nhóm <span className="text-red-500">*</span></span>
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value)}
          className="field-select"
          required
        >
          <option value="">-- Chọn nhóm --</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
          <option value="__non_group__">NON GROUP</option>
        </select>

        {/* HOST SELECTOR - filtered by group */}
        <div className="mt-4">
          <span className="field-label">Host <span className="text-red-500">*</span></span>
          <select
            name="hostId"
            defaultValue=""
            className="field-select"
            required
            disabled={!selectedGroupId}
          >
            <option value="">-- Chọn host --</option>
            {filteredMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {!selectedGroupId && (
            <span className="text-xs text-slate-500 mt-1">Chọn nhóm trước</span>
          )}
        </div>
      </div>

      <div className="field max-w-[200px]">
        <span className="field-label">Ngày</span>
        <input
          type="date"
          name="date"
          defaultValue={todayStr}
          className="field-input"
        />
      </div>

      <label className="field">
        <span className="field-label">Mật khẩu buổi (tuỳ chọn)</span>
        <input
          name="passcode"
          className="field-input"
          placeholder="VD: 123456 (để trống => ai cũng vào được)"
        />
      </label>

      <label className="field">
        <span className="field-label">Mật khẩu unlock chỉnh sửa (tuỳ chọn)</span>
        <input
          name="editPasscode"
          className="field-input"
          placeholder="VD: 1234 (để trống => ai cũng edit được)"
        />
      </label>

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

      <div className="flex items-center">
        <button type="submit" className="h-[42px] w-full md:w-auto">
          Tạo buổi
        </button>
      </div>
    </form>
  )
}
