import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./client-page";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true },
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      store: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} - ${product.store.name}`,
    description:
      product.description || `Shop ${product.name} at ${product.store.name}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      store: true,
      images: {
        orderBy: { order: "asc" },
      },
      categories: {
        include: { category: true },
      },
      optionTypes: {
        include: { values: true },
        orderBy: { name: "asc" },
      },
      variants: {
        include: {
          optionValues: {
            include: { type: true },
          },
        },
      },
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  // Get related products from the same store
  const relatedProducts = await prisma.product.findMany({
    where: {
      storeId: product.storeId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    include: {
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
      categories: {
        include: { category: true },
      },
      optionTypes: {
        include: { values: true },
      },
      variants: {
        include: {
          optionValues: {
            include: { type: true },
          },
        },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // Transform product to match expected type
  const transformedProduct = {
    ...product,
    store: {
      ...product.store,
      theme:
        (product.store.theme as {
          primary: string;
          secondary: string;
          bg: string;
          fg: string;
          accent: string;
        } | null) || null,
    },
  };

  return (
    <ProductDetailClient
      product={transformedProduct}
      relatedProducts={relatedProducts}
      storeSlug={product.store.slug}
    />
  );
}
