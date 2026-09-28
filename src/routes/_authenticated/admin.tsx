import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Package, ShoppingBag, Ticket, Settings as Cog, CreditCard, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { ProductsPanel } from "@/components/admin/ProductsPanel";
import { CouponsPanel } from "@/components/admin/CouponsPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { PaymentsPanel } from "@/components/admin/PaymentsPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — EYE VIEW" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const TABS = [
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Package },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Cog },
] as const;

function Admin() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.rpc("has_role" as never, { _user_id: user.id, _role: "admin" } as never).then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user.id]);

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/auth" }); };

  if (isAdmin === null) return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div><h1 className="font-display text-2xl font-bold">No admin access</h1><p className="mt-2 text-sm text-muted-foreground">{user.email} is not an admin.</p>
        <button onClick={signOut} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Sign out</button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container-page flex items-center justify-between py-3">
          <div className="flex items-center gap-3"><Logo /><span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold">Admin</span></div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="hidden items-center gap-1 text-muted-foreground sm:flex">View store <ExternalLink className="h-3.5 w-3.5" /></Link>
            <button onClick={signOut} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </div>
      </header>
      <div className="container-page grid gap-6 py-6 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
        <section className="min-w-0">
          {tab === "orders" && <OrdersPanel />}
          {tab === "products" && <ProductsPanel />}
          {tab === "coupons" && <CouponsPanel />}
          {tab === "payments" && <PaymentsPanel />}
          {tab === "settings" && <SettingsPanel />}
        </section>
      </div>
    </div>
  );
}
