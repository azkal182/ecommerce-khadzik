"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Store,
  ChevronRight
} from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import type { CartStore, CartItem } from "@/lib/cart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, clearStoreCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = (store: CartStore) => {
    // This will navigate to WhatsApp checkout for this specific store
    const checkoutData = {
      storeId: store.id,
      storeName: store.name,
      items: store.items.map(item => ({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: store.subtotal
    };

    // For now, just log the data. We'll implement the WhatsApp checkout next
    console.log("Checkout data:", checkoutData);
    alert(`Checkout for ${store.name} will be implemented with WhatsApp integration!`);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            {cart.totalItems > 0 && (
              <Badge variant="secondary">{cart.totalItems} items</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {cart.stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ShoppingCart className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add some products to get started!</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {cart.stores.map((store) => (
                <StoreCartSection
                  key={store.id}
                  store={store}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onClearStore={clearStoreCart}
                  onCheckout={handleCheckout}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total */}
        {cart.stores.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total ({cart.totalItems} items)</span>
              <span>{formatPrice(cart.totalAmount)}</span>
            </div>
            <p className="text-sm text-gray-500">
              {cart.stores.length === 1
                ? "Ready to checkout"
                : `Checkout separately for each store (${cart.stores.length} stores)`
              }
            </p>
          </div>
        )}
      </div>
    </>
  );
}

interface StoreCartSectionProps {
  store: CartStore;
  onUpdateQuantity: (storeId: string, itemId: string, quantity: number) => void;
  onRemoveItem: (storeId: string, itemId: string) => void;
  onClearStore: (storeId: string) => void;
  onCheckout: (store: CartStore) => void;
  formatPrice: (price: number) => string;
}

function StoreCartSection({
  store,
  onUpdateQuantity,
  onRemoveItem,
  onClearStore,
  onCheckout,
  formatPrice
}: StoreCartSectionProps) {
  return (
    <Card>
      <CardContent className="p-4">
        {/* Store Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Store className="h-5 w-5 text-primary" />
            <Link
              href={`/store/${store.slug}`}
              className="font-medium text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {store.name}
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{store.items.length} items</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearStore(store.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Store Items */}
        <div className="space-y-4 mb-4">
          {store.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={(quantity) => onUpdateQuantity(store.id, item.id, quantity)}
              onRemove={() => onRemoveItem(store.id, item.id)}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        <Separator className="my-4" />

        {/* Store Subtotal and Checkout */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="font-semibold">{formatPrice(store.subtotal)}</p>
          </div>
          <Button
            onClick={() => onCheckout(store)}
            className="flex items-center space-x-2"
          >
            <span>Checkout</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
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
    <div className="flex items-center space-x-4">
      {/* Product Image */}
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
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
          className="font-medium text-sm hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {item.name}
        </Link>
        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
        <p className="text-sm font-semibold text-primary">{formatPrice(item.price)}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
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