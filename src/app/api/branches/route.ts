import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server';

const sampleBranches = [
  { id: '1', name: 'Soli 62 Tân Tạo', abbreviation: 'TT', address: '123 Main St', phone: '123-456-7890', email: 'soli.tantao@gmail.com'},
  { id: '2', name: 'Soli 14 Nguyễn Văn Luông', abbreviation: 'NVL', address: '123 Main St', phone: '123-456-7890', email: 'soli.nvl@gmail.com'},
];

// GET /api/branches - List all branches
export async function GET() {
  try {
    const branches = await prisma.branch.findMany()
    return NextResponse.json(branches)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 })
  }
}

// POST /api/branches - Create a new branch
export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Simple validation
    const requiredFields = ['name', 'abbreviation', 'address', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !data[field] || typeof data[field] !== 'string' || data[field].trim() === '');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing or invalid fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.create({ data })
    return NextResponse.json(branch, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 400 })
  }
}
