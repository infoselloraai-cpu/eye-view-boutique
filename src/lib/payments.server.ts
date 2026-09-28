// Server-only payment gateway helpers (SSLCommerz + bKash Tokenized Checkout).
type Mode = "sandbox" | "live";

export async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as { from: (t: string) => any };
}

export async function getMode(): Promise<Mode> {
  const db = await getAdmin();
  const { data } = await db.from("site_settings").select("payment_mode").eq("id", 1).maybeSingle();
  return data?.payment_mode === "live" ? "live" : "sandbox";
}

interface OrderLike { id: string; total: number; customer_name: string; phone: string; address: string; city: string }

/* ---------- SSLCommerz ---------- */
const sslBase = (m: Mode) => (m === "live" ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");

export async function sslInit(order: OrderLike, origin: string) {
  const store_id = process.env["SSLCOMMERZ_STORE_ID"];
  const store_passwd = process.env["SSLCOMMERZ_STORE_PASSWORD"];
  if (!store_id || !store_passwd) throw new Error("SSLCommerz is not set up yet. Please choose another payment method.");
  const mode = await getMode();
  const cb = `${origin}/api/public/payments/sslcommerz`;
  const body = new URLSearchParams({
    store_id, store_passwd, total_amount: String(order.total), currency: "BDT", tran_id: order.id,
    success_url: `${cb}?r=success`, fail_url: `${cb}?r=fail`, cancel_url: `${cb}?r=cancel`, ipn_url: `${cb}?r=ipn`,
    cus_name: order.customer_name, cus_email: "customer@example.com", cus_add1: order.address, cus_city: order.city,
    cus_country: "Bangladesh", cus_phone: order.phone, shipping_method: "NO", num_of_item: "1",
    product_name: "Eyewear", product_category: "Eyewear", product_profile: "physical-goods",
  });
  const res = await fetch(`${sslBase(mode)}/gwprocess/v4/api.php`, { method: "POST", body });
  const json = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string };
  if (json.status !== "SUCCESS" || !json.GatewayPageURL) {
    console.error("SSLCommerz init failed", json.failedreason);
    throw new Error("Could not start card payment. Please try again.");
  }
  return json.GatewayPageURL;
}

export async function sslValidate(valId: string) {
  const store_id = process.env["SSLCOMMERZ_STORE_ID"]!;
  const store_passwd = process.env["SSLCOMMERZ_STORE_PASSWORD"]!;
  const mode = await getMode();
  const url = `${sslBase(mode)}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(store_id)}&store_passwd=${encodeURIComponent(store_passwd)}&format=json`;
  const json = (await (await fetch(url)).json()) as { status?: string; tran_id?: string; amount?: string; bank_tran_id?: string };
  return json;
}

/* ---------- bKash ---------- */
const bkBase = (m: Mode) => (m === "live" ? "https://tokenized.pay.bka.sh/v1.2.0-beta" : "https://tokenized.sandbox.bka.sh/v1.2.0-beta");

async function bkToken(mode: Mode) {
  const app_key = process.env["BKASH_APP_KEY"], app_secret = process.env["BKASH_APP_SECRET"];
  const username = process.env["BKASH_USERNAME"], password = process.env["BKASH_PASSWORD"];
  if (!app_key || !app_secret || !username || !password) throw new Error("bKash is not set up yet. Please choose another payment method.");
  const res = await fetch(`${bkBase(mode)}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", username, password },
    body: JSON.stringify({ app_key, app_secret }),
  });
  const json = (await res.json()) as { id_token?: string };
  if (!json.id_token) throw new Error("bKash login failed");
  return { token: json.id_token, app_key };
}

export async function bkCreate(order: OrderLike, origin: string) {
  const mode = await getMode();
  const { token, app_key } = await bkToken(mode);
  const res = await fetch(`${bkBase(mode)}/tokenized/checkout/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: token, "X-APP-Key": app_key },
    body: JSON.stringify({
      mode: "0011", payerReference: order.phone, callbackURL: `${origin}/api/public/payments/bkash`,
      amount: String(order.total), currency: "BDT", intent: "sale", merchantInvoiceNumber: order.id,
    }),
  });
  const json = (await res.json()) as { paymentID?: string; bkashURL?: string; statusMessage?: string };
  if (!json.bkashURL || !json.paymentID) {
    console.error("bKash create failed", json.statusMessage);
    throw new Error("Could not start bKash payment. Please try again.");
  }
  return { url: json.bkashURL, paymentID: json.paymentID };
}

export async function bkExecute(paymentID: string) {
  const mode = await getMode();
  const { token, app_key } = await bkToken(mode);
  const res = await fetch(`${bkBase(mode)}/tokenized/checkout/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: token, "X-APP-Key": app_key },
    body: JSON.stringify({ paymentID }),
  });
  return (await res.json()) as { transactionStatus?: string; trxID?: string; merchantInvoiceNumber?: string; amount?: string };
}
