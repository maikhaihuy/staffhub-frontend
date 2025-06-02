import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Branch, branchSchema } from './types';
import { createBranch } from './api';

export default function BranchForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<Branch>({
    resolver: zodResolver(branchSchema),
  });

  const mutation = useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      reset();
    },
  });
  
  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-white p-4 rounded shadow">
      <input {...register('name')} placeholder="Name" className="w-full mb-2 p-2 border rounded" />
      <input {...register('abbreviation')} placeholder="Name" className="w-full mb-2 p-2 border rounded" />
      <input {...register('address')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
      <input {...register('phone')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
      <input {...register('email')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Save</button>
    </form>
  );
}
