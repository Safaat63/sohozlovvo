"use client";

import { useRef, useState, useTransition, type ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { addToCart, updateCartItem, removeFromCart } from "@/actions/cart";
import {
  formatCurrency,
  useCurrencySymbol,
} from "@/components/providers/currency-provider";
import { trackAddToCart } from "@/lib/ga4";

type CartItem = {
  id: string;
  quantity: number;
  combinationId?: string | null;
  combinationLabel?: string | null;
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
};

type Cart = {
  id: string;
  items: CartItem[];
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
};

interface SideCartProps {
  cart: Cart | null;
  itemCount: number;
  relatedProducts?: RelatedProduct[];
  triggerClassName?: string;
  triggerLabel?: string;
  triggerLabelClassName?: string;
  badgeClassName?: string;
  triggerNode?: ReactElement;
}

export function SideCart({
  cart,
  itemCount,
  relatedProducts = [],
  triggerClassName,
  triggerLabel,
  triggerLabelClassName,
  badgeClassName,
  triggerNode,
}: SideCartProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [addingRelatedId, setAddingRelatedId] = useState<string | null>(null);
  const currency = useCurrencySymbol();
  const relatedScrollerRef = useRef<HTMLDivElement | null>(null);

  const items = cart?.items || [];

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.itemPrice);
    return sum + price * item.quantity;
  }, 0);

  const scrollRelated = (direction: "left" | "right") => {
    if (!relatedScrollerRef.current) return;
    const amount = relatedScrollerRef.current.clientWidth * 0.8;
    relatedScrollerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleAddRelated = (productId: string) => {
    setAddingRelatedId(productId);
    startTransition(async () => {
      const result = await addToCart(productId, 1);
      const related = relatedProducts.find((item) => item.id === productId);
      if (!result?.error && related) {
        trackAddToCart({
          item_id: related.id,
          item_name: related.name,
          price: related.price,
          quantity: 1,
        });
      }
      setAddingRelatedId(null);
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setUpdatingItem(itemId);
    startTransition(async () => {
      await updateCartItem(itemId, newQuantity);
      setUpdatingItem(null);
    });
  };

  const handleRemove = (itemId: string) => {
    setUpdatingItem(itemId);
    startTransition(async () => {
      await removeFromCart(itemId);
      setUpdatingItem(null);
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {triggerNode ? (
          triggerNode
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 cursor-pointer group">
            <button
              className={`relative flex items-center justify-center transition-all duration-200 ${triggerClassName ?? "text-foreground hover:text-primary"}`}
              style={{ width: "24px", height: "24px" }}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full shadow-sm ${badgeClassName ?? "bg-primary text-primary-foreground"}`}
                >
                  {itemCount}
                </span>
              )}
            </button>
            {triggerLabel ? (
              <span
                className={`text-[11px] font-medium leading-tight ${triggerLabelClassName ?? "text-foreground"}`}
              >
                {triggerLabel}
              </span>
            ) : null}
          </div>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col border-l border-border px-4 sm:px-6 bg-background text-foreground h-full inset-y-0 top-0 bottom-0 rounded-none w-full max-w-none sm:max-w-sm sm:inset-y-0">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold tracking-wide text-foreground">
              SHOPPING CART
            </SheetTitle>
            <button
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setOpen(false)}
            >
              Close
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="p-6 bg-muted rounded-full mb-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">
              Your bag is empty
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add some products to get started
            </p>
            <Button
              asChild
              onClick={() => setOpen(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 border border-border rounded-xl shadow-sm bg-card relative"
                  >
                    {updatingItem === item.id && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-xl">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    )}
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0 relative border border-border">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-semibold text-sm text-foreground hover:underline line-clamp-1"
                        onClick={() => setOpen(false)}
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex items-center gap-2 text-sm mt-1 text-muted-foreground">
                        <div className="flex items-center rounded-lg border border-border bg-background">
                          <button
                            className="h-7 w-7 flex items-center justify-center text-base text-foreground"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={isPending || item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-7 w-8 flex items-center justify-center text-sm text-foreground border-l border-r border-border">
                            {item.quantity}
                          </span>
                          <button
                            className="h-7 w-7 flex items-center justify-center text-base text-foreground"
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              isPending || item.quantity >= item.itemStock
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span aria-hidden="true">&times;</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(parseFloat(item.itemPrice), currency)}
                        </span>
                        <span aria-hidden="true">=</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(
                            parseFloat(item.itemPrice) * item.quantity,
                            currency,
                          )}
                        </span>
                      </div>
                      {item.combinationLabel && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.combinationLabel}
                        </p>
                      )}
                    </div>
                    <button
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemove(item.id)}
                      disabled={isPending}
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      You May Also Like
                    </h3>
                    <span className="inline-block w-12 h-0.5 bg-primary mt-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 rounded-full border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => scrollRelated("left")}
                      aria-label="Scroll left"
                    >
                      &lsaquo;
                    </button>
                    <button
                      className="h-8 w-8 rounded-full border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => scrollRelated("right")}
                      aria-label="Scroll right"
                    >
                      &rsaquo;
                    </button>
                  </div>
                </div>
                <div
                  ref={relatedScrollerRef}
                  className="mt-2 flex gap-3 overflow-x-auto pb-1 scroll-smooth"
                >
                  {relatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="min-w-52.5 max-w-55 border border-border rounded-xl p-2 bg-card flex items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-lg border border-border bg-background relative overflow-hidden shrink-0">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                          {product.name}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(product.price, currency)}
                          </span>
                          <button
                            className="h-7 px-3 rounded-full border border-primary text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
                            onClick={() => handleAddRelated(product.id)}
                            disabled={
                              isPending || addingRelatedId === product.id
                            }
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <SheetFooter className="border-t border-border pt-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <Button
                  asChild
                  className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setOpen(false)}
                >
                  <Link href="/checkout">CHECKOUT</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
