"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Search,
  User,
  LogIn,
  LayoutDashboard,
  Sparkles,
  Store as StoreIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stores?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Dual Store
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">
                Premium Shopping
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Cari toko atau produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </form>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 relative",
                isActive("/")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              Beranda
              {isActive("/") && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
              )}
            </Link>
            <Link
              href="/stores"
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 relative",
                isActive("/stores")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center space-x-1">
                <StoreIcon className="h-4 w-4" />
                <span>Semua Toko</span>
              </div>
              {isActive("/stores") && (
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
              )}
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Search Button - Mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0 hover:bg-gray-100"
              onClick={() => router.push("/stores")}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart Button */}
            <CartButton onClick={() => router.push("/cart")} />

            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <User className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">
                        {session.user?.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {session.user?.role?.toLowerCase()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/signin">
                <Button
                  size="sm"
                  className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="sm:hidden h-9 w-9 p-0"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/50">
            <div className="flex flex-col space-y-1 pt-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="px-3 mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari toko atau produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </form>

              <Link
                href="/"
                className={cn(
                  "px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2",
                  isActive("/")
                    ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Beranda</span>
              </Link>
              <Link
                href="/stores"
                className={cn(
                  "px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2",
                  isActive("/stores")
                    ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <StoreIcon className="h-4 w-4" />
                <span>Semua Toko</span>
              </Link>
              {session && (
                <Link
                  href="/dashboard"
                  className={cn(
                    "px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2",
                    isActive("/dashboard")
                      ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              {!session && (
                <Link
                  href="/auth/signin"
                  className="px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
