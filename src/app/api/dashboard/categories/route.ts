import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional(),
});

export async function GET() {
  try {
    // const user = await requireAuth();

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    // Validate request body
    const validatedData = createCategorySchema.parse(body);

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    // Create category
    const category = await prisma.category.create({
      data: validatedData,
    });

    // Revalidate SSG pages (categories affect all pages)
    try {
      // Revalidate all pages as categories might be used anywhere
      revalidatePath("/");
      revalidatePath("/stores");
      // Revalidate all store pages
      const stores = await prisma.store.findMany({
        where: { isActive: true },
        select: { slug: true },
      });
      stores.forEach((store: { slug: string }) => {
        revalidatePath(`/store/${store.slug}`);
      });
      // Revalidate all product pages
      const products = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true },
      });
      products.forEach((product: { slug: string }) => {
        revalidatePath(`/product/${product.slug}`);
      });
    } catch (revalidationError) {
      console.error("Revalidation error:", revalidationError);
      // Don't fail the request if revalidation fails
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
