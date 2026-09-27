import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/try-on", label: "Virtual Try-On" },
  { to: "/prescription", label: "Prescription" },
  { to: "/track", label: "Track Order" },
] as const;

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="text-foreground/80 hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/shop" aria-label="Search"><Search className="h-5 w-5" /></Link>
          <User className="hidden h-5 w-5 sm:block" />
          <Link to="/cart" aria-label="Cart" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">{count}</span>
            )}
          </Link>
        </div>
      </div>
      <nav className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2 text-sm md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="whitespace-nowrap text-foreground/70" activeProps={{ className: "font-semibold text-foreground" }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
