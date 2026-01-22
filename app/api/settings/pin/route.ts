import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Simple hash function (in production, consider using bcrypt)
function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin } = body

    if (!pin || pin.length < 4) {
      return NextResponse.json(
        { error: 'PIN must be at least 4 digits' },
        { status: 400 }
      )
    }

    const pinHash = hashPin(pin)

    // Get or create settings
    let settings = await prisma.appSettings.findFirst()
    
    if (settings) {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: { pinHash },
      })
    } else {
      settings = await prisma.appSettings.create({
        data: { pinHash, isLocked: false },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting PIN:', error)
    return NextResponse.json(
      { error: 'Failed to set PIN' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const settings = await prisma.appSettings.findFirst()
    
    return NextResponse.json({
      hasPin: !!settings?.pinHash,
      isLocked: settings?.isLocked || false,
    })
  } catch (error) {
    console.error('Error fetching PIN status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PIN status' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { pin, isLocked, newPin } = body

    let settings = await prisma.appSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json(
        { error: 'PIN not set. Please set PIN first.' },
        { status: 400 }
      )
    }

    // If updating PIN, verify old PIN first
    if (newPin) {
      if (!pin) {
        return NextResponse.json(
          { error: 'Current PIN is required to update PIN' },
          { status: 400 }
        )
      }
      const pinHash = hashPin(pin)
      if (settings.pinHash !== pinHash) {
        return NextResponse.json(
          { error: 'Incorrect current PIN' },
          { status: 401 }
        )
      }
      // Update to new PIN
      const newPinHash = hashPin(newPin)
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: { pinHash: newPinHash },
      })
      return NextResponse.json({ success: true, message: 'PIN updated successfully' })
    }

    // Verify PIN if provided (for unlock)
    if (pin && !newPin) {
      const pinHash = hashPin(pin)
      if (settings.pinHash !== pinHash) {
        return NextResponse.json(
          { error: 'Incorrect PIN' },
          { status: 401 }
        )
      }
    }

    // Update lock status
    if (typeof isLocked === 'boolean') {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: { isLocked },
      })
    }

    return NextResponse.json({ success: true, isLocked: settings.isLocked })
  } catch (error) {
    console.error('Error updating lock status:', error)
    return NextResponse.json(
      { error: 'Failed to update lock status' },
      { status: 500 }
    )
  }
}
