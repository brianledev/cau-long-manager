// lib/passcode.ts
export function getVietnamPasscode(): number {
  const now = new Date()

  // Lấy ngày giờ theo múi giờ Việt Nam
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const year  = Number(parts.find(p => p.type === 'year')?.value)
  const month = Number(parts.find(p => p.type === 'month')?.value)
  const day   = Number(parts.find(p => p.type === 'day')?.value)
  const hour  = Number(parts.find(p => p.type === 'hour')?.value)

  // Công thức: Năm - Tháng - Ngày - Giờ
  return year - month - day - hour
}
