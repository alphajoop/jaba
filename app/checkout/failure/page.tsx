import { XCircle } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export default async function FailurePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
          <XCircle className="h-7 w-7 text-destructive" />
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-destructive mb-3 flex items-center gap-3">
          <span className="inline-block w-6 h-px bg-destructive/50" />
          Paiement échoué
          <span className="inline-block w-6 h-px bg-destructive/50" />
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quelque chose s'est mal passé
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Le paiement n'a pas pu être traité. Veuillez réessayer ou choisir un
          autre opérateur.
        </p>

        {ref && (
          <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            Réf ·{" "}
            <span className="font-mono normal-case text-foreground">{ref}</span>
          </p>
        )}

        <div className="mt-10 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="sm" className="rounded-full noise-matcha">
            <Link href="/checkout">Réessayer</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/cart">Retour au panier</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
