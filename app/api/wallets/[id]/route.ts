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

    // Note: Balance can be manually updated here, but this should be used carefully.
    // The balance is normally maintained automatically by transaction operations.
    // Manual balance changes can cause inconsistencies if they don't match the sum of transactions.
    const updateData: any = {
      name,
      type,
      currency: currency || 'USD',
    }
    
    // Only update balance if explicitly provided
    if (balance !== undefined) {
      updateData.balance = parseFloat(balance)
    }

    const wallet = await prisma.wallet.update({
      where: { id: params.id },
      data: updateData,
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
