"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export function Header() {
  const { count, mounted } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/shop"
          className="font-bold tracking-tight text-foreground hover:opacity-70 transition-opacity text-sm uppercase"
        >
          JABA<span className="text-primary">SHOP</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link
            href="/shop"
            className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            Boutique
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="sr-only">Panier</span>
            {mounted && count > 0 && (
              <span
                className={cn(
                  "absolute -right-2.5 -top-2 flex h-4 w-4 items-center justify-center",
                  "rounded-full bg-primary text-[9px] font-bold text-primary-foreground",
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
