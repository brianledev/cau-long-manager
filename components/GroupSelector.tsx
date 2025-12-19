'use client'

export default function GroupSelector({
  memberId,
  currentGroupId,
  groups,
}: {
  memberId: string
  currentGroupId: string | null
  groups: { id: string; name: string }[]
}) {
  return (
    <select
      name={`group_${memberId}`}
      defaultValue={currentGroupId || ''}
      className="select text-xs py-1.5 max-w-[150px]"
    >
      <option value="">NON GROUP</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  )
}
