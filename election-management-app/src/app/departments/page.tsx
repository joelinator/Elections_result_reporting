'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { apiService } from '@/services/api'

interface Department {
  code: number
  libelle: string
  abbreviation: string
  chef_lieu: string
  region: {
    code: number
    libelle: string
    abbreviation: string
  }
  participationData: {
    nombre_inscrit: number
    nombre_votant: number
    taux_participation: number
    bulletin_nul: number
    suffrage_exprime: number
  }
}

function StatusBadge({ status }: { status: 'complete' | 'partial' | 'pending' }) {
  const config = {
    complete: {
      icon: CheckCircle,
      text: 'Complete',
      className: 'bg-green-100 text-green-800'
    },
    partial: {
      icon: AlertCircle,
      text: 'Partial',
      className: 'bg-yellow-100 text-yellow-800'
    },
    pending: {
      icon: Clock,
      text: 'Pending',
      className: 'bg-red-100 text-red-800'
    }
  }

  const { icon: Icon, text, className } = config[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {text}
    </span>
  )
}

function DepartmentCard({ department }: { department: Department }) {
  // Determine status based on participation rate
  const getStatus = (rate: number) => {
    if (rate >= 80) return 'complete'
    if (rate >= 50) return 'partial'
    return 'pending'
  }

  const status = getStatus(department.participationData.taux_participation)

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">{department.libelle}</h3>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Region:</span>
            <span className="font-medium">{department.region.libelle}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Chef-lieu:</span>
            <span className="font-medium">{department.chef_lieu}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Registered Voters:</span>
            <span className="font-medium">{department.participationData.nombre_inscrit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Participation Rate:</span>
            <span className="font-medium">{department.participationData.taux_participation}%</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <a
            href={`/departments/${department.code}`}
            className="flex items-center justify-between text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View Details
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    filterDepartments()
  }, [departments, searchQuery, statusFilter])

  const fetchDepartments = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getDepartments()
      setDepartments(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments')
    } finally {
      setIsLoading(false)
    }
  }

  const filterDepartments = () => {
    let filtered = departments

    if (searchQuery) {
      filtered = filtered.filter(dept => 
        dept.libelle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.region.libelle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(dept => {
        const rate = dept.participationData.taux_participation
        const status = rate >= 80 ? 'complete' : rate >= 50 ? 'partial' : 'pending'
        return status === statusFilter
      })
    }

    setFilteredDepartments(filtered)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading departments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Departments</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchDepartments}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const totalRegistered = departments.reduce((sum, dept) => sum + dept.participationData.nombre_inscrit, 0)
  const completedDepartments = departments.filter(d => d.participationData.taux_participation >= 80).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage election data by department
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
                <p className="text-sm text-gray-600">Total Departments</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{completedDepartments}</p>
                <p className="text-sm text-gray-600">Data Complete</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900">{totalRegistered.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Registered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((department) => (
            <DepartmentCard key={department.code} department={department} />
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}