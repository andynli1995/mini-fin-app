'use client'

import { Briefcase, Calendar, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Stats {
  totalCompanies: number
  totalInterviews: number
  totalAssessments: number
  activeInterviews: number
  pendingAssessments: number
  upcomingInterviewsCount: number
  upcomingAssessmentsCount: number
  overdueAssessmentsCount: number
}

interface InterviewStatsProps {
  stats: Stats
}

export default function InterviewStats({ stats }: InterviewStatsProps) {
  const statCards = [
    {
      label: 'Total Companies',
      value: stats.totalCompanies,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Total Interviews',
      value: stats.totalInterviews,
      icon: Calendar,
      color: 'purple',
    },
    {
      label: 'Active Interviews',
      value: stats.activeInterviews,
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Pending Assessments',
      value: stats.pendingAssessments,
      icon: FileText,
      color: 'orange',
    },
    {
      label: 'Upcoming (7 days)',
      value: stats.upcomingInterviewsCount + stats.upcomingAssessmentsCount,
      icon: Clock,
      color: 'yellow',
    },
    {
      label: 'Overdue',
      value: stats.overdueAssessmentsCount,
      icon: AlertCircle,
      color: 'red',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  }

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const colorClass = colorClasses[stat.color as keyof typeof colorClasses]
        const iconColorClass = iconColorClasses[stat.color as keyof typeof iconColorClasses]

        return (
          <div
            key={stat.label}
            className={`rounded-lg border p-4 ${colorClass}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${iconColorClass}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs mt-1 opacity-80">{stat.label}</div>
          </div>
        )
      })}
    </div>
  )
}
