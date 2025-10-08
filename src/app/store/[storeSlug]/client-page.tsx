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
import { Search, Filter, Grid, List, ShoppingCart } from "lucide-react";
import { Header } from "@/components/layout/header";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { useCart } from "@/contexts/cart-context";
import { applyStoreTheme } from "@/lib/theme";
import type { Store, Product, Category } from "@prisma/client";

interface StoreClientPageProps {
  store: Store & {
    products: (Product & {
      images: { id: string; url: string; alt: string | null; order: number }[];
      categories: { category: Category }[];
      variants: {
        id: string;
        sku: string | null;
        priceAbsolute: number | null;
        priceDelta: number | null;
        stock: number;
      }[];
    })[];
  };
  products: (Product & {
    images: { id: string; url: string; alt: string | null; order: number }[];
    categories: { category: Category }[];
    variants: {
      id: string;
      sku: string | null;
      priceAbsolute: number | null;
      priceDelta: number | null;
      stock: number;
    }[];
  })[];
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
      filtered = filtered.filter(product =>
        product.categories.some(cat => cat.category.slug === currentFilters.category)
      );
    }

    // Filter by search term
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
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
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, currentFilters]);

  const updateFilters = (newFilters: Record<string, string | number>) => {
    setCurrentFilters(prev => ({
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

  console.log(store);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <nav className="text-sm text-gray-500 mb-2">
                <Link href="/" className="hover:text-gray-700">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{store.name}</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{store.name}</h1>
              {store.description && (
                <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl">
                  {store.description}
                </p>
              )}
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                {totalProducts} products available
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none px-2 sm:px-3"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none px-2 sm:px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-64 flex-shrink-0 order-2 lg:order-1`}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base sm:text-lg">Filter</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                  >
                    ✕
                  </Button>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={currentFilters.category || "all"}
                    onValueChange={(value) =>
                      updateFilters({ category: value === "all" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <Select
                    value={currentFilters.sortBy}
                    onValueChange={(value) => updateFilters({ sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-asc">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="name-asc">Name: A to Z</SelectItem>
                      <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={currentFilters.minPrice === 0 ? "" : currentFilters.minPrice}
                      onChange={(e) =>
                        updateFilters({ minPrice: Number(e.target.value) || 0 })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={currentFilters.maxPrice === 10000000 ? "" : currentFilters.maxPrice}
                      onChange={(e) =>
                        updateFilters({ maxPrice: Number(e.target.value) || 10000000 })
                      }
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
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
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1 order-1 lg:order-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📦</div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <p className="text-sm sm:text-base text-gray-600">
                    Showing {paginatedProducts.length} of {totalProducts} products
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
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
                  <div className="flex justify-center mt-6 sm:mt-8">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="text-xs sm:text-sm px-2 sm:px-3"
                          >
                            {page}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreClientPage(props: StoreClientPageProps) {
  return (
    <Suspense fallback={
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
    }>
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
      (variant) => variant.stock > 0
    );
    if (!availableVariant) return;

    addToCart(product.id, availableVariant.id, 1, {
      id: product.id,
      slug: product.slug,
      name: product.name,
      basePrice: product.basePrice,
      images: product.images,
      store: store,
      variants: product.variants.map((v) => ({
        id: v.id,
        sku: v.sku || "",
        priceAbsolute: v.priceAbsolute || undefined,
        priceDelta: v.priceDelta || undefined,
      })),
    });
  };

  const primaryImage =
    product.images.find((img) => img.order === 0) || product.images[0];
  const inStock = product.variants.some((variant) => variant.stock > 0);

  if (viewMode === "list") {
    return (
      <Card className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-32 md:w-48 h-48 sm:h-auto relative">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2">
                {product.name}
              </h3>
              {product.description && (
              <div className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2 prose prose-sm max-w-none [&>*]:inline [&>*]:leading-normal">
                <MarkdownRenderer
                  content={product.description}
                  maxHeight="3em"
                />
              </div>
            )}
              <div className="flex flex-wrap gap-1 mb-3">
                {product.categories.map(({ category }) => (
                  <span
                    key={category.id}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-base sm:text-xl font-bold text-primary">
                {formatPrice(product.basePrice)}
              </div>
              <div
                className={`text-xs sm:text-sm ${
                  inStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {inStock ? "Tersedia" : "Habis"}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
            <Link href={`/product/${product.slug}`} className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View Details
              </Button>
            </Link>
            <Button
              size="sm"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add to Cart</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm sm:text-base">Out of Stock</span>
          </div>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
          {product.name}
        </h3>
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
          {product.categories.map(({ category }) => (
            <span
              key={category.id}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {category.name}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="text-sm sm:text-lg font-bold text-primary">
            {formatPrice(product.basePrice)}
          </div>
          <div
            className={`text-xs sm:text-sm ${
              inStock ? "text-green-600" : "text-red-600"
            }`}
          >
            {inStock ? "Tersedia" : "Habis"}
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/product/${product.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
          </Link>
          <Button
            size="sm"
            disabled={!inStock}
            onClick={handleAddToCart}
            className="px-2 sm:px-3"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:hidden ml-1 text-xs">+</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
