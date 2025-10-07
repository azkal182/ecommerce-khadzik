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
  DollarSign
} from "lucide-react";
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
      amount: 450000
    },
    {
      id: "2",
      type: "product",
      description: "New product added: Premium Watch",
      timestamp: "2 hours ago"
    },
    {
      id: "3",
      type: "customer",
      description: "New customer registered",
      timestamp: "3 hours ago"
    },
    {
      id: "4",
      type: "order",
      description: "Order #1234 completed",
      timestamp: "5 hours ago",
      amount: 890000
    }
  ]
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
              amount: 0
            },
            {
              id: "2",
              type: "product",
              title: `New products added`,
              description: `Total products: ${data.totalProducts}`,
              timestamp: "2 hours ago",
              amount: 0
            },
            {
              id: "3",
              type: "customer",
              title: `New customers registered`,
              description: `Total customers: ${data.totalCustomers}`,
              timestamp: "5 hours ago",
              amount: 0
            }
          ]
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
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      change: "+12%",
      changeType: "positive" as const,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      change: "+8%",
      changeType: "positive" as const,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: "+15%",
      changeType: "positive" as const,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your stores today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/stores/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Store</span>
          </Button>
        </Link>
        <Link href="/dashboard/products/new">
          <Button variant="outline" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </Link>
        <Link href="/dashboard/analytics">
          <Button variant="outline" className="flex items-center space-x-2">
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
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : stat.changeType === "neutral" ? (
                    <div className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "neutral"
                        ? "text-gray-600"
                        : "text-red-600"
                    }
                  >
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      {activity.amount && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs font-medium text-gray-900">
                            {formatPrice(activity.amount)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <Link href="/dashboard/analytics">
              <Button variant="ghost" className="w-full justify-center">
                View all activity
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Store Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Clothing Store</p>
                  <p className="text-xs text-gray-500">4 products</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">Active</p>
                  <p className="text-xs text-gray-500">23 orders</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Watches Store</p>
                  <p className="text-xs text-gray-500">4 products</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">Active</p>
                  <p className="text-xs text-gray-500">24 orders</p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <Link href="/dashboard/stores">
              <Button variant="ghost" className="w-full justify-center">
                Manage stores
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}