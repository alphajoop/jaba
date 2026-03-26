import { Header } from "@/components/header";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 space-y-3">
          <div className="h-2 w-24 rounded-full bg-secondary animate-pulse" />
          <div className="h-8 w-36 rounded-md bg-secondary animate-pulse" />
          <div className="h-3 w-44 rounded-full bg-secondary animate-pulse" />
        </div>
        <div className="h-px w-full bg-border mb-10" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square w-full rounded-lg bg-secondary animate-pulse" />
              <div className="h-3 w-16 rounded-full bg-secondary animate-pulse" />
              <div className="h-4 w-full rounded-md bg-secondary animate-pulse" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded-full bg-secondary animate-pulse" />
                <div className="h-7 w-7 rounded-md bg-secondary animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
