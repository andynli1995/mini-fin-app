import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, date, note, categoryId, walletId } = body

    // Validate required fields
    if (!type || !amount || !date || !categoryId || !walletId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get wallet to update balance
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Calculate new balance
    let newBalance = wallet.balance
    if (type === 'income') {
      newBalance += amount
    } else {
      newBalance -= amount
    }

    // Create transaction and update wallet balance in a transaction
    const result = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          type,
          amount,
          date: new Date(date),
          note: note || null,
          categoryId,
          walletId,
        },
      }),
      prisma.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      }),
    ])

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const walletId = searchParams.get('walletId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (type) where.type = type
    if (categoryId) where.categoryId = categoryId
    if (walletId) where.walletId = walletId
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        wallet: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
