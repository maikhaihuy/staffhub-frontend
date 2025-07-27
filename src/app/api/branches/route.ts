import { withAudit } from "../prisma-wrapper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/branches - List all branches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    if (searchParams.get("all"))
      return NextResponse.json({
        data: await prisma.branch.findMany({
          orderBy: { name: "asc" },
        }),
        total: 0, // No pagination for "all" branches
      });

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

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({ where, skip, take }),
      prisma.branch.count({ where }),
    ]);
    return NextResponse.json({
      data: branches,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST /api/branches - Create a new branch
export async function POST(request: Request) {
  try {
    const createdBranch = await request.json();

    // Simple validation
    const requiredFields = ["name", "abbreviation", "address"];
    const missingFields = requiredFields.filter(
      (field) =>
        !createdBranch[field] ||
        typeof createdBranch[field] !== "string" ||
        createdBranch[field].trim() === ""
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing or invalid fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    const data = withAudit(1, createdBranch, "create");

    const branch = await prisma.branch.create({ data });
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
