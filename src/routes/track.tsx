import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { trackOrder } from "@/lib/orders.functions";
import { Check, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>): { id?: string | undefined } => ({ id: typeof s["id"] === "string" ? (s["id"] as string) : undefined }),
  head: () => meta("Track Your Order", "Enter your order number or tracking ID to see live delivery status."),
  component: Track,
});

const STAGES = ["Order Placed", "Processing", "Shipped", "Delivered"];
type Order = Awaited<ReturnType<typeof trackOrder>>;

function Track() {
  const { id } = Route.useSearch();
  const [q, setQ] = useState(id ?? "");
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const fetchOrder = useServerFn(trackOrder);
  const run = async (v: string) => { try { setOrder(await fetchOrder({ data: { id: v } })); } catch { setOrder(null); } };
  useEffect(() => { if (id) run(id); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const cancelled = order?.status === "Cancelled";
  const reached = order ? Math.max(0, STAGES.indexOf(order.status)) + 1 : 0;
  const result = order && !cancelled ? STAGES.map((s, i) => ({ stage: s, done: i < reached, date: i === reached - 1 ? new Date(order.updated_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : i === 0 ? new Date(order.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : null })) : null;
  const delivered = order?.status === "Delivered";

  return (
    <>
      <PageHeader title="Track Your Order" subtitle="Enter your order number or tracking ID." />
      <div className="container-page grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) run(q.trim()); }} className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order Number / Tracking ID" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <button className="rounded-md bg-primary px-6 text-sm text-primary-foreground">Track</button>
          </form>
          {order === null && <p className="mt-6 text-sm text-destructive">No order found with that ID.</p>}
          {cancelled && <p className="mt-6 text-sm font-semibold text-destructive">This order was cancelled.</p>}
          {order && <p className="mt-6 text-sm text-muted-foreground">Payment: <b>{order.payment_method}</b> — {order.payment_status}</p>}
          {result && (
            <ol className="mt-8">
              {result.map((r, i) => (
                <li key={r.stage} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < result.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${result[i + 1]?.done ? "bg-primary" : "bg-border"}`} />}
                  <span className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full ${r.done ? "bg-primary text-primary-foreground" : "border-2 border-border bg-card"}`}>{r.done && <Check className="h-3.5 w-3.5" />}</span>
                  <div><p className={`text-sm ${r.done ? "font-semibold" : "text-muted-foreground"}`}>{r.stage}</p>{r.date && <p className="text-xs text-muted-foreground">{r.date}</p>}</div>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-secondary p-10 text-center">
          <Package className="h-16 w-16" strokeWidth={1.2} />
          <p className="mt-4 font-display text-2xl font-bold">{!result ? "Where's my order?" : delivered ? "Delivered!" : "Your order is on the way!"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{result ? "We'll notify you once it's delivered." : "Track any order in seconds."}</p>
          <Link to="/" className="mt-5 rounded-md border border-primary px-5 py-2 text-sm">Back to Home</Link>
        </div>
      </div>
    </>
  );
}
