"use client";

import { ShoppingBag } from "lucide-react";
import { SideCart } from "@/components/cart/side-cart";
import {
  formatCurrency,
  useCurrencySymbol,
} from "@/components/providers/currency-provider";

type Cart = {
  id: string;
  items: {
    id: string;
    quantity: number;
    itemPrice: string;
    itemStock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: string;
      images: string[];
      stock: number;
    };
  }[];
};

interface FloatingCartProps {
  cart: Cart | null;
  itemCount: number;
}

function FloatingCart({ cart, itemCount }: FloatingCartProps) {
  const currency = useCurrencySymbol();

  const items = cart?.items || [];

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.itemPrice);
    return sum + price * item.quantity;
  }, 0);

  const triggerNode = (
    <button className="fixed top-[50%] right-0 p-0 rounded-none rounded-l-md flex flex-col w-15 md:w-[67.5px] h-20 md:h-22.5 shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors z-50">
      <div className="flex-1 w-full flex flex-col gap-1 items-center justify-center pt-2">
        <ShoppingBag className="size-6" />
        <p className="text-xs">{itemCount} Items</p>
      </div>
      <div className="flex items-center justify-center bg-background w-full py-1 rounded-bl-sm">
        <p className="text-xs md:text-sm font-semibold text-accent-foreground">
          ৳ {formatCurrency(subtotal, currency)}
        </p>
      </div>
    </button>
  );

  return (
    <SideCart
      cart={cart}
      itemCount={itemCount}
      triggerNode={triggerNode}
    />
  );
}

export default FloatingCart;
