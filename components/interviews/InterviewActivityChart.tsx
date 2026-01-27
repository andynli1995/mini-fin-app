'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, eachMonthOfInterval, startOfMonth } from 'date-fns'

interface Interview {
  id: string
  scheduledAt: string | Date | null
  status: string
  company: {
    name: string
  }
}

interface InterviewActivityChartProps {
  interviews: Interview[]
  sixMonthsAgo: Date
  now: Date
  statusCounts: Record<string, number>
}

const STATUS_COLORS: Record<string, string> = {
  applied: '#3b82f6',
  screening: '#8b5cf6',
  interview: '#ec4899',
  offer: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#6b7280',
}

export default function InterviewActivityChart({
  interviews,
  sixMonthsAgo,
  now,
  statusCounts,
}: InterviewActivityChartProps) {
  // Prepare monthly activity data
  const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now })
  const monthlyData = months.map((month) => {
    const monthStart = startOfMonth(month)
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    
    const monthInterviews = interviews.filter((interview) => {
      if (!interview.scheduledAt) return false
      const interviewDate = interview.scheduledAt instanceof Date 
        ? interview.scheduledAt 
        : new Date(interview.scheduledAt)
      return interviewDate >= monthStart && interviewDate <= monthEnd
    })

    return {
      month: format(month, 'MMM yyyy'),
      count: monthInterviews.length,
    }
  })

  // Prepare status distribution data
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    color: STATUS_COLORS[status] || '#6b7280',
  }))

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border border-gray-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Interview Activity
      </h2>
      <div className="space-y-6">
        {/* Monthly Activity Bar Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Interviews by Month
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie Chart */}
        {statusData.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
