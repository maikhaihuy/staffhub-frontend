import { NextResponse } from 'next/server';

const sampleEmployees = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'employee' },
];

export async function GET() {
  return NextResponse.json(sampleEmployees);
}
