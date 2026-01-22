/**
 * Script to recalculate and fix wallet balances
 * 
 * Usage:
 *   node scripts/recalculate-balances.js [--fix]
 * 
 * Without --fix: Only shows discrepancies
 * With --fix: Actually fixes the balances
 */

const { PrismaClient, Prisma } = require('@prisma/client')
const prisma = new PrismaClient()

async function recalculateBalances(fix = false) {
  try {
    console.log('Fetching wallets and transactions...\n')
    
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

      const storedBalance = new Prisma.Decimal(wallet.balance)
      
      // Calculate initial balance: stored balance - net from transactions
      const estimatedInitialBalance = storedBalance.minus(calculatedFromTransactions)
      
      // Expected balance = initial balance + transactions (should match stored)
      const expectedBalance = estimatedInitialBalance.plus(calculatedFromTransactions)
      const difference = storedBalance.minus(expectedBalance)
      
      // Check if there's a discrepancy (more than 0.01 difference)
      const diffAbs = difference.abs()
      const hasDiscrepancy = diffAbs.greaterThan(new Prisma.Decimal('0.01'))
      
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

      const result = {
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
      }

      results.push(result)

      if (hasDiscrepancy) {
        const correctBalance = estimatedInitialBalance.plus(calculatedFromTransactions)
        
        updates.push({
          walletId: wallet.id,
          walletName: wallet.name,
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
          console.log(`✓ Fixed balance for "${wallet.name}": ${Number(storedBalance).toFixed(2)} → ${Number(correctBalance).toFixed(2)}`)
        }
      }
    }

    console.log('\n=== Balance Recalculation Report ===\n')
    
    for (const result of results) {
      console.log(`Wallet: ${result.walletName}`)
      console.log(`  Stored Balance: $${result.storedBalance.toFixed(2)}`)
      console.log(`  Net from Transactions: $${result.calculatedFromTransactions.toFixed(2)}`)
      console.log(`  Estimated Initial Balance: $${result.estimatedInitialBalance.toFixed(2)}`)
      console.log(`  Expected Balance: $${result.expectedBalance.toFixed(2)}`)
      console.log(`  Difference: $${result.difference.toFixed(2)}`)
      console.log(`  Transactions: ${result.transactionCount}`)
      console.log(`  Breakdown:`)
      console.log(`    Income: $${result.transactionTotals.income.toFixed(2)}`)
      console.log(`    Expense: $${result.transactionTotals.expense.toFixed(2)}`)
      console.log(`    Lend: $${result.transactionTotals.lend.toFixed(2)}`)
      console.log(`    Rent: $${result.transactionTotals.rent.toFixed(2)}`)
      console.log(`    Net: $${result.transactionTotals.net.toFixed(2)}`)
      console.log('')
    }

    if (updates.length > 0) {
      console.log(`\n⚠️  Found ${updates.length} wallet(s) with balance discrepancies:`)
      for (const update of updates) {
        console.log(`  - ${update.walletName}: $${update.storedBalance.toFixed(2)} → $${update.correctBalance.toFixed(2)} (diff: $${update.difference.toFixed(2)})`)
      }
      
      if (!fix) {
        console.log('\n💡 Run with --fix flag to automatically fix these balances:')
        console.log('   node scripts/recalculate-balances.js --fix')
      } else {
        console.log(`\n✅ Fixed ${updates.length} wallet balance(s)`)
      }
    } else {
      console.log('✅ All wallet balances are accurate!')
    }

  } catch (error) {
    console.error('Error recalculating balances:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const fix = process.argv.includes('--fix')

console.log(fix ? '🔧 Recalculating and FIXING balances...\n' : '📊 Recalculating balances (dry run)...\n')

recalculateBalances(fix)
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
