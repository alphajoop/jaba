import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types";

async function getProducts(): Promise<Product[]> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${appUrl}/api/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const products = await getProducts();

  // Extract unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  ) as string[];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Boutique
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} produit{products.length !== 1 ? "s" : ""}{" "}
            disponible{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun produit disponible pour le moment.
            </p>
          </div>
        ) : (
          <>
            {/* All products or by category */}
            {categories.length > 1 ? (
              <div className="space-y-10">
                {categories.map((cat) => (
                  <section key={cat}>
                    <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {cat}
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {products
                        .filter((p) => p.category === cat)
                        .map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
