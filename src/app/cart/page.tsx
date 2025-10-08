"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Store,
  ArrowLeft,
  MessageCircle,
  Check
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { useCart } from "@/contexts/cart-context";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import type { CartStore, CartItem } from "@/lib/cart";

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
  paymentMethod: "bank_transfer" | "dana" | "gopay";
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearStoreCart } = useCart();
  const [checkingOutStores, setCheckingOutStores] = useState<Set<string>>(new Set());
  const [checkoutStore, setCheckoutStore] = useState<CartStore | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleStartCheckout = (store: CartStore) => {
    setCheckoutStore(store);
  };

  const handleCancelCheckout = () => {
    setCheckoutStore(null);
  };

  const handleCheckoutSubmit = async (customerData: CustomerFormData) => {
    if (!checkoutStore) return;

    setCheckingOutStores(prev => new Set(prev).add(checkoutStore.id));

    try {
      const checkoutData = {
        storeId: checkoutStore.id,
        storeName: checkoutStore.name,
        items: checkoutStore.items.map(item => ({
          name: item.name,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: checkoutStore.subtotal,
        customer: customerData
      };

      // Call WhatsApp checkout API
      const response = await fetch('/api/checkout/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (response.ok) {
        const { whatsappUrl } = await response.json();
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');

        // Clear the cart for this store after successful checkout
        clearStoreCart(checkoutStore.id);
        setCheckoutStore(null);
      } else {
        alert('Failed to process checkout. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing checkout. Please try again.');
    } finally {
      setCheckingOutStores(prev => {
        const newSet = new Set(prev);
        newSet.delete(checkoutStore?.id || '');
        return newSet;
      });
    }
  };

  // Show checkout form if a store is selected for checkout
  if (checkoutStore) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleCancelCheckout}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Keranjang
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 mt-1">
              Selesaikan pesanan Anda dari {checkoutStore.name}
            </p>
          </div>

          <CheckoutForm
            store={checkoutStore}
            onSubmit={handleCheckoutSubmit}
            onCancel={handleCancelCheckout}
            isSubmitting={checkingOutStores.has(checkoutStore.id)}
          />
        </div>
      </div>
    );
  }

  if (cart.stores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Lanjut Belanja
            </Link>

            <div className="bg-white rounded-lg shadow-sm p-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Anda kosong</h1>
              <p className="text-gray-600 mb-8">
                Sepertinya Anda belum menambahkan produk ke keranjang belanja.
              </p>
              <Link href="/">
                <Button size="lg">
                  Mulai Belanja
                </Button>
              </Link>
            </div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Lanjut Belanja
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
            <p className="text-gray-600 mt-1">
              {cart.totalItems} produk • {cart.stores.length} toko
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.stores.map((store) => (
              <Card key={store.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Store Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Store className="h-5 w-5 text-primary" />
                      <div>
                        <Link
                          href={`/store/${store.slug}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {store.name}
                        </Link>
                        <p className="text-sm text-gray-500">{store.items.length} produk</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Subtotal:</span>
                      <span className="font-semibold">{formatPrice(store.subtotal)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearStoreCart(store.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Store Items */}
                  <div className="space-y-4">
                    {store.items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onUpdateQuantity={(quantity) => updateQuantity(store.id, item.id, quantity)}
                        onRemove={() => removeFromCart(store.id, item.id)}
                        formatPrice={formatPrice}
                      />
                    ))}
                  </div>

                  <Separator className="my-6" />

                  {/* Store Checkout */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Subtotal Toko</p>
                      <p className="text-xl font-bold">{formatPrice(store.subtotal)}</p>
                    </div>
                    <Button
                      onClick={() => handleStartCheckout(store)}
                      disabled={checkingOutStores.has(store.id)}
                      className="flex items-center space-x-2"
                    >
                      {checkingOutStores.has(store.id) ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          <span>Lanjut ke Checkout</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

                <div className="space-y-3 mb-6">
                  {cart.stores.map((store) => (
                    <div key={store.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{store.name}</span>
                      <span className="font-medium">{formatPrice(store.subtotal)}</span>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(cart.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Checkout aman via WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Checkout terpisah per toko</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Layanan pelanggan personal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  formatPrice: (price: number) => string;
}

function CartItemRow({ item, onUpdateQuantity, onRemove, formatPrice }: CartItemRowProps) {
  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      {/* Product Image */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-400">No img</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/product/${item.slug}`}
          className="font-medium text-gray-900 hover:text-primary transition-colors"
        >
          {item.name}
        </Link>
        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
        <div className="flex items-center space-x-4 mt-2">
          <p className="text-lg font-semibold text-primary">{formatPrice(item.price)}</p>
          <p className="text-sm text-gray-500">
            Subtotal: {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}