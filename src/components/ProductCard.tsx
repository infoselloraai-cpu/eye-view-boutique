import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { Stars } from "./Stars";
import { Price } from "./Price";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to="/product/$id" params={{ id: product.id }} className="group block overflow-hidden rounded-2xl bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square bg-secondary">
        <img src={product.images[0]} alt={product.name} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition group-hover:scale-105" />
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-card/80"><Heart className="h-4 w-4" /></span>
        {product.isNew && <span className="absolute left-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">NEW</span>}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <Price price={product.price} oldPrice={product.oldPrice} />
        <Stars rating={product.rating} reviews={product.reviews} />
      </div>
    </Link>
  );
}
