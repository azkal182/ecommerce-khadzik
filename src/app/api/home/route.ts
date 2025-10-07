import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch active stores with product counts
    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 6, // Limit to 6 stores for landing page
    });

    // Fetch featured products from all stores
    const featuredProducts = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        store: {
          isActive: true,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          where: {
            order: 0, // Get first image only
          },
          take: 1,
        },
        variants: {
          take: 1,
          select: {
            priceAbsolute: true,
            priceDelta: true,
          },
        },
        _count: {
          select: {
            variants: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8, // Limit to 8 products for landing page
    });

    // Transform products data
    const transformedProducts = featuredProducts.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      store: product.store,
      image: product.images[0] || null,
      price: product.variants[0]?.priceAbsolute || product.basePrice,
      variantCount: product._count.variants,
    }));

    // Get some statistics
    const [totalStores, totalProducts, activeStores] = await Promise.all([
      prisma.store.count(),
      prisma.product.count({
        where: {
          status: "ACTIVE",
        },
      }),
      prisma.store.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      stores,
      featuredProducts: transformedProducts,
      stats: {
        totalStores,
        totalProducts,
        activeStores,
      },
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch home data" },
      { status: 500 }
    );
  }
}