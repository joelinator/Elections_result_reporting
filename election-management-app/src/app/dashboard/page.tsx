'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  MapPin, 
  CheckCircle, 
  TrendingUp,
  BarChart3,
  FileText
} from 'lucide-react'
import DashboardLayout from '@/components/Layout/DashboardLayout'

interface StatsCardProps {
  title: string
  value: string | number
  icon: any
  color: 'blue' | 'green' | 'yellow' | 'purple'
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
}

function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change.type === 'increase' ? '+' : '-'}{change.value}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

interface ProgressBarProps {
  label: string
  value: number
  color: 'blue' | 'green' | 'yellow' | 'red'
}

function ProgressBar({ label, value, color }: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div>
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalDepartments: 10,
    completedDepartments: 7,
    totalRegisteredVoters: 12500000,
    averageParticipation: 68.5
  })
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data fetching
    const fetchDashboardData = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem('authToken')
        if (!token) {
          window.location.href = '/auth/login'
          return
        }

        // Mock user data
        setUser({
          noms_prenoms: 'Admin User',
          role: { libelle: 'Administrator' }
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const completionRate = Math.round((stats.completedDepartments / stats.totalDepartments) * 100)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Election data overview and system status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Departments"
            value={stats.totalDepartments}
            icon={MapPin}
            color="blue"
          />
          <StatsCard
            title="Data Complete"
            value={stats.completedDepartments}
            icon={CheckCircle}
            color="green"
            change={{ value: 12, type: 'increase' }}
          />
          <StatsCard
            title="Registered Voters"
            value={stats.totalRegisteredVoters.toLocaleString()}
            icon={Users}
            color="purple"
            change={{ value: 2.3, type: 'increase' }}
          />
          <StatsCard
            title="Avg. Participation"
            value={`${stats.averageParticipation}%`}
            icon={TrendingUp}
            color="yellow"
            change={{ value: 1.2, type: 'increase' }}
          />
        </div>

        {/* Progress and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Data Collection Progress */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Data Collection Progress
              </h3>
              <span className="text-sm text-gray-500">
                {stats.completedDepartments}/{stats.totalDepartments} Departments
              </span>
            </div>
            
            <div className="space-y-4">
              <ProgressBar
                label="Overall Completion"
                value={completionRate}
                color="blue"
              />
              <ProgressBar
                label="Participation Data"
                value={85}
                color="green"
              />
              <ProgressBar
                label="Results Data"
                value={72}
                color="red"
              />
              <ProgressBar
                label="Validation"
                value={68}
                color="yellow"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href="/departments"
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  Manage Departments
                </span>
              </a>
              <a
                href="/results"
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  View Results
                </span>
              </a>
              <a
                href="/reports"
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  Generate Reports
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}