import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCart } from "@/actions/cart";
import { getWishlistCount } from "@/actions/wishlist";
import { getCategories } from "@/actions/products";
import { getUserAffiliate } from "@/actions/affiliates";
import { getRelatedProducts } from "@/actions/product-recommendations";
import { DollarSign, Home, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/navbar/search-bar";
import { SideCart } from "@/components/cart/side-cart";
import { MobileMenu } from "./mobile-menu";
import { DesktopCategoryMenu } from "./desktop-category-menu";
import { NotificationSubscriptionDialog } from "../ui/notification-subscription-dialog";
import { ThemeToggle } from "../providers/theme-toggle";
import Image from "next/image";
import { LogoutButton } from "../auth/logout-button";

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

function HeartIcon({ className }: { className?: string }) {
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
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
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
      /* text-black handles light mode, dark:text-white handles dark mode */
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

interface NavbarProps {
  storeName?: string;
}

export async function Navbar({ storeName = "LuxeStore" }: NavbarProps) {
  const session = await auth();

  const [cart, wishlistCount, categories, userAffiliate] = await Promise.all([
    getCart(),
    getWishlistCount(),
    getCategories(),
    session?.user ? getUserAffiliate(session.user.id) : Promise.resolve(null),
  ]);

  const itemCount = (cart?.items ?? []).reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  );

  const menuCategories = categories.filter((cat) => cat.showInMenu !== false);

  const serializedCategories = menuCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    children:
      cat.children
        ?.filter((child) => child.showInMenu !== false)
        .map((child) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
        })) || [],
  }));

  const serializedCart = cart
    ? {
        id: cart.id,
        items: cart.items.map((item) => {
          const combination = item.combination;
          const combinationLabel =
            combination?.options
              ?.map(
                (o) =>
                  `${o.option.variation.variationName}: ${o.option.optionName}`,
              )
              .join(", ") || null;

          let basePrice = combination?.price
            ? Number(combination.price)
            : Number(item.product.price);

          const product = item.product;
          if (
            product.discountType &&
            product.discountValue &&
            Number(product.discountValue) > 0
          ) {
            const now = new Date();
            let isDiscountValid = true;

            if (
              product.discountStartDate &&
              now < new Date(product.discountStartDate)
            ) {
              isDiscountValid = false;
            }
            if (
              product.discountEndDate &&
              now > new Date(product.discountEndDate)
            ) {
              isDiscountValid = false;
            }

            if (isDiscountValid) {
              if (product.discountType === "PERCENTAGE") {
                const discount =
                  (basePrice * Number(product.discountValue)) / 100;
                basePrice = basePrice - discount;
              } else if (product.discountType === "FIXED_AMOUNT") {
                basePrice = basePrice - Number(product.discountValue);
              }
              basePrice = Math.max(0, basePrice);
            }
          }

          const itemStock = combination?.stock ?? item.product.stock;

          return {
            id: item.id,
            quantity: item.quantity,
            combinationId: item.combinationId ?? null,
            combinationLabel,
            itemPrice: basePrice.toString(),
            itemStock,
            product: {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              price: item.product.price.toString(),
              categoryId: item.product.categoryId ?? null,
              images: item.product.images,
              stock: item.product.stock,
            },
          };
        }),
      }
    : null;

  const relatedProducts = cart?.items?.length
    ? await (async () => {
        const relatedLimit = 8;
        const perItemLimit = Math.max(
          2,
          Math.ceil(relatedLimit / cart.items.length),
        );
        const lists = await Promise.all(
          cart.items.map((item) =>
            getRelatedProducts(
              item.product.id,
              item.product.categoryId ?? null,
              perItemLimit,
            ),
          ),
        );

        const cartProductIds = new Set(
          cart.items.map((item) => item.product.id),
        );
        const merged = lists
          .flat()
          .filter((product) => !cartProductIds.has(product.id));
        const seen = new Set<string>();
        const unique: typeof merged = [];

        for (const product of merged) {
          if (seen.has(product.id)) continue;
          seen.add(product.id);
          unique.push(product);
        }

        return unique.slice(0, relatedLimit);
      })()
    : [];

  const serializedRelatedProducts = relatedProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    images: product.images ?? [],
  }));

  return (
    <>
      {/* UPPER NAVBAR - NON-STICKY (Scrolls away normally) */}
      <header className="w-full bg-white dark:bg-black border-b border-border relative z-50">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex h-20 items-center justify-between gap-6">
              <Link href="/" className="flex items-center gap-3 shrink-0">
                <Image
                  src="/icon0.svg"
                  alt="Logo"
                  width={56}
                  height={56}
                  className="w-12 h-12"
                />
                <span className="text-xl font-bold text-primary">
                  {storeName}
                </span>
              </Link>

              <div className="flex-1 max-w-2xl">
                <SearchBar />
              </div>
              <div className="flex items-baseline gap-6">
                <div className="translate-y-1">
                  <ThemeToggle />
                </div>
                <Link
                  href="/tracking"
                  className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Track Order</span>
                </Link>

                {session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                        <UserIcon className="h-5 w-5" />
                        <span>Account</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 mt-2 shadow-xl border-border bg-popover text-popover-foreground"
                    >
                      <DropdownMenuLabel className="-m-1 mb-1 p-3 rounded-t-lg bg-muted">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="cursor-pointer">
                          My Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders" className="cursor-pointer">
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/wishlist" className="cursor-pointer">
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/addresses" className="cursor-pointer">
                          Addresses
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer p-0">
                        <NotificationSubscriptionDialog
                          userId={session?.user?.id}
                        />
                      </DropdownMenuItem>
                      {userAffiliate && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href="/affiliate"
                              className="text-green-600 cursor-pointer"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Affiliate Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      {session.user.role === "ADMIN" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <LogoutButton />
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                )}

                <Link
                  href="/wishlist"
                  className="relative flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-2 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-primary-foreground bg-primary rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <SideCart
                  cart={serializedCart}
                  itemCount={itemCount}
                  relatedProducts={serializedRelatedProducts}
                  triggerLabel="Cart"
                  triggerClassName="text-muted-foreground hover:text-foreground"
                  triggerLabelClassName="text-muted-foreground"
                  badgeClassName="bg-primary text-primary-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Header + Menu */}
        <div className="lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <MobileMenu
              session={session ? { user: session.user } : null}
              categories={serializedCategories}
            />
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icon0.svg"
                alt="Logo"
                width={40}
                height={40}
                className="w-9 h-9"
              />
              <span className="text-base font-bold text-primary">
                {storeName}
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <SideCart
                cart={serializedCart}
                itemCount={itemCount}
                relatedProducts={serializedRelatedProducts}
                triggerClassName="text-foreground"
                badgeClassName="bg-primary text-primary-foreground"
              />
            </div>
          </div>
        </div>
      </header>

      {/* LOWER NAVBAR (CATEGORIES) - STICKY */}
      <div className="hidden lg:block bg-black sticky top-0 z-40 w-full shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex items-center gap-4 py-2">
            <DesktopCategoryMenu categories={serializedCategories} />
          </nav>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR - FIXED */}
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
            categories={serializedCategories}
            triggerClassName="flex flex-col items-center text-[11px] text-background hover:text-primary"
            icon={<MenuIcon className="h-5 w-5" />}
          />
          <SideCart
            cart={serializedCart}
            itemCount={itemCount}
            relatedProducts={serializedRelatedProducts}
            triggerLabel="Cart"
            triggerClassName="text-background hover:text-primary"
            triggerLabelClassName="text-background"
            badgeClassName="bg-foreground text-background"
          />
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center text-[11px] text-background hover:text-primary">
                <SearchIcon className="h-5 w-5" />
                SEARCH
              </button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="h-auto border-none bg-background"
            >
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
    </>
  );
}
