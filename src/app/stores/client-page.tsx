"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Store as StoreIcon,
  MapPin,
  Package,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { Header } from "@/components/layout/header";

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

interface StoresClientProps {
  stores: Store[];
}

export default function StoresClient({ stores: initialStores }: StoresClientProps) {
  const [stores] = useState<Store[]>(initialStores);
  const [filteredStores, setFilteredStores] = useState<Store[]>(initialStores);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStores(filtered);
  }, [stores, searchTerm]);

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

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Jelajahi Toko Kami</h1>
            <p className="text-xl text-gray-600 mb-8">
              Temukan produk menakjubkan dari {stores.length} toko pilihan terbaik
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari toko..."
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
              {searchTerm ? "Tidak ada toko yang ditemukan" : "Belum ada toko tersedia"}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? "Coba ubah kata kunci pencarian" : "Kembali lagi nanti untuk toko baru"}
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
                        <span>{store._count.products} Produk</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>Indonesia</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm">
                      Jelajahi pilihan produk berkualitas dengan pengiriman cepat ke seluruh Indonesia.
                    </p>

                    <div className="flex items-center space-x-3">
                      <Link href={`/store/${store.slug}`}>
                        <Button
                          className="flex-1 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: store.theme.primary }}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Kunjungi Toko
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
              Ditemukan {filteredStores.length} toko yang cocok dengan &quot;{searchTerm}&quot;
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="mt-2"
            >
              Hapus Pencarian
            </Button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Tidak Menemukan Yang Anda Cari?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Kami terus menambahkan toko dan produk baru. Kembali lagi segera atau hubungi kami untuk permintaan khusus.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              Hubungi Dukungan
            </Button>
            <Link href="/">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}