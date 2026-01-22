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
      lockTimeoutMinutes: settings?.lockTimeoutMinutes || 5,
      enableNotifications: settings?.enableNotifications ?? true,
      reminderDays: settings?.reminderDays || 7,
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
    const { hideBalancesByDefault, lockTimeoutMinutes, enableNotifications, reminderDays } = body

    let settings = await prisma.appSettings.findFirst()
    
    const updateData: any = {}
    if (typeof hideBalancesByDefault === 'boolean') {
      updateData.hideBalancesByDefault = hideBalancesByDefault
    }
    if (typeof lockTimeoutMinutes === 'number' && lockTimeoutMinutes > 0) {
      updateData.lockTimeoutMinutes = lockTimeoutMinutes
    }
    if (typeof enableNotifications === 'boolean') {
      updateData.enableNotifications = enableNotifications
    }
    if (typeof reminderDays === 'number' && reminderDays > 0 && reminderDays <= 30) {
      updateData.reminderDays = reminderDays
    }
    
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          hideBalancesByDefault: hideBalancesByDefault || false,
          lockTimeoutMinutes: lockTimeoutMinutes || 5,
          enableNotifications: enableNotifications ?? true,
          reminderDays: reminderDays || 7,
        },
      })
    } else {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: updateData,
      })
    }

    return NextResponse.json({ 
      success: true, 
      hideBalancesByDefault: settings.hideBalancesByDefault,
      lockTimeoutMinutes: settings.lockTimeoutMinutes,
      enableNotifications: settings.enableNotifications,
      reminderDays: settings.reminderDays,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
