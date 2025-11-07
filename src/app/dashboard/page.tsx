"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  ArrowRight,
  Activity,
  DollarSign,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "order" | "product" | "customer" | "store";
  title?: string;
  description: string;
  timestamp: string;
  amount?: number;
}

const mockStats: DashboardStats = {
  totalStores: 2,
  totalProducts: 8,
  totalOrders: 47,
  totalCustomers: 23,
  totalRevenue: 8940000,
  recentActivity: [
    {
      id: "1",
      type: "order",
      description: "New order from John Doe",
      timestamp: "5 minutes ago",
      amount: 450000,
    },
    {
      id: "2",
      type: "product",
      description: "New product added: Premium Watch",
      timestamp: "2 hours ago",
    },
    {
      id: "3",
      type: "customer",
      description: "New customer registered",
      timestamp: "3 hours ago",
    },
    {
      id: "4",
      type: "order",
      description: "Order #1234 completed",
      timestamp: "5 hours ago",
      amount: 890000,
    },
  ],
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();

        // Transform data to match the expected format
        const transformedStats: DashboardStats = {
          totalStores: data.totalStores,
          totalProducts: data.totalProducts,
          totalOrders: data.totalCustomers, // Using customers as proxy for orders
          totalCustomers: data.totalCustomers || 0,
          totalRevenue: data.totalStock * 100000, // Approximate revenue
          recentActivity: [
            {
              id: "1",
              type: "store",
              title: `New store created`,
              description: `Total stores: ${data.totalStores}`,
              timestamp: "Just now",
              amount: 0,
            },
            {
              id: "2",
              type: "product",
              title: `New products added`,
              description: `Total products: ${data.totalProducts}`,
              timestamp: "2 hours ago",
              amount: 0,
            },
            {
              id: "3",
              type: "customer",
              title: `New customers registered`,
              description: `Total customers: ${data.totalCustomers}`,
              timestamp: "5 hours ago",
              amount: 0,
            },
          ],
        };

        setStats(transformedStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case "product":
        return <Package className="h-4 w-4 text-green-500" />;
      case "customer":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "store":
        return <Store className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const statCards = [
    {
      title: "Total Stores",
      value: stats.totalStores,
      icon: Store,
      change: "+0%",
      changeType: "neutral" as const,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      changeColor: "text-gray-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      change: "+12%",
      changeType: "positive" as const,
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-100/50",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      change: "+8%",
      changeType: "positive" as const,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: "+15%",
      changeType: "positive" as const,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-100/50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      changeColor: "text-green-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-64"></div>
          <div className="h-5 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 text-sm mt-0.5 flex items-center space-x-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Welcome back! Here&apos;s what&apos;s happening with your stores
                today.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/stores/new">
          <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30">
            <Plus className="h-4 w-4" />
            <span>Add Store</span>
          </Button>
        </Link>
        <Link href="/dashboard/products/new">
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-2 hover:bg-gray-50 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </Link>
        <Link href="/dashboard/analytics">
          <Button
            variant="outline"
            className="flex items-center space-x-2 border-2 hover:bg-gray-50 transition-all duration-200"
          >
            <Eye className="h-4 w-4" />
            <span>View Analytics</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50"
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
                  `bg-gradient-to-br ${stat.gradient}`
                )}
              />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110",
                      stat.iconBg
                    )}
                  >
                    <Icon className={cn("h-6 w-6", stat.iconColor)} />
                  </div>
                </div>
                <div className="flex items-center text-sm pt-3 border-t border-gray-100">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1.5" />
                  ) : stat.changeType === "neutral" ? (
                    <div className="h-4 w-4 mr-1.5" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1.5" />
                  )}
                  <span className={cn("font-medium", stat.changeColor)}>
                    {stat.change} from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold">Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group relative flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50/50 transition-all duration-200"
                >
                  <div className="relative">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors duration-200">
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < stats.recentActivity.length - 1 && (
                      <div className="absolute left-1/2 top-10 w-0.5 h-full bg-gray-200 transform -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-950 transition-colors">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </p>
                      {activity.amount && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Badge
                            variant="secondary"
                            className="text-xs font-semibold bg-green-50 text-green-700 border-green-200"
                          >
                            {formatPrice(activity.amount)}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <Link href="/dashboard/analytics">
              <Button
                variant="ghost"
                className="w-full justify-center group hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
              >
                View all activity
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-semibold">Store Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="group p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Store className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-gray-900">
                        Clothing Store
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">4 products</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold mb-1">
                      Active
                    </Badge>
                    <p className="text-xs text-gray-500">23 orders</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="group p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Store className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-semibold text-gray-900">
                        Watches Store
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">4 products</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold mb-1">
                      Active
                    </Badge>
                    <p className="text-xs text-gray-500">24 orders</p>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <Link href="/dashboard/stores">
              <Button
                variant="ghost"
                className="w-full justify-center group hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
              >
                Manage stores
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
