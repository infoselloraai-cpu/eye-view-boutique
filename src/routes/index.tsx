import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CreditCard, RotateCcw, Truck } from "lucide-react";
import hero from "@/assets/hero.jpg";
import sunglasses from "@/assets/sunglasses.jpg";
import eyeglasses from "@/assets/eyeglasses.jpg";
import bluelight from "@/assets/bluelight.jpg";
import { SITE_NAME, SITE_TAGLINE, FREE_SHIPPING_MIN, formatPrice } from "@/config/site";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => meta("Premium Eyewear", "Shop stylish eyeglasses, sunglasses and blue light glasses with free shipping and easy returns across Bangladesh."),
  component: Home,
});

const badges = [
  { icon: Truck, title: "Free Shipping", sub: `On orders over ${formatPrice(FREE_SHIPPING_MIN)}` },
  { icon: RotateCcw, title: "30 Days Return", sub: "Hassle free returns" },
  { icon: BadgeCheck, title: "100% Authentic", sub: "Original branded products" },
  { icon: CreditCard, title: "Secure Payment", sub: "bKash, Nagad, Card & COD" },
];

const cats = [
  { name: "Eyeglasses", sub: "See the world clearly", img: eyeglasses, cat: "Eyeglasses" },
  { name: "Sunglasses", sub: "For every adventure", img: sunglasses, cat: "Sunglasses" },
  { name: "Blue Light Glasses", sub: "Work & study with comfort", img: bluelight, cat: "Blue Light" },
  { name: "New Arrivals", sub: "Latest styles, trendiest looks", img: hero, cat: "New" },
] as const;

function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Man wearing sunglasses" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="container-page relative py-20 md:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">Premium eyewear for every you</p>
          <h1 className="mt-4 font-display text-6xl font-bold leading-none md:text-8xl">{SITE_NAME}</h1>
          <p className="mt-3 font-display text-2xl md:text-3xl">{SITE_TAGLINE}</p>
          <p className="mt-4 max-w-sm text-foreground/80">Stylish frames. Clear vision. A better you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Shop Now</Link>
            <Link to="/shop" className="rounded-md border border-primary px-6 py-3 text-sm font-medium">Explore Collections</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container-page grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
          {badges.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <b.icon className="h-7 w-7 shrink-0" strokeWidth={1.5} />
              <div className="min-w-0"><p className="text-sm font-semibold">{b.title}</p><p className="text-xs text-muted-foreground">{b.sub}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Shop by Category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Explore our wide range of eyewear for every occasion.</p>
          </div>
          <Link to="/shop" className="hidden items-center gap-1 text-sm font-medium sm:flex">View All <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {cats.map((c) => (
            <Link key={c.name} to="/shop" search={{ category: c.cat }} className="group overflow-hidden rounded-2xl bg-card shadow-soft">
              <div className="aspect-[4/3] overflow-hidden"><img src={c.img} alt={c.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" /></div>
              <div className="p-4"><p className="font-semibold">{c.name}</p><p className="text-xs text-muted-foreground">{c.sub}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-secondary">
          <img src={sunglasses} alt="Aviator sunglasses" loading="lazy" className="absolute inset-y-0 right-0 h-full w-full object-cover md:w-2/3" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
          <div className="relative max-w-md p-8 md:p-14">
            <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">Timeless Styles For Modern You</h2>
            <p className="mt-3 text-sm text-foreground/80">Classic designs. Premium quality. Everyday comfort.</p>
            <Link to="/shop" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Shop Collection</Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-8 font-display text-3xl font-bold md:text-4xl">Bestsellers</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </>
  );
}
