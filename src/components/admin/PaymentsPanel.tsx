import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/catalog";

export function PaymentsPanel() {
  const [mode, setMode] = useState<string>("sandbox");
  useEffect(() => { db.from("site_settings").select("payment_mode").eq("id", 1).maybeSingle().then(({ data }: { data: { payment_mode: string } | null }) => data && setMode(data.payment_mode)); }, []);

  const change = async (m: string) => {
    if (m === "live" && !confirm("Switch to LIVE? Real money will be charged.")) return;
    const { error } = await db.from("site_settings").update({ payment_mode: m }).eq("id", 1);
    if (error) toast.error(error.message); else { setMode(m); toast.success(`Payments are now in ${m === "live" ? "live" : "test"} mode`); }
  };
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Payments</h2>
      <div className="rounded-xl bg-card p-5 shadow-soft">
        <p className="text-sm font-semibold">Mode</p>
        <div className="mt-2 flex gap-2">
          {[["sandbox", "Test (sandbox)"], ["live", "Live"]].map(([v, l]) => (
            <button key={v} onClick={() => change(v!)} className={`rounded-md px-4 py-2 text-sm ${mode === v ? "bg-primary text-primary-foreground" : "border border-border"}`}>{l}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Use test mode with sandbox keys; switch to live only after adding your live keys.</p>
      </div>
      <div className="rounded-xl bg-card p-5 text-sm shadow-soft">
        <p className="font-semibold">Gateways</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li><b>bKash</b> — needs App Key, App Secret, Username, Password from your bKash merchant account.</li>
          <li><b>SSLCommerz</b> — needs Store ID and Store Password. Covers cards, Nagad, Rocket.</li>
          <li><b>Cash on Delivery</b> — always on.</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">SSLCommerz IPN link (paste in your SSLCommerz panel):</p>
        <code className="mt-1 block break-all rounded bg-secondary px-2 py-1 text-xs">{origin}/api/public/payments/sslcommerz?r=ipn</code>
      </div>
    </div>
  );
}
