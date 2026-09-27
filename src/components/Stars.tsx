import { Star } from "lucide-react";

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "fill-star text-star" : "text-border"}`} />
      ))}
      {reviews !== undefined && <span className="ml-1 text-xs text-muted-foreground">({reviews})</span>}
    </div>
  );
}
