import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { addMonths, addWeeks, addDays, addYears } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { wallet: true },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (!subscription.walletId) {
      return NextResponse.json(
        { error: 'Subscription must have a wallet assigned' },
        { status: 400 }
      )
    }

    // Calculate next due date
    const currentDueDate = new Date(subscription.nextDueDate)
    let nextDueDate: Date
    switch (subscription.period) {
      case 'daily':
        nextDueDate = addDays(currentDueDate, 1)
        break
      case 'weekly':
        nextDueDate = addWeeks(currentDueDate, 1)
        break
      case 'monthly':
        nextDueDate = addMonths(currentDueDate, 1)
        break
      case 'yearly':
        nextDueDate = addYears(currentDueDate, 1)
        break
      default:
        nextDueDate = addMonths(currentDueDate, 1)
    }

    // Get or create expense category for subscriptions
    let category = await prisma.category.findFirst({
      where: {
        name: 'Subscription',
        type: 'expense',
      },
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Subscription',
          type: 'expense',
        },
      })
    }

    // Create transaction and update subscription
    // Marking subscription as paid creates an expense transaction
    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          type: 'expense',
          amount: subscription.amount,
          date: new Date(),
          note: `Subscription: ${subscription.serviceName}`,
          categoryId: category.id,
          walletId: subscription.walletId,
        },
      })

      // Recalculate wallet balance from all transactions
      // Balance = sum(income) - sum(expense) - sum(lend) - sum(rent)
      const transactions = await tx.transaction.findMany({
        where: { walletId: subscription.walletId },
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
        where: { id: subscription.walletId },
        data: { balance },
      })

      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { nextDueDate },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking subscription as paid:', error)
    return NextResponse.json(
      { error: 'Failed to mark subscription as paid' },
      { status: 500 }
    )
  }
}
