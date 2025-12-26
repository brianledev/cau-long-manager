// Trả về top N member theo số buổi
export function getTopNMemberIds(members: any[], participations: any[], n: number = 3): string[] {
  const countMap: Record<string, number> = {};
  for (const p of participations) {
    if (p.memberId && !p.isGuest) {
      countMap[p.memberId] = (countMap[p.memberId] || 0) + 1;
    }
  }
  // Sắp xếp theo số buổi giảm dần
  const sorted = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id]) => id);
  return sorted;
}
// lib/topMembers.ts
// Utility to get top member ids from data

// Dùng any để tránh lỗi import

export function getTopMemberIds(members: any[], participations: any[]): string[] {
  // Đếm số participation cho từng member
  const countMap: Record<string, number> = {};
  for (const p of participations) {
    if (p.memberId && !p.isGuest) {
      countMap[p.memberId] = (countMap[p.memberId] || 0) + 1;
    }
  }
  let max = 0;
  for (const id in countMap) {
    if (countMap[id] > max) max = countMap[id];
  }
  return Object.keys(countMap).filter(id => countMap[id] === max);
}
