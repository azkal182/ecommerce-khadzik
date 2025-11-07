import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoreClientPage from "./client-page";

interface StorePageProps {
  params: Promise<{ storeSlug: string }>;
}

export async function generateStaticParams() {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return stores.map((store: { slug: string }) => ({
    storeSlug: store.slug,
  }));
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

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;

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

  // Get all categories for filtering
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <StoreClientPage
      store={store}
      products={store.products}
      categories={categories}
      storeSlug={storeSlug}
    />
  );
}
