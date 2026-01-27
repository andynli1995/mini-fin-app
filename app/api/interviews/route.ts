import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const companyId = searchParams.get('companyId')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (companyId) {
      where.companyId = companyId
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: { scheduledAt: 'desc' },
    })

    return NextResponse.json(interviews)
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    } = body

    if (!companyId || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      )
    }

    const interview = await prisma.interview.create({
      data: {
        companyId,
        role,
        status: status || 'applied',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        referenceLink,
        notes,
        interviewer,
        interviewType,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    )
  }
}
