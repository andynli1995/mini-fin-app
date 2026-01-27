import { prisma } from '@/lib/prisma'
import { differenceInDays, format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import InterviewActivityChart from './InterviewActivityChart'
import AssessmentActivityChart from './AssessmentActivityChart'
import UpcomingInterviews from './UpcomingInterviews'
import UpcomingAssessments from './UpcomingAssessments'
import InterviewStats from './InterviewStats'

export default async function InterviewDashboard() {
  try {
    const now = new Date()
    const sixMonthsAgo = subMonths(now, 6)

    // Parallelize all queries for performance
    const [
      companies,
      interviews,
      assessments,
      upcomingInterviews,
      upcomingAssessments,
      overdueAssessments,
    ] = await Promise.all([
      prisma.company.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.interview.findMany({
        include: {
          company: true,
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.assessment.findMany({
        include: {
          company: true,
        },
        orderBy: { deadline: 'asc' },
      }),
      prisma.interview.findMany({
        where: {
          scheduledAt: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: {
            notIn: ['rejected', 'withdrawn', 'offer'],
          },
        },
        include: {
          company: true,
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.assessment.findMany({
        where: {
          deadline: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: {
            notIn: ['completed', 'submitted', 'expired'],
          },
        },
        include: {
          company: true,
        },
        orderBy: { deadline: 'asc' },
        take: 5,
      }),
      prisma.assessment.findMany({
        where: {
          deadline: {
            lt: now,
          },
          status: {
            notIn: ['completed', 'submitted'],
          },
        },
        include: {
          company: true,
        },
        orderBy: { deadline: 'asc' },
      }),
    ])

    // Calculate statistics
    const stats = {
      totalCompanies: companies.length,
      totalInterviews: interviews.length,
      totalAssessments: assessments.length,
      activeInterviews: interviews.filter(
        (i) => !['rejected', 'withdrawn', 'offer'].includes(i.status)
      ).length,
      pendingAssessments: assessments.filter(
        (a) => !['completed', 'submitted', 'expired'].includes(a.status)
      ).length,
      upcomingInterviewsCount: upcomingInterviews.length,
      upcomingAssessmentsCount: upcomingAssessments.length,
      overdueAssessmentsCount: overdueAssessments.length,
    }

    // Status distribution
    const interviewStatusCounts = interviews.reduce((acc, interview) => {
      acc[interview.status] = (acc[interview.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const assessmentStatusCounts = assessments.reduce((acc, assessment) => {
      acc[assessment.status] = (acc[assessment.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Interview Manager
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track your job applications, interviews, and assessments
          </p>
        </div>

        {/* Statistics Cards */}
        <InterviewStats stats={stats} />

        {/* Activity Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InterviewActivityChart
            interviews={interviews}
            sixMonthsAgo={sixMonthsAgo}
            now={now}
            statusCounts={interviewStatusCounts}
          />
          <AssessmentActivityChart
            assessments={assessments}
            sixMonthsAgo={sixMonthsAgo}
            now={now}
            statusCounts={assessmentStatusCounts}
          />
        </div>

        {/* Upcoming Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingInterviews
            interviews={upcomingInterviews}
            overdueCount={0}
          />
          <UpcomingAssessments
            assessments={upcomingAssessments}
            overdueAssessments={overdueAssessments}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Database error:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Interview Manager
          </h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400">
            Unable to load interview data. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}
