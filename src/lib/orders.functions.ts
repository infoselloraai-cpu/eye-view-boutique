import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const itemSchema = z.object({ productId: z.string().max(100), color: z.string().max(50), size: z.string().max(30), qty: z.number().int().min(1).max(20) });

async function priceCart(items: z.infer<typeof itemSchema>[], couponCode?: string) {
  const { getAdmin } = await import("./payments.server");
  const db = await getAdmin();
  const ids = [...new Set(items.map((i) => i.productId))];
  const [{ data: prods }, { data: settings }] = await Promise.all([
    db.from("products").select("id,name,price,active").in("id", ids),
    db.from("site_settings").select("shipping_fee,free_shipping_min").eq("id", 1).maybeSingle(),
  ]);
  const lines = items.map((i) => {
    const p = (prods ?? []).find((x: any) => x.id === i.productId && x.active);
    if (!p) throw new Error("A product in your cart is no longer available.");
    return { ...i, name: p.name as string, price: p.price as number };
  });
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  let percent = 0;
  let code: string | null = null;
  if (couponCode?.trim()) {
    const { data: c } = await db.from("coupons").select("code,percent,active").eq("code", couponCode.trim().toUpperCase()).maybeSingle();
    if (c?.active) { percent = c.percent; code = c.code; }
  }
  const discount = Math.round((subtotal * percent) / 100);
  const fee = settings?.shipping_fee ?? 80, min = settings?.free_shipping_min ?? 1500;
  const shipping = subtotal - discount >= min ? 0 : fee;
  return { db, lines, subtotal, discount, shipping, total: subtotal - discount + shipping, code, percent };
}

export const checkCoupon = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().min(1).max(40) }).parse(d))
  .handler(async ({ data }) => {
    const { getAdmin } = await import("./payments.server");
    const db = await getAdmin();
    const { data: c } = await db.from("coupons").select("percent,active").eq("code", data.code.trim().toUpperCase()).maybeSingle();
    return c?.active ? { valid: true, percent: c.percent as number } : { valid: false, percent: 0 };
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      items: z.array(itemSchema).min(1).max(50),
      name: z.string().trim().min(2).max(100),
      phone: z.string().trim().regex(/^(\+?88)?01\d{9}$/, "Enter a valid Bangladeshi phone number"),
      address: z.string().trim().min(5).max(400),
      city: z.string().max(50),
      payment: z.enum(["bKash", "SSLCommerz", "COD"]),
      coupon: z.string().max(40).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { db, lines, subtotal, discount, shipping, total, code } = await priceCart(data.items, data.coupon);
    const id = "EV" + Math.floor(100000 + Math.random() * 900000);
    const order = { id, customer_name: data.name, phone: data.phone, address: data.address, city: data.city, items: lines, subtotal, discount, shipping, total, coupon_code: code, payment_method: data.payment, payment_status: data.payment === "COD" ? "cod" : "pending" };
    const { error } = await db.from("orders").insert(order);
    if (error) { console.error(error); throw new Error("Could not place order. Please try again."); }
    if (data.payment === "COD") return { orderId: id, redirect: null as string | null };

    const origin = new URL(getRequest().url).origin;
    const pay = await import("./payments.server");
    try {
      if (data.payment === "SSLCommerz") return { orderId: id, redirect: await pay.sslInit(order, origin) };
      const r = await pay.bkCreate(order, origin);
      await db.from("orders").update({ gateway_ref: r.paymentID }).eq("id", id);
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
