import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/config/site";
import { useServerFn } from "@tanstack/react-start";
import { checkCoupon, placeOrder } from "@/lib/orders.functions";
import { useSettings } from "@/lib/catalog";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/cart")({
  head: () => meta("Cart & Checkout", "Review your cart and check out securely with bKash, Nagad, Rocket, card or cash on delivery."),
  component: CartPage,
});

const STEPS = ["Shipping Info", "Payment", "Review", "Confirmation"];
const PAYMENTS = [
  { id: "bKash", label: "bKash" },
  { id: "SSLCommerz", label: "Card / Nagad / Rocket (SSLCommerz)" },
  { id: "COD", label: "Cash on Delivery" },
] as const;

function CartPage() {
  const cart = useCart();
  const [step, setStep] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [pay, setPay] = useState("bKash");
  const [ship, setShip] = useState({ name: "", phone: "", address: "", city: "Dhaka" });
  const [orderId, setOrderId] = useState("");
  const [busy, setBusy] = useState(false);
  const settings = useSettings();
  const couponFn = useServerFn(checkCoupon);
  const orderFn = useServerFn(placeOrder);
  const FREE_SHIPPING_MIN = settings.free_shipping_min, SHIPPING_FEE = settings.shipping_fee;

  const disc = Math.round(cart.subtotal * discount);
  const shipping = cart.subtotal - disc >= FREE_SHIPPING_MIN || cart.subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = cart.subtotal - disc + shipping;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    const r = await couponFn({ data: { code: coupon } });
    if (r.valid) { setDiscount(r.percent / 100); toast.success("Coupon applied"); } else { setDiscount(0); toast.error("Invalid coupon code"); }
  };

  const next = async () => {
    if (step === 0 && (!ship.name || !ship.phone || !ship.address)) { toast.error("Please fill in your shipping info"); return; }
    if (step === 2) {
      setBusy(true);
      try {
        const r = await orderFn({ data: {
          items: cart.items.map((i) => ({ productId: i.productId, color: i.color, size: i.size, qty: i.qty })),
          name: ship.name, phone: ship.phone.replace(/[\s-]/g, ""), address: ship.address, city: ship.city,
          payment: pay as "bKash" | "SSLCommerz" | "COD", coupon: discount ? coupon : undefined,
        } });
        if (r.redirect) { window.location.href = r.redirect; return; }
        setOrderId(r.orderId); cart.clear();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        toast.error(msg.startsWith("[") ? "Please check your details and try again" : msg);
        setBusy(false); return;
      }
      setBusy(false);
    }
    setStep(step + 1);
  };

  if (!cart.items.length && step < 3) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Your cart is empty</h1>
        <Link to="/shop" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm text-primary-foreground">Start Shopping</Link>
      </div>
    );
  }

  const input = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm";

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_420px]">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Your Cart <span className="text-base font-normal text-muted-foreground">({cart.count} items)</span></h1>
          {step < 3 && <button onClick={cart.clear} className="text-sm text-muted-foreground">Clear Cart</button>}
        </div>
        {step === 3 ? (
          <p className="text-muted-foreground">Items have been ordered.</p>
        ) : (
          <div className="space-y-4">
            {cart.items.map((i) => (
              <div key={i.key} className="flex gap-4 rounded-2xl bg-card p-4 shadow-soft">
                <img src={i.product.images[0]} alt={i.product.name} className="h-24 w-24 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="truncate font-semibold">{i.product.name}</p>
                    <button onClick={() => cart.remove(i.key)} aria-label="Remove"><X className="h-4 w-4" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground">{i.product.category} | {i.color} | {i.size}</p>
                  <p className="mt-1 text-sm font-semibold">{formatPrice(i.product.price)}</p>
                  <div className="mt-2 inline-flex items-center rounded-md border border-border">
                    <button onClick={() => cart.setQty(i.key, i.qty - 1)} className="p-1.5"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm">{i.qty}</span>
                    <button onClick={() => cart.setQty(i.key, i.qty + 1)} className="p-1.5"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            ))}
            <div>
              <p className="mb-2 text-sm font-semibold">Apply Coupon Code</p>
              <div className="flex max-w-md gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter code (try EYE10)" className={input} />
                <button onClick={applyCoupon} className="rounded-md bg-olive px-5 text-sm text-olive-foreground">Apply</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <aside className="h-fit rounded-2xl bg-card p-6 shadow-soft">
        <h2 className="font-display text-2xl font-bold">Checkout</h2>
        <ol className="mt-4 space-y-2">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2 text-sm">
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-olive text-olive-foreground" : "border border-border"}`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className={i === step ? "font-semibold" : "text-muted-foreground"}>{s}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 border-t border-border pt-6">
          {step === 0 && (
            <div className="space-y-3">
              <input className={input} placeholder="Full name" value={ship.name} onChange={(e) => setShip({ ...ship, name: e.target.value })} />
              <input className={input} placeholder="Phone (01XXXXXXXXX)" value={ship.phone} onChange={(e) => setShip({ ...ship, phone: e.target.value })} />
              <textarea className={input} placeholder="Full address" value={ship.address} onChange={(e) => setShip({ ...ship, address: e.target.value })} />
              <select className={input} value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })}>
                {["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal", "Rangpur", "Mymensingh"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-2">
              <p className="mb-2 text-sm font-semibold">Payment Method</p>
              {PAYMENTS.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${pay === m.id ? "border-primary" : "border-border"}`}>
                  <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} className="accent-primary" /> {m.label}
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-1 text-sm">
              <p><b>Ship to:</b> {ship.name}, {ship.phone}</p>
              <p className="text-muted-foreground">{ship.address}, {ship.city}</p>
              <p className="pt-2"><b>Payment:</b> {PAYMENTS.find((m) => m.id === pay)?.label}</p>
            </div>
          )}
          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></div>
              <p className="mt-3 font-semibold">Order placed!</p>
              <p className="text-sm text-muted-foreground">Your order ID is <b>{orderId}</b></p>
              <Link to="/track" search={{ id: orderId }} className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Track Order</Link>
            </div>
          )}
        </div>

        {step < 3 && (
          <>
            <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
              {disc > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>-{formatPrice(disc)}</dd></div>}
              <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? formatPrice(shipping) : `${formatPrice(0)} (Free)`}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
            <div className="mt-5 flex gap-2">
              {step > 0 && <button onClick={() => setStep(step - 1)} className="rounded-md border border-border px-4 text-sm">Back</button>}
              <button onClick={next} disabled={busy} className="flex-1 disabled:opacity-60 rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground">
                {step === 0 ? "Proceed to Payment" : step === 1 ? "Review Order" : busy ? "Please wait…" : pay === "COD" ? "Place Order" : "Pay Now"}
              </button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Your information is safe and secure</p>
          </>
        )}
      </aside>
    </div>
  );
}
