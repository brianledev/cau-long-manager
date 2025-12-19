import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const data = {
    members: await prisma.member.findMany(),
    sessions: await prisma.session.findMany(),
    participations: await prisma.participation.findMany(),
  }

  fs.mkdirSync('backup', { recursive: true })
  const name = `backup/backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  fs.writeFileSync(name, JSON.stringify(data, null, 2), 'utf-8')
  console.log('✅ Backup OK:', name)
}

main().finally(() => prisma.$disconnect())
