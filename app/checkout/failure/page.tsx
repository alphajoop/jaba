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
      <main className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Paiement échoué
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Le paiement n'a pas pu être traité. Veuillez réessayer ou choisir un
          autre opérateur.
        </p>
        {ref && (
          <p className="mt-3 text-xs text-muted-foreground">
            Référence :{" "}
            <span className="font-mono font-medium text-foreground">{ref}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="sm">
            <Link href="/checkout">Réessayer</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/cart">Retour au panier</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
