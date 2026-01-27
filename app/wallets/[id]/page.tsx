import { redirect } from 'next/navigation'

interface WalletDetailRedirectProps {
  params: {
    id: string
  }
}

export default function WalletDetailRedirect({ params }: WalletDetailRedirectProps) {
  redirect(`/tools/finance/wallets/${params.id}`)
}
