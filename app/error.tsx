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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-base font-semibold text-foreground">
        Une erreur est survenue
      </h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
      </p>
      <Button onClick={reset} size="sm" className="mt-6">
        Réessayer
      </Button>
    </div>
  );
}
