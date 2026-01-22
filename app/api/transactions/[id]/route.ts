import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { type, amount, date, note, categoryId, walletId } = body

    if (!type || !amount || !date || !categoryId || !walletId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get existing transaction
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Verify new wallet exists
    const newWallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    })

    if (!newWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    const newAmount = new Prisma.Decimal(amount)
    const walletChanged = existingTransaction.walletId !== walletId

    // Update transaction and recalculate balances
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update the transaction
      await tx.transaction.update({
        where: { id: params.id },
        data: {
          type,
          amount: newAmount,
          date: new Date(date),
          note: note || null,
          categoryId,
          walletId,
        },
      })

      // Recalculate balances for affected wallets
      // Balance = sum(income) - sum(expense) - sum(lend) - sum(rent)
      const walletsToUpdate = walletChanged 
        ? [existingTransaction.walletId, walletId]
        : [walletId]

      for (const wId of walletsToUpdate) {
        // Get all transactions for this wallet
        const transactions = await tx.transaction.findMany({
          where: { walletId: wId },
        })

        // Calculate balance from transactions: sum(income) - sum(expense) - sum(lend) - sum(rent)
        let balance = new Prisma.Decimal(0)
        for (const t of transactions) {
          const amt = new Prisma.Decimal(t.amount)
          if (t.type === 'income') {
            balance = balance.plus(amt)
          } else {
            balance = balance.minus(amt)
          }
        }

        await tx.wallet.update({
          where: { id: wId },
          data: { balance },
        })
      }

      return await tx.transaction.findUnique({
        where: { id: params.id },
        include: {
          category: true,
          wallet: true,
        },
      })
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const walletId = transaction.walletId

      // Delete transaction and recalculate wallet balance
      // Balance = sum(income) - sum(expense) - sum(lend) - sum(rent)
      await prisma.$transaction(async (tx) => {
        // Delete the transaction
        await tx.transaction.delete({
          where: { id: params.id },
        })

        // Recalculate balance from remaining transactions
        const transactions = await tx.transaction.findMany({
          where: { walletId },
        })

        let balance = new Prisma.Decimal(0)
        for (const t of transactions) {
          const amt = new Prisma.Decimal(t.amount)
          if (t.type === 'income') {
            balance = balance.plus(amt)
          } else {
            balance = balance.minus(amt)
          }
        }

        await tx.wallet.update({
          where: { id: walletId },
          data: { balance },
        })
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
