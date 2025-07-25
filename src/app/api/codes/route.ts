import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for codes
const codeSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be 50 characters or less"),
  isActive: z.boolean().default(false),
});

// GET /api/codes - Fetch all codes
export async function GET() {
  try {
    const codes = await prisma.codeDistribution.findMany({
      include: {
        user: {
          select: {
            id: true,
            UserDetails: {
              select: {
                firstName: true,
                lastName: true,
              }
            },
            UserAccounts: {
              select: {
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: codes,
    });
  } catch (error) {
    console.error("Error fetching codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch codes" },
      { status: 500 }
    );
  }
}

// POST /api/codes - Create new code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = codeSchema.parse(body);

    // Check if code already exists
    const existingCode = await prisma.codeDistribution.findUnique({
      where: { code: validatedData.code.toUpperCase() },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Code already exists" },
        { status: 400 }
      );
    }

    const newCode = await prisma.codeDistribution.create({
      data: {
        code: validatedData.code.toUpperCase(),
        isActive: validatedData.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      data: newCode,
      message: "Code created successfully",
    });

  } catch (error) {
    console.error("Error creating code:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create code" },
      { status: 500 }
    );
  }
}

// PUT /api/codes - Update existing code
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      id,
      code,
      isActive,
    } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Code ID is required" },
        { status: 400 }
      );
    }

    // Check if code exists
    const existingCode = await prisma.codeDistribution.findUnique({
      where: { id },
    });

    if (!existingCode) {
      return NextResponse.json(
        { error: "Code not found" },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code already exists
    if (code && code.toUpperCase() !== existingCode.code) {
      const duplicateCode = await prisma.codeDistribution.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (duplicateCode) {
        return NextResponse.json(
          { error: "Code already exists" },
          { status: 400 }
        );
      }
    }

    // Update the code
    const updatedCode = await prisma.codeDistribution.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCode,
      message: "Code updated successfully",
    });

  } catch (error) {
    console.error("Error updating code:", error);
    return NextResponse.json(
      { error: "Failed to update code" },
      { status: 500 }
    );
  }
}

// DELETE /api/codes - Delete code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Code ID is required" },
        { status: 400 }
      );
    }

    // Check if code exists
    const existingCode = await prisma.codeDistribution.findUnique({
      where: { id },
    });

    if (!existingCode) {
      return NextResponse.json(
        { error: "Code not found" },
        { status: 404 }
      );
    }

    // Check if code has been used (has userId)
    if (existingCode.userId) {
      return NextResponse.json(
        { 
          error: "Cannot delete code that has been used by a member. Please deactivate the code instead." 
        },
        { status: 400 }
      );
    }

    // Delete the code
    await prisma.codeDistribution.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Code deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting code:", error);
    return NextResponse.json(
      { error: "Failed to delete code" },
      { status: 500 }
    );
  }
}