"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/layout/header";
import {
  Search,
  Store as StoreIcon,
  MapPin,
  Package,
  ShoppingBag,
  ArrowRight
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

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch("/api/home");
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await response.json();
        setStores(data.stores);
        setFilteredStores(data.stores);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  useEffect(() => {
    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  const getStoreEmoji = (storeName: string) => {
    const name = storeName.toLowerCase();
    if (name.includes('fashion') || name.includes('clothing')) return '👔';
    if (name.includes('watch') || name.includes('time')) return '⌚';
    if (name.includes('sport') || name.includes('active')) return '🏃';
    if (name.includes('tech') || name.includes('gadget')) return '📱';
    return '🛍️';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Our Stores</h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover amazing products from {stores.length} carefully selected stores
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No stores found" : "No stores available"}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Check back later for new stores"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store) => (
              <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Store Header with Theme Color */}
                <div
                  className="h-48 flex items-center justify-center relative"
                  style={{ backgroundColor: store.theme.primary }}
                >
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">
                      {getStoreEmoji(store.name)}
                    </div>
                    <h3 className="text-xl font-semibold">{store.name}</h3>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-white/20 text-white border-white/30">
                    {store._count.products} products
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {store.description ? store.description.substring(0, 80) + '...' : 'Discover amazing products'}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4" />
                        <span>{store._count.products} Products</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Indonesia</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm">
                      Explore our curated selection of quality products with fast delivery across Indonesia.
                    </p>

                    <div className="flex items-center space-x-3">
                      <Link href={`/store/${store.slug}`}>
                        <Button
                          className="flex-1 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: store.theme.primary }}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Visit Store
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/store/${store.slug}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Show All Results */}
        {searchTerm && filteredStores.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Found {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            We're constantly adding new stores and products. Check back soon or contact us for special requests.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              Contact Support
            </Button>
            <Link href="/">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}