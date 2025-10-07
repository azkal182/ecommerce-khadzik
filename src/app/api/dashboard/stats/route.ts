import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get total counts
    const [
      totalStores,
      totalProducts,
      totalCategories,
      activeStores,
    ] = await Promise.all([
      prisma.store.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.store.count({ where: { isActive: true } }),
    ]);

    // Get total stock across all variants
    const totalStockResult = await prisma.variant.aggregate({
      _sum: {
        stock: true,
      },
    });

    const totalStock = totalStockResult._sum.stock || 0;

    // Get recent activity counts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newStores, newProducts, activeProducts] = await Promise.all([
      prisma.store.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.product.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      }),
      prisma.product.count({
        where: {
          status: "ACTIVE",
        },
      }),
    ]);

    const stats = {
      totalStores,
      totalProducts,
      totalCategories,
      activeStores,
      activeProducts,
      totalStock,
      recentActivity: {
        newStores,
        newProducts,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}