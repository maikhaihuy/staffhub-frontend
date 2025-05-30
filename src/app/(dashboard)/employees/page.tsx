'use client';

import EmployeeList from '@/features/employee/list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export default function EmployeePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nhân viên</CardTitle>
        <CardDescription>View all customers and their orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <EmployeeList />
      </CardContent>
    </Card>
  );
}
