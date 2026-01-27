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

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: { deadline: 'asc' },
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('Error fetching assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      companyId,
      title,
      description,
      deadline,
      status,
      referenceLink,
      notes,
      reminderDays,
    } = body

    if (!companyId || !title || !deadline) {
      return NextResponse.json(
        { error: 'Company, title, and deadline are required' },
        { status: 400 }
      )
    }

    const assessment = await prisma.assessment.create({
      data: {
        companyId,
        title,
        description,
        deadline: new Date(deadline),
        status: status || 'pending',
        referenceLink,
        notes,
        reminderDays: reminderDays !== undefined ? reminderDays : null,
      },
      include: {
        company: true,
      },
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    )
  }
}
