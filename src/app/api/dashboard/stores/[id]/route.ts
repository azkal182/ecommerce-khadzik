import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string().min(1, "Store slug is required"),
  description: z.string().min(1, "Description is required"),
  waNumber: z.string().min(1, "WhatsApp number is required"),
  theme: z.object({
    primary: z.string(),
    secondary: z.string(),
    bg: z.string(),
    fg: z.string(),
    accent: z.string(),
  }),
  isActive: z.boolean(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateStoreSchema.parse(body);

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id },
    });

    if (!existingStore) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Check if slug already exists (excluding current store)
    const slugExists = await prisma.store.findFirst({
      where: {
        slug: validatedData.slug,
        id: { not: id },
      },
    });

    if (slugExists) {
      return NextResponse.json(
        { error: "Store with this slug already exists" },
        { status: 400 }
      );
    }

    // Update store
    const store = await prisma.store.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error updating store:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update store" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    // Check if store exists
    const existingStore = await prisma.store.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingStore) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Check if store has products
    if (existingStore._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete store with existing products" },
        { status: 400 }
      );
    }

    // Delete store
    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Store deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 }
    );
  }
}