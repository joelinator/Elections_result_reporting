// app/departments/page.tsx
'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MapPin, 
  FileText, 
  Users, 
  BarChart3, 
  Search, 
  Filter,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface Department {
  code: number;
  name: string;
  region: string;
  registeredVoters: number;
  dataStatus: 'complete' | 'partial' | 'pending';
  lastUpdated: string;
  participationRate?: number;
}

// Mock data - replace with actual data fetching
const departments: Department[] = [
  {
    code: 1,
    name: 'Adamawa',
    region: 'Adamawa',
    registeredVoters: 850000,
    dataStatus: 'complete',
    lastUpdated: '2024-01-15',
    participationRate: 78.5
  },
  {
    code: 2,
    name: 'Centre',
    region: 'Centre',
    registeredVoters: 1200000,
    dataStatus: 'partial',
    lastUpdated: '2024-01-14',
    participationRate: 65.2
  },
  {
    code: 3,
    name: 'East',
    region: 'East',
    registeredVoters: 650000,
    dataStatus: 'pending',
    lastUpdated: '2024-01-10',
  },
  // Add more departments...
];

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { t } = useLanguage();

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.dataStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: Department['dataStatus']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Department['dataStatus']) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalRegistered = departments.reduce((sum, dept) => sum + dept.registeredVoters, 0);
  const completedDepartments = departments.filter(d => d.dataStatus === 'complete').length;
  const avgParticipation = departments
    .filter(d => d.participationRate)
    .reduce((sum, d) => sum + (d.participationRate || 0), 0) / 
    departments.filter(d => d.participationRate).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('departments.title')}
          description={t('departments.description')}
          icon={MapPin}
          breadcrumbs={[
            { label: t('breadcrumbs.dashboard'), href: '/dashboard' },
            { label: t('breadcrumbs.departments') },
          ]}
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={t('departments.totalDepartments')}
            value={departments.length}
            icon={MapPin}
            color="blue"
          />
          <StatsCard
            title={t('departments.dataComplete')}
            value={completedDepartments}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title={t('departments.registeredVoters')}
            value={totalRegistered.toLocaleString()}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title={t('departments.avgParticipation')}
            value={`${avgParticipation.toFixed(1)}%`}
            icon={BarChart3}
            color="yellow"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDepartments.map((department) => (
            <div key={department.code} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                    <p className="text-sm text-gray-600">Department {department.code}</p>
                  </div>
                </div>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(department.dataStatus)}`}>
                  {getStatusIcon(department.dataStatus)}
                  <span className="ml-1 capitalize">{department.dataStatus}</span>
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Registered Voters:</span>
                  <span className="font-medium">{department.registeredVoters.toLocaleString()}</span>
                </div>
                
                {department.participationRate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Participation Rate:</span>
                    <span className="font-medium text-green-600">{department.participationRate}%</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(department.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link href={`/departments/${department.code}/participation`} className="flex-1">
                  <Button className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4" />
                    <span>Enter Data</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href={`/departments/${department.code}/results`}>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>View Results</span>
                  </Button>
                </Link>
              </div>
            </div>
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
  );
}