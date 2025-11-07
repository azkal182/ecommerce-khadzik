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
  ArrowRight,
  Sparkles,
  X,
  TrendingUp,
  Star,
  CheckCircle2
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Header */}
      <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-white/5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Toko Pilihan Terbaik</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Jelajahi Toko Kami
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 max-w-2xl mx-auto mb-8">
              Temukan produk menakjubkan dari {stores.length} toko pilihan terbaik di seluruh Indonesia
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                <Input
                    placeholder="Cari toko atau produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-12 py-6 text-base border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-blue-100 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-200"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </form>
              {searchTerm && filteredStores.length > 0 && (
                <div className="mt-4">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-1.5">
                    Ditemukan {filteredStores.length} toko yang cocok
                  </Badge>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredStores.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 mx-auto">
                <StoreIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm ? "Tidak ada toko yang ditemukan" : "Belum ada toko tersedia"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm ? "Coba ubah kata kunci pencarian atau hapus filter untuk melihat semua toko" : "Kembali lagi nanti untuk toko baru"}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="border-2 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Pencarian
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredStores.map((store) => (
                  <Card
                    key={store.id}
                    className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white"
                  >
                    {/* Store Header with Theme Color */}
                    <div
                      className="h-48 md:h-52 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: store.theme.primary }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                      <div className="text-center text-white relative z-10">
                        <div className="text-6xl md:text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                          {getStoreEmoji(store.name)}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold">{store.name}</h3>
                      </div>
                      <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold shadow-lg">
                        {store._count.products} produk
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <div className="mb-5">
                        <h4 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
                          {store.description ? store.description.substring(0, 100) + (store.description.length > 100 ? '...' : '') : 'Temukan produk menakjubkan dengan kualitas terbaik dari toko ini'}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
                          <div className="flex items-center space-x-1.5">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">{store._count.products} Produk</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span>Indonesia</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600 font-medium">4.8</span>
                          <span className="text-sm text-gray-500">(120+ ulasan)</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <Link href={`/store/${store.slug}`} className="block">
                          <Button
                            className="w-full group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                            style={{ backgroundColor: store.theme.primary }}
                          >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Kunjungi Toko
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Stats Section */}
              {!searchTerm && (
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                        <StoreIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{stores.length}+</h3>
                      <p className="text-gray-600 font-medium">Toko Aktif</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        {stores.reduce((acc, store) => acc + store._count.products, 0)}+
                      </h3>
                      <p className="text-gray-600 font-medium">Total Produk</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6 text-center">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
                      <p className="text-gray-600 font-medium">Terpercaya</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="absolute inset-0 bg-white/3"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">Butuh Bantuan?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tidak Menemukan Yang Anda Cari?
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Kami terus menambahkan toko dan produk baru. Kembali lagi segera atau hubungi kami untuk permintaan khusus.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
            >
              Hubungi Dukungan
            </Button>
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8"
              >
                Kembali ke Beranda
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span>100% Original</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span>Garansi Produk</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span>Pengembalian Mudah</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-300" />
              <span>Dukungan 24/7</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
