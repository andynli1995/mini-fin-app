'use client'

import { useState, useEffect } from 'react'
import { Wallet } from '@prisma/client'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface WalletWithNumber extends Omit<Wallet, 'balance'> {
  balance: number
}

interface WalletCardProps {
  wallet: WalletWithNumber
  defaultHidden?: boolean
}

export default function WalletCard({ wallet, defaultHidden = false }: WalletCardProps) {
  const [isHidden, setIsHidden] = useState(() => {
    // Initialize from localStorage if available, otherwise use defaultHidden
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hideBalances')
      if (stored !== null) {
        return stored === 'true'
      }
    }
    return defaultHidden
  })

  useEffect(() => {
    // When defaultHidden changes (e.g., setting is updated), update to match
    // This ensures the dashboard respects the "hide balances by default" setting
    if (defaultHidden !== undefined) {
      setIsHidden(defaultHidden)
      localStorage.setItem('hideBalances', defaultHidden ? 'true' : 'false')
    }
  }, [defaultHidden])

  const toggleVisibility = () => {
    const newHidden = !isHidden
    setIsHidden(newHidden)
    // Save user's manual toggle preference
    localStorage.setItem('hideBalances', newHidden ? 'true' : 'false')
  }

  const formattedBalance = Number(wallet.balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Link href={`/tools/finance/wallets/${wallet.id}`}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 sm:p-6 hover:shadow-md dark:hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-slate-700">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{wallet.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{wallet.type}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleVisibility()
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 flex-shrink-0 ml-2"
            aria-label={isHidden ? 'Show balance' : 'Hide balance'}
          >
            {isHidden ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isHidden ? '••••••' : `${wallet.currency} ${formattedBalance}`}
          </p>
        </div>
      </div>
    </Link>
  )
}
