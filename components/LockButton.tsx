'use client'

import { lockSessionAction } from '@/app/actions'

interface LockButtonProps {
  sessionId: string
  isJoinOpen: boolean
  editAccess: boolean
  sessionStatus: string
}

export default function LockButton({
  sessionId,
  isJoinOpen,
  editAccess,
  sessionStatus,
}: LockButtonProps) {
  // Only show button when join is locked and already unlocked
  if (isJoinOpen || !editAccess || sessionStatus !== 'PLANNED') {
    return null
  }

  const handleLock = async () => {
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    await lockSessionAction(formData)
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
