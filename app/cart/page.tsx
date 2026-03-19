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
        <main className="mx-auto max-w-2xl px-4 py-10">
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
          <ShoppingBag className="mb-4 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">
            Votre panier est vide
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajoutez des produits pour commencer.
          </p>
          <Button asChild className="mt-6" size="sm">
            <Link href="/shop">Parcourir la boutique</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Panier
          </h1>
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Vider
          </button>
        </div>

        {/* Items */}
        <div className="space-y-0 rounded-lg border border-border overflow-hidden">
          {items.map((item, idx) => (
            <div key={item.product.id}>
              {idx > 0 && <Separator />}
              <div className="flex items-center gap-3 p-3">
                {/* Thumbnail */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Name + price */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.product.price, item.product.currency)}{" "}
                    l'unité
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Diminuer"
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
                    className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
                    aria-label="Augmenter"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Subtotal */}
                <p className="w-24 text-right text-sm font-semibold tabular-nums">
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
                  aria-label="Retirer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-medium">{formatPrice(total, "XOF")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Livraison</span>
            <span className="text-muted-foreground">Calculée au paiement</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-lg tabular-nums">
              {formatPrice(total, "XOF")}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
          <Button asChild className="flex-1">
            <Link href="/checkout">Procéder au paiement</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/shop">Continuer les achats</Link>
          </Button>
        </div>
      </main>
    </div>
  );

  function clearAll() {
    clearCart();
  }
}
