import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    let newBalance = transaction.wallet.balance
    if (transaction.type === 'income') {
      newBalance -= transaction.amount
    } else {
      newBalance += transaction.amount
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
