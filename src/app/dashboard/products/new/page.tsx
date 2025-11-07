"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/ui/markdown-editor";
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
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { generateVariantSKU } from "@/lib/sku-generator";
import { cn } from "@/lib/utils";

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
        <div className="space-y-4 mb-8">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Add New Product
              </h1>
            </div>
            <p className="text-gray-500 text-sm flex items-center space-x-2 ml-11">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create a new product with flexible variants</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <span className="font-semibold">Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="storeId" className="text-sm font-semibold text-gray-700">
                    Store *
                  </Label>
                  <Select
                    value={formData.storeId}
                    onValueChange={(value) => handleInputChange("storeId", value)}
                  >
                    <SelectTrigger className={cn("border-2 focus:border-blue-500 transition-all duration-200", errors.storeId && "border-red-500")}>
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
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className={cn("border-2 focus:border-blue-500 transition-all duration-200", errors.name && "border-red-500")}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
              </div>

              <div>
                <MarkdownEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Enter product description in Markdown format..."
                  error={errors.description}
                  height={300}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="basePrice" className="text-sm font-semibold text-gray-700">
                    Base Price (IDR) *
                  </Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => handleInputChange("basePrice", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className={cn("border-2 focus:border-blue-500 transition-all duration-200", errors.basePrice && "border-red-500")}
                  />
                  {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "DRAFT" | "ACTIVE" | "ARCHIVED") => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="border-2 focus:border-blue-500 transition-all duration-200">
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
                <Label className="text-sm font-semibold text-gray-700">Categories *</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={formData.categories.includes(category.id) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 font-medium",
                        formData.categories.includes(category.id)
                          ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                          : "hover:bg-gray-100"
                      )}
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-semibold">Product Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
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
                        className="w-full h-32 object-cover rounded-lg ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded font-semibold">
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-semibold">Product Options</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOptionType}
                  className="border-2 hover:bg-gray-50 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option Type
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Define product options like Size, Color, etc. If no options are defined, the product will have a single variant.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {formData.optionTypes.map((type, typeIndex) => (
                <div key={type.id} className="border-2 border-gray-200 rounded-lg p-4 space-y-4 hover:border-blue-300 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Option type name (e.g., Size, Color)"
                        value={type.name}
                        onChange={(e) => updateOptionType(type.id, 'name', e.target.value)}
                        className={cn("w-64 border-2 focus:border-blue-500 transition-all duration-200", errors[`optionType_${typeIndex}_name`] && "border-red-500")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOptionValue(type.id)}
                        className="border-2 hover:bg-gray-50 transition-all duration-200"
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 transition-all duration-200"
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
                          className="w-32 border-2 focus:border-blue-500 transition-all duration-200"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOptionValue(type.id, valueIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 transition-all duration-200"
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <span className="font-semibold">Generated Variants</span>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-semibold">
                  {formData.variants.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Variants are automatically generated based on your product options. If no options are defined, a single default variant will be created.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              {formData.variants.length > 0 ? (
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4 hover:border-blue-300 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">Variant {index + 1}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <span className="font-medium">SKU:</span>
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 font-mono text-xs">
                              {variant.generatedSKU}
                            </Badge>
                          </div>
                          {variant.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {variant.options.map((opt, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-medium">
                                  {opt.typeName}: {opt.value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Price (IDR)</Label>
                          <Input
                            type="number"
                            value={variant.priceAbsolute}
                            onChange={(e) => updateVariant(index, 'priceAbsolute', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className="border-2 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Stock</Label>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className="border-2 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Final Price</Label>
                          <div className="font-semibold text-green-600 text-lg">
                            {formatPrice(variant.priceAbsolute)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    {formData.name ? "Variants will be shown here once you add options or set a base price" : "Enter a product name first"}
                  </p>
                </div>
              )}

              {/* Remove variant error display - variants are now optional */}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Link href="/dashboard/products">
              <Button variant="outline" disabled={isSaving} className="border-2 hover:bg-gray-50 transition-all duration-200">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
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
