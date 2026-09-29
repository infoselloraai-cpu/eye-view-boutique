import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { products as fallback, categoryImage, type Product } from "@/data/products";

export interface SiteContent {
  hero_eyebrow?: string; hero_title?: string; hero_subtitle?: string; hero_text?: string; hero_image?: string;
  banner_title?: string; banner_text?: string; banner_image?: string;
  about?: string; logo_url?: string; favicon_url?: string;
  cat_eyeglasses_img?: string; cat_sunglasses_img?: string; cat_bluelight_img?: string; cat_new_img?: string;
}
export interface Social { facebook?: string; instagram?: string; youtube?: string; tiktok?: string; whatsapp?: string }

export interface Settings {
  shipping_inside: number;
  shipping_outside: number;
  contact_phone: string;
  contact_email: string;
  business_address: string;
  payment_number: string;
  announcement: string;
  payment_mode: string;
  piprapay_url: string;
  social: Social;
  content: SiteContent;
}

export interface ColorOpt { name: string; hex: string; image?: string }
export interface ProductRow {
  id: string; name: string; category: string; gender: string; shape: string;
  price: number; old_price: number | null; offer_percent: number; rating: number; reviews: number;
  colors: ColorOpt[]; image_url: string | null; is_new: boolean;
  description: string; stock: number; active: boolean; sort: number;
}
export interface PageRow { slug: string; title: string; body: string; sort: number }

// Loosely typed handle for tables created after types were generated.
export const db = supabase as unknown as { from: (t: string) => any; storage: typeof supabase.storage; auth: typeof supabase.auth; rpc: (...a: any[]) => any };

/** Final selling price after the product's offer %. Same formula as the server. */
export const offerPrice = (price: number, pct: number) => (pct > 0 ? Math.round(price * (1 - pct / 100)) : price);

export function rowToProduct(r: ProductRow): Product {
  const img = r.image_url || categoryImage(r.category);
  const pct = r.offer_percent ?? 0;
  const price = offerPrice(r.price, pct);
  const oldPrice = pct > 0 ? r.price : r.old_price;
  return {
    id: r.id, name: r.name, category: r.category as Product["category"], gender: r.gender as Product["gender"],
    shape: r.shape as Product["shape"], price, ...(oldPrice ? { oldPrice } : {}), offerPercent: pct,
    rating: Number(r.rating), reviews: r.reviews, colors: r.colors ?? [], images: [img, img, img],
    isNew: r.is_new, stock: r.stock,
    description: r.description || `Elevate your style with the ${r.name}. Premium lenses, 100% UV protection and a lightweight frame for all-day comfort.`,
  };
}

export const defaultSettings: Settings = {
  shipping_inside: 70, shipping_outside: 130, contact_phone: "01885005734", contact_email: "",
  business_address: "Dhaka, Bangladesh", payment_number: "01885005734", announcement: "", payment_mode: "sandbox",
  piprapay_url: "", social: {}, content: {},
};

const Ctx = createContext<{ products: Product[]; settings: Settings; pages: PageRow[]; loaded: boolean }>({ products: fallback, settings: defaultSettings, pages: [], loaded: false });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallback);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, s, pg] = await Promise.all([
        db.from("products").select("*").eq("active", true).order("sort"),
        db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        db.from("pages").select("slug,title,body,sort").order("sort"),
      ]);
      if (!p.error && p.data) setProducts((p.data as ProductRow[]).map(rowToProduct));
      if (!s.error && s.data) setSettings({ ...defaultSettings, ...s.data, social: s.data.social ?? {}, content: s.data.content ?? {} });
      if (!pg.error && pg.data) setPages(pg.data);
      setLoaded(true);
    })();
  }, []);

  // Admin-controlled favicon.
  useEffect(() => {
    const href = settings.content.favicon_url || settings.content.logo_url;
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.removeAttribute("type");
    link.href = href;
  }, [settings.content.favicon_url, settings.content.logo_url]);

  return <Ctx.Provider value={{ products, settings, pages, loaded }}>{children}</Ctx.Provider>;
}

export const useCatalog = () => useContext(Ctx);
export const useProducts = () => useContext(Ctx).products;
export const useSettings = () => useContext(Ctx).settings;
export const usePages = () => useContext(Ctx).pages;
