import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Simple hash function (in production, consider using bcrypt)
function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex')
}

export async function GET() {
  try {
    const settings = await prisma.appSettings.findFirst()
    
    return NextResponse.json({
      hasPin: !!settings?.pinHash,
      isLocked: settings?.isLocked || false,
      hideBalancesByDefault: settings?.hideBalancesByDefault || false,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { hideBalancesByDefault } = body

    let settings = await prisma.appSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: { hideBalancesByDefault: hideBalancesByDefault || false },
      })
    } else {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: { hideBalancesByDefault: hideBalancesByDefault || false },
      })
    }

    return NextResponse.json({ success: true, hideBalancesByDefault: settings.hideBalancesByDefault })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
