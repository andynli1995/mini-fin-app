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
      const walletsToUpdate = walletChanged 
        ? [existingTransaction.walletId, walletId]
        : [walletId]

      for (const wId of walletsToUpdate) {
        const wallet = await tx.wallet.findUnique({
          where: { id: wId },
        })

        // Get all transactions for this wallet
        const transactions = await tx.transaction.findMany({
          where: { walletId: wId },
        })

        // Calculate net from transactions
        let netFromTransactions = new Prisma.Decimal(0)
        for (const t of transactions) {
          const amt = new Prisma.Decimal(t.amount)
          if (t.type === 'income') {
            netFromTransactions = netFromTransactions.plus(amt)
          } else {
            netFromTransactions = netFromTransactions.minus(amt)
          }
        }

        // Calculate initial balance: stored balance - net from transactions
        // This preserves the initial balance that was set when wallet was created
        const storedBalance = new Prisma.Decimal(wallet!.balance)
        const initialBalance = storedBalance.minus(netFromTransactions)
        
        // New balance = initial balance + net from all transactions
        const newBalance = initialBalance.plus(netFromTransactions)

        await tx.wallet.update({
          where: { id: wId },
          data: { balance: newBalance },
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
      await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { id: walletId },
        })

        // Get all transactions BEFORE deletion (to calculate initial balance)
        const transactionsBefore = await tx.transaction.findMany({
          where: { walletId },
        })

        // Calculate net from transactions before deletion
        let netBefore = new Prisma.Decimal(0)
        for (const t of transactionsBefore) {
          const amt = new Prisma.Decimal(t.amount)
          if (t.type === 'income') {
            netBefore = netBefore.plus(amt)
          } else {
            netBefore = netBefore.minus(amt)
          }
        }

        // Calculate initial balance
        const storedBalance = new Prisma.Decimal(wallet!.balance)
        const initialBalance = storedBalance.minus(netBefore)

        // Delete the transaction
        await tx.transaction.delete({
          where: { id: params.id },
        })

        // Get remaining transactions after deletion
        const transactionsAfter = await tx.transaction.findMany({
          where: { walletId },
        })

        // Calculate net from remaining transactions
        let netAfter = new Prisma.Decimal(0)
        for (const t of transactionsAfter) {
          const amt = new Prisma.Decimal(t.amount)
          if (t.type === 'income') {
            netAfter = netAfter.plus(amt)
          } else {
            netAfter = netAfter.minus(amt)
          }
        }

        // New balance = initial balance + net from remaining transactions
        const newBalance = initialBalance.plus(netAfter)

        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: newBalance },
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
