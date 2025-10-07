"use client";

import { useState } from "react";
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
  Info
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
    accent: string;
  };
}

export default function NewStorePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    slug: "",
    description: "",
    waNumber: "",
    isActive: true,
    theme: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#06b6d4"
    }
  });

  const handleInputChange = (field: keyof StoreFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === "name" && typeof value === "string") {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Creating store:", formData);

      // Redirect to stores list
      router.push("/dashboard/stores");
    } catch (error) {
      console.error("Failed to create store:", error);
    } finally {
      setIsLoading(false);
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Store</h1>
            <p className="text-gray-600 mt-1">
              Add a new store to your marketplace
            </p>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="#8b5cf6"
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
                    placeholder="#06b6d4"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-900">WhatsApp Integration</h4>
                  <p className="text-sm text-blue-700">
                    The WhatsApp number will be used for customer checkout. Make sure this number is active
                    and ready to receive customer orders. Customers will be redirected to WhatsApp with
                    their order details.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard/stores">
            <Button variant="outline">
              Cancel
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            {formData.slug && (
              <Link href={`/store/${formData.slug}`} target="_blank">
                <Button variant="outline" disabled={!formData.name}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Store
                </Button>
              </Link>
            )}
            <Button type="submit" disabled={isLoading || !formData.name || !formData.slug || !formData.waNumber}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Store
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}