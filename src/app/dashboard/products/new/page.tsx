"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Image as ImageIcon,
  Package,
  Trash2,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { generateVariantSKU } from "@/lib/sku-generator";

interface Store {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface OptionType {
  id: string;
  name: string;
  values: string[];
}

interface VariantOption {
  typeId: string;
  typeName: string;
  value: string;
}

interface Variant {
  id?: string;
  priceAbsolute: number;
  stock: number;
  options: VariantOption[];
  generatedSKU?: string;
}

interface ProductFormData {
  storeId: string;
  name: string;
  description: string;
  basePrice: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  images: Array<{
    url: string;
    alt: string;
    order: number;
  }>;
  categories: string[];
  optionTypes: OptionType[];
  variants: Variant[];
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ProductFormData>({
    storeId: "",
    name: "",
    description: "",
    basePrice: 0,
    status: "ACTIVE",
    images: [],
    categories: [],
    optionTypes: [],
    variants: [],
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, categoriesRes] = await Promise.all([
          fetch('/api/dashboard/stores'),
          fetch('/api/dashboard/categories')
        ]);

        if (storesRes.ok) {
          const storesData = await storesRes.json();
          setStores(storesData);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Auto-generate variants when option types or product name changes
  useEffect(() => {
    if (formData.name) {
      generateVariants();
    }
  }, [formData.name, formData.optionTypes]);

  const generateVariants = () => {
    if (formData.optionTypes.length === 0) {
      // Create a default variant if no options
      setFormData(prev => ({
        ...prev,
        variants: [{
          priceAbsolute: prev.basePrice,
          stock: 0,
          options: [],
          generatedSKU: generateVariantSKU(prev.name, {})
        }]
      }));
      return;
    }

    // Generate all possible combinations
    const generateCombinations = (types: OptionType[], index = 0, current: VariantOption[] = []): VariantOption[][] => {
      if (index >= types.length) {
        return current.length > 0 ? [current] : [];
      }

      const type = types[index];
      const combinations: VariantOption[][] = [];

      for (const value of type.values) {
        const newCurrent = [...current, {
          typeId: type.id,
          typeName: type.name,
          value
        }];
        combinations.push(...generateCombinations(types, index + 1, newCurrent));
      }

      return combinations;
    };

    const combinations = generateCombinations(formData.optionTypes);

    const variants: Variant[] = combinations.map(options => ({
      priceAbsolute: formData.basePrice,
      stock: 10,
      options,
      generatedSKU: generateVariantSKU(
        formData.name,
        options.reduce((acc, opt) => ({ ...acc, [opt.typeName]: opt.value }), {})
      )
    }));

    setFormData(prev => ({ ...prev, variants }));
  };

  const addOptionType = () => {
    const newType: OptionType = {
      id: `type_${Date.now()}`,
      name: "",
      values: []
    };

    setFormData(prev => ({
      ...prev,
      optionTypes: [...prev.optionTypes, newType]
    }));
  };

  const updateOptionType = (typeId: string, field: 'name' | 'values', value: unknown) => {
    setFormData(prev => ({
      ...prev,
      optionTypes: prev.optionTypes.map(type =>
        type.id === typeId ? { ...type, [field]: value } : type
      )
    }));
  };

  const addOptionValue = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      optionTypes: prev.optionTypes.map(type =>
        type.id === typeId
          ? { ...type, values: [...type.values, ""] }
          : type
      )
    }));
  };

  const updateOptionValue = (typeId: string, valueIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      optionTypes: prev.optionTypes.map(type =>
        type.id === typeId
          ? {
              ...type,
              values: type.values.map((v, i) => i === valueIndex ? value : v)
            }
          : type
      )
    }));
  };

  const removeOptionValue = (typeId: string, valueIndex: number) => {
    setFormData(prev => ({
      ...prev,
      optionTypes: prev.optionTypes.map(type =>
        type.id === typeId
          ? {
              ...type,
              values: type.values.filter((_, i) => i !== valueIndex)
            }
          : type
      )
    }));
  };

  const removeOptionType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      optionTypes: prev.optionTypes.filter(type => type.id !== typeId)
    }));
  };

  const updateVariant = (index: number, field: 'priceAbsolute' | 'stock', value: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeId) newErrors.storeId = "Store is required";
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = "Valid base price is required";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";
    if (formData.categories.length === 0) newErrors.categories = "At least one category is required";
    // Remove variant requirement validation - variants are now optional

    // Validate option types have names and values
    formData.optionTypes.forEach((type, index) => {
      if (!type.name.trim()) {
        newErrors[`optionType_${index}_name`] = "Option type name is required";
      }
      if (type.values.length === 0 || type.values.every(v => !v.trim())) {
        newErrors[`optionType_${index}_values`] = "At least one option value is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProductFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Auto-update variant prices when base price changes and there are no option types
    if (field === 'basePrice' && formData.optionTypes.length === 0 && formData.variants.length > 0) {
      const numValue = value as number;
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(variant => ({
          ...variant,
          priceAbsolute: numValue
        }))
      }));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImagePreviews(prev => [...prev, result]);
          setFormData(prev => ({
            ...prev,
            images: [
              ...prev.images,
              {
                url: result,
                alt: file.name,
                order: prev.images.length
              }
            ]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index).map((img, i) => ({
        ...img,
        order: i
      }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        variants: formData.variants.map(variant => ({
          ...variant,
          sku: variant.generatedSKU,
          optionValues: variant.options.map(opt => ({
            typeName: opt.typeName,
            value: opt.value
          }))
        }))
      };

      const response = await fetch('/api/dashboard/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        router.push('/dashboard/products');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('An error occurred while creating the product');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-1">
              Create a new product with flexible variants
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeId">Store *</Label>
                  <Select
                    value={formData.storeId}
                    onValueChange={(value) => handleInputChange("storeId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.storeId && <p className="text-sm text-red-500">{errors.storeId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter product description"
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (IDR) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange("basePrice", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className={errors.basePrice ? "border-red-500" : ""}
                  />
                  {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "DRAFT" | "ACTIVE" | "ARCHIVED") => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categories *</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={formData.categories.includes(category.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
                {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Product Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="space-y-4">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Click to upload images
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </span>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && <p className="text-sm text-red-500">{errors.images}</p>}
            </CardContent>
          </Card>

          {/* Product Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Product Options</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOptionType}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option Type
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Define product options like Size, Color, etc. If no options are defined, the product will have a single variant.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.optionTypes.map((type, typeIndex) => (
                <div key={type.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Option type name (e.g., Size, Color)"
                        value={type.name}
                        onChange={(e) => updateOptionType(type.id, 'name', e.target.value)}
                        className={`w-64 ${errors[`optionType_${typeIndex}_name`] ? "border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOptionValue(type.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Value
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOptionType(type.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {type.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex items-center space-x-1">
                        <Input
                          placeholder="Option value"
                          value={value}
                          onChange={(e) => updateOptionValue(type.id, valueIndex, e.target.value)}
                          className="w-32"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOptionValue(type.id, valueIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {errors[`optionType_${typeIndex}_values`] && (
                    <p className="text-sm text-red-500">{errors[`optionType_${typeIndex}_values`]}</p>
                  )}
                </div>
              ))}

              {formData.optionTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">No option types defined.</p>
                  <p className="text-sm">This product will have a single variant with the base price.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Variants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Generated Variants ({formData.variants.length})</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Variants are automatically generated based on your product options. If no options are defined, a single default variant will be created.
              </p>
            </CardHeader>
            <CardContent>
              {formData.variants.length > 0 ? (
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Variant {index + 1}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>SKU:</span>
                            <Badge variant="outline">{variant.generatedSKU}</Badge>
                          </div>
                          {variant.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {variant.options.map((opt, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {opt.typeName}: {opt.value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Price (IDR)</Label>
                          <Input
                            type="number"
                            value={variant.priceAbsolute}
                            onChange={(e) => updateVariant(index, 'priceAbsolute', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Final Price</Label>
                          <div className="font-medium text-green-600">
                            {formatPrice(variant.priceAbsolute)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {formData.name ? "Variants will be shown here once you add options or set a base price" : "Enter a product name first"}
                </div>
              )}

              {/* Remove variant error display - variants are now optional */}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link href="/dashboard/products">
              <Button variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}