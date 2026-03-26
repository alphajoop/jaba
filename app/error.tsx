"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.25em] text-destructive mb-3 flex items-center gap-3">
        <span className="inline-block w-6 h-px bg-destructive/50" />
        Erreur
        <span className="inline-block w-6 h-px bg-destructive/50" />
      </p>
      <h2 className="text-lg font-bold text-foreground">
        Une erreur est survenue
      </h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
      </p>
      <Button
        onClick={reset}
        size="sm"
        className="mt-8 rounded-full noise-matcha"
      >
        Réessayer
      </Button>
    </div>
  );
}
