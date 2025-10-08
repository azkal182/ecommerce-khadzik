import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ShoppingBag,
  Store as StoreIcon,
  MessageCircle,
  Package,
  TrendingUp
} from "lucide-react";
import HomeClient from "./client-page";

export const metadata: Metadata = {
  title: "Dual Store - Indonesia's Premium Shopping Destination",
  description: "Discover amazing products from our curated stores. Fashion, watches, and more - all in one place.",
};

async function getHomeData() {
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
    take: 6,
  });

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        where: { order: 0 },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Get stats using individual queries for better type safety
  const totalStores = await prisma.store.count({ where: { isActive: true } });
  const totalProducts = await prisma.product.count({ where: { status: "ACTIVE" } });
  const totalCategories = await prisma.category.count();

  return {
    stores: stores.map(store => ({
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
    })),
    products: products.map(product => ({
      ...product,
      description: product.description || '',
      images: product.images.map(img => ({
        ...img,
        alt: img.alt || product.name,
      })),
    })),
    stats: { totalStores, totalProducts, totalCategories },
  };
}

export default async function HomePage() {
  const data = await getHomeData();

  return <HomeClient {...data} />;
}