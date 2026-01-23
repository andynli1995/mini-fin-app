import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
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
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { type, amount, date, note, categoryId, walletId, cleared, isReturn, relatedTransactionId } = body

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

    // Update transaction and recalculate wallet balances
    // When a transaction is updated, we must recalculate the balance for affected wallets
    // Balance = sum(income) - sum(expense) - sum(lend) - sum(rent)
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Step 1: Update the transaction
      await tx.transaction.update({
        where: { id: params.id },
        data: {
          type,
          amount: newAmount,
          date: new Date(date),
          note: note || null,
          categoryId,
          walletId,
          cleared: cleared !== undefined ? cleared : existingTransaction.cleared,
          isReturn: isReturn !== undefined ? isReturn : existingTransaction.isReturn,
          relatedTransactionId: relatedTransactionId !== undefined ? relatedTransactionId : existingTransaction.relatedTransactionId,
        },
      })

      // Step 2: Determine which wallets need balance recalculation
      // If wallet changed, we need to update both old and new wallet
      // If same wallet, we only need to update that wallet
      const walletsToUpdate = walletChanged 
        ? [existingTransaction.walletId, walletId]
        : [walletId]

      // Step 3: Recalculate and update balance for each affected wallet
      for (const wId of walletsToUpdate) {
        // Get all transactions for this wallet (after the update)
        const transactions = await tx.transaction.findMany({
          where: { walletId: wId },
        })

        // Recalculate balance from all transactions: sum(income) - sum(expense) - sum(lend) - sum(rent)
        let balance = new Prisma.Decimal(0)
        for (const t of transactions) {
          const amt = new Prisma.Decimal(t.amount)
          if (t.type === 'income') {
            balance = balance.plus(amt)
          } else {
            // expense, lend, rent all subtract from balance
            balance = balance.minus(amt)
          }
        }

        // Update wallet balance with recalculated value
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
          relatedTransaction: {
            include: {
              category: true,
              wallet: true,
            },
          },
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
