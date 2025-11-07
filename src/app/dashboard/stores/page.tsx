"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Store as StoreIcon,
  Phone,
  Package,
  Sparkles,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreWithProductCount {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  theme: Record<string, unknown>;
  waNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreWithProductCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch("/api/dashboard/stores");
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await response.json();

        // Transform data to match the expected interface
        const transformedStores: StoreWithProductCount[] = data.map(
          (store: StoreWithProductCount) => ({
            id: store.id,
            slug: store.slug,
            name: store.name,
            description: store.description,
            theme: store.theme || {},
            waNumber: store.waNumber,
            isActive: store.isActive,
            createdAt: new Date(store.createdAt),
            updatedAt: new Date(store.updatedAt),
            _count: {
              products: store._count?.products || 0,
            },
          })
        );

        setStores(transformedStores);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatWhatsAppNumber = (number: string) => {
    return `+${number}`;
  };

  const handleDeleteStore = async (
    storeId: string,
    storeName: string,
    productCount: number
  ) => {
    if (productCount > 0) {
      alert(
        `Cannot delete store "${storeName}" because it has ${productCount} products. Please delete all products first.`
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete store "${storeName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/stores/${storeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete store");
      }

      // Refresh stores list
      setStores(stores.filter((store) => store.id !== storeId));
    } catch (error) {
      console.error("Failed to delete store:", error);
      alert(error instanceof Error ? error.message : "Failed to delete store");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
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
              <StoreIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Stores
            </h1>
          </div>
          <p className="text-gray-500 text-sm flex items-center space-x-2 ml-11">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Manage your stores and their settings</span>
          </p>
        </div>
        <Link href="/dashboard/stores/new">
          <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30">
            <Plus className="h-4 w-4" />
            <span>Add Store</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Total Stores
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stores.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110">
                <StoreIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Active Stores
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stores.filter((s) => s.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110">
                <Eye className="h-6 w-6 text-green-600" />
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
                  Total Products
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {stores.reduce(
                    (acc, store) => acc + store._count.products,
                    0
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
          <Input
            placeholder="Search stores by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 focus:border-blue-500 transition-all duration-200"
          />
        </div>
        {searchTerm && (
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {filteredStores.length}{" "}
            {filteredStores.length === 1 ? "store" : "stores"} found
          </Badge>
        )}
      </div>

      {/* Stores Table */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <StoreIcon className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-semibold">All Stores</span>
            <Badge
              variant="secondary"
              className="ml-auto bg-gray-100 text-gray-700"
            >
              {filteredStores.length}{" "}
              {filteredStores.length === 1 ? "store" : "stores"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredStores.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <StoreIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? "No stores found" : "No stores yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms or clear the search to see all stores"
                  : "Get started by creating your first store to manage your products and customers"}
              </p>
              {!searchTerm && (
                <Link href="/dashboard/stores/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">
                      Store
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Contact
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Products
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
                  {filteredStores.map((store) => (
                    <TableRow
                      key={store.id}
                      className="group hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 ring-2 ring-white group-hover:scale-105 transition-transform duration-200">
                              <span className="text-white font-bold text-sm">
                                {store.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {store.isActive && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-gray-950 transition-colors">
                              {store.name}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {store.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 font-medium">
                            {formatWhatsAppNumber(store.waNumber)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 border-purple-200 font-semibold"
                          >
                            {store._count.products}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            products
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={store.isActive ? "default" : "secondary"}
                          className={cn(
                            store.isActive
                              ? "bg-green-100 text-green-700 border-green-200 font-semibold"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          )}
                        >
                          {store.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{store.createdAt.toLocaleDateString()}</span>
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
                                href={`/store/${store.slug}`}
                                target="_blank"
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Store
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/stores/${store.id}/edit`}
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Store
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                              onClick={() =>
                                handleDeleteStore(
                                  store.id,
                                  store.name,
                                  store._count.products
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Store
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
