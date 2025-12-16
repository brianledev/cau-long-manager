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
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-400/20 blur-[100px]"></div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md space-y-8 rounded-3xl border border-white/60 bg-white/70 p-10 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-4xl shadow-lg shadow-blue-500/30 ring-4 ring-white">
            🏸
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Nhập passcode
          </h1>
          <p className="text-base text-slate-500">
            Đào nói app cùi nhục quá phải làm cái này..
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 ml-1">
            Passcode
          </label>
          <input
            type="password"
            name="code"
            placeholder="Nhập mật khẩu"
            className="w-full rounded-xl border border-slate-200 bg-white/50 px-5 py-3.5 text-base text-slate-900 shadow-sm placeholder:text-slate-400 transition-all hover:bg-white hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          Truy cập
        </button>
      </form>
    </div>
  )
}
