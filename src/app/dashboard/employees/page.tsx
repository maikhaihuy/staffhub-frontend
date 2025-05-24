'use client';

import EmployeeList from '@/features/employee/list';
import EmployeeForm from '@/features/employee/form';

export default function EmployeePage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <EmployeeList />
      <EmployeeForm />
    </div>
  );
}
