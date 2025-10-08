import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

export interface RevalidationOptions {
  type: "product" | "store" | "category" | "all";
  slug?: string;
  oldSlug?: string; // For updates when slug changes
  storeSlug?: string; // For products when store changes
  oldStoreSlug?: string; // For products when store changes
}

/**
 * Revalidates SSG pages based on the type of change
 */
export async function revalidatePages(options: RevalidationOptions) {
  try {
    const { type, slug, oldSlug, storeSlug, oldStoreSlug } = options;

    switch (type) {
      case "product":
        // Revalidate product pages
        if (slug) {
          revalidatePath(`/product/${slug}`);
        }
        if (oldSlug && oldSlug !== slug) {
          revalidatePath(`/product/${oldSlug}`);
        }

        // Revalidate store pages
        if (storeSlug) {
          revalidatePath(`/store/${storeSlug}`);
        }
        if (oldStoreSlug && oldStoreSlug !== storeSlug) {
          revalidatePath(`/store/${oldStoreSlug}`);
        }

        // Revalidate stores list and home page
        revalidatePath("/stores");
        revalidatePath("/");
        break;

      case "store":
        // Revalidate store pages
        if (slug) {
          revalidatePath(`/store/${slug}`);
        }
        if (oldSlug && oldSlug !== slug) {
          revalidatePath(`/store/${oldSlug}`);
        }

        // Revalidate stores list and home page
        revalidatePath("/stores");
        revalidatePath("/");
        break;

      case "category":
        // Categories affect all pages, so revalidate everything
        await revalidateAllPages();
        break;

      case "all":
        // Revalidate all pages
        await revalidateAllPages();
        break;
    }
  } catch (error) {
    console.error("Revalidation error:", error);
    // Don't throw the error - it shouldn't fail the API request
  }
}

/**
 * Revalidates all SSG pages
 */
async function revalidateAllPages() {
  // Revalidate main pages
  revalidatePath("/");
  revalidatePath("/stores");

  // Revalidate all store pages
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  stores.forEach((store) => {
    revalidatePath(`/store/${store.slug}`);
  });

  // Revalidate all product pages
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
  });
  products.forEach((product) => {
    revalidatePath(`/product/${product.slug}`);
  });
}

/**
 * Simple revalidation for manual triggers
 */
export async function manualRevalidate(paths?: string[]) {
  try {
    if (paths && paths.length > 0) {
      paths.forEach((path) => {
        revalidatePath(path);
      });
    } else {
      await revalidateAllPages();
    }
    return { success: true };
  } catch (error) {
    console.error("Manual revalidation error:", error);
    return { success: false, error: String(error) };
  }
}