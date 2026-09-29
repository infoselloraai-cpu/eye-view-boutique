import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const itemSchema = z.object({ productId: z.string().max(100), color: z.string().max(50), size: z.string().max(30), qty: z.number().int().min(1).max(20) });

async function priceCart(items: z.infer<typeof itemSchema>[], city: string, couponCode?: string) {
  const { getAdmin } = await import("./payments.server");
  const db = await getAdmin();
  const ids = [...new Set(items.map((i) => i.productId))];
  const [{ data: prods }, { data: settings }] = await Promise.all([
    db.from("products").select("id,name,price,offer_percent,active").in("id", ids),
    db.from("site_settings").select("shipping_inside,shipping_outside").eq("id", 1).maybeSingle(),
  ]);
  const lines = items.map((i) => {
    const p = (prods ?? []).find((x: any) => x.id === i.productId && x.active);
    if (!p) throw new Error("A product in your cart is no longer available.");
    const pct = Number(p.offer_percent ?? 0);
    const price = pct > 0 ? Math.round(p.price * (1 - pct / 100)) : p.price;
    return { ...i, name: p.name as string, price: price as number };
  });
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  let percent = 0;
  let code: string | null = null;
  if (couponCode?.trim()) {
    const { data: c } = await db.from("coupons").select("code,percent,active").eq("code", couponCode.trim().toUpperCase()).maybeSingle();
    if (c?.active) { percent = c.percent; code = c.code; }
  }
  const discount = Math.round((subtotal * percent) / 100);
  const shipping = city === "Dhaka" ? (settings?.shipping_inside ?? 70) : (settings?.shipping_outside ?? 130);
  return { db, lines, subtotal, discount, shipping, total: subtotal - discount + shipping, code };
}

export const checkCoupon = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { getAdmin } = await import("./payments.server");
    const db = await getAdmin();
    const { data: c } = await db.from("coupons").select("percent,active").eq("code", data.code.trim().toUpperCase()).maybeSingle();
    return c?.active ? { valid: true, percent: c.percent as number } : { valid: false, percent: 0 };
  });

const rxEye = z.object({ sph: z.string().max(10), cyl: z.string().max(10), axis: z.string().max(10) });
const prescriptionSchema = z.object({
  file: z.string().max(300).optional(),
  right: rxEye.optional(), left: rxEye.optional(),
  pd: z.string().max(10).optional(), lens: z.string().max(40).optional(), note: z.string().max(500).optional(),
}).optional();

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      items: z.array(itemSchema).min(1).max(50),
      name: z.string().trim().min(2).max(100),
      phone: z.string().trim().regex(/^(\+?88)?01\d{9}$/, "Enter a valid Bangladeshi phone number"),
      email: z.string().trim().email().max(120).optional().or(z.literal("")),
      address: z.string().trim().min(5).max(400),
      city: z.string().max(50),
      payment: z.enum(["Manual", "PipraPay", "COD"]),
      wallet: z.string().max(20).optional(),
      senderNumber: z.string().trim().max(20).optional(),
      trxId: z.string().trim().max(40).optional(),
      coupon: z.string().max(40).optional(),
      prescription: prescriptionSchema,
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { db, lines, subtotal, discount, shipping, total, code } = await priceCart(data.items, data.city, data.coupon);
    const req = getRequest();
    const h = req.headers;
    const ip = (h.get("cf-connecting-ip") || h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0] || "").trim().slice(0, 64) || null;

    let trx: string | null = null;
    if (data.payment === "Manual") {
      trx = (data.trxId ?? "").toUpperCase().replace(/\s/g, "");
      if (trx.length < 6) throw new Error("Please enter the transaction ID you received after sending money.");
      if (!/^01\d{9}$/.test((data.senderNumber ?? "").replace(/^\+?88/, ""))) throw new Error("Please enter the number you sent money from.");
      const { data: dup } = await db.from("orders").select("id").eq("transaction_id", trx).limit(1);
      if (dup?.length) throw new Error("This transaction ID has already been used.");
    }

    const id = "EV" + Math.floor(100000 + Math.random() * 900000);
    const order = {
      id, customer_name: data.name, phone: data.phone, email: data.email || null, address: data.address, city: data.city,
      items: lines, subtotal, discount, shipping, total, coupon_code: code,
      payment_method: data.payment === "Manual" ? `${data.wallet || "bKash"} (manual)` : data.payment,
      payment_status: data.payment === "COD" ? "cod" : data.payment === "Manual" ? "verifying" : "pending",
      transaction_id: trx, sender_number: data.senderNumber || null, customer_ip: ip, prescription: data.prescription ?? null,
    };
    const { error } = await db.from("orders").insert(order);
    if (error) { console.error(error); throw new Error("Could not place order. Please try again."); }
    if (data.payment !== "PipraPay") return { orderId: id, redirect: null as string | null };

    const pay = await import("./payments.server");
    try {
      const r = await pay.ppCreate(order, new URL(req.url).origin);
      await db.from("orders").update({ gateway_ref: r.ppId }).eq("id", id);
      return { orderId: id, redirect: r.url };
    } catch (e) {
      await db.from("orders").update({ payment_status: "failed" }).eq("id", id);
      throw e;
    }
  });

export const trackOrder = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ id: z.string().trim().min(3).max(20) }).parse(d))
  .handler(async ({ data }) => {
    const { getAdmin } = await import("./payments.server");
    const db = await getAdmin();
    const { data: o } = await db.from("orders").select("id,status,payment_status,payment_method,total,created_at,updated_at").eq("id", data.id.toUpperCase()).maybeSingle();
    return o as null | { id: string; status: string; payment_status: string; payment_method: string; total: number; created_at: string; updated_at: string };
  });

/** Whether online payment (PipraPay) is fully configured — used to show/hide it at checkout. */
export const paymentOptions = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdmin } = await import("./payments.server");
  const db = await getAdmin();
  const { data } = await db.from("site_settings").select("piprapay_url").eq("id", 1).maybeSingle();
  return { piprapay: Boolean(String(data?.piprapay_url ?? "").trim() && process.env["PIPRAPAY_API_KEY"]) };
});
