export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string | null;
  sku: string;
  quantity: number;
  price: number;
  storeId: string;
  storeName: string;
  storeSlug: string;
};

export type CartStore = {
  id: string;
  name: string;
  slug: string;
  items: CartItem[];
  subtotal: number;
};

export type Cart = {
  stores: CartStore[];
  totalItems: number;
  totalAmount: number;
};

export type CartContextType = {
  cart: Cart;
  addToCart: (
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
  ) => void;
  removeFromCart: (storeId: string, itemId: string) => void;
  updateQuantity: (storeId: string, itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearStoreCart: (storeId: string) => void;
  isInCart: (productId: string, variantId: string) => boolean;
  getItemQuantity: (productId: string, variantId: string) => number;
};

const CART_STORAGE_KEY = 'dual-store-cart';

export function getInitialCart(): Cart {
  if (typeof window === 'undefined') {
    return { stores: [], totalItems: 0, totalAmount: 0 };
  }

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      return JSON.parse(storedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }

  return { stores: [], totalItems: 0, totalAmount: 0 };
}

export function saveCart(cart: Cart): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

export function calculateCartTotals(stores: CartStore[]): { totalItems: number; totalAmount: number } {
  let totalItems = 0;
  let totalAmount = 0;

  stores.forEach(store => {
    store.items.forEach(item => {
      totalItems += item.quantity;
      totalAmount += item.price * item.quantity;
    });
  });

  return { totalItems, totalAmount };
}

export function calculateStoreSubtotal(items: CartItem[]): number {
  return items.reduce((subtotal, item) => subtotal + (item.price * item.quantity), 0);
}