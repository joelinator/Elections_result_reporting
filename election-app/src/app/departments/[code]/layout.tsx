// app/departments/[code]/layout.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface DepartmentLayoutProps {
  children: React.ReactNode;
}

export default function DepartmentLayout({ children }: DepartmentLayoutProps) {
  const params = useParams();
  const departmentCode = params?.code as string;

  return (
    <DashboardLayout>
      <div className="department-layout">
        {/* You can add department-specific navigation or breadcrumbs here */}
        <div className="department-content">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
}