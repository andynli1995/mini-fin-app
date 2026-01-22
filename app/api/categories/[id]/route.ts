import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: params.id },
    })

    if (transactionCount > 0) {
      // Delete all transactions first (cascade)
      await prisma.transaction.deleteMany({
        where: { categoryId: params.id },
      })
    }

    // Delete category
    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
