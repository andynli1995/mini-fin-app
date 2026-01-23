import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { cleared } = body

    if (typeof cleared !== 'boolean') {
      return NextResponse.json(
        { error: 'cleared must be a boolean' },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: { cleared },
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

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction cleared status:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction cleared status' },
      { status: 500 }
    )
  }
}
