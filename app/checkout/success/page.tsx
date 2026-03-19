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
      <main className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Paiement confirmé
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Votre commande a été reçue et votre paiement est en cours de
          traitement.
        </p>
        {ref && (
          <p className="mt-3 text-xs text-muted-foreground">
            Référence :{" "}
            <span className="font-mono font-medium text-foreground">{ref}</span>
          </p>
        )}
        <Button asChild className="mt-8" size="sm">
          <Link href="/shop">Retour à la boutique</Link>
        </Button>
      </main>
    </div>
  );
}
