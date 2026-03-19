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
    <div className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden transition-all hover:border-muted-foreground/30">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Badge variant="secondary" className="text-xs">
              Rupture
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-3">
        {product.category && (
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">
            {product.category}
          </span>
        )}
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price, product.currency)}
          </span>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
