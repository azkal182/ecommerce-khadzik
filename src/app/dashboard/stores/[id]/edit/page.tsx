"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Eye,
  Store,
  Phone,
  Palette,
  Info,
  Trash2,
  Sparkles,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreFormData {
  name: string;
  slug: string;
  description: string;
  waNumber: string;
  isActive: boolean;
  theme: {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    accent: string;
  };
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  waNumber: string;
  isActive: boolean;
  theme: {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    accent: string;
  };
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

export default function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStore, setIsLoadingStore] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [id, setId] = useState<string>("");

  // Resolve the params promise
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    slug: "",
    description: "",
    waNumber: "",
    isActive: true,
    theme: {
      primary: "#3b82f6",
      secondary: "#1d4ed8",
      bg: "#ffffff",
      fg: "#111827",
      accent: "#f59e0b"
    }
  });

  // Fetch store data
  useEffect(() => {
    const fetchStore = async () => {
      if (!id) return; // Don't fetch until id is available

      try {
        const response = await fetch(`/api/dashboard/stores/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch store");
        }
        const storeData: Store = await response.json();
        setStore(storeData);
        setFormData({
          name: storeData.name,
          slug: storeData.slug,
          description: storeData.description,
          waNumber: storeData.waNumber,
          isActive: storeData.isActive,
          theme: storeData.theme
        });
      } catch (error) {
        console.error("Error fetching store:", error);
        router.push("/dashboard/stores");
      } finally {
        setIsLoadingStore(false);
      }
    };

    fetchStore();
  }, [id, router]);

  const handleInputChange = (field: keyof StoreFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name (only if slug hasn't been manually edited)
    if (field === "name" && typeof value === "string" && store?.slug === formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleThemeChange = (colorKey: keyof StoreFormData["theme"], value: string) => {
    setFormData(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorKey]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/dashboard/stores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update store");
      }

      // Redirect to stores list
      router.push("/dashboard/stores");
    } catch (error) {
      console.error("Failed to update store:", error);
      alert(error instanceof Error ? error.message : "Failed to update store");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!store) return;

    if (store._count.products > 0) {
      alert("Cannot delete store with existing products. Please delete all products first.");
      return;
    }

    if (!confirm("Are you sure you want to delete this store? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/stores/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete store");
      }

      // Redirect to stores list
      router.push("/dashboard/stores");
    } catch (error) {
      console.error("Failed to delete store:", error);
      alert(error instanceof Error ? error.message : "Failed to delete store");
    }
  };

  const formatWhatsAppNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    // Remove leading 0 and add 62 if needed
    if (digits.startsWith("0")) {
      return "62" + digits.slice(1);
    }
    return digits;
  };

  if (isLoadingStore) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200 animate-pulse"></div>
          <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-500 mb-6">The store you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard/stores">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25">
              Back to Stores
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
          <Link href="/dashboard/stores">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stores
            </Button>
          </Link>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Edit Store
              </h1>
            </div>
            <p className="text-gray-500 text-sm flex items-center space-x-2 ml-11">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Update store information and settings</span>
            </p>
        </div>
        <div className="flex items-center space-x-2">
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
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
            {store._count.products} Products
          </Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold">Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Store Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter store name"
                  className="border-2 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                  Store Slug *
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="store-slug"
                  pattern="[a-z0-9-]+"
                  className="border-2 focus:border-blue-500 transition-all duration-200"
                  required
                />
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <span>Used in URLs:</span>
                  <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-xs">
                    example.com/store/{formData.slug || "store-slug"}
                  </code>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your store..."
                rows={3}
                className="border-2 focus:border-blue-500 transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="waNumber" className="text-sm font-semibold text-gray-700">
                  WhatsApp Number *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                    +62
                  </span>
                  <Input
                    id="waNumber"
                    value={formData.waNumber}
                    onChange={(e) => handleInputChange("waNumber", formatWhatsAppNumber(e.target.value))}
                    placeholder="8123456789"
                    className="pl-12 border-2 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Format: 8123456789 (without country code)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                  Store Status
                </Label>
                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="status"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="status" className="text-sm font-medium">
                    {formData.isActive ? "Active" : "Inactive"}
                  </Label>
                  <Badge
                    variant={formData.isActive ? "default" : "secondary"}
                    className={cn(
                      formData.isActive
                        ? "bg-green-100 text-green-700 border-green-200 font-semibold"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    )}
                  >
                    {formData.isActive ? "Live" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Configuration */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-semibold">Store Theme</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-sm font-semibold text-gray-700">
                  Primary Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.theme.primary}
                    onChange={(e) => handleThemeChange("primary", e.target.value)}
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.primary}
                    onChange={(e) => handleThemeChange("primary", e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className="text-sm font-semibold text-gray-700">
                  Secondary Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.theme.secondary}
                    onChange={(e) => handleThemeChange("secondary", e.target.value)}
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.secondary}
                    onChange={(e) => handleThemeChange("secondary", e.target.value)}
                    placeholder="#1d4ed8"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bgColor" className="text-sm font-semibold text-gray-700">
                  Background Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="bgColor"
                    type="color"
                    value={formData.theme.bg}
                    onChange={(e) => handleThemeChange("bg", e.target.value)}
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.bg}
                    onChange={(e) => handleThemeChange("bg", e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fgColor" className="text-sm font-semibold text-gray-700">
                  Foreground Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="fgColor"
                    type="color"
                    value={formData.theme.fg}
                    onChange={(e) => handleThemeChange("fg", e.target.value)}
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.fg}
                    onChange={(e) => handleThemeChange("fg", e.target.value)}
                    placeholder="#111827"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor" className="text-sm font-semibold text-gray-700">
                  Accent Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="accentColor"
                    type="color"
                    value={formData.theme.accent}
                    onChange={(e) => handleThemeChange("accent", e.target.value)}
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.accent}
                    onChange={(e) => handleThemeChange("accent", e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 rounded-xl border-2 shadow-sm" style={{
              backgroundColor: formData.theme.bg,
              color: formData.theme.fg,
              borderColor: formData.theme.secondary
            }}>
              <h4 className="font-semibold mb-4 flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Theme Preview</span>
              </h4>
              <div className="flex items-center space-x-6">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white"
                  style={{ backgroundColor: formData.theme.primary }}
                >
                  {formData.name.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 rounded-lg shadow-sm" style={{ backgroundColor: formData.theme.primary }}></div>
                  <div className="h-4 rounded-lg shadow-sm w-3/4" style={{ backgroundColor: formData.theme.secondary }}></div>
                  <div className="h-4 rounded-lg shadow-sm w-1/2" style={{ backgroundColor: formData.theme.accent }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Info className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold">Store Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Store ID</p>
                <p className="font-semibold text-gray-900 font-mono text-xs">{store.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                <p className="font-semibold text-gray-900">{new Date(store.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Products</p>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                  {store._count.products}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/stores">
              <Button variant="outline" className="border-2 hover:bg-gray-50 transition-all duration-200">
                Cancel
              </Button>
            </Link>
            {store._count.products === 0 && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-red-500/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Store
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {formData.slug && (
              <Link href={`/store/${formData.slug}`} target="_blank">
                <Button variant="outline" disabled={!formData.name} className="border-2 hover:bg-gray-50 transition-all duration-200">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Store
                </Button>
              </Link>
            )}
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.slug || !formData.waNumber}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Store
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
