"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/ui/markdown-editor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Image as ImageIcon,
  Package,
  Zap,
  Sparkles,
  Edit
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { generateSKU, generateVariantSKU } from "@/lib/sku-generator";
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

interface ProductVariant {
  id?: string;
  sku?: string;
  priceAbsolute: number;
  stock: number;
  optionValues: Array<{
    typeName: string;
    value: string;
  }>;
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
  variants: ProductVariant[];
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch product data and dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, storesRes, categoriesRes] = await Promise.all([
          fetch(`/api/dashboard/products/${productId}`),
          fetch('/api/dashboard/stores'),
          fetch('/api/dashboard/categories')
        ]);

        if (!productRes.ok) {
          throw new Error('Product not found');
        }

        const productData = await productRes.json();

        // Transform product data to form format
        const transformedData: ProductFormData = {
          storeId: productData.storeId,
          name: productData.name,
          description: productData.description || "",
          basePrice: productData.basePrice,
          status: productData.status,
          images: productData.images || [],
          categories: productData.categories?.map((cat: Category) => cat.id) || [],
          optionTypes: productData.optionTypes || [],
          variants: productData.variants || []
        };

        setFormData(transformedData);
        setImagePreviews(transformedData.images.map(img => img.url));

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
        router.push('/dashboard/products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeId) newErrors.storeId = "Store is required";
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = "Valid base price is required";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";
    if (formData.categories.length === 0) newErrors.categories = "At least one category is required";

    // Validate variants
    if (formData.variants.length === 0) {
      newErrors.variants = "At least one variant is required";
    }

    formData.variants.forEach((variant, index) => {
      if (variant.stock < 0) {
        newErrors[`variant_${index}_stock`] = "Stock cannot be negative";
      }
      if (!variant.priceAbsolute || variant.priceAbsolute < 0) {
        newErrors[`variant_${index}_price`] = "Valid variant price is required";
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

  // Option Type Management
  const addOptionType = () => {
    const newOptionType: OptionType = {
      id: `temp_${Date.now()}`,
      name: "",
      values: []
    };
    setFormData(prev => ({
      ...prev,
      optionTypes: [...prev.optionTypes, newOptionType]
    }));
  };

  const updateOptionType = (id: string, field: 'name' | 'values', value: unknown) => {
    setFormData(prev => ({
      ...prev,
      optionTypes: prev.optionTypes.map(type =>
        type.id === id ? { ...type, [field]: value } : type
      )
    }));
  };

  const removeOptionType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      optionTypes: prev.optionTypes.filter(type => type.id !== id)
    }));
    // Regenerate variants after removing option type
    generateVariantsAfterOptionChange(formData.optionTypes.filter(type => type.id !== id));
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
          ? { ...type, values: type.values.filter((_, i) => i !== valueIndex) }
          : type
      )
    }));
  };

  // Variant Management
  const generateVariantsFromOptions = () => {
    if (formData.optionTypes.length === 0) {
      // Create a single variant with no options
      const singleVariant: ProductVariant = {
        sku: generateSKU(formData.name, []),
        priceAbsolute: formData.basePrice,
        stock: 10,
        optionValues: []
      };
      setFormData(prev => ({ ...prev, variants: [singleVariant] }));
      return;
    }

    // Generate all combinations of option values
    const optionCombinations = cartesianProduct(
      formData.optionTypes.map(type => type.values.filter(v => v.trim() !== ""))
    );

    const variants: ProductVariant[] = optionCombinations.map((combination) => {
      const optionValues = combination.map((value, idx) => ({
        typeName: formData.optionTypes[idx].name,
        value: value
      }));

      return {
        sku: generateVariantSKU(formData.name,
          Object.fromEntries(optionValues.map(ov => [ov.typeName, ov.value]))
        ),
        priceAbsolute: formData.basePrice,
        stock: 10,
        optionValues
      };
    });

    setFormData(prev => ({ ...prev, variants }));
  };

  const cartesianProduct = (arrays: string[][]): string[][] => {
    if (arrays.length === 0) return [[]];

    const [first, ...rest] = arrays;
    const restProduct = cartesianProduct(rest);

    return first.flatMap(item =>
      restProduct.map(combination => [item, ...combination])
    );
  };

  const generateVariantsAfterOptionChange = (newOptionTypes: OptionType[]) => {
    if (newOptionTypes.length === 0) {
      const singleVariant: ProductVariant = {
        sku: generateSKU(formData.name, []),
        priceAbsolute: formData.basePrice,
        stock: 10,
        optionValues: []
      };
      setFormData(prev => ({ ...prev, optionTypes: newOptionTypes, variants: [singleVariant] }));
    } else {
      const optionCombinations = cartesianProduct(
        newOptionTypes.map(type => type.values.filter(v => v.trim() !== ""))
      );

      const variants: ProductVariant[] = optionCombinations.map((combination) => {
        const optionValues = combination.map((value, idx) => ({
          typeName: newOptionTypes[idx].name,
          value: value
        }));

        return {
          sku: generateVariantSKU(formData.name,
            Object.fromEntries(optionValues.map(ov => [ov.typeName, ov.value]))
          ),
          priceAbsolute: formData.basePrice,
          stock: 10,
          optionValues
        };
      });

      setFormData(prev => ({ ...prev, optionTypes: newOptionTypes, variants }));
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: unknown) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const regenerateSKU = (index: number) => {
    const variant = formData.variants[index];
    const newSKU = generateVariantSKU(
      formData.name,
      Object.fromEntries(variant.optionValues.map(ov => [ov.typeName, ov.value]))
    );
    updateVariant(index, 'sku', newSKU);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/dashboard/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/products');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('An error occurred while updating the product');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-48"></div>
            <div className="h-5 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="space-y-6 mt-8">
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200 animate-pulse"></div>
            <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

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
                <Edit className="h-5 w-5 text-white" />
            </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Edit Product
              </h1>
            </div>
            <p className="text-gray-500 text-sm flex items-center space-x-2 ml-11">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Update product information and variants</span>
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

              <div className="space-y-2">
                <MarkdownEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  error={errors.description}
                  height={300}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Define product options like Size, Color, etc. Variants will be generated automatically.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {formData.optionTypes.map((type, typeIndex) => (
                <div key={type.id} className="border-2 border-gray-200 rounded-lg p-4 space-y-4 hover:border-blue-300 transition-colors duration-200">
                  <div className="flex items-center justify-between">
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOptionType(type.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {type.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex items-center gap-1">
                        <Input
                          placeholder={`Value ${valueIndex + 1}`}
                          value={value}
                          onChange={(e) => updateOptionValue(type.id, valueIndex, e.target.value)}
                          className="w-32 border-2 focus:border-blue-500 transition-all duration-200"
                        />
                        {type.values.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOptionValue(type.id, valueIndex)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {formData.optionTypes.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={generateVariantsFromOptions}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25 transition-all duration-200"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Variants from Options
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Variants */}
          {formData.variants.length > 0 && (
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
                  Configure pricing and stock for each variant. SKUs are auto-generated.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4 hover:border-blue-300 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Variant {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          {variant.optionValues.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {variant.optionValues.map((ov, ovIndex) => (
                                <Badge key={ovIndex} variant="secondary" className="text-xs bg-purple-50 text-purple-700 border-purple-200 font-medium">
                                  {ov.typeName}: {ov.value}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => regenerateSKU(index)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Regenerate SKU
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">SKU</Label>
                          <Input
                            value={variant.sku || ""}
                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                            placeholder="Auto-generated SKU"
                            className="font-mono text-sm border-2 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Price (IDR) *</Label>
                          <Input
                            type="number"
                            value={variant.priceAbsolute}
                            onChange={(e) => updateVariant(index, "priceAbsolute", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className={cn("border-2 focus:border-blue-500 transition-all duration-200", errors[`variant_${index}_price`] && "border-red-500")}
                          />
                          {errors[`variant_${index}_price`] && (
                            <p className="text-sm text-red-500">{errors[`variant_${index}_price`]}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Stock *</Label>
                          <Input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className={cn("border-2 focus:border-blue-500 transition-all duration-200", errors[`variant_${index}_stock`] && "border-red-500")}
                          />
                          {errors[`variant_${index}_stock`] && (
                            <p className="text-sm text-red-500">{errors[`variant_${index}_stock`]}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-gray-600">
                          Final Price: <span className="font-semibold text-green-600">{formatPrice(variant.priceAbsolute)}</span>
                        </div>
                        <div className="text-gray-600">
                          Stock: <span className={cn("font-semibold", variant.stock > 0 ? 'text-green-600' : 'text-red-600')}>
                            {variant.stock} {variant.stock > 0 ? 'available' : 'out of stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.variants && <p className="text-sm text-red-500">{errors.variants}</p>}
              </CardContent>
            </Card>
          )}

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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
