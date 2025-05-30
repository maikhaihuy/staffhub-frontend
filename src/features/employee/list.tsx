import { useQuery } from '@tanstack/react-query';
import { getEmployees } from './api';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { EmployeeItem } from './item';

export default function EmployeeList() {
  const { data, isLoading } = useQuery({ queryKey: ['employees'], queryFn: getEmployees });

  if (isLoading) return <p>Loading...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            <span className="sr-only">Avatar</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Level</TableHead>
          <TableHead>
            Branch
          </TableHead>
          <TableHead className="hidden md:table-cell">Created at</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((employee) => (
          <EmployeeItem key={employee.id} employee={employee} />
        ))}
      </TableBody>
    </Table>
  );
}
