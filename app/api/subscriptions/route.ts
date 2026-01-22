import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceName, amount, period, startDate, nextDueDate, paymentMethod, walletId, note } = body

    if (!serviceName || !amount || !period || !startDate || !nextDueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        serviceName,
        amount: new Prisma.Decimal(amount),
        period,
        startDate: new Date(startDate),
        nextDueDate: new Date(nextDueDate),
        paymentMethod: paymentMethod || null,
        walletId: walletId || null,
        note: note || null,
      },
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { nextDueDate: 'asc' },
      include: {
        wallet: true,
      },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}
