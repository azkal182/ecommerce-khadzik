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
  image: {
    id: string;
    url: string;
    alt: string;
  } | null;
  price: number;
  variantCount: number;
}

interface HomeData {
  stores: Store[];
  featuredProducts: Product[];
  stats: {
    totalStores: number;
    totalProducts: number;
    activeStores: number;
  };
}

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch("/api/home");
        if (!response.ok) {
          throw new Error("Failed to fetch home data");
        }
        const data = await response.json();
        setHomeData(data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded mb-16"></div>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to load content</h1>
            <p className="text-gray-600">Please refresh the page to try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Indonesia&apos;s Premium Shopping Destination
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover amazing products from our curated stores. {homeData.stats.activeStores} active stores with {homeData.stats.totalProducts}+ products.
          </p>
          <div className="flex justify-center space-x-4">
            {homeData.stores.length > 0 && (
              <Link href={`/store/${homeData.stores[0].slug}`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shop Now
                </Button>
              </Link>
            )}
            <Link href="#stores">
              <Button size="lg" variant="outline">
                <StoreIcon className="h-4 w-4 mr-2" />
                Browse Stores
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex justify-center mb-2">
                <StoreIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{homeData.stats.activeStores}</div>
              <div className="text-sm text-gray-600">Active Stores</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex justify-center mb-2">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{homeData.stats.totalProducts}+</div>
              <div className="text-sm text-gray-600">Products Available</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">WhatsApp Support</div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Products */}
        {homeData.featuredProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
              <Link href="/stores">
                <Button variant="outline">
                  View All Products
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {homeData.featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/product/${product.slug}`}>
                    <div className="aspect-square relative">
                      {product.image ? (
                        <Image
                          src={product.image.url}
                          alt={product.image.alt || product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      {product.variantCount > 1 && (
                        <Badge variant="secondary" className="absolute top-2 left-2">
                          {product.variantCount} variants
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {product.store.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </div>
                      <Link href={`/product/${product.slug}`}>
                        <Button size="sm" variant="outline">
                          <ShoppingBag className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Store Highlights */}
        {homeData.stores.length > 0 && (
          <section id="stores" className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Stores</h2>
              <p className="text-xl text-gray-600">
                Shop from our carefully selected stores, each offering unique products and experiences
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homeData.stores.map((store) => (
                <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div
                    className="h-48 flex items-center justify-center relative"
                    style={{ backgroundColor: store.theme.primary }}
                  >
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">
                        {store.name.toLowerCase().includes('fashion') || store.name.toLowerCase().includes('clothing') ? '👔' :
                         store.name.toLowerCase().includes('watch') || store.name.toLowerCase().includes('time') ? '⌚' :
                         store.name.toLowerCase().includes('sport') || store.name.toLowerCase().includes('active') ? '🏃' :
                         store.name.toLowerCase().includes('tech') || store.name.toLowerCase().includes('gadget') ? '📱' :
                         '🛍️'}
                      </div>
                      <h3 className="text-xl font-semibold">{store.name}</h3>
                    </div>
                    <Badge className="absolute top-4 right-4">
                      {store._count.products} products
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {store.description ? store.description.substring(0, 60) + '...' : 'Discover amazing products'}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Explore our curated selection of quality products with fast delivery across Indonesia.
                    </p>
                    <Link href={`/store/${store.slug}`}>
                      <Button className="w-full" style={{ backgroundColor: store.theme.primary }}>
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Dual Store?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Curated Selection</h3>
              <p className="text-gray-600">Handpicked products from trusted brands and quality sellers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Checkout</h3>
              <p className="text-gray-600">Easy ordering through WhatsApp with personalized service</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery across all Indonesia</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 Dual Store. Your premium shopping destination in Indonesia.
            </p>
            <div className="mt-4 flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <StoreIcon className="h-4 w-4" />
                <span className="text-sm">{homeData.stats.activeStores} Active Stores</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="text-sm">{homeData.stats.totalProducts}+ Products</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
