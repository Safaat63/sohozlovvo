"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenu } from "@/components/navbar/mobile-menu";
import { SearchBar } from "@/components/navbar/search-bar";
import { SideCart } from "@/components/cart/side-cart";

type SessionUser = {
  name?: string;
  email?: string;
  role?: string;
} | null;

type Session = {
  user: SessionUser;
} | null;

type Category = {
  id: string;
  name: string;
  slug: string;
  children?: {
    id: string;
    name: string;
    slug: string;
  }[];
};

type Cart = {
  id: string;
  items: {
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
      categoryId?: string | null;
      images: string[];
      stock: number;
    };
  }[];
} | null;

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
};

interface MobileBottomBarProps {
  session: Session;
  categories: Category[];
  cart: Cart;
  itemCount: number;
  relatedProducts: RelatedProduct[];
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-white dark:text-black ${className || ""}`}
    >
      <path
        d="M9 3H5C3.89543 3 3 3.89543 3 5V9C3 10.1046 3.89543 11 5 11H9C10.1046 11 11 10.1046 11 9V5C11 3.89543 10.1046 3 9 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 3H15C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13H5C3.89543 13 3 13.8954 3 15V19C3 20.1046 3.89543 21 5 21H9C10.1046 21 11 20.1046 11 19V15C11 13.8954 10.1046 13 9 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 13H15C13.8954 13 13 13.8954 13 15V19C13 20.1046 13.8954 21 15 21H19C20.1046 21 21 20.1046 21 19V15C21 13.8954 20.1046 13 19 13Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MobileBottomBar({
  session,
  categories,
  cart,
  itemCount,
  relatedProducts,
}: MobileBottomBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-accent-foreground border-t border-border text-foreground font-sans z-50">
      <div className="grid grid-cols-5 items-center h-16">
        <Link
          href="/"
          className="flex flex-col items-center text-[11px] text-background hover:text-primary"
        >
          <Home className="h-5 w-5" />
          HOME
        </Link>
        <MobileMenu
          session={session ? { user: session.user } : null}
          categories={categories}
          triggerClassName="flex flex-col items-center text-[11px] text-background hover:text-primary"
          icon={<MenuIcon className="h-5 w-5" />}
        />
        <SideCart
          cart={cart}
          itemCount={itemCount}
          relatedProducts={relatedProducts}
          triggerLabel="Cart"
          triggerClassName="text-background hover:text-primary"
          triggerLabelClassName="text-background"
          badgeClassName="bg-foreground text-background"
        />
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex flex-col items-center text-[11px] text-background hover:text-primary"
            >
              <SearchIcon className="h-5 w-5" />
              SEARCH
            </button>
          </SheetTrigger>
          <SheetContent side="top" className="h-auto border-none bg-background">
            <div className="pt-6 pb-4 px-4">
              <SearchBar isMobile={true} />
            </div>
          </SheetContent>
        </Sheet>
        {session?.user ? (
          <Link
            href="/account"
            className="flex flex-col items-center text-[11px] text-background hover:text-primary"
          >
            <UserIcon className="h-5 w-5" />
            ACCOUNT
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="flex flex-col items-center text-[11px] text-background hover:text-primary"
          >
            <UserIcon className="h-5 w-5" />
            ACCOUNT
          </Link>
        )}
      </div>
    </div>
  );
}
