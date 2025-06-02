import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee, employeeSchema } from './types';
import { createEmployee } from './api';

export default function EmployeeForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<Employee>({
    resolver: zodResolver(employeeSchema),
  });

  const mutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      reset();
    },
  });
  
  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-white p-4 rounded shadow">
      <input {...register('name')} placeholder="Name" className="w-full mb-2 p-2 border rounded" />
      <input {...register('email')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
      <select {...register('role')} className="w-full mb-2 p-2 border rounded">
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
      <select {...register('branch')} className="w-full mb-2 p-2 border rounded">
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Save</button>
    </form>
  );
}
