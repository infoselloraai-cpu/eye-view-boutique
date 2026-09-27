import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatPrice, FREE_SHIPPING_MIN, SHIPPING_FEE } from "@/config/site";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/cart")({
  head: () => meta("Cart & Checkout", "Review your cart and check out securely with bKash, Nagad, Rocket, card or cash on delivery."),
  component: CartPage,
});

const STEPS = ["Shipping Info", "Payment", "Review", "Confirmation"];
const PAYMENTS = ["bKash", "Nagad", "Rocket", "Card (SSLCommerz)", "Cash on Delivery"];
const COUPONS: Record<string, number> = { EYE10: 0.1 };

function CartPage() {
  const cart = useCart();
  const [step, setStep] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [pay, setPay] = useState("bKash");
  const [ship, setShip] = useState({ name: "", phone: "", address: "", city: "Dhaka" });
  const [orderId, setOrderId] = useState("");

  const disc = Math.round(cart.subtotal * discount);
  const shipping = cart.subtotal - disc >= FREE_SHIPPING_MIN || cart.subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = cart.subtotal - disc + shipping;

  const applyCoupon = () => {
    const d = COUPONS[coupon.trim().toUpperCase()];
    if (d) { setDiscount(d); toast.success("Coupon applied"); } else toast.error("Invalid coupon code");
  };

  const next = () => {
    if (step === 0 && (!ship.name || !ship.phone || !ship.address)) return toast.error("Please fill in your shipping info");
    if (step === 2) { setOrderId("EV" + Math.floor(100000 + Math.random() * 900000)); cart.clear(); }
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
                <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${pay === m ? "border-primary" : "border-border"}`}>
                  <input type="radio" name="pay" checked={pay === m} onChange={() => setPay(m)} className="accent-primary" /> {m}
                </label>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-1 text-sm">
              <p><b>Ship to:</b> {ship.name}, {ship.phone}</p>
              <p className="text-muted-foreground">{ship.address}, {ship.city}</p>
              <p className="pt-2"><b>Payment:</b> {pay}</p>
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
              <button onClick={next} className="flex-1 rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground">
                {step === 0 ? "Proceed to Payment" : step === 1 ? "Review Order" : "Place Order"}
              </button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Your information is safe and secure</p>
          </>
        )}
      </aside>
    </div>
  );
}
