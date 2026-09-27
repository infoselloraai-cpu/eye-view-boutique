import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Feather, Heart, Minus, Plus, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { toast } from "sonner";
import { getProduct, products } from "@/data/products";
import { Stars } from "@/components/Stars";
import { Price } from "@/components/Price";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { SITE_NAME } from "@/config/site";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return { id: p.id, name: p.name, category: p.category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.name} ${loaderData.category} — ${SITE_NAME}`;
    const d = `Buy ${loaderData.name} ${loaderData.category.toLowerCase()} online with UV protection, free shipping and 30-day returns.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "product" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="container-page py-20 text-center"><h1 className="font-display text-3xl">Product not found</h1><Link to="/shop" className="mt-4 inline-block underline">Back to shop</Link></div>
  ),
  errorComponent: ({ error }) => <div className="container-page py-20">{error.message}</div>,
});

const SIZES = ["Small", "Medium", "Large"];
const FEATURES = [
  { icon: Sun, label: "UV Protection" },
  { icon: Sparkles, label: "Anti-Glare" },
  { icon: ShieldCheck, label: "Scratch Resistant" },
  { icon: Feather, label: "Lightweight" },
];
const TABS = ["Description", "Specifications", "Shipping & Return", "Reviews"] as const;

function ProductPage() {
  const { id } = Route.useLoaderData();
  const p = getProduct(id)!;
  const { add } = useCart();
  const navigate = useNavigate();
  const [img, setImg] = useState(0);
  const [color, setColor] = useState(p.colors[0]?.name ?? "");
  const [size, setSize] = useState("Medium");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [wish, setWish] = useState(false);
  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  const addToCart = () => { add(p.id, color, size, qty); toast.success(`${p.name} added to cart`); };

  return (
    <div className="container-page py-8">
      <nav className="mb-6 text-xs text-muted-foreground"><Link to="/">Home</Link> › <Link to="/shop">{p.category}</Link> › <span className="text-foreground">{p.name}</span></nav>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {p.images.map((src, i) => (
              <button key={i} onClick={() => setImg(i)} className={`h-20 w-20 overflow-hidden rounded-xl border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
                <img src={src} alt="" className={`h-full w-full object-cover ${i === 1 ? "scale-x-[-1]" : i === 2 ? "scale-125" : ""}`} />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-2xl bg-card shadow-soft">
            <img src={p.images[img]} alt={p.name} width={1024} height={1024} className={`aspect-square w-full object-cover ${img === 1 ? "scale-x-[-1]" : img === 2 ? "scale-125" : ""}`} />
          </div>
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold">{p.name}</h1>
          <div className="mt-2"><Stars rating={p.rating} reviews={p.reviews} /></div>
          <div className="mt-4 flex items-center gap-3">
            <Price price={p.price} oldPrice={p.oldPrice} large />
            {off > 0 && <span className="rounded-full bg-olive px-2 py-0.5 text-xs font-semibold text-olive-foreground">{off}% OFF</span>}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{p.description}</p>

          <p className="mt-6 text-sm">Color: <b>{color}</b></p>
          <div className="mt-2 flex gap-3">
            {p.colors.map((c) => (
              <button key={c.name} onClick={() => setColor(c.name)} title={c.name} className={`h-8 w-8 rounded-full border-2 ${color === c.name ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""} border-card`} style={{ backgroundColor: c.hex }} />
            ))}
          </div>

          <div className="mt-6 flex justify-between text-sm"><span>Frame Size: <b>{size}</b></span><span className="text-muted-foreground underline">Size Guide</span></div>
          <div className="mt-2 flex gap-2">
            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={`rounded-md border px-4 py-2 text-sm ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{s}</button>
            ))}
          </div>

          <div className="mt-6 inline-flex items-center rounded-md border border-border bg-card">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
            <span className="w-10 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="p-3" aria-label="Increase"><Plus className="h-4 w-4" /></button>
          </div>

          <div className="mt-6 space-y-3">
            <button onClick={addToCart} className="w-full rounded-md bg-primary py-3 font-medium text-primary-foreground">Add to Cart</button>
            <button onClick={() => { add(p.id, color, size, qty); navigate({ to: "/cart" }); }} className="w-full rounded-md bg-olive py-3 font-medium text-olive-foreground">Buy Now</button>
            <button onClick={() => { setWish(!wish); toast(wish ? "Removed from wishlist" : "Added to wishlist"); }} className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card py-3 font-medium">
              <Heart className={`h-4 w-4 ${wish ? "fill-primary" : ""}`} /> {wish ? "In Wishlist" : "Add to Wishlist"}
            </button>
            <Link to="/prescription" className="block text-center text-sm underline">Add prescription lenses</Link>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl bg-card p-6 shadow-soft sm:grid-cols-4">
        {FEATURES.map((f) => <div key={f.label} className="flex flex-col items-center gap-2 text-center text-xs"><f.icon className="h-6 w-6" strokeWidth={1.5} />{f.label}</div>)}
      </div>

      <div className="mt-10">
        <div className="flex gap-6 overflow-x-auto border-b border-border">
          {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap pb-3 text-sm ${tab === t ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"}`}>{t}</button>)}
        </div>
        <div className="max-w-3xl py-6 text-sm leading-relaxed text-foreground/80">
          {tab === "Description" && <p>{p.description}</p>}
          {tab === "Specifications" && (
            <table className="w-full"><tbody>
              {[["Category", p.category], ["Frame Shape", p.shape], ["Gender", p.gender], ["Lens Width", "54 mm"], ["Bridge", "18 mm"], ["Temple Length", "145 mm"], ["Material", "Acetate / Metal"]].map(([k, v]) => (
                <tr key={k} className="border-b border-border"><td className="py-2 font-medium">{k}</td><td>{v}</td></tr>
              ))}
            </tbody></table>
          )}
          {tab === "Shipping & Return" && <p>Dhaka: 1–2 working days. Outside Dhaka: 2–5 working days. Free shipping over ৳1,500. Return within 30 days of receiving your order.</p>}
          {tab === "Reviews" && (
            <div className="space-y-4">
              {[["Rahim A.", 5, "Excellent quality, fits perfectly."], ["Nusrat J.", 4, "Stylish and light. Delivery was quick."]].map(([n, r, t]) => (
                <div key={n as string} className="rounded-xl bg-card p-4"><div className="flex items-center justify-between"><b>{n}</b><Stars rating={r as number} /></div><p className="mt-1">{t}</p></div>
              ))}
            </div>
          )}
        </div>
      </div>

      <h2 className="mb-6 mt-8 font-display text-2xl font-bold">You may also like</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.filter((x) => x.id !== p.id).slice(0, 4).map((x) => <ProductCard key={x.id} product={x} />)}
      </div>
    </div>
  );
}
