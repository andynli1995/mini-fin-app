import { NextResponse } from 'next/server'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export async function GET() {
  const manifest: MetadataRoute.Manifest = {
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
        src: '/icon-512.png',
        sizes: '512x512',
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

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
