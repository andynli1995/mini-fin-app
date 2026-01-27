import { NextResponse } from 'next/server'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

export async function GET() {
  const manifest: MetadataRoute.Manifest = {
    name: 'Solo Entrepreneur Toolkit',
    short_name: 'Toolkit',
    description: 'All-in-one platform to manage your business, finances, and productivity tools',
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
    categories: ['finance', 'productivity', 'utilities', 'business'],
    shortcuts: [
      {
        name: 'Tools Hub',
        short_name: 'Tools',
        description: 'View all available tools',
        url: '/',
        icons: [{ src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      {
        name: 'Finance Manager',
        short_name: 'Finance',
        description: 'Manage your finances',
        url: '/tools/finance',
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
