// lib/getGlobalTop3.ts
// Lấy top 1-2-3 member giống logic stats/page.tsx, dùng cho các page khác
import { prisma } from './db'

export async function getGlobalTop3() {
  // Lấy tất cả member và participation
  const allMembers = await prisma.member.findMany({ select: { id: true, name: true } })
  const participations = await prisma.participation.findMany({ where: { isGuest: false }, include: { member: true, session: true } })

  // Chỉ tính buổi hoàn thành
  const now = new Date()
  const monthAgo = new Date()
  monthAgo.setMonth(now.getMonth() - 1)

  // Map memberId -> { id, name, sessions }
  const monthMap = new Map<string, { id: string, name: string, sessions: number }>()
  for (const p of participations) {
    if (!p.memberId || !p.member || !p.session) continue
    if (p.session.date < monthAgo) continue
    if (p.session.status !== 'COMPLETED') continue
    const key = p.memberId
    const existing = monthMap.get(key) ?? { id: key, name: p.member.name, sessions: 0 }
    existing.sessions += 1
    monthMap.set(key, existing)
  }
  // Sort theo số buổi giảm dần
  const monthStats = Array.from(monthMap.values()).sort((a, b) => b.sessions - a.sessions)
  // Lấy đúng top 3 (ít hơn nếu thiếu)
  return monthStats.slice(0, 3).map(m => m.id)
}
