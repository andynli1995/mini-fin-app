'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface BalanceDisplayProps {
  label: string
  amount: number
  defaultHidden?: boolean
  className?: string
  textSize?: string
}

export default function BalanceDisplay({
  label,
  amount,
  defaultHidden = false,
  className = '',
  textSize = 'text-2xl sm:text-4xl',
}: BalanceDisplayProps) {
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

  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-4 sm:p-6 text-white ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-blue-100 text-sm font-medium">{label}</p>
        <button
          onClick={toggleVisibility}
          className="text-blue-100 hover:text-white transition-colors p-1"
          aria-label={isHidden ? 'Show balance' : 'Hide balance'}
        >
          {isHidden ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className={`${textSize} font-bold mt-2`}>
        {isHidden ? '••••••' : `$${formattedAmount}`}
      </p>
    </div>
  )
}
