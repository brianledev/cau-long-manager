'use client'

import { useState } from 'react'
import UnlockSessionModal from './UnlockSessionModal'

interface UnlockButtonProps {
  sessionId: string
  isSessionDay: boolean
  editAccess: boolean
  sessionStatus: string
}

export default function UnlockButton({
  sessionId,
  isSessionDay,
  editAccess,
  sessionStatus,
}: UnlockButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Only show button if on session day and not yet unlocked
  if (!isSessionDay || editAccess || sessionStatus !== 'PLANNED') {
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
