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
      include: { wallet: true },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Get new wallet if changed
    const newWallet = await prisma.wallet.findUnique({
      where: { id: walletId },
    })

    if (!newWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 })
    }

    // Calculate balance adjustments
    const oldAmount = new Prisma.Decimal(existingTransaction.amount)
    const newAmount = new Prisma.Decimal(amount)
    const oldWalletBalance = new Prisma.Decimal(existingTransaction.wallet.balance)
    const newWalletBalance = new Prisma.Decimal(newWallet.balance)

    // Reverse old transaction effect on the original wallet
    // If it was income, we subtract it back; if it was expense/lend/rent, we add it back
    let oldWalletNewBalance: Prisma.Decimal
    if (existingTransaction.type === 'income') {
      oldWalletNewBalance = oldWalletBalance.minus(oldAmount)
    } else {
      // Reverse expense/lend/rent by adding the amount back
      oldWalletNewBalance = oldWalletBalance.plus(oldAmount)
    }

    // Apply new transaction effect on the target wallet
    // Income adds to balance; expense/lend/rent subtracts from balance
    let finalNewWalletBalance: Prisma.Decimal
    if (type === 'income') {
      finalNewWalletBalance = newWalletBalance.plus(newAmount)
    } else {
      // All other types (expense, lend, rent) reduce the wallet balance
      finalNewWalletBalance = newWalletBalance.minus(newAmount)
    }

    // Update transaction and wallet balances
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: params.id },
        data: {
          type,
          amount: newAmount,
          date: new Date(date),
          note: note || null,
          categoryId,
          walletId,
        },
      }),
      prisma.wallet.update({
        where: { id: existingTransaction.walletId },
        data: { balance: oldWalletNewBalance },
      }),
      prisma.wallet.update({
        where: { id: walletId },
        data: { balance: finalNewWalletBalance },
      }),
    ])

    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        wallet: true,
      },
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
      include: { wallet: true },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Calculate new balance (reverse the transaction effect)
    // If it was income, subtract it; if it was expense/lend/rent, add it back
    const currentBalance = new Prisma.Decimal(transaction.wallet.balance)
    const amountDecimal = new Prisma.Decimal(transaction.amount)
    let newBalance: Prisma.Decimal
    if (transaction.type === 'income') {
      // Reverse income by subtracting
      newBalance = currentBalance.minus(amountDecimal)
    } else {
      // Reverse expense/lend/rent by adding back
      newBalance = currentBalance.plus(amountDecimal)
    }

    // Delete transaction and update wallet balance
    await prisma.$transaction([
      prisma.transaction.delete({
        where: { id: params.id },
      }),
      prisma.wallet.update({
        where: { id: transaction.walletId },
        data: { balance: newBalance },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
