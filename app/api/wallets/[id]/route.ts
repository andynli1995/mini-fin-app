import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, type, currency, balance } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const wallet = await prisma.wallet.update({
      where: { id: params.id },
      data: {
        name,
        type,
        currency: currency || 'USD',
        balance: balance ? parseFloat(balance) : undefined,
      },
    })

    return NextResponse.json(wallet)
  } catch (error) {
    console.error('Error updating wallet:', error)
    return NextResponse.json(
      { error: 'Failed to update wallet' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if wallet has transactions
    const transactionCount = await prisma.transaction.count({
      where: { walletId: params.id },
    })

    if (transactionCount > 0) {
      // Delete all transactions first (cascade)
      await prisma.transaction.deleteMany({
        where: { walletId: params.id },
      })
    }

    // Delete wallet
    await prisma.wallet.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wallet:', error)
    return NextResponse.json(
      { error: 'Failed to delete wallet' },
      { status: 500 }
    )
  }
}
