'use client'

import { useEffect, useState } from 'react'
import { getTimeUntilJoinDeadline } from '@/lib/sessionAccess'

interface JoinCountdownProps {
  sessionDate: Date
}

export default function JoinCountdown({ sessionDate }: JoinCountdownProps) {
  const [time, setTime] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean } | null>(null)

  useEffect(() => {
    // Tính lần đầu tiên
    const updateTime = () => {
      const result = getTimeUntilJoinDeadline(sessionDate)
      setTime({
        days: result.days,
        hours: result.hours,
        minutes: result.minutes,
        seconds: result.seconds,
        isExpired: result.isExpired,
      })
    }

    updateTime()

    // Update mỗi giây
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [sessionDate])

  if (!time) return null

  if (time.isExpired) {
    return (
      <div className="space-y-2">
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
          ⏰ Thời gian tham gia đã hết. Buổi này bị khóa tham gia.
        </div>
        <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs text-orange-800">
          📋 Hạn đăng ký đã kết thúc. Nếu bạn muốn tham gia, vui lòng nhờ <b>Host đăng ký</b> giúp.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
      <div className="font-semibold mb-1">⏱️ Thời gian tham gia còn lại:</div>
      <div className="font-mono font-bold text-sm text-blue-900">
        {String(time.days).padStart(2, '0')} ngày · {String(time.hours).padStart(2, '0')}h · {String(time.minutes).padStart(2, '0')}m · {String(time.seconds).padStart(2, '0')}s
      </div>
    </div>
  )
}
