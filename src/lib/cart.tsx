import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";
import { useProducts } from "@/lib/catalog";

export interface CartItem {
  key: string;
  productId: string;
  color: string;
  size: string;
  qty: number;
}

interface CartCtx {
  items: (CartItem & { product: Product })[];
  count: number;
  subtotal: number;
  add: (productId: string, color: string, size: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const products = useProducts();

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE);
      if (s) setItems(JSON.parse(s));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartCtx>(() => {
    const full = items
      .map((i) => ({ ...i, product: products.find((p) => p.id === i.productId)! }))
      .filter((i) => i.product);
    return {
      items: full,
      count: full.reduce((a, i) => a + i.qty, 0),
      subtotal: full.reduce((a, i) => a + i.qty * i.product.price, 0),
      add: (productId, color, size, qty = 1) =>
        setItems((prev) => {
          const key = `${productId}-${color}-${size}`;
          const ex = prev.find((i) => i.key === key);
          if (ex) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
          return [...prev, { key, productId, color, size, qty }];
        }),
      setQty: (key, qty) =>
        setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i))),
      remove: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
      clear: () => setItems([]),
    };
  }, [items, products]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be inside CartProvider");
  return c;
}
