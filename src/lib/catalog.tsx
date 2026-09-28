import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { products as fallback, categoryImage, type Product } from "@/data/products";
import { FREE_SHIPPING_MIN, SHIPPING_FEE } from "@/config/site";

export interface Settings {
  shipping_fee: number;
  free_shipping_min: number;
  contact_phone: string;
  contact_email: string;
  announcement: string;
  payment_mode: string;
}

export interface ProductRow {
  id: string; name: string; category: string; gender: string; shape: string;
  price: number; old_price: number | null; rating: number; reviews: number;
  colors: { name: string; hex: string }[]; image_url: string | null; is_new: boolean;
  description: string; stock: number; active: boolean; sort: number;
}

// Loosely typed handle for tables created after types were generated.
export const db = supabase as unknown as { from: (t: string) => any; storage: typeof supabase.storage; auth: typeof supabase.auth; rpc: (...a: any[]) => any };

export function rowToProduct(r: ProductRow): Product {
  const img = r.image_url || categoryImage(r.category);
  return {
    id: r.id, name: r.name, category: r.category as Product["category"], gender: r.gender as Product["gender"],
    shape: r.shape as Product["shape"], price: r.price, oldPrice: r.old_price ?? undefined,
    rating: Number(r.rating), reviews: r.reviews, colors: r.colors ?? [], images: [img, img, img],
    isNew: r.is_new, stock: r.stock,
    description: r.description || `Elevate your style with the ${r.name}. Premium lenses, 100% UV protection and a lightweight frame for all-day comfort.`,
  };
}

const defaultSettings: Settings = {
  shipping_fee: SHIPPING_FEE, free_shipping_min: FREE_SHIPPING_MIN,
  contact_phone: "", contact_email: "", announcement: "", payment_mode: "sandbox",
};

const Ctx = createContext<{ products: Product[]; settings: Settings; loaded: boolean }>({ products: fallback, settings: defaultSettings, loaded: false });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallback);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([
        db.from("products").select("*").eq("active", true).order("sort"),
        db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      ]);
      if (!p.error && p.data) setProducts((p.data as ProductRow[]).map(rowToProduct));
      if (!s.error && s.data) setSettings(s.data as Settings);
      setLoaded(true);
    })();
  }, []);

  return <Ctx.Provider value={{ products, settings, loaded }}>{children}</Ctx.Provider>;
}

export const useCatalog = () => useContext(Ctx);
export const useProducts = () => useContext(Ctx).products;
export const useSettings = () => useContext(Ctx).settings;
