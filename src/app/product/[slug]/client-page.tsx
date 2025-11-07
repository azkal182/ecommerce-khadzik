"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Star,
  Package,
  Home,
  Store as StoreIcon,
  Sparkles,
  Heart,
  Share2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { useCart } from "@/contexts/cart-context";
import { applyStoreTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

interface VariantOptionValue {
  id: string;
  name: string;
  type: { id: string; name: string };
}

interface Variant {
  id: string;
  sku: string | null;
  priceAbsolute: number | null;
  priceDelta: number | null;
  stock: number;
  optionValues: VariantOptionValue[];
}

interface VariantOptionType {
  id: string;
  name: string;
  values: { id: string; name: string }[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  createdAt: Date;
  images: ProductImage[];
  categories: { category: Category }[];
  optionTypes: VariantOptionType[];
  variants: Variant[];
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  theme: {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    accent: string;
  } | null;
  isActive: boolean;
}

interface ProductDetailClientProps {
  product: Product & {
    store: Store;
  };
  relatedProducts: (Product & {
    images: ProductImage[];
  })[];
  storeSlug: string;
}

export default function ProductDetailClient({
  product,
  relatedProducts,
  storeSlug,
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart } = useCart();

  // Apply store theme
  useEffect(() => {
    applyStoreTheme(storeSlug);
  }, [storeSlug]);

  // Find variant based on selected options
  const selectedVariant = product.variants.find((variant: Variant) => {
    const variantOptionIds = variant.optionValues
      .map((ov: VariantOptionValue) => ov.id)
      .sort();
    const selectedOptionIds = Object.values(selectedOptions).sort();
    return (
      JSON.stringify(variantOptionIds) === JSON.stringify(selectedOptionIds)
    );
  });

  // Calculate final price
  const basePrice = selectedVariant?.priceAbsolute ?? product.basePrice;
  const finalPrice = selectedVariant?.priceDelta
    ? basePrice + selectedVariant.priceDelta
    : basePrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOptionSelect = (optionTypeId: string, optionValueId: string) => {
    setSelectedOptions((prev) => {
      const newOptions = {
        ...prev,
        [optionTypeId]: optionValueId,
      };

      // Check if this selection creates an invalid combination
      // If so, clear other options to allow free selection
      const hasValidVariant = product.variants.some((variant: Variant) => {
        if (variant.stock === 0) return false;

        const selectedOptionIds = Object.values(newOptions).sort();
        const variantOptionIds = variant.optionValues
          .map((ov: VariantOptionValue) => ov.id)
          .sort();

        return (
          JSON.stringify(selectedOptionIds) === JSON.stringify(variantOptionIds)
        );
      });

      // If no valid variant exists with current selection, allow user to continue selecting
      // but don't restrict them from changing their mind
      return newOptions;
    });
  };

  const getAvailableOptionsForType = (optionTypeId: string) => {
    const availableValues = new Set<string>();

    // If no options are selected, show all available values for this type
    if (Object.keys(selectedOptions).length === 0) {
      product.variants.forEach((variant: Variant) => {
        if (variant.stock > 0) {
          variant.optionValues
            .filter((ov: VariantOptionValue) => ov.type.id === optionTypeId)
            .forEach((ov: VariantOptionValue) => availableValues.add(ov.id));
        }
      });
      return Array.from(availableValues);
    }

    // If options are selected, check combinations more flexibly
    product.variants.forEach((variant: Variant) => {
      if (variant.stock === 0) return;

      const otherOptionsSelected = Object.entries(selectedOptions)
        .filter(([typeId]) => typeId !== optionTypeId)
        .map(([_, valueId]) => valueId);

      // If no other options are selected yet, show all values that have any variant with stock
      if (otherOptionsSelected.length === 0) {
        variant.optionValues
          .filter((ov: VariantOptionValue) => ov.type.id === optionTypeId)
          .forEach((ov: VariantOptionValue) => availableValues.add(ov.id));
      } else {
        // Check if this variant has the selected options for other types
        const hasCompatibleOptions = otherOptionsSelected.every((valueId) =>
          variant.optionValues.some(
            (ov: VariantOptionValue) => ov.id === valueId
          )
        );

        if (hasCompatibleOptions) {
          variant.optionValues
            .filter((ov: VariantOptionValue) => ov.type.id === optionTypeId)
            .forEach((ov: VariantOptionValue) => availableValues.add(ov.id));
        }
      }
    });

    return Array.from(availableValues);
  };

  const getOptionAvailability = (
    optionTypeId: string,
    optionValueId: string
  ) => {
    const availableOptions = getAvailableOptionsForType(optionTypeId);
    return availableOptions.includes(optionValueId);
  };

  const handleAddToCart = () => {
    // Check if product has variants but no variant is selected
    if (product.optionTypes.length > 0 && !selectedVariant) {
      alert(
        "Silakan pilih semua pilihan variant terlebih dahulu sebelum menambah ke keranjang."
      );
      return;
    }

    // For products without variants, find first available variant with stock
    let variantToAdd = selectedVariant;

    if (!variantToAdd) {
      // For products without variants, find first variant with stock
      const availableVariant = product.variants.find(
        (v: Variant) => v.stock > 0
      );
      if (!availableVariant) {
        alert("Maaf, semua variant untuk produk ini sedang habis.");
        return;
      }
      variantToAdd = availableVariant;
    }

    // Check if selected variant has stock
    if (variantToAdd.stock <= 0) {
      alert(
        "Maaf, variant yang dipilih sedang habis. Silakan pilih variant lain."
      );
      return;
    }

    // Check if quantity is valid
    if (quantity > variantToAdd.stock) {
      alert(
        `Maaf, stok tidak mencukupi. Tersedia hanya ${variantToAdd.stock} unit.`
      );
      return;
    }

    addToCart(product.id, variantToAdd.id, quantity, {
      id: product.id,
      slug: product.slug,
      name: product.name,
      basePrice: product.basePrice,
      images: product.images,
      store: product.store,
      variants: product.variants.map((v: Variant) => ({
        id: v.id,
        sku: v.sku || `SKU-${v.id}`,
        priceAbsolute: v.priceAbsolute ?? undefined,
        priceDelta: v.priceDelta ?? undefined,
      })),
    });
  };

  const inStock = selectedVariant
    ? selectedVariant.stock > 0
    : product.variants.some((v: Variant) => v.stock > 0);

  const storeTheme = (product.store.theme as {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    accent: string;
  }) || {
    primary: "#3b82f6",
    secondary: "#1d4ed8",
    bg: "#ffffff",
    fg: "#111827",
    accent: "#f59e0b",
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link
              href="/"
              className="hover:text-gray-900 transition-colors flex items-center space-x-1"
            >
              <Home className="h-4 w-4" />
              <span>Beranda</span>
            </Link>
            <span>/</span>
            <Link
              href={`/store/${product.store.slug}`}
              className="hover:text-gray-900 transition-colors flex items-center space-x-1"
            >
              <StoreIcon className="h-4 w-4" />
              <span>{product.store.name}</span>
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-gray-100 group">
                  {product.images[selectedImageIndex] ? (
                    <Image
                      src={product.images[selectedImageIndex].url}
                      alt={
                        product.images[selectedImageIndex].alt || product.name
                      }
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Package className="h-24 w-24 text-gray-400" />
                    </div>
                  )}
                </div>
              </Card>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image: ProductImage, index: number) => (
                    <button
                      key={image.id}
                      className={cn(
                        "aspect-square relative overflow-hidden rounded-lg border-2 transition-all duration-200 group",
                        selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-200 shadow-md scale-105"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                      )}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-blue-500/10"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                      {product.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                        <span className="text-xs font-medium text-gray-600">
                          4.8
                        </span>
                        <span className="text-xs text-gray-500">(120+)</span>
                      </div>
                      <Link href={`/store/${product.store.slug}`}>
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer text-xs">
                          <StoreIcon className="h-3 w-3 mr-1" />
                          {product.store.name}
                        </Badge>
                      </Link>
                      {product.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {product.categories.map(
                            ({ category }: { category: Category }) => (
                              <Badge
                                key={category.id}
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 border-gray-200 text-xs"
                              >
                                {category.name}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                    {formatPrice(finalPrice)}
                  </div>
                  {selectedVariant && selectedVariant.priceDelta && (
                    <p className="text-xs text-gray-500">
                      Harga dasar: {formatPrice(product.basePrice)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {inStock ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold px-2 py-0.5 text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Tersedia
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="font-semibold px-2 py-0.5 text-xs"
                    >
                      Habis
                    </Badge>
                  )}
                  {selectedVariant && (
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-2 py-0.5 text-xs">
                      Stok: {selectedVariant.stock}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Variant Selection */}
              {product.optionTypes.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Pilih Variant
                      </h3>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {Object.keys(selectedOptions).length} /{" "}
                        {product.optionTypes.length}
                      </Badge>
                    </div>
                    {Object.keys(selectedOptions).length > 0 &&
                      !selectedVariant && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                          <p className="text-xs text-amber-800">
                            ⚠️ Lengkapi semua pilihan (
                            {product.optionTypes.length -
                              Object.keys(selectedOptions).length}{" "}
                            tersisa)
                          </p>
                        </div>
                      )}
                    {Object.keys(selectedOptions).length === 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                        <p className="text-xs text-blue-800">
                          📝 Pilih semua variant untuk melihat harga
                        </p>
                      </div>
                    )}
                    {product.optionTypes.map(
                      (optionType: VariantOptionType) => (
                        <div key={optionType.id}>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            {optionType.name}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {optionType.values.map(
                              (value: { id: string; name: string }) => {
                                const isSelected =
                                  selectedOptions[optionType.id] === value.id;
                                const isAvailable = getOptionAvailability(
                                  optionType.id,
                                  value.id
                                );

                                const wouldLeadToValidVariant =
                                  product.variants.some((variant: Variant) => {
                                    if (variant.stock === 0) return false;
                                    const prospectiveOptions = {
                                      ...selectedOptions,
                                      [optionType.id]: value.id,
                                    };
                                    const selectedOptionIds =
                                      Object.values(prospectiveOptions).sort();
                                    const variantOptionIds =
                                      variant.optionValues
                                        .map((ov: VariantOptionValue) => ov.id)
                                        .sort();
                                    return (
                                      JSON.stringify(selectedOptionIds) ===
                                      JSON.stringify(variantOptionIds)
                                    );
                                  });

                                return (
                                  <button
                                    key={value.id}
                                    className={cn(
                                      "px-3 py-1.5 border-2 rounded-lg text-xs font-semibold transition-all duration-200",
                                      isSelected
                                        ? "border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-105"
                                        : isAvailable
                                        ? "border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 hover:shadow-sm"
                                        : wouldLeadToValidVariant
                                        ? "border-gray-300 hover:border-amber-400 text-gray-600 hover:text-gray-800 hover:bg-amber-50"
                                        : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                                    )}
                                    onClick={() =>
                                      (isAvailable ||
                                        wouldLeadToValidVariant) &&
                                      handleOptionSelect(
                                        optionType.id,
                                        value.id
                                      )
                                    }
                                    disabled={
                                      !(isAvailable || wouldLeadToValidVariant)
                                    }
                                    title={
                                      !isAvailable && !wouldLeadToValidVariant
                                        ? "Tidak tersedia"
                                        : !isAvailable &&
                                          wouldLeadToValidVariant
                                        ? "Pilih opsi lain terlebih dahulu"
                                        : value.name
                                    }
                                  >
                                    {value.name}
                                    {!isAvailable &&
                                      wouldLeadToValidVariant && (
                                        <span className="ml-1 text-xs">⚠️</span>
                                      )}
                                  </button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Reset Selection Button & Selected Variant Info */}
              <div className="flex items-center justify-between gap-3">
                {Object.keys(selectedOptions).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOptions({})}
                    className="text-xs text-gray-500 hover:text-gray-700 h-7"
                  >
                    Reset
                  </Button>
                )}
                {selectedVariant && (
                  <div className="flex-1 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Check className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-900">
                        Variant Terpilih
                      </span>
                      <span className="text-xs text-blue-700 font-mono">
                        SKU: {selectedVariant.sku || "N/A"}
                      </span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold text-xs px-2 py-0.5">
                      Stok: {selectedVariant.stock}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Jumlah
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-9 w-9 p-0 border-2 hover:bg-gray-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        type="number"
                        min="1"
                        max={selectedVariant?.stock || 1}
                        value={quantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          const max = selectedVariant?.stock || 1;
                          setQuantity(Math.min(max, Math.max(1, value)));
                        }}
                        className="w-20 text-center border-2 border-gray-300 rounded-lg px-2 py-1.5 font-semibold text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const max = selectedVariant?.stock || 1;
                          setQuantity(Math.min(quantity + 1, max));
                        }}
                        disabled={quantity >= (selectedVariant?.stock || 1)}
                        className="h-9 w-9 p-0 border-2 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {selectedVariant && (
                        <span className="text-xs text-gray-500 ml-1">
                          (Maks: {selectedVariant.stock})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Variant Selection Warning */}
                  {product.optionTypes.length > 0 && !selectedVariant && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                      <div className="flex items-start">
                        <span className="text-amber-600 mr-2 text-sm">⚠️</span>
                        <div className="text-xs text-amber-800">
                          <span className="font-semibold block">
                            Pilih variant terlebih dahulu
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Out of Stock Warning */}
                  {selectedVariant && selectedVariant.stock <= 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                      <div className="flex items-start">
                        <span className="text-red-600 mr-2 text-sm">❌</span>
                        <div className="text-xs text-red-800">
                          <span className="font-semibold block">
                            Variant habis
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Insufficient Stock Warning */}
                  {selectedVariant &&
                    selectedVariant.stock > 0 &&
                    quantity > selectedVariant.stock && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5">
                        <div className="flex items-start">
                          <span className="text-orange-600 mr-2 text-sm">
                            ⚠️
                          </span>
                          <div className="text-xs text-orange-800">
                            <span className="font-semibold block">
                              Stok tidak mencukupi
                            </span>
                            <p className="text-xs mt-0.5">
                              Tersedia hanya {selectedVariant.stock} unit
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold py-5 text-base"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={
                      (product.optionTypes.length > 0 && !selectedVariant) ||
                      !inStock ||
                      (selectedVariant && selectedVariant.stock <= 0) ||
                      quantity > (selectedVariant?.stock || 0)
                    }
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.optionTypes.length > 0 && !selectedVariant
                      ? "Pilih Variant Terlebih Dahulu"
                      : selectedVariant && selectedVariant.stock <= 0
                      ? "Variant Habis"
                      : selectedVariant && quantity > selectedVariant.stock
                      ? "Stok Tidak Mencukupi"
                      : selectedVariant &&
                        isInCart(product.id, selectedVariant.id)
                      ? "Perbarui Keranjang"
                      : !inStock
                      ? "Stok Habis"
                      : "Tambah ke Keranjang"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mt-8 lg:col-span-2">
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Deskripsi Produk
                  </h2>
                  <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
                    <MarkdownRenderer content={product.description} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 py-12 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2 mb-8">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Produk Terkait
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card
                    key={relatedProduct.id}
                    className="group border-0 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {relatedProduct.images[0] ? (
                        <Image
                          src={relatedProduct.images[0].url}
                          alt={
                            relatedProduct.images[0].alt || relatedProduct.name
                          }
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        {formatPrice(relatedProduct.basePrice)}
                      </div>
                      <Link href={`/product/${relatedProduct.slug}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-2 hover:bg-gray-50 font-semibold"
                        >
                          Lihat Detail
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
