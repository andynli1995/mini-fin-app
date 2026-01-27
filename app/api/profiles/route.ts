import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { interviews: true, assessments: true },
        },
      },
    })
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const profile = await prisma.profile.create({
      data: { name: name.trim() },
    })
    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
