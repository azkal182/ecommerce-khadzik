"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  Download,
  Eye
} from "lucide-react";

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
  };
  customers: {
    current: number;
    previous: number;
    change: number;
  };
  conversionRate: {
    current: number;
    previous: number;
    change: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  storePerformance: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    products: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData: AnalyticsData = {
          revenue: {
            current: 8940000,
            previous: 7800000,
            change: 14.6
          },
          orders: {
            current: 47,
            previous: 41,
            change: 14.6
          },
          customers: {
            current: 23,
            previous: 19,
            change: 21.1
          },
          conversionRate: {
            current: 3.2,
            previous: 2.8,
            change: 14.3
          },
          topProducts: [
            { id: "1", name: "Classic T-Shirt", sales: 15, revenue: 2250000 },
            { id: "2", name: "Analog Watch", sales: 12, revenue: 14400000 },
            { id: "3", name: "Denim Jeans", sales: 8, revenue: 1600000 },
            { id: "4", name: "Smart Watch", sales: 7, revenue: 8750000 },
            { id: "5", name: "Casual Shirt", sales: 5, revenue: 750000 }
          ],
          storePerformance: [
            { id: "1", name: "Fashion Hub", revenue: 4600000, orders: 24, products: 4 },
            { id: "2", name: "Time Pieces", revenue: 4340000, orders: 23, products: 4 }
          ]
        };

        setData(mockData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading || !data) {
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

  const metrics = [
    {
      title: "Revenue",
      value: formatPrice(data.revenue.current),
      change: data.revenue.change,
      changeType: data.revenue.change > 0 ? "positive" : "negative",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Orders",
      value: data.orders.current.toString(),
      change: data.orders.change,
      changeType: data.orders.change > 0 ? "positive" : "negative",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Customers",
      value: data.customers.current.toString(),
      change: data.customers.change,
      changeType: data.customers.change > 0 ? "positive" : "negative",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Conversion Rate",
      value: `${data.conversionRate.current}%`,
      change: data.conversionRate.change,
      changeType: data.conversionRate.change > 0 ? "positive" : "negative",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your store performance and customer behavior
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {metric.value}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      {metric.changeType === "positive" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={
                          metric.changeType === "positive" ? "text-green-600" : "text-red-600"
                        }
                      >
                        {Math.abs(metric.change)}% from previous period
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Top Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Store Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Store Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.storePerformance.map((store, index) => (
                <div key={store.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{store.name}</h4>
                    <Badge variant="outline" className="text-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-bold text-green-600">{formatPrice(store.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Orders</p>
                      <p className="font-bold">{store.orders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Products</p>
                      <p className="font-bold">{store.products}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Quick Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Best Day</h4>
              <p className="text-2xl font-bold text-blue-600">Saturday</p>
              <p className="text-sm text-blue-700">Most orders placed</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Avg Order Value</h4>
              <p className="text-2xl font-bold text-green-600">{formatPrice(190000)}</p>
              <p className="text-sm text-green-700">Per transaction</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Top Category</h4>
              <p className="text-2xl font-bold text-purple-600">Watches</p>
              <p className="text-sm text-purple-700">48% of sales</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Growth Rate</h4>
              <p className="text-2xl font-bold text-orange-600">+24%</p>
              <p className="text-sm text-orange-700">Month over month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}