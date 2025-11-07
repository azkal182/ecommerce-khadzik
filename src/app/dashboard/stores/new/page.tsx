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
  Info,
  Sparkles,
  Plus,
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
      accent: "#06b6d4",
    },
  });

  const handleInputChange = (
    field: keyof StoreFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from name
    if (field === "name" && typeof value === "string") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleThemeChange = (
    colorKey: keyof StoreFormData["theme"],
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorKey]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/dashboard/stores">
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
        </Link>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Create New Store
            </h1>
          </div>
          <p className="text-gray-500 text-sm flex items-center space-x-2 ml-11">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Add a new store to your marketplace</span>
          </p>
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
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-700"
                >
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
                <Label
                  htmlFor="slug"
                  className="text-sm font-semibold text-gray-700"
                >
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
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-700"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your store..."
                rows={3}
                className="border-2 focus:border-blue-500 transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="waNumber"
                  className="text-sm font-semibold text-gray-700"
                >
                  WhatsApp Number *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                    +62
                  </span>
                  <Input
                    id="waNumber"
                    value={formData.waNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "waNumber",
                        formatWhatsAppNumber(e.target.value)
                      )
                    }
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
                <Label
                  htmlFor="status"
                  className="text-sm font-semibold text-gray-700"
                >
                  Store Status
                </Label>
                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    id="status"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleInputChange("isActive", checked)
                    }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="primaryColor"
                  className="text-sm font-semibold text-gray-700"
                >
                  Primary Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.theme.primary}
                    onChange={(e) =>
                      handleThemeChange("primary", e.target.value)
                    }
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.primary}
                    onChange={(e) =>
                      handleThemeChange("primary", e.target.value)
                    }
                    placeholder="#3b82f6"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="secondaryColor"
                  className="text-sm font-semibold text-gray-700"
                >
                  Secondary Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.theme.secondary}
                    onChange={(e) =>
                      handleThemeChange("secondary", e.target.value)
                    }
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.secondary}
                    onChange={(e) =>
                      handleThemeChange("secondary", e.target.value)
                    }
                    placeholder="#8b5cf6"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="accentColor"
                  className="text-sm font-semibold text-gray-700"
                >
                  Accent Color
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="accentColor"
                    type="color"
                    value={formData.theme.accent}
                    onChange={(e) =>
                      handleThemeChange("accent", e.target.value)
                    }
                    className="w-16 h-12 p-1 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={formData.theme.accent}
                    onChange={(e) =>
                      handleThemeChange("accent", e.target.value)
                    }
                    placeholder="#06b6d4"
                    className="flex-1 border-2 focus:border-blue-500 transition-all duration-200 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Eye className="h-4 w-4 text-gray-600" />
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
                  <div
                    className="h-4 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.theme.primary }}
                  ></div>
                  <div
                    className="h-4 rounded-lg shadow-sm w-3/4"
                    style={{ backgroundColor: formData.theme.secondary }}
                  ></div>
                  <div
                    className="h-4 rounded-lg shadow-sm w-1/2"
                    style={{ backgroundColor: formData.theme.accent }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold">Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="font-semibold text-blue-900">
                    WhatsApp Integration
                  </h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    The WhatsApp number will be used for customer checkout. Make
                    sure this number is active and ready to receive customer
                    orders. Customers will be redirected to WhatsApp with their
                    order details.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link href="/dashboard/stores">
            <Button
              variant="outline"
              className="border-2 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            {formData.slug && (
              <Link href={`/store/${formData.slug}`} target="_blank">
                <Button
                  variant="outline"
                  disabled={!formData.name}
                  className="border-2 hover:bg-gray-50 transition-all duration-200"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Store
                </Button>
              </Link>
            )}
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.name ||
                !formData.slug ||
                !formData.waNumber
              }
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
