"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Cart, CartItem, CartStore, CartContextType } from '@/lib/cart';
import { getInitialCart, saveCart, calculateCartTotals, calculateStoreSubtotal } from '@/lib/cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ stores: [], totalItems: 0, totalAmount: 0 });

  // Load cart from localStorage on mount
  useEffect(() => {
    const initialCart = getInitialCart();
    setCart(initialCart);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (
    productId: string,
    variantId: string,
    quantity: number,
    product: {
      id: string;
      slug: string;
      name: string;
      basePrice: number;
      images: { url: string | null }[];
      store: { id: string; name: string; slug: string };
      variants: { id: string; sku: string; priceAbsolute?: number; priceDelta?: number }[];
    }
  ) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };

      // Find the variant to get its price
      const variant = product.variants.find(v => v.id === variantId);
      if (!variant) return prevCart;

      const price = variant.priceAbsolute ?? product.basePrice + (variant.priceDelta ?? 0);

      // Find or create the store in cart
      let storeIndex = newCart.stores.findIndex(s => s.id === product.store.id);
      if (storeIndex === -1) {
        const newStore: CartStore = {
          id: product.store.id,
          name: product.store.name,
          slug: product.store.slug,
          items: [],
          subtotal: 0
        };
        newCart.stores.push(newStore);
        storeIndex = newCart.stores.length - 1;
      }

      const store = newCart.stores[storeIndex];

      // Find or create the item in store
      const itemIndex = store.items.findIndex(
        item => item.productId === productId && item.variantId === variantId
      );

      if (itemIndex === -1) {
        // Add new item
        const newItem: CartItem = {
          id: `${productId}-${variantId}`,
          productId,
          variantId,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.url || null,
          sku: variant.sku,
          quantity,
          price,
          storeId: product.store.id,
          storeName: product.store.name,
          storeSlug: product.store.slug,
        };
        store.items.push(newItem);
      } else {
        // Update existing item quantity
        store.items[itemIndex].quantity += quantity;
      }

      // Recalculate store subtotal
      store.subtotal = calculateStoreSubtotal(store.items);

      // Recalculate cart totals
      const { totalItems, totalAmount } = calculateCartTotals(newCart.stores);
      newCart.totalItems = totalItems;
      newCart.totalAmount = totalAmount;

      return newCart;
    });
  };

  const removeFromCart = (storeId: string, itemId: string) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      const storeIndex = newCart.stores.findIndex(s => s.id === storeId);

      if (storeIndex === -1) return prevCart;

      const store = newCart.stores[storeIndex];
      store.items = store.items.filter(item => item.id !== itemId);

      // Remove store if it has no items
      if (store.items.length === 0) {
        newCart.stores = newCart.stores.filter(s => s.id !== storeId);
      } else {
        // Recalculate store subtotal
        store.subtotal = calculateStoreSubtotal(store.items);
      }

      // Recalculate cart totals
      const { totalItems, totalAmount } = calculateCartTotals(newCart.stores);
      newCart.totalItems = totalItems;
      newCart.totalAmount = totalAmount;

      return newCart;
    });
  };

  const updateQuantity = (storeId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(storeId, itemId);
      return;
    }

    setCart(prevCart => {
      const newCart = { ...prevCart };
      const storeIndex = newCart.stores.findIndex(s => s.id === storeId);

      if (storeIndex === -1) return prevCart;

      const store = newCart.stores[storeIndex];
      const itemIndex = store.items.findIndex(item => item.id === itemId);

      if (itemIndex === -1) return prevCart;

      store.items[itemIndex].quantity = quantity;

      // Recalculate store subtotal
      store.subtotal = calculateStoreSubtotal(store.items);

      // Recalculate cart totals
      const { totalItems, totalAmount } = calculateCartTotals(newCart.stores);
      newCart.totalItems = totalItems;
      newCart.totalAmount = totalAmount;

      return newCart;
    });
  };

  const clearCart = () => {
    setCart({ stores: [], totalItems: 0, totalAmount: 0 });
  };

  const clearStoreCart = (storeId: string) => {
    setCart(prevCart => {
      const newCart = {
        ...prevCart,
        stores: prevCart.stores.filter(s => s.id !== storeId)
      };

      // Recalculate cart totals
      const { totalItems, totalAmount } = calculateCartTotals(newCart.stores);
      newCart.totalItems = totalItems;
      newCart.totalAmount = totalAmount;

      return newCart;
    });
  };

  const isInCart = (productId: string, variantId: string) => {
    return cart.stores.some(store =>
      store.items.some(item =>
        item.productId === productId && item.variantId === variantId
      )
    );
  };

  const getItemQuantity = (productId: string, variantId: string) => {
    for (const store of cart.stores) {
      const item = store.items.find(
        item => item.productId === productId && item.variantId === variantId
      );
      if (item) return item.quantity;
    }
    return 0;
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearStoreCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}