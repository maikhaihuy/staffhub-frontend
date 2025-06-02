'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import BranchList from "@/features/branch/list";

export default function BranchPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nhân viên</CardTitle>
        <CardDescription>View all customers and their orders.</CardDescription>
      </CardHeader>
      <CardContent>
        <BranchList />
      </CardContent>
    </Card>
  );
}
