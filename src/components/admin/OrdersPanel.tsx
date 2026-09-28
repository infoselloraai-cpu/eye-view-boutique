import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/catalog";
import { formatPrice } from "@/config/site";

const STATUSES = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
interface Order {
  id: string; customer_name: string; phone: string; address: string; city: string; total: number;
  payment_method: string; payment_status: string; status: string; transaction_id: string | null; created_at: string;
  items: { name: string; qty: number; color: string; size: string; price: number }[];
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const { data, error } = await db.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) toast.error(error.message); else setOrders(data);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await db.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success("Status updated");
  };

  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const revenue = orders.filter((o) => o.payment_status === "paid" || o.status === "Delivered").reduce((a, o) => a + o.total, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total orders" value={String(orders.length)} />
        <Stat label="Pending delivery" value={String(orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length)} />
        <Stat label="Revenue (paid/delivered)" value={formatPrice(revenue)} />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Orders</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border border-input bg-card px-2 py-1.5 text-sm">
          <option value="all">All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {!list.length && <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">No orders yet.</p>}
      <div className="space-y-2">
        {list.map((o) => (
          <div key={o.id} className="rounded-xl bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setOpen(open === o.id ? null : o.id)} className="font-semibold underline-offset-2 hover:underline">{o.id}</button>
              <span className="text-sm">{o.customer_name}</span>
              <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
              <span className="ml-auto text-sm font-semibold">{formatPrice(o.total)}</span>
              <span className={`rounded px-2 py-0.5 text-xs ${o.payment_status === "paid" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{o.payment_method} · {o.payment_status}</span>
              <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-xs">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {open === o.id && (
              <div className="mt-3 grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-2">
                <div><p><b>Phone:</b> {o.phone}</p><p><b>Address:</b> {o.address}, {o.city}</p>{o.transaction_id && <p><b>Transaction:</b> {o.transaction_id}</p>}</div>
                <ul className="space-y-1">{o.items.map((i, k) => <li key={k}>{i.qty} × {i.name} ({i.color}, {i.size}) — {formatPrice(i.price * i.qty)}</li>)}</ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-card p-4 shadow-soft"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold">{value}</p></div>;
}
