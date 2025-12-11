'use client'

import { useEffect, useState } from 'react'
import { getVietnamPasscode } from '@/lib/passcode'

export default function PassGate({
  children,
}: {
  children: React.ReactNode
}) {
  const [ok, setOk] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const expected = String(getVietnamPasscode())
    const saved = typeof window !== 'undefined'
      ? window.localStorage.getItem('badminton_passcode')
      : null

    if (saved === expected) {
      setOk(true)
    }

    setChecking(false)
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const code = String(formData.get('code') || '').trim()
    const expected = String(getVietnamPasscode())

    if (code === expected) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('badminton_passcode', expected)
      }
      setOk(true)
      setError(null)
    } else {
      setError('Sai passcode, thử lại nhé.')
    }
  }

  // Trong lúc đang check localStorage thì khỏi chớp chớp giao diện
  if (checking) {
    return null
  }

  // Đã pass → render app
  if (ok) {
    return <>{children}</>
  }

  // Chưa pass → form nhập code
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="card max-w-sm w-[500] space-y-3"
      >
        <h1 className="card-title">Nhập passcode</h1>
        <p className="card-subtitle text-xs">
          Đào nói app cùi nhục quá phải làm cái này..
        </p>

        <input
          type="password"
          name="code"
          placeholder="Passcode"
          className="field-input max-w-[200]"
          autoFocus
        />

        {error && (
          <p className="text-xs text-red-500">
            {error}
          </p>
        )}

        <button type="submit">Mở ứng dụng</button>
      </form>
    </div>
  )
}
