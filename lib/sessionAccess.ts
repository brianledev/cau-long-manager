// lib/sessionAccess.ts
// Helper functions để tính toán join/edit rules theo thời gian

/**
 * Lấy start-of-day (00:00) của session theo timezone Asia/Ho_Chi_Minh
 * Session date stored as UTC (e.g., 2026-01-01T00:00:00.000Z)
 * We need to find midnight of that day in VN timezone
 */
export function getSessionDayStart(sessionDate: Date): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const dateString = formatter.format(sessionDate) // Format: "2026-01-01"
  const [year, month, day] = dateString.split('-').map(Number)
  
  // Midnight UTC of that day
  const utcMidnight = new Date(Date.UTC(year, month - 1, day))
  
  // VN is UTC+7, so midnight VN time = UTC midnight - 7 hours
  const vnOffset = -7 * 60 * 60 * 1000
  return new Date(utcMidnight.getTime() + vnOffset)
}

/**
 * Lấy current time theo timezone Asia/Ho_Chi_Minh
 */
export function getCurrentTimeVN(): Date {
  return new Date()
}

/**
 * Tính access flags cho buổi
 * @param session - Session object
 * @param hasEditAccess - có cookie session_edit_access_${id}
 * @returns { isJoinOpen, isSessionDay, canJoin, canEdit }
 */
export function getSessionAccessFlags(
  session: { date: Date | string; status: string },
  hasEditAccess: boolean = false
) {
  const now = getCurrentTimeVN()
  const sessionDate = session.date instanceof Date ? session.date : new Date(session.date)
  const sessionDayStart = getSessionDayStart(sessionDate)
  const sessionDayEnd = new Date(sessionDayStart.getTime() + 24 * 60 * 60 * 1000)
  const joinDeadline = new Date(sessionDayStart.getTime() - 24 * 60 * 60 * 1000)

  const isJoinOpen = now < joinDeadline
  const isSessionDay = now >= sessionDayStart && now < sessionDayEnd

  const canJoin = session.status === 'PLANNED' && isJoinOpen
  // canEdit: trước join deadline thì tự do, sau đó cần unlock
  const canEdit =
    session.status === 'PLANNED' &&
    (isJoinOpen ? true : hasEditAccess)

  return { isJoinOpen, isSessionDay, canJoin, canEdit }
}

/**
 * Generate 6-digit passcode
 */
export function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Tính thời gian còn lại (ms) đến join deadline
 * Trả về: { days, hours, minutes, seconds, totalMs }
 */
export function getTimeUntilJoinDeadline(sessionDate: Date) {
  const now = getCurrentTimeVN()
  const sessionDayStart = getSessionDayStart(sessionDate)
  const joinDeadline = new Date(sessionDayStart.getTime() - 24 * 60 * 60 * 1000)
  
  const totalMs = joinDeadline.getTime() - now.getTime()
  
  if (totalMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true }
  }
  
  const seconds = Math.floor((totalMs / 1000) % 60)
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60)
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24)
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24))
  
  return { days, hours, minutes, seconds, totalMs, isExpired: false }
}
