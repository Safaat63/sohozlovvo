import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getBrands,
  getCategories,
  getProductPriceRange,
  getProducts,
} from "@/actions/products";
import { getPublicSettings } from "@/actions/settings";
import { ProductCardServer } from "@/components/product/product-card-server";
import { SortSelect } from "@/components/product/sort-select";
import { CategoriesFilterPanel } from "@/components/product/categories-filter-panel";

interface SearchParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  brand?: string;
  rating?: string;
  inStock?: string;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  page?: string;
  flag?: "best_selling" | "new_arrival";
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const derivedSortBy =
    params.sortBy ||
    (params.flag === "best_selling"
      ? "rating"
      : params.flag === "new_arrival"
        ? "newest"
        : undefined);

  const [productResult, categories, brands, priceRange, settings] =
    await Promise.all([
      getProducts({
        categorySlug: params.category,
        minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
        brand: params.brand,
        rating: params.rating ? parseFloat(params.rating) : undefined,
        inStock: params.inStock === "true",
        page: params.page ? parseInt(params.page) : 1,
        sortBy: derivedSortBy,
      }),
      getCategories(),
      getBrands(),
      getProductPriceRange(),
      getPublicSettings(),
    ]);

  const { products, pagination } = productResult;
  const whatsappNumber = settings.whatsapp_number;

  const start =
    pagination.total === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.limit + 1;
  const end = Math.min(
    pagination.currentPage * pagination.limit,
    pagination.total,
  );

  const buildQueryString = (newParams: Record<string, string | undefined>) => {
    const current = new URLSearchParams();
    if (params.category) current.set("category", params.category);
    if (params.brand) current.set("brand", params.brand);
    if (params.minPrice) current.set("minPrice", params.minPrice);
    if (params.maxPrice) current.set("maxPrice", params.maxPrice);
    if (params.flag) current.set("flag", params.flag);
    if (params.sortBy) current.set("sortBy", params.sortBy);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) current.set(key, value);
      else current.delete(key);
    });

    return current.toString() ? `?${current.toString()}` : "/categories";
  };

  return (
    <main className="min-h-screen bg-[#F3F4F6] pb-12">
      <div className="mx-auto w-full max-w-300 px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex gap-2 mb-6 text-sm">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Categories</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0">
            <CategoriesFilterPanel
              categories={categories}
              brands={brands}
              priceRange={priceRange}
              selected={{
                category: params.category,
                brand: params.brand,
                minPrice: params.minPrice ? Number(params.minPrice) : undefined,
                maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
                flag: params.flag,
              }}
            />
          </aside>

          <section className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Sort By:</span>
                <SortSelect
                  defaultValue={derivedSortBy || "newest"}
                  className="bg-white border border-border rounded-md py-1.5 pl-3 pr-8 text-sm font-medium"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="text-foreground font-semibold">{start}</span> -{" "}
                <span className="text-foreground font-semibold">{end}</span> of{" "}
                <span className="text-foreground font-semibold">
                  {pagination.total}
                </span>{" "}
                results
              </div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCardServer key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-2">
                  <Link
                    href={
                      pagination.currentPage > 1
                        ? buildQueryString({
                            page: String(pagination.currentPage - 1),
                          })
                        : "#"
                    }
                    className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors ${
                      pagination.currentPage <= 1
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>

                  {Array.from(
                    { length: Math.min(pagination.pages, 5) },
                    (_, i) => {
                      let pageNum: number;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.pages - 2
                      ) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      return (
                        <Link
                          key={pageNum}
                          href={buildQueryString({ page: String(pageNum) })}
                          className={`w-10 h-10 rounded-lg font-medium flex items-center justify-center transition-colors ${
                            pagination.currentPage === pageNum
                              ? "bg-primary text-white font-bold"
                              : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    },
                  )}

                  {pagination.pages > 5 &&
                    pagination.currentPage < pagination.pages - 2 && (
                      <>
                        <span className="text-muted-foreground px-2">...</span>
                        <Link
                          href={buildQueryString({
                            page: String(pagination.pages),
                          })}
                          className="w-10 h-10 rounded-lg text-muted-foreground hover:bg-muted font-medium flex items-center justify-center transition-colors"
                        >
                          {pagination.pages}
                        </Link>
                      </>
                    )}

                  <Link
                    href={
                      pagination.currentPage < pagination.pages
                        ? buildQueryString({
                            page: String(pagination.currentPage + 1),
                          })
                        : "#"
                    }
                    className={`p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors ${
                      pagination.currentPage >= pagination.pages
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </nav>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
