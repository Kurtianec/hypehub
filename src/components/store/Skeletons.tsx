"use client";

export function ProductCardSkeleton() {
  return <div className="skeleton-card overflow-hidden">
    <div className="skeleton-block aspect-[16/9] w-full" />
    <div className="space-y-3 p-4">
      <div className="skeleton-block h-3 w-24 rounded-md" />
      <div className="skeleton-block h-5 w-[88%] rounded-md" />
      <div className="skeleton-block h-5 w-[62%] rounded-md" />
      <div className="flex items-end justify-between border-t border-black/[.05] pt-4">
        <div className="skeleton-block h-7 w-20 rounded-md" />
        <div className="skeleton-block h-9 w-24 rounded-lg" />
      </div>
    </div>
  </div>;
}

export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5">
    {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>;
}
