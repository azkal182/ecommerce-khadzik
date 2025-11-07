"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Store,
  Package,
  Tags,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Stores",
    href: "/dashboard/stores",
    icon: Store,
    badge: "2",
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: Tags,
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex-shrink-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50/50">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 group"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Admin Panel
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 rounded-lg hover:bg-gray-100"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="px-6 py-5 border-b border-gray-200/50 bg-gradient-to-br from-gray-50/50 to-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 ring-2 ring-white">
                    <span className="text-white font-bold text-lg">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session?.user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {session?.user?.email || "admin@example.com"}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="w-full justify-center py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200/50 font-medium"
              >
                {session?.user?.role || "OWNER"}
              </Badge>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <div className="px-2 mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Menu
                </p>
              </div>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group relative flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm shadow-blue-500/10"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-all duration-200",
                          active
                            ? "text-blue-600"
                            : "text-gray-500 group-hover:text-gray-700"
                        )}
                      />
                      <span className={cn(active && "font-semibold")}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border-0 font-semibold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {active && (
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sign out */}
            <div className="p-4 border-t border-gray-200/50 bg-gray-50/30">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform duration-200" />
                <span className="font-medium">Sign out</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top bar */}
          <header className="bg-white/80 backdrop-blur-xl shadow-sm border-gray-200/50 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-9 w-9 rounded-lg hover:bg-gray-100"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div className="hidden lg:block h-6 w-px bg-gray-200" />
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant="outline"
                      className="hidden sm:inline-flex border-green-200 bg-green-50 text-green-700 font-medium"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Production Mode
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 hidden sm:inline-flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>Last sync: Just now</span>
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
