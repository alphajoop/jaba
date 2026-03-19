import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground/20 select-none">
        404
      </p>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        Page introuvable
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        La page que vous cherchez n'existe pas.
      </p>
      <Button asChild size="sm" className="mt-6">
        <Link href="/shop">Retour à la boutique</Link>
      </Button>
    </div>
  );
}
