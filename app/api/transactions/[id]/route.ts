import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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

    // Calculate new balance (reverse the transaction)
    const currentBalance = new Prisma.Decimal(transaction.wallet.balance)
    const amountDecimal = new Prisma.Decimal(transaction.amount)
    let newBalance: Prisma.Decimal
    if (transaction.type === 'income') {
      newBalance = currentBalance.minus(amountDecimal)
    } else {
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
