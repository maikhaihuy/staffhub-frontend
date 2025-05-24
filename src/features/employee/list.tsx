import { useQuery } from '@tanstack/react-query';
import { getEmployees } from './api';

export default function EmployeeList() {
  const { data, isLoading } = useQuery({ queryKey: ['employees'], queryFn: getEmployees });

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul className="space-y-2">
      {data?.map((emp) => (
        <li key={emp.id} className="bg-white p-4 shadow rounded">{emp.name}</li>
      ))}
    </ul>
  );
}
