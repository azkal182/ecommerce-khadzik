"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Store as StoreIcon,
  Tag,
  Package as PackageIcon,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  sku: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  store: {
    id: string;
    name: string;
    slug: string;
  };
  categories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  variants: {
    id: string;
    sku: string | null;
    priceAbsolute: number | null;
    priceDelta: number | null;
    stock: number;
  }[];
  images: {
    id: string;
    url: string;
    alt: string | null;
    order: number;
  }[];
  _count: {
    variants: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedStore && selectedStore !== "all") {
          params.append("storeId", selectedStore);
        }
        if (selectedCategory && selectedCategory !== "all") {
          params.append("categoryId", selectedCategory);
        }
        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const response = await fetch(
          `/api/dashboard/products?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        // Transform data to match the expected interface
        const transformedProducts: Product[] = data.map((product: Product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          basePrice: product.basePrice,
          sku: product.sku,
          isActive: product.isActive,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt),
          store: product.store,
          categories: product.categories || [],
          variants: product.variants || [],
          images: product.images || [],
          _count: product._count || { variants: 0 },
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedStore, selectedCategory, searchTerm]);

  const filteredProducts = products; // Filtering is now done on the server side

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStore, selectedCategory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalStock = (product: Product) => {
    return product.variants.reduce(
      (total, variant) => total + variant.stock,
      0
    );
  };

  const uniqueStores = Array.from(new Set(products.map((p) => p.store)));
  const uniqueCategories = Array.from(
    new Set(products.flatMap((p) => p.categories.map((c) => c.category)))
  );

  const hasActiveFilters =
    searchTerm || selectedStore !== "all" || selectedCategory !== "all";

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200"></div>
            </div>
          ))}
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Products
            </h1>
          </div>
          <p className="text-gray-500 text-sm flex items-center space-x-2 ml-11">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Manage your products across all stores</span>
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Products
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {products.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">Stores</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {uniqueStores.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110">
                <StoreIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Categories
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {uniqueCategories.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Stock
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {products.reduce(
                    (acc, product) => acc + getTotalStock(product),
                    0
                  )}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110">
                <PackageIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            <Input
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full sm:w-48 border-2 focus:border-blue-500">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {uniqueStores.map((store, index) => (
                <SelectItem key={store.id + index} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 border-2 focus:border-blue-500">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category, i) => (
                <SelectItem key={category.id + i} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
            </Badge>
            {(searchTerm ||
              selectedStore !== "all" ||
              selectedCategory !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStore("all");
                  setSelectedCategory("all");
                }}
                className="h-7 text-xs hover:bg-gray-100"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold">All Products</span>
              <Badge
                variant="secondary"
                className="ml-2 bg-gray-100 text-gray-700"
              >
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </Badge>
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedStore("all");
                  setSelectedCategory("all");
                }}
                className="text-xs hover:bg-gray-100"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? "No products found" : "No products yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try adjusting your search terms or filters to find products"
                  : "Get started by creating your first product to manage inventory and sales"}
              </p>
              {!hasActiveFilters && (
                <Link href="/dashboard/products/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">
                        Product
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Store
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Price
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Stock
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Created
                      </TableHead>
                      <TableHead className="w-[100px] font-semibold text-gray-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className="group hover:bg-blue-50/30 transition-colors duration-150"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-200">
                              {product.images[0] ? (
                                <Image
                                  src={product.images[0].url}
                                  alt={product.images[0].alt || product.name}
                                  width={56}
                                  height={56}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-gray-950 transition-colors">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 font-mono mt-0.5">
                                {product.sku || "No SKU"}
                              </p>
                              <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-1">
                                {product.categories
                                  .slice(0, 2)
                                  .map(({ category }) => (
                                    <Badge
                                      key={category.id}
                                      variant="secondary"
                                      className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-medium"
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
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <StoreIcon className="h-4 w-4 text-gray-400" />
                            <Link
                              href={`/store/${product.store.slug}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                            >
                              {product.store.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {formatPrice(product.basePrice)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {product._count.variants}{" "}
                              {product._count.variants === 1
                                ? "variant"
                                : "variants"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span
                              className={cn(
                                "font-semibold",
                                getTotalStock(product) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              )}
                            >
                              {getTotalStock(product)}
                            </span>
                            <Badge
                              variant={
                                getTotalStock(product) > 0
                                  ? "default"
                                  : "destructive"
                              }
                              className={cn(
                                "text-xs font-semibold",
                                getTotalStock(product) > 0
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              )}
                            >
                              {getTotalStock(product) > 0
                                ? "In Stock"
                                : "Out of Stock"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? "default" : "secondary"}
                            className={cn(
                              product.isActive
                                ? "bg-green-100 text-green-700 border-green-200 font-semibold"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            )}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              {product.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/product/${product.slug}`}
                                  target="_blank"
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/products/${product.id}/edit`}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/30">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-semibold text-gray-900">
                        {startIndex + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-gray-900">
                        {Math.min(endIndex, filteredProducts.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900">
                        {filteredProducts.length}
                      </span>{" "}
                      products
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="border-2 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={cn(
                                  "min-w-[2.5rem] border-2",
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
                                    : "hover:bg-gray-50"
                                )}
                              >
                                {pageNum}
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
                        className="border-2 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
