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
        variant="outline"
        size="sm"
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            setIsOpen(true);
          }
        }}
        className="relative"
      >
        <ShoppingCart className="h-5 w-5" />
        {cart.totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {cart.totalItems > 99 ? "99+" : cart.totalItems}
          </Badge>
        )}
      </Button>

      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}