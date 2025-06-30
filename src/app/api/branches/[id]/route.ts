import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper to parse ID from params
async function getId(params: Promise<{ id?: string }>) {
  const { id } = await params;
  if (!id) throw new Error("ID param missing");
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) throw new Error("ID param is not a valid integer");
  return parsedId;
}

/**
 * GET /api/branches/[id]
 * Returns a branch by its id.
 */
// GET /api/branches/[id] - Get branch detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("test");
    const id = await getId(params);
    console.log("test1");
    const branch = await prisma.branch.findUnique({ where: { id } });
    console.log("test2");
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    return NextResponse.json(branch);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch branch" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/branches/[id]
 * Returns a branch by its id.
 */
// PUT /api/branches/[id] - Update branch
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getId(params);
    const data = await request.json();
    const branch = await prisma.branch.update({ where: { id }, data });
    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/branches/[id]
 * Returns a branch by its id.
 */
// DELETE /api/branches/[id] - Delete branch
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getId(params);
    await prisma.branch.delete({ where: { id } });
    return NextResponse.json({ message: "Branch deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 400 }
    );
  }
}
