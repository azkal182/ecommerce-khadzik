"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import {
  ArrowRight,
  ShoppingBag,
  Store as StoreIcon,
  MessageCircle,
  Package,
  TrendingUp
} from "lucide-react";

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme: {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    accent: string;
  };
  _count: {
    products: number;
  };
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  store: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    alt: string;
  }[];
}

interface Stats {
  totalStores: number;
  totalProducts: number;
  totalCategories: number;
}

interface HomeClientProps {
  stores: Store[];
  products: Product[];
  stats: Stats;
}

export default function HomeClient({ stores, products, stats }: HomeClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStoreEmoji = (storeName: string) => {
    const name = storeName.toLowerCase();
    if (name.includes('fashion') || name.includes('clothing')) return '👔';
    if (name.includes('watch') || name.includes('time')) return '⌚';
    if (name.includes('sport') || name.includes('active')) return '🏃';
    if (name.includes('tech') || name.includes('gadget')) return '📱';
    return '🛍️';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Dual Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing products from our curated collection of premium stores across Indonesia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/stores">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <StoreIcon className="h-5 w-5 mr-2" />
                  Browse Stores
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <StoreIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalStores}</h3>
                <p className="text-gray-600">Active Stores</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalProducts}</h3>
                <p className="text-gray-600">Products Available</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalCategories}</h3>
                <p className="text-gray-600">Categories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Stores</h2>
            <p className="text-xl text-gray-600">Discover our handpicked selection of premium stores</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div
                  className="h-32 flex items-center justify-center relative"
                  style={{ backgroundColor: store.theme.primary }}
                >
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">{getStoreEmoji(store.name)}</div>
                    <h3 className="text-lg font-semibold">{store.name}</h3>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30">
                    {store._count.products} products
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">
                    {store.description ? store.description.substring(0, 100) + '...' : 'Discover amazing products'}
                  </p>
                  <Link href={`/store/${store.slug}`}>
                    <Button
                      className="w-full group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: store.theme.primary }}
                    >
                      Visit Store
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/stores">
              <Button size="lg" variant="outline">
                View All Stores
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Latest additions from our stores</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-square bg-gray-100 relative">
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-blue-600">{formatPrice(product.basePrice)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {product.store.name}
                      </Badge>
                    </div>
                    <Link href={`/product/${product.slug}`}>
                      <Button size="sm" className="w-full mt-3">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied customers across Indonesia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/stores">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}