import axios from '@/lib/axios';
import { Employee } from './types';

export const getEmployees = async (): Promise<Employee[]> => {
  const res = await axios.get('/api/employees');
  return res.data;
};

export const createEmployee = async (data: Partial<Employee>) => {
  const res = await axios.post('/api/employees', data);
  return res.data;
};
