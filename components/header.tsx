"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export function Header() {
  const { count, mounted } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/shop"
          className="text-sm font-semibold tracking-tight text-foreground hover:opacity-70 transition-opacity"
        >
          mini shop
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/shop"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Boutique
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="sr-only">Panier</span>
            {mounted && count > 0 && (
              <span
                className={cn(
                  "absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center",
                  "rounded-full bg-primary text-[10px] font-medium text-primary-foreground",
                )}
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
