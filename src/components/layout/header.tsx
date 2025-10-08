"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Dual Store</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-gray-600"
              }`}
            >
              Beranda
            </Link>
            <Link
              href="/stores"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/stores") ? "text-primary" : "text-gray-600"
              }`}
            >
              Semua Toko
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <CartButton onClick={() => router.push('/cart')} />

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-3 border-t">
            <div className="flex flex-col space-y-2 pt-3">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${
                  isActive("/") ? "text-primary bg-gray-50" : "text-gray-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="/stores"
                className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${
                  isActive("/stores") ? "text-primary bg-gray-50" : "text-gray-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Semua Toko
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}