import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createStoreSchema = z.object({
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
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    await requireAuth();

    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    // Validate request body
    const validatedData = createStoreSchema.parse(body);

    // Check if slug already exists
    const existingStore = await prisma.store.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: "Store with this slug already exists" },
        { status: 400 }
      );
    }

    // Create store
    const store = await prisma.store.create({
      data: validatedData,
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}