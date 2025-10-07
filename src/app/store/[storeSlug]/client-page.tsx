"use client";

import { useState, useEffect } from "react";
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
import { useCart } from "@/contexts/cart-context";
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
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  currentFilters: {
    category: string;
    sortBy: string;
    search: string;
    minPrice: number;
    maxPrice: number;
  };
}

export default function StoreClientPage({
  store,
  products,
  categories,
  totalProducts,
  currentPage,
  totalPages,
  currentFilters,
}: StoreClientPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-store", store.slug);
  }, [store.slug]);

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page"); // Reset to page 1 when filters change
    router.push(`?${params.toString()}`);
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
    if (products.length === 0) return 1000000;
    return Math.max(...products.map((p) => p.basePrice));
  };

  console.log(store);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="text-sm text-gray-500 mb-2">
                <Link href="/" className="hover:text-gray-700">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{store.name}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              {store.description && (
                <p className="text-gray-600 mt-2 max-w-2xl">
                  {store.description}
                </p>
              )}
              <p className="text-gray-500 mt-2">
                {totalProducts} products available
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-64 flex-shrink-0`}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Filters</h3>

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
                      value={currentFilters.minPrice || ""}
                      onChange={(e) =>
                        updateFilters({ minPrice: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={currentFilters.maxPrice || ""}
                      onChange={(e) =>
                        updateFilters({ maxPrice: e.target.value })
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
                    router.push("?");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {products.length} of {totalProducts} products
                  </p>
                </div>

                {/* Products */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {products.map((product) => (
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
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              const params = new URLSearchParams(
                                searchParams.toString()
                              );
                              params.set("page", page.toString());
                              router.push(`?${params.toString()}`);
                            }}
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
        <div className="sm:w-48 h-48 relative">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-lg sm:rounded-l-lg sm:rounded-t-none flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {product.description}
              </p>
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
            <div className="text-right ml-4">
              <div className="text-xl font-bold text-primary">
                {formatPrice(product.basePrice)}
              </div>
              <div
                className={`text-sm ${
                  inStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Link href={`/product/${product.slug}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
            <Button size="sm" disabled={!inStock} onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
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
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
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
        <div className="flex justify-between items-center mb-3">
          <div className="text-lg font-bold text-primary">
            {formatPrice(product.basePrice)}
          </div>
          <div
            className={`text-sm ${inStock ? "text-green-600" : "text-red-600"}`}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/product/${product.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
          <Button size="sm" disabled={!inStock} onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
