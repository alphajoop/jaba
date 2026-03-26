"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product);
    toast.success(`${product.name} ajouté au panier`);
  }

  const outOfStock = product.stock === 0;

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/40 hover:scale-[1.02]">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/20" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Badge
              variant="destructive"
              className="text-[10px] uppercase tracking-widest"
            >
              Rupture
            </Badge>
          </div>
        )}
        {/* Category tag on image */}
        {product.category && (
          <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest bg-background/80 text-muted-foreground px-2 py-0.5 rounded-full backdrop-blur-sm">
            {product.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-sm font-bold text-primary tabular-nums">
            {formatPrice(product.price, product.currency)}
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Ajouter ${product.name} au panier`}
            className="border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors hover:noise-matcha"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
