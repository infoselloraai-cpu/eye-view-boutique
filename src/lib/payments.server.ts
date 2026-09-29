// Server-only helpers: admin DB client + PipraPay (self-hosted gateway) API.
export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (t: string) => any };
}

interface OrderLike { id: string; total: number; customer_name: string; phone: string; email?: string | null }

async function ppConfig() {
  const db = await getAdmin();
  const { data } = await db.from("site_settings").select("piprapay_url").eq("id", 1).maybeSingle();
  const base = String(data?.piprapay_url ?? "").trim().replace(/\/+$/, "");
  const key = process.env["PIPRAPAY_API_KEY"];
  if (!base || !key) throw new Error("Online payment is not set up yet. Please choose another payment method.");
  return { base, key };
}

async function ppPost(path: string, body: unknown) {
  const { base, key } = await ppConfig();
  const res = await fetch(`${base}/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "MHS-PIPRAPAY-API-KEY": key },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text) as Record<string, any>; } catch { console.error("PipraPay non-JSON", res.status, text.slice(0, 300)); return {}; }
}

export async function ppCreate(order: OrderLike, origin: string) {
  const json = await ppPost("checkout/redirect", {
    full_name: order.customer_name,
    email_address: order.email || `${order.phone}@customer.local`,
    mobile_number: order.phone,
    amount: String(order.total),
    currency: "BDT",
    metadata: { order_id: order.id },
    return_url: `${origin}/api/public/payments/piprapay?order=${encodeURIComponent(order.id)}`,
    webhook_url: `${origin}/api/public/payments/piprapay?order=${encodeURIComponent(order.id)}`,
  });
  if (!json["pp_url"] || !json["pp_id"]) {
    console.error("PipraPay create failed", json["error"]);
    throw new Error("Could not start online payment. Please try again or choose another method.");
  }
  return { url: String(json["pp_url"]), ppId: String(json["pp_id"]) };
}

export async function ppVerify(ppId: string) {
  return ppPost("verify-payment", { pp_id: ppId });
}
