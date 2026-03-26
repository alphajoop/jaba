import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-3 flex items-center gap-3">
          <span className="inline-block w-6 h-px bg-primary" />
          Paiement confirmé
          <span className="inline-block w-6 h-px bg-primary" />
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Commande reçue
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Votre commande a été reçue et votre paiement est en cours de
          traitement.
        </p>

        {ref && (
          <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            Réf ·{" "}
            <span className="font-mono normal-case text-foreground">{ref}</span>
          </p>
        )}

        <Button asChild className="mt-10 rounded-full noise-matcha" size="sm">
          <Link href="/shop">Retour à la boutique</Link>
        </Button>
      </main>
    </div>
  );
}
