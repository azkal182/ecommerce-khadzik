"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { useCart } from "@/contexts/cart-context";
import { applyStoreTheme } from "@/lib/theme";
import type { Product, Store, ProductImage, Category, VariantOptionType, Variant } from "@prisma/client";

interface ProductDetailClientProps {
  product: Product & {
    store: Store;
    images: ProductImage[];
    categories: { category: Category }[];
    optionTypes: (VariantOptionType & {
      values: { id: string; name: string }[];
    })[];
    variants: (Variant & {
      optionValues: {
        id: string;
        name: string;
        type: { id: string; name: string };
      }[];
    })[];
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart } = useCart();

  // Apply store theme
  useEffect(() => {
    applyStoreTheme(storeSlug);
  }, [storeSlug]);

  // Find variant based on selected options
  const selectedVariant = product.variants.find(variant => {
    const variantOptionIds = variant.optionValues.map(ov => ov.id).sort();
    const selectedOptionIds = Object.values(selectedOptions).sort();
    return JSON.stringify(variantOptionIds) === JSON.stringify(selectedOptionIds);
  });

  // Calculate final price
  const basePrice = selectedVariant?.priceAbsolute ?? product.basePrice;
  const finalPrice = selectedVariant?.priceDelta ? basePrice + selectedVariant.priceDelta : basePrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOptionSelect = (optionTypeId: string, optionValueId: string) => {
    setSelectedOptions(prev => {
      const newOptions = {
        ...prev,
        [optionTypeId]: optionValueId,
      };

      // Check if this selection creates an invalid combination
      // If so, clear other options to allow free selection
      const hasValidVariant = product.variants.some(variant => {
        if (variant.stock === 0) return false;

        const selectedOptionIds = Object.values(newOptions).sort();
        const variantOptionIds = variant.optionValues.map(ov => ov.id).sort();

        return JSON.stringify(selectedOptionIds) === JSON.stringify(variantOptionIds);
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
      product.variants.forEach(variant => {
        if (variant.stock > 0) {
          variant.optionValues
            .filter(ov => ov.type.id === optionTypeId)
            .forEach(ov => availableValues.add(ov.id));
        }
      });
      return Array.from(availableValues);
    }

    // If options are selected, check combinations more flexibly
    product.variants.forEach(variant => {
      if (variant.stock === 0) return;

      const otherOptionsSelected = Object.entries(selectedOptions)
        .filter(([typeId]) => typeId !== optionTypeId)
        .map(([_, valueId]) => valueId);

      // If no other options are selected yet, show all values that have any variant with stock
      if (otherOptionsSelected.length === 0) {
        variant.optionValues
          .filter(ov => ov.type.id === optionTypeId)
          .forEach(ov => availableValues.add(ov.id));
      } else {
        // Check if this variant has the selected options for other types
        const hasCompatibleOptions = otherOptionsSelected.every(valueId =>
          variant.optionValues.some(ov => ov.id === valueId)
        );

        if (hasCompatibleOptions) {
          variant.optionValues
            .filter(ov => ov.type.id === optionTypeId)
            .forEach(ov => availableValues.add(ov.id));
        }
      }
    });

    return Array.from(availableValues);
  };

  const getOptionAvailability = (optionTypeId: string, optionValueId: string) => {
    const availableOptions = getAvailableOptionsForType(optionTypeId);
    return availableOptions.includes(optionValueId);
  };

  const handleAddToCart = () => {
    // Check if product has variants but no variant is selected
    if (product.optionTypes.length > 0 && !selectedVariant) {
      alert("Silakan pilih semua pilihan variant terlebih dahulu sebelum menambah ke keranjang.");
      return;
    }

    // For products without variants, find first available variant with stock
    let variantToAdd = selectedVariant;

    if (!variantToAdd) {
      // For products without variants, find first variant with stock
      const availableVariant = product.variants.find(v => v.stock > 0);
      if (!availableVariant) {
        alert("Maaf, semua variant untuk produk ini sedang habis.");
        return;
      }
      variantToAdd = availableVariant;
    }

    // Check if selected variant has stock
    if (variantToAdd.stock <= 0) {
      alert("Maaf, variant yang dipilih sedang habis. Silakan pilih variant lain.");
      return;
    }

    // Check if quantity is valid
    if (quantity > variantToAdd.stock) {
      alert(`Maaf, stok tidak mencukupi. Tersedia hanya ${variantToAdd.stock} unit.`);
      return;
    }

    addToCart(
      product.id,
      variantToAdd.id,
      quantity,
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        basePrice: product.basePrice,
        images: product.images,
        store: product.store,
        variants: product.variants.map(v => ({
          id: v.id,
          sku: v.sku || `SKU-${v.id}`,
          priceAbsolute: v.priceAbsolute,
          priceDelta: v.priceDelta || undefined
        }))
      }
    );
  };

  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.variants.some(v => v.stock > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span>/</span>
            <Link href={`/store/${product.store.slug}`} className="hover:text-gray-700">
              {product.store.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg">
              {product.images[selectedImageIndex] ? (
                <Image
                  src={product.images[selectedImageIndex].url}
                  alt={product.images[selectedImageIndex].alt || product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`aspect-square relative overflow-hidden rounded border-2 transition-colors ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-gray-500">
                  Sold by {product.store.name}
                </span>
                {inStock ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-primary mb-4">
                {formatPrice(finalPrice)}
              </div>
              {product.description && (
                <div className="mb-6 prose prose-sm sm:prose-base max-w-none text-gray-600">
                  <MarkdownRenderer
                    content={product.description}
                  />
                </div>
              )}
            </div>

            {/* Categories */}
            {product.categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map(({ category }) => (
                    <Badge key={category.id} variant="outline">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selection */}
            {product.optionTypes.length > 0 && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Pilih Variant</h3>
                    <span className="text-xs text-gray-500">
                      {Object.keys(selectedOptions).length} / {product.optionTypes.length} dipilih
                    </span>
                  </div>
                  {Object.keys(selectedOptions).length > 0 && !selectedVariant && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Silakan lengkapi semua pilihan variant ({product.optionTypes.length - Object.keys(selectedOptions).length} tersisa)
                    </p>
                  )}
                  {Object.keys(selectedOptions).length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      📝 Pilih semua variant untuk melihat harga dan menambah ke keranjang
                    </p>
                  )}
                </div>
                {product.optionTypes.map((optionType) => (
                  <div key={optionType.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {optionType.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {optionType.values.map((value) => {
                        const isSelected = selectedOptions[optionType.id] === value.id;
                        const isAvailable = getOptionAvailability(optionType.id, value.id);

                        // Check if selecting this value would lead to any valid variant
                        const wouldLeadToValidVariant = product.variants.some(variant => {
                          if (variant.stock === 0) return false;

                          const prospectiveOptions = {
                            ...selectedOptions,
                            [optionType.id]: value.id
                          };

                          const selectedOptionIds = Object.values(prospectiveOptions).sort();
                          const variantOptionIds = variant.optionValues.map(ov => ov.id).sort();

                          return JSON.stringify(selectedOptionIds) === JSON.stringify(variantOptionIds);
                        });

                        return (
                          <button
                            key={value.id}
                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-white scale-105 shadow-md"
                                : isAvailable
                                ? "border-gray-300 hover:border-gray-400 hover:scale-105 hover:shadow-sm"
                                : wouldLeadToValidVariant
                                ? "border-gray-300 hover:border-yellow-400 text-gray-600 hover:text-gray-800"
                                : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                            }`}
                            onClick={() => (isAvailable || wouldLeadToValidVariant) && handleOptionSelect(optionType.id, value.id)}
                            disabled={!(isAvailable || wouldLeadToValidVariant)}
                            title={!isAvailable && !wouldLeadToValidVariant ? "Tidak tersedia" :
                                   !isAvailable && wouldLeadToValidVariant ? "Pilih opsi lain terlebih dahulu" : value.name}
                          >
                            {value.name}
                            {!isAvailable && wouldLeadToValidVariant && (
                              <span className="ml-1 text-xs">⚠️</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reset Selection Button */}
            {Object.keys(selectedOptions).length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedOptions({})}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Reset pilihan variant
                </button>
              </div>
            )}

            {/* Selected Variant Info */}
            {selectedVariant && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-900">Selected Variant</span>
                    <div className="text-sm text-blue-700">
                      SKU: {selectedVariant.sku}
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">
                    Stock: {selectedVariant.stock}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
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
                    className="w-20 text-center border rounded-md px-3 py-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity((selectedVariant?.stock || quantity) + 1)}
                    disabled={quantity >= (selectedVariant?.stock || 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Variant Selection Warning */}
              {product.optionTypes.length > 0 && !selectedVariant && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                  <div className="flex items-center">
                    <div className="text-amber-600 mr-2">
                      ⚠️
                    </div>
                    <div className="text-sm text-amber-800">
                      <span className="font-medium">Pilih variant terlebih dahulu</span>
                      <p className="text-xs mt-1">Silakan pilih semua pilihan variant yang tersedia</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Out of Stock Warning */}
              {selectedVariant && selectedVariant.stock <= 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-2">
                      ❌
                    </div>
                    <div className="text-sm text-red-800">
                      <span className="font-medium">Variant habis</span>
                      <p className="text-xs mt-1">Silakan pilih variant lain yang tersedia</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Insufficient Stock Warning */}
              {selectedVariant && selectedVariant.stock > 0 && quantity > selectedVariant.stock && (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4">
                  <div className="flex items-center">
                    <div className="text-orange-600 mr-2">
                      ⚠️
                    </div>
                    <div className="text-sm text-orange-800">
                      <span className="font-medium">Stok tidak mencukupi</span>
                      <p className="text-xs mt-1">Tersedia hanya {selectedVariant.stock} unit</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  (product.optionTypes.length > 0 && !selectedVariant) ||
                  !inStock ||
                  (selectedVariant && selectedVariant.stock <= 0) ||
                  quantity > (selectedVariant?.stock || 0)
                }
                variant={
                  product.optionTypes.length > 0 && !selectedVariant ?
                    "secondary" :
                    "default"
                }
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.optionTypes.length > 0 && !selectedVariant ?
                  "Pilih Variant Terlebih Dahulu" :
                  selectedVariant && selectedVariant.stock <= 0 ?
                    "Variant Habis" :
                  selectedVariant && quantity > selectedVariant.stock ?
                    "Stok Tidak Mencukupi" :
                  selectedVariant && isInCart(product.id, selectedVariant.id) ?
                    "Perbarui Keranjang" :
                    !inStock ?
                      "Stok Habis" :
                      "Tambah ke Keranjang"
                }
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produk Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    {relatedProduct.images[0] ? (
                      <Image
                        src={relatedProduct.images[0].url}
                        alt={relatedProduct.images[0].alt || relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="text-lg font-bold text-primary mb-3">
                      {formatPrice(relatedProduct.basePrice)}
                    </div>
                    <Link href={`/product/${relatedProduct.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Lihat Detail
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}