"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import { useCart } from "@/contexts/cart-context";
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
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart } = useCart();

  // Apply store theme
  useState(() => {
    document.body.setAttribute("data-store", product.store.slug);
  });

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
    setSelectedOptions(prev => ({
      ...prev,
      [optionTypeId]: optionValueId,
    }));
  };

  const getAvailableOptionsForType = (optionTypeId: string) => {
    const availableValues = new Set<string>();

    product.variants.forEach(variant => {
      const otherOptionsSelected = Object.entries(selectedOptions)
        .filter(([typeId]) => typeId !== optionTypeId)
        .map(([_, valueId]) => valueId);

      const hasAllOtherOptions = otherOptionsSelected.every(valueId =>
        variant.optionValues.some(ov => ov.id === valueId)
      );

      if (hasAllOtherOptions || Object.keys(selectedOptions).length === 0) {
        variant.optionValues
          .filter(ov => ov.type.id === optionTypeId)
          .forEach(ov => availableValues.add(ov.id));
      }
    });

    return Array.from(availableValues);
  };

  const getOptionAvailability = (optionTypeId: string, optionValueId: string) => {
    const availableOptions = getAvailableOptionsForType(optionTypeId);
    return availableOptions.includes(optionValueId);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addToCart(
      product.id,
      selectedVariant.id,
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
                <p className="text-gray-600 mb-6">{product.description}</p>
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
                <h3 className="text-sm font-medium text-gray-700">Options</h3>
                {product.optionTypes.map((optionType) => (
                  <div key={optionType.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {optionType.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {optionType.values.map((value) => {
                        const isSelected = selectedOptions[optionType.id] === value.id;
                        const isAvailable = getOptionAvailability(optionType.id, value.id);

                        return (
                          <button
                            key={value.id}
                            className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-white"
                                : isAvailable
                                ? "border-gray-300 hover:border-gray-400"
                                : "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                            }`}
                            onClick={() => isAvailable && handleOptionSelect(optionType.id, value.id)}
                            disabled={!isAvailable}
                          >
                            {value.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
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

              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={!selectedVariant || !inStock || quantity > (selectedVariant?.stock || 0)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {selectedVariant && isInCart(product.id, selectedVariant.id) ? "Update Cart" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
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
                        View Details
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