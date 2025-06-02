import { NextResponse } from 'next/server';

const sampleBranches = [
  { id: '1', name: 'Soli 62 Tân Tạo', abbreviation: 'TT', address: '123 Main St', phone: '123-456-7890', email: 'soli.tantao@gmail.com'},
  { id: '2', name: 'Soli 14 Nguyễn Văn Luông', abbreviation: 'NVL', address: '123 Main St', phone: '123-456-7890', email: 'soli.nvl@gmail.com'},
];

export async function GET() {
  return NextResponse.json(sampleBranches);
}
