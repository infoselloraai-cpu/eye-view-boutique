import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/track")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => meta("Track Your Order", "Enter your order number or tracking ID to see live delivery status."),
  component: Track,
});

const STAGES = ["Order Placed", "Processing", "Shipped", "Delivered"];

// Placeholder lookup — replace with an API call later.
function lookup(id: string) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const reached = (n % 3) + 1;
  const base = Date.now() - reached * 86400000;
  return STAGES.map((s, i) => ({
    stage: s,
    done: i < reached,
    date: i < reached ? new Date(base + i * 86400000).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : null,
  }));
}

function Track() {
  const { id } = Route.useSearch();
  const [q, setQ] = useState(id ?? "");
  const [result, setResult] = useState(id ? lookup(id) : null);
  const delivered = result?.every((r) => r.done);

  return (
    <>
      <PageHeader title="Track Your Order" subtitle="Enter your order number or tracking ID." />
      <div className="container-page grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) setResult(lookup(q.trim())); }} className="flex gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order Number / Tracking ID" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <button className="rounded-md bg-primary px-6 text-sm text-primary-foreground">Track</button>
          </form>
          {result && (
            <ol className="mt-8">
              {result.map((r, i) => (
                <li key={r.stage} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < result.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${result[i + 1].done ? "bg-primary" : "bg-border"}`} />}
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
