"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { CartDrawer } from "./cart-drawer";

interface CartButtonProps {
  onClick?: () => void;
}

export function CartButton({ onClick }: CartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            setIsOpen(true);
          }
        }}
        className="relative h-9 w-9 p-0 hover:bg-gray-100 transition-all duration-200"
      >
        <ShoppingCart className="h-5 w-5 text-gray-700" />
        {cart.totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold shadow-lg animate-pulse"
          >
            {cart.totalItems > 99 ? "99+" : cart.totalItems}
          </Badge>
        )}
      </Button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
