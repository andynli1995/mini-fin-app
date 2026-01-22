import { Wallet } from '@prisma/client'
import Link from 'next/link'

interface WalletCardProps {
  wallet: Wallet
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <Link href={`/wallets/${wallet.id}`}>
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{wallet.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{wallet.type}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">
            {wallet.currency} {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </Link>
  )
}
