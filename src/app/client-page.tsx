"use client";

import { useState } from "react";
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
  TrendingUp,
  Shield,
  Truck,
  CreditCard,
  Headphones,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Award,
  Heart,
  ShoppingCart,
  Search,
  Star as StarIcon,
} from "lucide-react";
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

export default function HomeClient({
  stores,
  products,
  stats,
}: HomeClientProps) {
  //   const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStoreEmoji = (storeName: string) => {
    const name = storeName.toLowerCase();
    if (name.includes("fashion") || name.includes("clothing")) return "👔";
    if (name.includes("watch") || name.includes("time")) return "⌚";
    if (name.includes("sport") || name.includes("active")) return "🏃";
    if (name.includes("tech") || name.includes("gadget")) return "📱";
    return "🛍️";
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        {/* Soft overlay untuk mengurangi kontras */}
        <div className="absolute inset-0 bg-white/5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">
                Platform E-Commerce Terpercaya di Indonesia
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Belanja Lebih Mudah
              </span>
              <br />
              <span className="text-white">Dengan Dual Store</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-blue-50 max-w-3xl mx-auto leading-relaxed">
              Temukan produk menakjubkan dari koleksi pilihan toko premium di
              seluruh Indonesia. Belanja dengan aman, cepat, dan terpercaya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/stores">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-6 text-lg font-semibold"
                >
                  <StoreIcon className="h-5 w-5 mr-2" />
                  Jelajahi Toko
                </Button>
              </Link>
              <Link href="/stores">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-6 text-lg font-semibold"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Belanja Sekarang
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm text-blue-50">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>100% Aman & Terpercaya</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5" />
                <span>Pengiriman Cepat</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Pembayaran Mudah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <CardContent className="p-8 text-center relative">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  <StoreIcon className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stats.totalStores}+
                  </h3>
                  <p className="text-gray-600 font-medium">Toko Aktif</p>
                  <p className="text-sm text-gray-500">Toko premium terpilih</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <CardContent className="p-8 text-center relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stats.totalProducts}+
                  </h3>
                  <p className="text-gray-600 font-medium">Produk Tersedia</p>
                  <p className="text-sm text-gray-500">
                    Beragam pilihan produk
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <CardContent className="p-8 text-center relative">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {stats.totalCategories}+
                  </h3>
                  <p className="text-gray-600 font-medium">Kategori</p>
                  <p className="text-sm text-gray-500">
                    Berbagai kategori produk
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">
                Keunggulan Kami
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Mengapa Pilih Dual Store?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Platform e-commerce terpercaya dengan berbagai keunggulan untuk
              pengalaman belanja terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "100% Aman & Terpercaya",
                description: "Transaksi aman dengan sistem keamanan terbaik",
                color: "blue",
              },
              {
                icon: Truck,
                title: "Pengiriman Cepat",
                description:
                  "Pengiriman ke seluruh Indonesia dengan layanan ekspres",
                color: "green",
              },
              {
                icon: CreditCard,
                title: "Pembayaran Mudah",
                description: "Berbagai metode pembayaran yang fleksibel",
                color: "purple",
              },
              {
                icon: Headphones,
                title: "Dukungan 24/7",
                description: "Tim customer service siap membantu kapan saja",
                color: "orange",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300 group-hover:scale-110",
                      feature.color === "blue" &&
                        "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25",
                      feature.color === "green" &&
                        "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25",
                      feature.color === "purple" &&
                        "bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25",
                      feature.color === "orange" &&
                        "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/25"
                    )}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
              <StoreIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">
                Toko Pilihan
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Toko Unggulan Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Temukan pilihan premium dari toko-toko terbaik dan terpercaya di
              seluruh Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => (
              <Card
                key={store.id}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white"
              >
                <div
                  className="h-40 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: store.theme.primary }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                  <div className="text-center text-white relative z-10">
                    <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {getStoreEmoji(store.name)}
                    </div>
                    <h3 className="text-xl font-bold">{store.name}</h3>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold shadow-lg">
                    {store._count.products} produk
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6 line-clamp-3 min-h-[4.5rem]">
                    {store.description
                      ? store.description.substring(0, 120) + "..."
                      : "Temukan produk menakjubkan dengan kualitas terbaik dari toko ini"}
                  </p>
                  <Link href={`/store/${store.slug}`}>
                    <Button
                      className="w-full group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
                      style={{
                        backgroundColor: store.theme.primary,
                        color: "white",
                      }}
                    >
                      Kunjungi Toko
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/stores">
              <Button
                size="lg"
                variant="outline"
                className="border-2 hover:bg-gray-50 transition-all duration-200 font-semibold px-8"
              >
                Lihat Semua Toko
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full mb-4">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                Produk Terbaru
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Produk Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Produk terbaru dan terpilih dari toko-toko premium kami
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full w-10 h-10 p-0 shadow-lg"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div>
                      <Badge
                        variant="secondary"
                        className="text-xs mb-2 bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {product.store.name}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                      {product.description ||
                        "Produk berkualitas dengan harga terbaik"}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(product.basePrice)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-600">
                          4.8
                        </span>
                      </div>
                    </div>
                    <Link href={`/product/${product.slug}`}>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Lihat Detail
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-full mb-4">
              <Zap className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-600">
                Cara Kerja
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Cara Berbelanja di Dual Store
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Proses belanja yang mudah dan cepat hanya dalam beberapa langkah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Pilih Toko",
                description:
                  "Jelajahi berbagai toko premium dan pilih yang sesuai kebutuhan",
                icon: StoreIcon,
              },
              {
                step: "2",
                title: "Pilih Produk",
                description:
                  "Temukan produk yang Anda cari dengan mudah menggunakan fitur pencarian",
                icon: Search,
              },
              {
                step: "3",
                title: "Checkout",
                description:
                  "Lakukan checkout dengan berbagai metode pembayaran yang tersedia",
                icon: ShoppingCart,
              },
              {
                step: "4",
                title: "Terima Barang",
                description:
                  "Tunggu barang sampai di rumah dengan pengiriman cepat dan aman",
                icon: Package,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-20"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white border-2 border-blue-500 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 -z-10">
                    <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 h-6 w-6 text-purple-600 bg-white rounded-full p-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-full mb-4">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-600">
                Testimoni
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Apa Kata Pelanggan Kami?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ribuan pelanggan puas telah mempercayai Dual Store untuk kebutuhan
              belanja mereka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Budi Santoso",
                role: "Pengusaha",
                location: "Jakarta",
                rating: 5,
                comment:
                  "Platform yang sangat mudah digunakan dan produknya berkualitas. Pengiriman cepat dan packaging rapi. Sangat recommended!",
                avatar: "👨‍💼",
              },
              {
                name: "Siti Nurhaliza",
                role: "Ibu Rumah Tangga",
                location: "Bandung",
                rating: 5,
                comment:
                  "Belanja jadi lebih praktis dengan Dual Store. Banyak pilihan toko dan produk, harga juga kompetitif. Customer service responsif banget!",
                avatar: "👩‍💼",
              },
              {
                name: "Ahmad Rizki",
                role: "Mahasiswa",
                location: "Surabaya",
                rating: 5,
                comment:
                  "Sebagai mahasiswa, saya sangat suka dengan berbagai promo yang ditawarkan. Kualitas produk sesuai dengan deskripsi dan harganya terjangkau.",
                avatar: "👨‍🎓",
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.comment}&rdquo;
                  </p>
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.role} • {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 text-white relative overflow-hidden">
        {/* Soft overlay untuk mengurangi kontras */}
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">
              Dapatkan Penawaran Spesial
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Dapatkan Update & Promo Terbaru
          </h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
            Berlangganan newsletter kami dan dapatkan penawaran eksklusif,
            diskon spesial, dan update produk terbaru langsung di email Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/95"
            />
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl font-semibold px-8"
            >
              Berlangganan
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-4">
            Kami menghormati privasi Anda. Unsubscribe kapan saja.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
        {/* Soft overlay untuk mengurangi kontras */}
        <div className="absolute inset-0 bg-white/3"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Award className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">Bergabung Sekarang</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Siap Memulai Berbelanja?
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pelanggan puas di seluruh Indonesia.
            Dapatkan pengalaman belanja online terbaik dengan Dual Store.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/stores">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 px-10 py-6 text-lg font-semibold"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Mulai Berbelanja
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-10 py-6 text-lg font-semibold"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Hubungi Dukungan
            </Button>
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
