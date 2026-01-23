import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, amount, date, note, categoryId, walletId, isReturn, relatedTransactionId, cleared } = body

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

    // If this is a return transaction, verify the related transaction exists and is a lend/rent
    if (isReturn && relatedTransactionId) {
      const relatedTransaction = await prisma.transaction.findUnique({
        where: { id: relatedTransactionId },
      })
      
      if (!relatedTransaction) {
        return NextResponse.json(
          { error: 'Related transaction not found' },
          { status: 404 }
        )
      }
      
      if (relatedTransaction.type !== 'lend' && relatedTransaction.type !== 'rent') {
        return NextResponse.json(
          { error: 'Return transactions can only be linked to lend or rent transactions' },
          { status: 400 }
        )
      }
      
      // Return transactions should be income type
      if (type !== 'income') {
        return NextResponse.json(
          { error: 'Return transactions must be of type income' },
          { status: 400 }
        )
      }
    }

    const amountDecimal = new Prisma.Decimal(amount)

    // Create transaction and recalculate wallet balance
    // Balance = sum(income) - sum(expense) - sum(lend) - sum(rent)
    const result = await prisma.$transaction(async (tx) => {
      // Create the new transaction
      const transaction = await tx.transaction.create({
        data: {
          type,
          amount: amountDecimal,
          date: new Date(date),
          note: note || null,
          categoryId,
          walletId,
          isReturn: isReturn || false,
          relatedTransactionId: relatedTransactionId || null,
          cleared: cleared || false,
        },
      })

      // If this is a return transaction, mark the related transaction as cleared
      if (isReturn && relatedTransactionId) {
        await tx.transaction.update({
          where: { id: relatedTransactionId },
          data: { cleared: true },
        })
      }

      // Recalculate balance from ALL transactions: sum(income) - sum(expense) - sum(lend) - sum(rent)
      const transactions = await tx.transaction.findMany({
        where: { walletId },
      })

      let balance = new Prisma.Decimal(0)
      for (const t of transactions) {
        const amt = new Prisma.Decimal(t.amount)
        if (t.type === 'income') {
          balance = balance.plus(amt)
        } else {
          // expense, lend, rent all subtract
          balance = balance.minus(amt)
        }
      }

      await tx.wallet.update({
        where: { id: walletId },
        data: { balance },
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
        relatedTransaction: {
          include: {
            category: true,
            wallet: true,
          },
        },
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
