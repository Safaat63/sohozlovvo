import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getBrands,
  getCategories,
  getProductPriceRange,
  getProducts,
} from "@/actions/products";
import { getPublicSettings } from "@/actions/settings";
import { CategoriesFilterPanel } from "@/components/product/categories-filter-panel";
import { ProductCardServer } from "@/components/product/product-card-server";
import { SortSelect } from "@/components/product/sort-select";

interface SearchParams {
  page?: string;
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
  minPrice?: string;
  maxPrice?: string;
  brand?: string;
  rating?: string;
  inStock?: string;
  flag?: "best_selling" | "new_arrival";
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  const derivedSortBy =
    searchParamsResolved.sortBy ||
    (searchParamsResolved.flag === "best_selling"
      ? "rating"
      : searchParamsResolved.flag === "new_arrival"
        ? "newest"
        : undefined);

  const [productResult, categories, brands, priceRange] = await Promise.all([
    getProducts({
      categorySlug: slug,
      minPrice: searchParamsResolved.minPrice
        ? parseFloat(searchParamsResolved.minPrice)
        : undefined,
      maxPrice: searchParamsResolved.maxPrice
        ? parseFloat(searchParamsResolved.maxPrice)
        : undefined,
      brand: searchParamsResolved.brand,
      rating: searchParamsResolved.rating
        ? parseFloat(searchParamsResolved.rating)
        : undefined,
      inStock: searchParamsResolved.inStock === "true",
      page: searchParamsResolved.page ? parseInt(searchParamsResolved.page) : 1,
      sortBy: derivedSortBy,
    }),
    getCategories(),
    getBrands(),
    getProductPriceRange(),
    getPublicSettings(),
  ]);

  const currentCategory = categories.find((category) => category.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const { products, pagination } = productResult;

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
    if (searchParamsResolved.brand) {
      current.set("brand", searchParamsResolved.brand);
    }
    if (searchParamsResolved.minPrice) {
      current.set("minPrice", searchParamsResolved.minPrice);
    }
    if (searchParamsResolved.maxPrice) {
      current.set("maxPrice", searchParamsResolved.maxPrice);
    }
    if (searchParamsResolved.flag) {
      current.set("flag", searchParamsResolved.flag);
    }
    if (searchParamsResolved.sortBy) {
      current.set("sortBy", searchParamsResolved.sortBy);
    }
    if (searchParamsResolved.rating) {
      current.set("rating", searchParamsResolved.rating);
    }
    if (searchParamsResolved.inStock) {
      current.set("inStock", searchParamsResolved.inStock);
    }

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) current.set(key, value);
      else current.delete(key);
    });

    const query = current.toString();
    return query ? `/categories/${slug}?${query}` : `/categories/${slug}`;
  };

  return (
    <main className="min-h-screen bg-[#F3F4F6] pb-12">
      <div className="mx-auto w-full max-w-300_ px-4 sm:px-10 lg:px-16 py-8">
        <div className="w-full flex justify-between items-center pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {currentCategory.name}
            </h1>
            {currentCategory.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentCategory.description}
              </p>
            )}
          </div>
          <nav className="flex flex-wrap gap-2 mb-4 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/categories"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Categories
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">
              {currentCategory.name}
            </span>
          </nav>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0">
            <CategoriesFilterPanel
              categories={categories}
              brands={brands}
              priceRange={priceRange}
              selected={{
                category: slug,
                brand: searchParamsResolved.brand,
                minPrice: searchParamsResolved.minPrice
                  ? Number(searchParamsResolved.minPrice)
                  : undefined,
                maxPrice: searchParamsResolved.maxPrice
                  ? Number(searchParamsResolved.maxPrice)
                  : undefined,
                flag: searchParamsResolved.flag,
              }}
              basePath={`/categories/${slug}`}
              categoryRouteBase="/categories"
            />
          </aside>

          <section className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 bg-white px-6 py-3 rounded-xs">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-foreground">Sort By:</span>
                <SortSelect
                  defaultValue={derivedSortBy || "newest"}
                  className="bg-white rounded-xs py-1.5 pl-3 pr-8 text-sm font-medium"
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
