'use client'

import { lockSessionAction } from '@/app/actions'
import { useRouter } from 'next/navigation'

interface LockButtonProps {
  sessionId: string
  canEdit: boolean
  sessionStatus: string
}

export default function LockButton({
  sessionId,
  canEdit,
  sessionStatus,
}: LockButtonProps) {
  const router = useRouter()
  
  // Show button only when open (canEdit)
  if (!canEdit || sessionStatus !== 'PLANNED') {
    return null
  }

  const handleLock = async () => {
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    await lockSessionAction(formData)
    router.refresh()
  }

  return (
    <button
      onClick={handleLock}
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      title="Khóa buổi này"
    >
      🔒 Khóa lại
    </button>
  )
}
