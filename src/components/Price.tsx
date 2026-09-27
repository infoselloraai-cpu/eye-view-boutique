import { formatPrice } from "@/config/site";

export function Price({ price, oldPrice, large }: { price: number; oldPrice?: number | undefined; large?: boolean }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className={large ? "text-3xl font-bold" : "font-semibold"}>{formatPrice(price)}</span>
      {oldPrice && <span className="text-sm text-muted-foreground line-through">{formatPrice(oldPrice)}</span>}
    </div>
  );
}
