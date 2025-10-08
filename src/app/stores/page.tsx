import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import StoresClient from "./client-page";

export const metadata: Metadata = {
  title: "All Stores - Dual Store",
  description: "Browse our curated collection of premium stores offering fashion, watches, and more across Indonesia.",
};

// Static generation for all stores
async function getStores() {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      theme: true,
      _count: {
        select: {
          products: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return stores.map(store => ({
    ...store,
    description: store.description || '',
    theme: (store.theme as {
      primary: string;
      secondary: string;
      bg: string;
      fg: string;
      accent: string;
    }) || {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      bg: '#ffffff',
      fg: '#111827',
      accent: '#f59e0b'
    },
  }));
}

export default async function StoresPage() {
  const stores = await getStores();

  return <StoresClient stores={stores} />;
}