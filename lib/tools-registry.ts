import React from 'react'
import { Wallet, TrendingUp, Briefcase } from 'lucide-react'

export interface Tool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
  getCriticalInfo?: () => Promise<ToolCriticalInfo | null>
  getSettingsComponent?: () => React.ComponentType<any> | null
}

export interface ToolCriticalInfo {
  primary?: {
    label: string
    value: string | number
    urgent?: boolean
    subtitle?: string
  }
  secondary?: {
    label: string
    value: string | number
    subtitle?: string
  }
  alerts?: Array<{
    label: string
    count: number
    urgent?: boolean
  }>
}

// Tools registry - easily extensible for new apps
export const tools: Tool[] = [
  {
    id: 'finance',
    name: 'Finance Manager',
    description: 'Manage expenses, income, subscriptions, and wallets',
    icon: Wallet,
    href: '/tools/finance',
    color: 'blue',
    getCriticalInfo: async () => {
      try {
        const response = await fetch('/api/tools/finance/critical-info')
        if (response.ok) {
          return await response.json()
        }
        return null
      } catch (error) {
        console.error('Error fetching finance info:', error)
        return null
      }
    },
  },
  {
    id: 'interviews',
    name: 'Interview Manager',
    description: 'Track job applications, interviews, and assessments',
    icon: Briefcase,
    href: '/tools/interviews',
    color: 'purple',
    getCriticalInfo: async () => {
      try {
        const { prisma } = await import('@/lib/prisma')
        
        const now = new Date()
        const sevenDaysFromNow = new Date(now)
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
        
        // Parallelize queries
        const [
          allInterviews,
          allAssessments,
          overdueAssessments,
          totalInterviews,
          totalAssessments,
        ] = await Promise.all([
          prisma.interview.findMany({
            where: {
              scheduledAt: {
                gte: now,
              },
              status: {
                notIn: ['rejected', 'withdrawn', 'offer'],
              },
            },
            select: { 
              id: true,
              scheduledAt: true,
              reminderDays: true,
              reminderHours: true,
            },
          }),
          prisma.assessment.findMany({
            where: {
              deadline: {
                gte: now,
              },
              status: {
                notIn: ['completed', 'submitted', 'expired'],
              },
            },
            select: { 
              id: true,
              deadline: true,
              reminderDays: true,
            },
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
            select: { id: true },
          }),
          prisma.interview.count(),
          prisma.assessment.count(),
        ])
        
        // Check for interview reminders
        const interviewReminders: string[] = []
        allInterviews.forEach((interview) => {
          if (!interview.scheduledAt) return
          
          const scheduledAt = new Date(interview.scheduledAt)
          let reminderTime = new Date(scheduledAt)
          
          // Subtract reminder days
          if (interview.reminderDays) {
            reminderTime.setDate(reminderTime.getDate() - interview.reminderDays)
          }
          
          // Subtract reminder hours
          if (interview.reminderHours) {
            reminderTime.setHours(reminderTime.getHours() - interview.reminderHours)
          }
          
          // Check if reminder time is within the next 7 days
          if (reminderTime >= now && reminderTime <= sevenDaysFromNow) {
            interviewReminders.push(interview.id)
          }
        })
        
        // Check for assessment reminders
        const assessmentReminders: string[] = []
        allAssessments.forEach((assessment) => {
          const deadline = new Date(assessment.deadline)
          let reminderTime = new Date(deadline)
          
          // Subtract reminder days
          if (assessment.reminderDays) {
            reminderTime.setDate(reminderTime.getDate() - assessment.reminderDays)
          } else {
            return // No reminder set
          }
          
          // Check if reminder time is within the next 7 days
          if (reminderTime >= now && reminderTime <= sevenDaysFromNow) {
            assessmentReminders.push(assessment.id)
          }
        })
        
        // Also check for upcoming items (within 7 days)
        const upcomingInterviews = allInterviews.filter((interview) => {
          if (!interview.scheduledAt) return false
          const scheduledAt = new Date(interview.scheduledAt)
          return scheduledAt >= now && scheduledAt <= sevenDaysFromNow
        })
        
        const upcomingAssessments = allAssessments.filter((assessment) => {
          const deadline = new Date(assessment.deadline)
          return deadline >= now && deadline <= sevenDaysFromNow
        })
        
        // Build alerts array
        const alerts: Array<{ label: string; count: number; urgent?: boolean }> = []
        
        if (overdueAssessments.length > 0) {
          alerts.push({
            label: 'Overdue Assessments',
            count: overdueAssessments.length,
            urgent: true,
          })
        }
        
        if (interviewReminders.length > 0) {
          alerts.push({
            label: 'Interview Reminders',
            count: interviewReminders.length,
            urgent: false,
          })
        }
        
        if (assessmentReminders.length > 0) {
          alerts.push({
            label: 'Assessment Reminders',
            count: assessmentReminders.length,
            urgent: false,
          })
        }
        
        if (upcomingInterviews.length > 0 && interviewReminders.length === 0) {
          alerts.push({
            label: 'Upcoming Interviews (7 days)',
            count: upcomingInterviews.length,
            urgent: false,
          })
        }
        
        if (upcomingAssessments.length > 0 && assessmentReminders.length === 0) {
          alerts.push({
            label: 'Upcoming Assessments (7 days)',
            count: upcomingAssessments.length,
            urgent: false,
          })
        }
        
        return {
          primary: {
            label: 'Total Applications',
            value: totalInterviews + totalAssessments,
            subtitle: `${totalInterviews} interviews, ${totalAssessments} assessments`,
          },
          alerts: alerts.length > 0 ? alerts : undefined,
        }
      } catch (error) {
        console.error('Error fetching interview info:', error)
        return null
      }
    },
  },
  // Add more tools here as they're developed
]

export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
