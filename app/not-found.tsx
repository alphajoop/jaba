import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-[8rem] font-bold leading-none text-foreground/5 select-none tracking-tighter">
        404
      </p>
      <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-3 flex items-center gap-3">
        <span className="inline-block w-6 h-px bg-primary" />
        Page introuvable
        <span className="inline-block w-6 h-px bg-primary" />
      </p>
      <h2 className="text-lg font-bold text-foreground">On s'est perdus</h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Button asChild size="sm" className="mt-8 rounded-full noise-matcha">
        <Link href="/shop">Retour à la boutique</Link>
      </Button>
    </div>
  );
}
