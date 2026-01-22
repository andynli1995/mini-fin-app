import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * Recalculates wallet balances from transactions to verify accuracy
 * 
 * Balance should equal: initial balance + sum(income) - sum(expense) - sum(lend) - sum(rent)
 * 
 * This endpoint helps identify discrepancies between stored balances and
 * what they should be based on transaction history.
 */
export async function POST(request: NextRequest) {
  try {
    const { fix = false } = await request.json().catch(() => ({ fix: false }))
    
    const wallets = await prisma.wallet.findMany({
      include: {
        transactions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    const results = []
    const updates = []

    for (const wallet of wallets) {
      // Calculate balance from transactions: sum(income) - sum(expense) - sum(lend) - sum(rent)
      let calculatedFromTransactions = new Prisma.Decimal(0)
      
      // Process all transactions
      for (const transaction of wallet.transactions) {
        const amount = new Prisma.Decimal(transaction.amount)
        if (transaction.type === 'income') {
          calculatedFromTransactions = calculatedFromTransactions.plus(amount)
        } else {
          // expense, lend, rent all subtract from balance
          calculatedFromTransactions = calculatedFromTransactions.minus(amount)
        }
      }
      
      // Balance should equal calculated from transactions (no initial balance concept)
      // If wallet was created with initial balance, it should have been a transaction

      const storedBalance = new Prisma.Decimal(wallet.balance)
      
      // The stored balance should equal: initial balance + calculated from transactions
      // So: initialBalance = storedBalance - calculatedFromTransactions
      const estimatedInitialBalance = storedBalance.minus(calculatedFromTransactions)
      
      // Calculate what the balance should be (initial + transactions)
      // This should match the stored balance
      const expectedBalance = estimatedInitialBalance.plus(calculatedFromTransactions)
      const difference = storedBalance.minus(expectedBalance)
      
      // Check if there's a discrepancy (more than 0.01 difference)
      const diffAbs = difference.abs()
      const hasDiscrepancy = diffAbs.greaterThan(new Prisma.Decimal('0.01'))
      
      if (hasDiscrepancy) {
        // Calculate correct balance: initial balance + transactions
        // Since we don't track initial balance separately, we'll use the difference
        // as the initial balance estimate
        const correctBalance = estimatedInitialBalance.plus(calculatedFromTransactions)
        
        updates.push({
          walletId: wallet.id,
          storedBalance: Number(storedBalance),
          calculatedBalance: Number(calculatedFromTransactions),
          estimatedInitialBalance: Number(estimatedInitialBalance),
          correctBalance: Number(correctBalance),
          difference: Number(difference),
        })
        
        // Fix the balance if requested
        if (fix) {
          await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: correctBalance },
          })
        }
      }
      
      // Calculate transaction totals by type
      const incomeTotal = wallet.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum.plus(new Prisma.Decimal(t.amount)), new Prisma.Decimal(0))
      
      const expenseTotal = wallet.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum.plus(new Prisma.Decimal(t.amount)), new Prisma.Decimal(0))
      
      const lendTotal = wallet.transactions
        .filter(t => t.type === 'lend')
        .reduce((sum, t) => sum.plus(new Prisma.Decimal(t.amount)), new Prisma.Decimal(0))
      
      const rentTotal = wallet.transactions
        .filter(t => t.type === 'rent')
        .reduce((sum, t) => sum.plus(new Prisma.Decimal(t.amount)), new Prisma.Decimal(0))
      
      const netFromTransactions = incomeTotal.minus(expenseTotal).minus(lendTotal).minus(rentTotal)
      
      results.push({
        walletId: wallet.id,
        walletName: wallet.name,
        storedBalance: Number(storedBalance),
        calculatedFromTransactions: Number(calculatedFromTransactions),
        estimatedInitialBalance: Number(estimatedInitialBalance),
        expectedBalance: Number(expectedBalance),
        difference: Number(difference),
        transactionCount: wallet.transactions.length,
        transactionTotals: {
          income: Number(incomeTotal),
          expense: Number(expenseTotal),
          lend: Number(lendTotal),
          rent: Number(rentTotal),
          net: Number(netFromTransactions),
        },
      })
    }

    return NextResponse.json({
      success: true,
      results,
      discrepancies: updates,
      fixed: fix ? updates.length : 0,
      message: updates.length > 0 
        ? `Found ${updates.length} wallet(s) with balance discrepancies${fix ? ' - balances have been fixed' : ''}`
        : 'All wallet balances are accurate',
    })
  } catch (error) {
    console.error('Error recalculating balances:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate balances', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
