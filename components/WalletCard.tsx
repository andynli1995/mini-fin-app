'use client'

import { useState, useEffect } from 'react'
import { Wallet } from '@prisma/client'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface WalletCardProps {
  wallet: Wallet
  defaultHidden?: boolean
}

export default function WalletCard({ wallet, defaultHidden = false }: WalletCardProps) {
  const [isHidden, setIsHidden] = useState(defaultHidden)

  useEffect(() => {
    // Check localStorage for user preference
    const stored = localStorage.getItem('hideBalances')
    if (stored !== null) {
      setIsHidden(stored === 'true')
    } else {
      setIsHidden(defaultHidden)
    }
  }, [defaultHidden])

  const toggleVisibility = () => {
    setIsHidden(!isHidden)
  }

  const formattedBalance = Number(wallet.balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Link href={`/wallets/${wallet.id}`}>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{wallet.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{wallet.type}</p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleVisibility()
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0 ml-2"
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
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {isHidden ? '••••••' : `${wallet.currency} ${formattedBalance}`}
          </p>
        </div>
      </div>
    </Link>
  )
}
