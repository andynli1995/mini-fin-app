import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { serviceName, amount, period, startDate, nextDueDate, paymentMethod, walletId, note, isActive } = body

    if (!serviceName || !amount) {
      return NextResponse.json(
        { error: 'Service name and amount are required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        serviceName,
        amount: parseFloat(amount),
        period: period || 'monthly',
        startDate: startDate ? new Date(startDate) : undefined,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        paymentMethod: paymentMethod || null,
        walletId: walletId || null,
        note: note || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subscription.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
