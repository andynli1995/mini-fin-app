import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Recalculates wallet balance from all transactions
 * Balance = sum(income) - sum(expense) - sum(lend) - sum(rent)
 */
export async function recalculateWalletBalance(walletId: string): Promise<Prisma.Decimal> {
  const transactions = await prisma.transaction.findMany({
    where: { walletId },
  })

  let balance = new Prisma.Decimal(0)

  for (const transaction of transactions) {
    const amount = new Prisma.Decimal(transaction.amount)
    if (transaction.type === 'income') {
      balance = balance.plus(amount)
    } else {
      // expense, lend, rent all subtract from balance
      balance = balance.minus(amount)
    }
  }

  return balance
}

/**
 * Recalculates and updates wallet balance from all transactions
 */
export async function updateWalletBalance(walletId: string): Promise<Prisma.Decimal> {
  const newBalance = await recalculateWalletBalance(walletId)
  
  await prisma.wallet.update({
    where: { id: walletId },
    data: { balance: newBalance },
  })

  return newBalance
}
