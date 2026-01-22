import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finance Manager',
    short_name: 'Finance',
    description: 'Manage your expenses, income, subscriptions, and wallets',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'productivity', 'utilities'],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View your financial overview',
        url: '/',
        icons: [{ src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      {
        name: 'Add Transaction',
        short_name: 'Add',
        description: 'Quickly add a new transaction',
        url: '/transactions',
        icons: [{ src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
    ],
  }
}
