// app/actions.ts
'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'


// Tính tiền mỗi người, làm tròn lên 1.000
function calcPerPersonFee(totalAmount: number, count: number) {
  if (count <= 0) return 0
  // return Math.ceil(totalAmount / count / 1000) * 1000
  return Math.floor(totalAmount / count)
}

/* ========= GROUP ========= */

export async function createGroupAction(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  if (!name) return

  await prisma.group.create({
    data: { name },
  })

  revalidatePath('/members')
}

export async function updateMemberGroupAction(formData: FormData) {
  const memberId = String(formData.get('memberId') || '')
  const groupId = String(formData.get('groupId') || '') || null

  if (!memberId) return

  await prisma.member.update({
    where: { id: memberId },
    data: { groupId },
  })

  revalidatePath('/members')
}

export async function updateMemberGroupsBulkAction(formData: FormData) {
  // Get all entries that start with "group_"
  const updates: { memberId: string; groupId: string | null }[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('group_')) {
      const memberId = key.replace('group_', '')
      const groupId = String(value || '') || null
      updates.push({ memberId, groupId })
    }
  }

  // Bulk update all members
  await prisma.$transaction(
    updates.map((u) =>
      prisma.member.update({
        where: { id: u.memberId },
        data: { groupId: u.groupId },
      })
    )
  )

  revalidatePath('/members')
}

/* ========= MEMBER ========= */

export async function createMemberAction(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  if (!name) return

  await prisma.member.create({
    data: { name },
  })

  revalidatePath('/')
  revalidatePath('/members')
}

export async function toggleMemberActiveAction(formData: FormData) {
  const id = String(formData.get('id') || '')
  const active = formData.get('active') === 'on'

  if (!id) return

  await prisma.member.update({
    where: { id },
    data: { active },
  })

  revalidatePath('/')
  revalidatePath('/members')
}

/* ========= SESSION ========= */

// Tạo buổi đánh mới
export async function createSessionAction(formData: FormData) {
  const dateStr = String(formData.get('date') || '')
  const hostId = String(formData.get('hostId') || '') || null

  const courtFee = Number(formData.get('courtFee') || 0)
  const shuttleFee = Number(formData.get('shuttleFee') || 0)
  const fundFee = Number(formData.get('fundFee') || 0)
//  lấy thêm địa chỉ sân
  const courtAddressRaw = String(formData.get('courtAddress') ?? '').trim()
  const courtAddress = courtAddressRaw || null  
  const date = dateStr ? new Date(dateStr) : new Date()

  // lấy thêm passcode (mã truy cập) nếu có
  const passcodeRaw = String(formData.get('passcode') ?? '').trim()
  const passcode = passcodeRaw ? passcodeRaw : undefined


  await prisma.session.create({
    data: {
      date,
      hostId: hostId || null,
      courtFee,
      shuttleFee,
      fundFee,
      courtAddress,
      passcode,
    },
  })

  revalidatePath('/')
  revalidatePath('/history')
}

// Thành viên join buổi
export async function joinSessionAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  const memberId = String(formData.get('memberId') || '')

  if (!sessionId || !memberId) return

  // tránh join trùng
  const exists = await prisma.participation.findFirst({
    where: {
      sessionId,
      memberId,
      isGuest: false,
    },
  })
  if (exists) return

  await prisma.participation.create({
    data: {
      sessionId,
      memberId,
      isGuest: false,
    },
  })

  revalidatePath('/')
  revalidatePath(`/sessions/${sessionId}`)
}

// Khách vãng lai join buổi
export async function joinGuestAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  const guestName = String(formData.get('guestName') || '').trim()

  if (!sessionId || !guestName) return

  await prisma.participation.create({
    data: {
      sessionId,
      guestName,
      isGuest: true,
    },
  })

  revalidatePath('/')
  revalidatePath(`/sessions/${sessionId}`)
}

// Xóa 1 người khỏi buổi (host dùng)
export async function leaveSessionAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  const participationId = String(formData.get('participationId') || '')

  if (!sessionId || !participationId) return

  await prisma.participation.delete({
    where: { id: participationId },
  })

  revalidatePath('/')
  revalidatePath(`/sessions/${sessionId}`)
}

// Host bấm "Tính tiền"
export async function calculateFeeAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  if (!sessionId) return

  const totalAmount = Number(formData.get('totalAmount') || 0)
  const qrContent = String(formData.get('qrContent') || '')
  const qrBankId = String(formData.get('qrBankId') || '')
  const qrAccountNo = String(formData.get('qrAccountNo') || '')

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { participations: true },
  })

  if (!session) return
  const count = session.participations.length
  if (count === 0) return

  const perFee = calcPerPersonFee(totalAmount, count)

  await prisma.$transaction([
    prisma.participation.updateMany({
      where: { sessionId },
      data: { customFee: perFee },
    }),
    prisma.session.update({
      where: { id: sessionId },
      data: {
        totalAmount,
        qrContent,
        qrBankId,
        qrAccountNo,
      },
    }),
  ])

  revalidatePath('/')
  revalidatePath(`/sessions/${sessionId}`)
}

// Tick "đã đóng"
export async function togglePaidAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  const participationId = String(formData.get('participationId') || '')
  const paid = formData.get('paid') === 'on'

  if (!sessionId || !participationId) return

  await prisma.participation.update({
    where: { id: participationId },
    data: { paid },
  })

  revalidatePath('/')
  revalidatePath(`/sessions/${sessionId}`)
}

// Hoàn thành buổi đánh
export async function completeSessionAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  if (!sessionId) return

  await prisma.$transaction([
    prisma.participation.updateMany({
      where: { sessionId },
      data: { paid: true },
    }),
    prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    }),
  ])
  
  // await prisma.session.update({
  //   where: { id: sessionId },
  //   data: {
  //     status: 'COMPLETED',
  //     completedAt: new Date(),
  //   },
  // })

  revalidatePath('/')
  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/history')
}

// Hủy buổi đánh
export async function cancelSessionAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  const note = String(formData.get('note') || '')

  if (!sessionId) return

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: 'CANCELED',
      note,
    },
  })

  revalidatePath('/')
  revalidatePath(`/sessions/${sessionId}`)
  revalidatePath('/history')
}

// Cập nhật thông tin buổi đánh
export async function updateSessionAction(formData: FormData) {
  const sessionId = String(formData.get('sessionId') || '')
  if (!sessionId) throw new Error('Missing sessionId')

  const dateStr = String(formData.get('date') || '')
  const hostIdRaw = String(formData.get('hostId') || '')
  const courtAddress = String(formData.get('courtAddress') || '')
  const note = String(formData.get('note') || '')

  const courtFee = Number(formData.get('courtFee') || 0)
  const shuttleFee = Number(formData.get('shuttleFee') || 0)
  const fundFee = Number(formData.get('fundFee') || 0)

  // ✅ tổng tiền tự tính từ 3 phí
  const totalAmount = courtFee + shuttleFee + fundFee

  await prisma.session.update({
    where: { id: sessionId },
    data: {
      date: dateStr ? new Date(dateStr) : undefined,
      hostId: hostIdRaw ? hostIdRaw : null,
      courtAddress: courtAddress || null,
      note: note || null,
      courtFee,
      shuttleFee,
      fundFee,
      totalAmount, // ✅ update luôn
    },
  })

// revalidatePath(`/sessions/${sessionId}`)
// revalidatePath(`/sessions`)
revalidatePath(`/`)
revalidatePath('/history') // ✅ thêm
if (sessionId) {
  revalidatePath(`/sessions/${sessionId}`)
  redirect(`/sessions/${sessionId}?saved=1`)
}
// ✅ bắt Next “tải lại” trang hiện tại ngay
// redirect(`/sessions/${sessionId}?saved=1`)

}

export async function verifySessionPasscodeAction(formData: FormData) {
  // Lấy sessionId và passcode từ form
  const sessionId = String(formData.get('sessionId') || '')
  const passcode = String(formData.get('passcode') || '').trim()

  // Lấy passcode của buổi từ database
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { passcode: true },
  })

  const real = (session?.passcode ?? '').trim()

  // Buổi không có passcode => cho vào luôn và set cookie truy cập
  if (!real) {
    const cookieStore = await cookies()
    cookieStore.set(`session_access_${sessionId}`, '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    redirect(`/sessions/${sessionId}`)
  }

  // Buổi có passcode => kiểm tra passcode nhập vào
  if (!passcode || passcode !== real) {
    redirect(`/sessions/${sessionId}?err=1`)
  }

  // Passcode đúng => set cookie truy cập
  const cookieStore = await cookies()
  cookieStore.set(`session_access_${sessionId}`, '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // maxAge: 60 * 60 * 24 * 30,
  })

  redirect(`/sessions/${sessionId}`)
}

/* ========= NEW GROUP & MEMBER ACTIONS ========= */

export async function deleteGroupAction(formData: FormData) {
  const groupId = formData.get('groupId') as string
  
  await prisma.group.delete({
    where: { id: groupId },
  })
  
  revalidatePath('/members')
  redirect('/members')
}

export async function updateGroupAction(formData: FormData) {
  const groupId = formData.get('groupId') as string
  const name = formData.get('name') as string
  
  await prisma.group.update({
    where: { id: groupId },
    data: { name },
  })
  
  revalidatePath('/members')
}

export async function deleteMemberAction(formData: FormData) {
  const memberId = formData.get('memberId') as string
  
  await prisma.member.delete({
    where: { id: memberId },
  })
  
  revalidatePath('/members')
}

export async function updateMemberAction(formData: FormData) {
  const memberId = formData.get('memberId') as string
  const name = formData.get('name') as string
  const active = formData.get('active') === 'true'
  
  await prisma.member.update({
    where: { id: memberId },
    data: { name, active },
  })
  
  revalidatePath('/members')
}
