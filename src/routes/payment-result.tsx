import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/payment-result")({
  validateSearch: (s: Record<string, unknown>): { id?: string; status?: string } => ({
    id: typeof s["id"] === "string" ? s["id"] : undefined,
    status: typeof s["status"] === "string" ? s["status"] : undefined,
  }),
  head: () => meta("Payment Status", "See whether your EYE VIEW payment went through."),
  component: Result,
});

function Result() {
  const { id, status } = Route.useSearch();
  const cart = useCart();
  const ok = status === "paid";
  useEffect(() => { if (ok) cart.clear(); }, [ok]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="container-page py-24 text-center">
      <div className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${ok ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>{ok ? <Check /> : <X />}</div>
      <h1 className="mt-4 font-display text-3xl font-bold">{ok ? "Payment successful!" : status === "cancelled" ? "Payment cancelled" : "Payment failed"}</h1>
      {id && <p className="mt-2 text-muted-foreground">Order ID: <b>{id}</b></p>}
      <div className="mt-6 flex justify-center gap-3">
        {id && ok && <Link to="/track" search={{ id }} className="rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Track Order</Link>}
        {!ok && <Link to="/cart" className="rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Back to Cart</Link>}
        <Link to="/shop" className="rounded-md border border-border px-5 py-2 text-sm">Continue Shopping</Link>
      </div>
    </div>
  );
}
