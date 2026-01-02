'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { verifySessionEditPasscodeAction } from '@/app/actions'

interface UnlockSessionModalProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
}

export default function UnlockSessionModal({
  sessionId,
  isOpen,
  onClose,
}: UnlockSessionModalProps) {
  const [passcode, setPasscode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const router = useRouter()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
      setError('')
      setPasscode('')
    } else {
      dialog.close()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('editPasscode', passcode)

    const result = await verifySessionEditPasscodeAction(formData)
    
    if (result.success) {
      onClose()
      router.refresh()
    } else {
      setError(result.error || 'Có lỗi xảy ra')
      setIsSubmitting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: '1rem',
        maxWidth: '320px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div className="bg-white rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">🔐 Mở khóa buổi</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ❌ {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 text-sm ${error ? 'border-red-300' : 'border-slate-300'}`}
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 text-sm font-medium"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : '🔓 Mở khóa'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
