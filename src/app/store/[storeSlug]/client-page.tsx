"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Grid,
  List,
  ShoppingCart,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  Sparkles,
  Home,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { useCart } from "@/contexts/cart-context";
import { applyStoreTheme } from "@/lib/theme";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  createdAt: Date;
  images: { id: string; url: string; alt: string | null; order: number }[];
  categories: { category: Category }[];
  variants: {
    id: string;
    sku: string | null;
    priceAbsolute: number | null;
    priceDelta: number | null;
    stock: number;
  }[];
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    accent: string;
  } | null;
  isActive: boolean;
}

interface StoreClientPageProps {
  store: Store & {
    products: Product[];
  };
  products: Product[];
  categories: Category[];
  storeSlug: string;
}

function StorePageContent({
  store,
  products,
  categories,
  storeSlug,
}: StoreClientPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Client-side filtering and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const totalProducts = filteredProducts.length;

  // Filter state
  const [currentFilters, setCurrentFilters] = useState({
    category: "",
    sortBy: "newest",
    search: "",
    minPrice: 0,
    maxPrice: 10000000,
  });

  useEffect(() => {
    applyStoreTheme(storeSlug);
  }, [storeSlug]);

  // Client-side filtering logic
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    if (currentFilters.category) {
      filtered = filtered.filter((product) =>
        product.categories.some(
          (cat: { category: Category }) =>
            cat.category.slug === currentFilters.category
        )
      );
    }

    // Filter by search term
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          (product.description &&
            product.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.basePrice >= currentFilters.minPrice &&
        product.basePrice <= currentFilters.maxPrice
    );

    // Sort products
    switch (currentFilters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, currentFilters]);

  const updateFilters = (newFilters: Record<string, string | number>) => {
    setCurrentFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getMinPrice = () => {
    if (products.length === 0) return 0;
    return Math.min(...products.map((p) => p.basePrice));
  };

  const getMaxPrice = () => {
    if (products.length === 0) return 10000000;
    return Math.max(...products.map((p) => p.basePrice));
  };

  // Get paginated products for display
  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const paginatedProducts = getPaginatedProducts();

  const storeTheme = (store.theme as {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    accent: string;
  }) || {
    primary: "#3b82f6",
    secondary: "#1d4ed8",
    bg: "#ffffff",
    fg: "#111827",
    accent: "#f59e0b",
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Store Header */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: storeTheme.primary }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <nav className="text-sm text-white/80 mb-4 flex items-center space-x-2">
            <Link
              href="/"
              className="hover:text-white transition-colors flex items-center space-x-1"
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </Link>
            <span>/</span>
            <Link href="/stores" className="hover:text-white transition-colors">
              Toko
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{store.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">Toko Premium</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3">
                {store.name}
              </h1>
              {store.description && (
                <p className="text-white/90 text-base md:text-lg max-w-2xl mb-4">
                  {store.description}
                </p>
              )}
              <div className="flex items-center space-x-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-semibold">
                  <Package className="h-4 w-4 mr-1" />
                  {totalProducts} Produk
                </Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-white/80">(120+ ulasan)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="flex border border-white/20 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-none border-0",
                    viewMode === "grid"
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-none border-0",
                    viewMode === "list"
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-white to-gray-50 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filters Sidebar */}
            <div
              className={cn(
                showFilters ? "block" : "hidden",
                "lg:block w-full lg:w-72 flex-shrink-0 order-2 lg:order-1"
              )}
            >
              <Card className="border-0 shadow-lg sticky top-24">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center space-x-2">
                      <Filter className="h-5 w-5" />
                      <span>Filter</span>
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="lg:hidden h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Search */}
                  <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm("");
                            updateFilters({ search: "" });
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Kategori
                    </label>
                    <Select
                      value={currentFilters.category || "all"}
                      onValueChange={(value) =>
                        updateFilters({
                          category: value === "all" ? "" : value,
                        })
                      }
                    >
                      <SelectTrigger className="border-2 focus:border-blue-500 transition-all duration-200">
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Urutkan
                    </label>
                    <Select
                      value={currentFilters.sortBy}
                      onValueChange={(value) =>
                        updateFilters({ sortBy: value })
                      }
                    >
                      <SelectTrigger className="border-2 focus:border-blue-500 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Terbaru</SelectItem>
                        <SelectItem value="price-asc">
                          Harga: Rendah ke Tinggi
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Harga: Tinggi ke Rendah
                        </SelectItem>
                        <SelectItem value="name-asc">Nama: A ke Z</SelectItem>
                        <SelectItem value="name-desc">Nama: Z ke A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Rentang Harga
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Minimum
                        </label>
                        <Input
                          type="number"
                          placeholder="Rp 0"
                          value={
                            currentFilters.minPrice === 0
                              ? ""
                              : currentFilters.minPrice
                          }
                          onChange={(e) =>
                            updateFilters({
                              minPrice: Number(e.target.value) || 0,
                            })
                          }
                          className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Maksimum
                        </label>
                        <Input
                          type="number"
                          placeholder="Rp 10.000.000"
                          value={
                            currentFilters.maxPrice === 10000000
                              ? ""
                              : currentFilters.maxPrice
                          }
                          onChange={(e) =>
                            updateFilters({
                              maxPrice: Number(e.target.value) || 10000000,
                            })
                          }
                          className="border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <Button
                    variant="outline"
                    className="w-full border-2 hover:bg-gray-50 font-semibold"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentFilters({
                        category: "",
                        sortBy: "newest",
                        search: "",
                        minPrice: 0,
                        maxPrice: 10000000,
                      });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hapus Filter
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="flex-1 order-1 lg:order-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6 mx-auto">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Produk tidak ditemukan
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Coba ubah filter atau kata kunci pencarian Anda
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentFilters({
                        category: "",
                        sortBy: "newest",
                        search: "",
                        minPrice: 0,
                        maxPrice: 10000000,
                      });
                    }}
                    className="border-2 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hapus Semua Filter
                  </Button>
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm sm:text-base text-gray-600">
                        Menampilkan{" "}
                        <span className="font-semibold text-gray-900">
                          {paginatedProducts.length}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-gray-900">
                          {totalProducts}
                        </span>{" "}
                        produk
                      </p>
                      {(currentFilters.category ||
                        currentFilters.search ||
                        currentFilters.minPrice > 0 ||
                        currentFilters.maxPrice < 10000000) && (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          Filter Aktif
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden border-2 hover:bg-gray-50"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  {/* Products */}
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                        : "space-y-4"
                    }
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        store={store}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 space-y-4 sm:space-y-0">
                      <p className="text-sm text-gray-600">
                        Halaman {currentPage} dari {totalPages}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className="border-2 hover:bg-gray-50"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Sebelumnya
                        </Button>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let page;
                              if (totalPages <= 5) {
                                page = i + 1;
                              } else if (currentPage <= 3) {
                                page = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                              } else {
                                page = currentPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={page}
                                  variant={
                                    page === currentPage ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={cn(
                                    "min-w-[40px]",
                                    page === currentPage
                                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                                      : "border-2 hover:bg-gray-50"
                                  )}
                                >
                                  {page}
                                </Button>
                              );
                            }
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="border-2 hover:bg-gray-50"
                        >
                          Selanjutnya
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function StoreClientPage(props: StoreClientPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 mb-8"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-48 bg-gray-200 rounded mb-8"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <StorePageContent {...props} />
    </Suspense>
  );
}

interface ProductCardProps {
  product: Product & {
    images: { id: string; url: string; alt: string | null; order: number }[];
    categories: { category: Category }[];
    variants: {
      id: string;
      sku: string | null;
      priceAbsolute: number | null;
      priceDelta: number | null;
      stock: number;
    }[];
  };
  store: Store;
  viewMode: "grid" | "list";
}

function ProductCard({ product, store, viewMode }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    // Find the first available variant
    const availableVariant = product.variants.find(
      (variant: {
        id: string;
        sku: string | null;
        priceAbsolute: number | null;
        priceDelta: number | null;
        stock: number;
      }) => variant.stock > 0
    );
    if (!availableVariant) return;

    addToCart(product.id, availableVariant.id, 1, {
      id: product.id,
      slug: product.slug,
      name: product.name,
      basePrice: product.basePrice,
      images: product.images,
      store: store,
      variants: product.variants.map(
        (v: {
          id: string;
          sku: string | null;
          priceAbsolute: number | null;
          priceDelta: number | null;
          stock: number;
        }) => ({
          id: v.id,
          sku: v.sku || "",
          priceAbsolute: v.priceAbsolute || undefined,
          priceDelta: v.priceDelta || undefined,
        })
      ),
    });
  };

  const primaryImage =
    product.images.find(
      (img: { id: string; url: string; alt: string | null; order: number }) =>
        img.order === 0
    ) || product.images[0];
  const inStock = product.variants.some(
    (variant: {
      id: string;
      sku: string | null;
      priceAbsolute: number | null;
      priceDelta: number | null;
      stock: number;
    }) => variant.stock > 0
  );

  if (viewMode === "list") {
    return (
      <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 md:w-64 h-48 sm:h-auto relative overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <Badge className="bg-red-500 text-white border-0 font-semibold px-4 py-2">
                Habis
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                {product.description && (
                  <div className="text-gray-600 text-sm mb-3 line-clamp-2 prose prose-sm max-w-none [&>*]:inline [&>*]:leading-normal">
                    <MarkdownRenderer
                      content={product.description}
                      maxHeight="3em"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {product.categories
                    .slice(0, 3)
                    .map(({ category }: { category: Category }) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  {product.categories.length > 3 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-600"
                    >
                      +{product.categories.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">4.8</span>
                  <span className="text-sm text-gray-500">(120+ ulasan)</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2 sm:min-w-[140px]">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(product.basePrice)}
                </div>
                <Badge
                  variant={inStock ? "default" : "destructive"}
                  className={cn(
                    inStock
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  )}
                >
                  {inStock ? "Tersedia" : "Habis"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">
            <Link
              href={`/product/${product.slug}`}
              className="flex-1 sm:flex-none"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto border-2 hover:bg-gray-50 font-semibold"
              >
                Lihat Detail
              </Button>
            </Link>
            <Button
              size="sm"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Tambah ke Keranjang</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Badge className="bg-red-500 text-white border-0 font-semibold px-4 py-2">
              Habis
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link href={`/product/${product.slug}`}>
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full w-10 h-10 p-0 shadow-lg bg-white hover:bg-gray-100"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex flex-wrap gap-1 mb-3">
          {product.categories
            .slice(0, 2)
            .map(({ category }: { category: Category }) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
              >
                {category.name}
              </Badge>
            ))}
          {product.categories.length > 2 && (
            <Badge
              variant="secondary"
              className="text-xs bg-gray-100 text-gray-600"
            >
              +{product.categories.length - 2}
            </Badge>
          )}
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatPrice(product.basePrice)}
          </div>
          <Badge
            variant={inStock ? "default" : "destructive"}
            className={cn(
              inStock
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-red-100 text-red-700 border-red-200"
            )}
          >
            {inStock ? "Tersedia" : "Habis"}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Link href={`/product/${product.slug}`} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-2 hover:bg-gray-50 font-semibold"
            >
              Detail
            </Button>
          </Link>
          <Button
            size="sm"
            disabled={!inStock}
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
