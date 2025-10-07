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
  Trash2
} from "lucide-react";

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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-600 mb-4">The store you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard/stores">
            <Button>Back to Stores</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/stores">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stores
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Store</h1>
            <p className="text-gray-600 mt-1">
              Update store information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={store.isActive ? "default" : "secondary"}>
            {store.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">
            {store._count.products} Products
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter store name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Store Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="store-slug"
                  pattern="[a-z0-9-]+"
                  required
                />
                <p className="text-xs text-gray-500">
                  Used in URLs: example.com/store/{formData.slug || "store-slug"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your store..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waNumber">WhatsApp Number *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    +62
                  </span>
                  <Input
                    id="waNumber"
                    value={formData.waNumber}
                    onChange={(e) => handleInputChange("waNumber", formatWhatsAppNumber(e.target.value))}
                    placeholder="8123456789"
                    className="pl-12"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Format: 8123456789 (without country code)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Store Status</Label>
                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="status"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="status" className="text-sm">
                    {formData.isActive ? "Active" : "Inactive"}
                  </Label>
                  <Badge variant={formData.isActive ? "default" : "secondary"}>
                    {formData.isActive ? "Live" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Store Theme</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.theme.primary}
                    onChange={(e) => handleThemeChange("primary", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.theme.primary}
                    onChange={(e) => handleThemeChange("primary", e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.theme.secondary}
                    onChange={(e) => handleThemeChange("secondary", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.theme.secondary}
                    onChange={(e) => handleThemeChange("secondary", e.target.value)}
                    placeholder="#1d4ed8"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={formData.theme.bg}
                    onChange={(e) => handleThemeChange("bg", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.theme.bg}
                    onChange={(e) => handleThemeChange("bg", e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fgColor">Foreground Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="fgColor"
                    type="color"
                    value={formData.theme.fg}
                    onChange={(e) => handleThemeChange("fg", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.theme.fg}
                    onChange={(e) => handleThemeChange("fg", e.target.value)}
                    placeholder="#111827"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={formData.theme.accent}
                    onChange={(e) => handleThemeChange("accent", e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.theme.accent}
                    onChange={(e) => handleThemeChange("accent", e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 border rounded-lg" style={{
              backgroundColor: formData.theme.bg,
              color: formData.theme.fg,
              borderColor: formData.theme.secondary
            }}>
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="flex space-x-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.theme.primary }}
                >
                  {formData.name.charAt(0) || "S"}
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-32 rounded" style={{ backgroundColor: formData.theme.primary }}></div>
                  <div className="h-3 w-24 rounded" style={{ backgroundColor: formData.theme.secondary }}></div>
                  <div className="h-3 w-20 rounded" style={{ backgroundColor: formData.theme.accent }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Store Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Store ID</p>
                <p className="font-medium">{store.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{new Date(store.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <p className="font-medium">{store._count.products}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={store.isActive ? "default" : "secondary"}>
                  {store.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/stores">
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            {store._count.products === 0 && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Store
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {formData.slug && (
              <Link href={`/store/${formData.slug}`} target="_blank">
                <Button variant="outline" disabled={!formData.name}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Store
                </Button>
              </Link>
            )}
            <Button
              type="submit"
              disabled={isLoading || !formData.name || !formData.slug || !formData.waNumber}
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