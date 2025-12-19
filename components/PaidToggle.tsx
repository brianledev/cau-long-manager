'use client'

import { useRef } from 'react'

export default function PaidToggle({
  sessionId,
  participationId,
  defaultChecked,
  action,
}: {
  sessionId: string
  participationId: string
  defaultChecked: boolean
  action: (formData: FormData) => void
}) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action} className="inline-flex items-center">
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="participationId" value={participationId} />

      <input
        type="checkbox"
        name="paid"
        defaultChecked={defaultChecked}
        className="w-4 h-4 cursor-pointer"
        onChange={() => formRef.current?.requestSubmit()}
      />
    </form>
  )
}
