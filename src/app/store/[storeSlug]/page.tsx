import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { applyStoreTheme } from "@/lib/theme";
import StoreClientPage from "./client-page";

interface StorePageProps {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { storeSlug } = await params;
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    select: { name: true, description: true },
  });

  if (!store) {
    return {
      title: "Store Not Found",
      description: "The requested store could not be found.",
    };
  }

  return {
    title: `${store.name} - Dual Store`,
    description:
      store.description || `Shop at ${store.name} for premium products`,
  };
}

export default async function StorePage({
  params,
  searchParams,
}: StorePageProps) {
  const { storeSlug } = await params;
  const searchParam = await searchParams;

  // Get store information
  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: true,
          categories: {
            include: { category: true },
          },
          variants: {
            include: {
              optionValues: {
                include: { type: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store || !store.isActive) {
    notFound();
  }

  // Apply store theme
  applyStoreTheme(storeSlug);

  // Parse search parameters for filtering and sorting
  const page = parseInt((searchParam.page as string) || "1");
  const limit = parseInt((searchParam.limit as string) || "12");
  const category = searchParam.category as string;
  const sortBy = (searchParam.sortBy as string) || "newest";
  const search = searchParam.search as string;
  const minPrice = parseInt((searchParam.minPrice as string) || "0");
  const maxPrice = parseInt((searchParam.maxPrice as string) || "999999");

  // Filter products
  let filteredProducts = store.products;

  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter((product) =>
      product.categories.some((pc) => pc.category.slug === category)
    );
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description &&
          product.description.toLowerCase().includes(searchLower))
    );
  }

  // Filter by price range
  filteredProducts = filteredProducts.filter((product) => {
    const price = product.basePrice;
    return price >= minPrice && price <= maxPrice;
  });

  // Sort products
  switch (sortBy) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.basePrice - b.basePrice);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.basePrice - a.basePrice);
      break;
    case "name-asc":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "newest":
    default:
      filteredProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  // Pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Get all categories for filtering
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <StoreClientPage
      store={store}
      products={paginatedProducts}
      categories={categories}
      totalProducts={totalProducts}
      currentPage={page}
      totalPages={totalPages}
      currentFilters={{
        category,
        sortBy,
        search,
        minPrice,
        maxPrice,
      }}
    />
  );
}
