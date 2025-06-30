import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Branch, branchSchema } from './types';
import { createBranch, updateBranch, getBranch } from './api';
import { useEffect } from 'react';

type BranchFormProps = {
  branchId?: string; // If provided, form is in edit mode
  onSuccess?: () => void; // Optional callback after successful submit
};

export default function BranchForm({ branchId, onSuccess }: BranchFormProps) {
  const queryClient = useQueryClient();

  const { data: branchData } = useQuery({ queryKey: ['branch', branchId], queryFn: () => getBranch(branchId!), enabled: !!branchId});
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<Branch>({
    resolver: zodResolver(branchSchema),
    defaultValues: undefined,
  });

  useEffect(() => {
    if (branchData) {
      reset({
        ...branchData,
        address: branchData.address ?? '',
        phone: branchData.phone ?? '',
        email: branchData.email ?? '',
      });
    }
  }, [branchData, reset]);

  const mutation = useMutation({
    mutationFn: (data: Branch) =>
      branchData && branchData.id
        ? updateBranch(data)
        : createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      reset();
      onSuccess?.();
    },
  });

  return (
    <form 
      onSubmit={handleSubmit((data) => {
        // Sanitize and trim input values before mutation
        const sanitizedData = {
          ...data,
          name: data.name.trim(),
          abbreviation: data.abbreviation.trim(),
          address: data.address?.replace(/[<>]/g, '').trim(),
          phone: data.phone?.replace(/[^0-9+()-\s]/g, '').trim(),
          email: data.email?.trim().toLowerCase(),
        };
        mutation.mutate(sanitizedData);
      })}
      className="bg-white p-4 rounded shadow"
    >
      {/* 
        NOTE: Always validate and sanitize again on the backend to prevent security issues,
        as frontend validation can be bypassed.
      */}
      {mutation.isError && (
        <div className="text-red-600 mb-2">
          {mutation.error?.message || 'An error occurred while creating the branch.'}
        </div>
      )}
      <input {...register('name')} placeholder="Name" className="w-full mb-2 p-2 border rounded" />
      {errors.name && <p className="text-red-600 text-sm mb-2">{errors.name.message}</p>}
      <input {...register('abbreviation')} placeholder="Abbreviation" className="w-full mb-2 p-2 border rounded" />
      {errors.abbreviation && <p className="text-red-600 text-sm mb-2">{errors.abbreviation.message}</p>}
      <input {...register('address')} placeholder="Address" className="w-full mb-2 p-2 border rounded" />
      {errors.address && <p className="text-red-600 text-sm mb-2">{errors.address.message}</p>}
      <input {...register('phone')} placeholder="Phone" className="w-full mb-2 p-2 border rounded" />
      {errors.phone && <p className="text-red-600 text-sm mb-2">{errors.phone.message}</p>}
      <input {...register('email')} placeholder="Email" className="w-full mb-2 p-2 border rounded" />
      {errors.email && <p className="text-red-600 text-sm mb-2">{errors.email.message}</p>}
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
