import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { updateWalletBalance } from '@/lib/balance-utils'

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

    // Verify wallet exists
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    })

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    const amountDecimal = new Prisma.Decimal(amount)

    // Create transaction and recalculate wallet balance
    const result = await prisma.$transaction(async (tx) => {
      // Get current wallet and existing transactions BEFORE creating the new transaction
      const currentWallet = await tx.wallet.findUnique({
        where: { id: walletId },
      })
      
      const existingTransactions = await tx.transaction.findMany({
        where: { walletId },
      })

      // Calculate net from existing transactions (before the new one)
      let netFromExisting = new Prisma.Decimal(0)
      for (const t of existingTransactions) {
        const amt = new Prisma.Decimal(t.amount)
        if (t.type === 'income') {
          netFromExisting = netFromExisting.plus(amt)
        } else {
          netFromExisting = netFromExisting.minus(amt)
        }
      }

      // Calculate initial balance: stored balance - net from existing transactions
      const storedBalance = new Prisma.Decimal(currentWallet!.balance)
      const initialBalance = storedBalance.minus(netFromExisting)

      // Now create the new transaction
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount: amountDecimal,
          date: new Date(date),
          note: note || null,
          categoryId,
          walletId,
        },
      })

      // Calculate net from ALL transactions (including the new one)
      const newTransactionNet = type === 'income' 
        ? amountDecimal 
        : amountDecimal.neg() // Negate for expense/lend/rent
      
      const netFromAll = netFromExisting.plus(newTransactionNet)

      // New balance = initial balance + net from all transactions
      const newBalance = initialBalance.plus(netFromAll)

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      })

      return transaction
    })

    return NextResponse.json(result, { status: 201 })
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
