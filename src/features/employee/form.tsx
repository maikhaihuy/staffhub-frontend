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
  // avatar: z.string().optional(),
  //   status: z.enum(['active', 'inactive']).default('active'),
  //   level: z.number().min(0, 'Level must be a positive number').default(0),
  //   branch: z.string().optional(),
  //   availableAt: z.string().optional(),
  //   name: z.string().min(1, 'Name is required'),
  //   email: z.string().email('Invalid email'),
  //   role: z.enum(['employee', 'admin'])
  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-white p-4 rounded shadow">
      <input {...register('name')} placeholder="Name" className="w-full mb-2 p-2 border rounded" />
      <input {...register('email')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
      <input {...register('level')} placeholder="Level" type='number' className="w-full mb-2 p-2 border rounded" />
      <select {...register('role')} className="w-full mb-2 p-2 border rounded">
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
      <select {...register('branch')} className="w-full mb-2 p-2 border rounded">
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
      <select {...register('status')} className="w-full mb-2 p-2 border rounded">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Save</button>
    </form>
  );
}
