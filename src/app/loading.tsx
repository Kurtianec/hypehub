import { CatalogSkeleton } from "@/components/store/Skeletons";

export default function Loading() {
  return <div className="min-h-screen bg-[#080808]">
    <div className="container mx-auto px-4 pt-4"><div className="skeleton-block h-[68px] rounded-2xl" /></div>
    <main className="container mx-auto px-4 pb-16 pt-16">
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <div className="skeleton-block mx-auto mb-5 h-8 w-52 rounded-full" />
        <div className="skeleton-block mx-auto mb-3 h-14 w-[85%] rounded-xl md:h-20" />
        <div className="skeleton-block mx-auto h-14 w-[62%] rounded-xl" />
      </div>
      <div className="skeleton-block mb-3 h-9 w-64 rounded-lg" />
      <div className="skeleton-block mb-7 h-5 w-96 max-w-full rounded-md" />
      <CatalogSkeleton count={8} />
    </main>
  </div>;
}
