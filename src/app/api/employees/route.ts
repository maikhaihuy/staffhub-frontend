import { NextResponse } from 'next/server';

const sampleEmployees = [
  { id: '1', status: 'active', branch: 'TT', availableAt: "2025-05-30", name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', status: 'active', branch: 'TT', availableAt: "2025-05-30", name: 'Jane Smith', email: 'jane@example.com', role: 'employee' },
];

export async function GET() {
  return NextResponse.json(sampleEmployees);
}
