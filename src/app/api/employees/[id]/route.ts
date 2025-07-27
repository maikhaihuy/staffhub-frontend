import { withAudit } from "../../prisma-wrapper";
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
 * GET /api/employees/[id]
 * Returns a employee by its id.
 */
// GET /api/employees/[id] - Get employee detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getId(params);
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        branches: true,
      },
    });
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    // Add branchIds to an employee
    const employeeWithBranchIds = {
      ...employee,
      branchIds: employee.branches.map((b) => b.id),
    };
    return NextResponse.json(employeeWithBranchIds);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employees/[id]
 * Returns a employee by its id.
 */
// PUT /api/employees/[id] - Update employee
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getId(params);
    const updatedEmployee = await request.json();
    const userId = 1;
    // Simple validation
    const requiredFields = ["name", "phone", "branchIds"];
    const missingFields = requiredFields.filter((field) => {
      if (field === "branchIds") {
        return (
          !Array.isArray(updatedEmployee.branchIds) ||
          updatedEmployee.branchIds.length === 0
        );
      }
      return (
        !updatedEmployee[field] ||
        typeof updatedEmployee[field] !== "string" ||
        updatedEmployee[field].trim() === ""
      );
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing or invalid fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const data = withAudit(
      userId,
      {
        ...updatedEmployee,
        branches: {
          set: updatedEmployee.branchIds.map((id: number) => ({ id })),
        },
      },
      "update"
    );

    // Remove branchIds from data to avoid unknown field error
    delete data.branchIds;

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: { branches: true },
    });
    // Add branchIds to an employee
    const employeeWithBranchIds = {
      ...employee,
      branchIds: employee.branches.map((b) => b.id),
    };
    return NextResponse.json(employeeWithBranchIds);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}

/**
 * DELETE /api/employees/[id]
 * Returns a employee by its id.
 */
// DELETE /api/employees/[id] - Delete employee
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = await getId(params);
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ message: "Employee deleted" });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
