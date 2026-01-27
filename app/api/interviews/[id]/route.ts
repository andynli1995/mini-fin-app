import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: {
        company: true,
      },
    })

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(interview)
  } catch (error) {
    console.error('Error fetching interview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interview' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      companyId,
      role,
      status,
      scheduledAt,
      referenceLink,
      notes,
      interviewer,
      interviewType,
      reminderDays,
      reminderHours,
    } = body

    const interview = await prisma.interview.update({
      where: { id: params.id },
      data: {
        companyId,
        role,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        referenceLink,
        notes,
        interviewer,
        interviewType,
        reminderDays: reminderDays !== undefined ? reminderDays : null,
        reminderHours: reminderHours !== undefined ? reminderHours : null,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(interview)
  } catch (error) {
    console.error('Error updating interview:', error)
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.interview.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting interview:', error)
    return NextResponse.json(
      { error: 'Failed to delete interview' },
      { status: 500 }
    )
  }
}
