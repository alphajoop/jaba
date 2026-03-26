import { Fragment } from "react/jsx-runtime";
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

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  ) as string[];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Page header — style GRAINHAUS */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-2 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary" />
            Catalogue
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Boutique
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} produit{products.length !== 1 ? "s" : ""}{" "}
            disponible{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border mb-10" />

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBagEmpty />
            <p className="text-sm text-muted-foreground mt-4">
              Aucun produit disponible pour le moment.
            </p>
          </div>
        ) : (
          <Fragment>
            {categories.length > 1 ? (
              <div className="space-y-12">
                {categories.map((cat) => (
                  <section key={cat}>
                    <h2 className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                      <span className="inline-block w-4 h-px bg-border" />
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
          </Fragment>
        )}
      </main>
    </div>
  );
}

function ShoppingBagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Panier vide"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function ShoppingBagEmpty() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground/40">
      <ShoppingBagIcon />
    </div>
  );
}
