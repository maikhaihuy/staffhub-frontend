import { withAudit } from "../prisma-wrapper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/employees - List all employees
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Pagination params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Build dynamic where filter
    const where: any = {};
    // if (searchParams.has("name")) {
    //   where.name = { contains: searchParams.get("name")!, mode: "insensitive" };
    // }
    // if (searchParams.has("abbreviation")) {
    //   where.abbreviation = {
    //     contains: searchParams.get("abbreviation")!,
    //     mode: "insensitive",
    //   };
    // }
    // if (searchParams.has("address")) {
    //   where.address = {
    //     contains: searchParams.get("address")!,
    //     mode: "insensitive",
    //   };
    // }
    // if (searchParams.has("phone")) {
    //   where.phone = {
    //     contains: searchParams.get("phone")!,
    //     mode: "insensitive",
    //   };
    // }
    // if (searchParams.has("email")) {
    //   where.email = {
    //     contains: searchParams.get("email")!,
    //     mode: "insensitive",
    //   };
    // }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        include: {
          branches: true,
        },
      }),
      prisma.employee.count({ where }),
    ]);

    // Add branchIds to each employee
    const employeesWithBranchIds = employees.map((emp) => ({
      ...emp,
      branchIds: emp.branches.map((b) => b.id),
    }));

    return NextResponse.json({
      data: employeesWithBranchIds,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: Request) {
  try {
    const createdEmployee = await request.json();

    // Simple validation
    const requiredFields = ["name", "phone", "branchIds"];
    const missingFields = requiredFields.filter((field) => {
      if (field === "branchIds") {
        return (
          !Array.isArray(createdEmployee.branchIds) ||
          createdEmployee.branchIds.length === 0
        );
      }
      return (
        !createdEmployee[field] ||
        typeof createdEmployee[field] !== "string" ||
        createdEmployee[field].trim() === ""
      );
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing or invalid fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    // Prepare data for Prisma, linking branches
    const data = withAudit(
      1,
      {
        ...createdEmployee,
        branches: {
          connect: createdEmployee.branchIds.map((id: number) => ({ id })),
        },
      },
      "create"
    );

    // Remove branchIds from data to avoid unknown field error
    delete data.branchIds;

    const employee = await prisma.employee.create({
      data,
      include: { branches: true }, // Optionally include linked branches in response
    });

    // Add branchIds to an employee
    const employeeWithBranchIds = {
      ...employee,
      branchIds: employee.branches.map((b) => b.id),
    };

    return NextResponse.json(employeeWithBranchIds, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
