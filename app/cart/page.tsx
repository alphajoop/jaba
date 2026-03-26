"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, total, mounted, removeItem, updateQuantity, clearCart } =
    useCart();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-6 py-10">
          <div className="h-8 w-32 animate-pulse rounded-md bg-secondary" />
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-muted-foreground/30 mb-4">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">
            Votre panier est vide
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajoutez des produits pour commencer.
          </p>
          <Button asChild className="mt-6 rounded-full noise-matcha" size="sm">
            <Link href="/shop">Parcourir la boutique</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-primary mb-2 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-primary" />
            Récapitulatif
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Panier
            </h1>
            <button
              type="button"
              onClick={() => clearCart()}
              className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Vider
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-border mb-8" />

        {/* Items */}
        <div className="rounded-lg border border-border overflow-hidden">
          {items.map((item, idx) => (
            <div key={item.product.id}>
              {idx > 0 && <Separator />}
              <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatPrice(item.product.price, item.product.currency)}{" "}
                    l'unité
                  </p>
                </div>

                {/* Qty */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product.stock}
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Subtotal */}
                <p className="w-24 text-right text-sm font-bold tabular-nums text-primary">
                  {formatPrice(
                    item.product.price * item.quantity,
                    item.product.currency,
                  )}
                </p>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-lg border border-border bg-secondary p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Sous-total
            </span>
            <span className="font-medium">{formatPrice(total, "XOF")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Livraison
            </span>
            <span className="text-muted-foreground text-xs">
              Calculée au paiement
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest text-foreground font-semibold">
              Total
            </span>
            <span className="font-bold text-xl tabular-nums text-primary">
              {formatPrice(total, "XOF")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
          <Button asChild className="flex-1 rounded-full noise-matcha">
            <Link href="/checkout">Procéder au paiement</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link href="/shop">Continuer les achats</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
