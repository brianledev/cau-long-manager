'use client'

import { useState } from 'react'
import UnlockSessionModal from './UnlockSessionModal'

interface UnlockButtonProps {
  sessionId: string
  isJoinOpen: boolean
  editAccess: boolean
  sessionStatus: string
}

export default function UnlockButton({
  sessionId,
  isJoinOpen,
  editAccess,
  sessionStatus,
}: UnlockButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Only show button when join is locked and not yet unlocked
  if (isJoinOpen || editAccess || sessionStatus !== 'PLANNED') {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        🔐 Mở khóa
      </button>
      <UnlockSessionModal
        sessionId={sessionId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
