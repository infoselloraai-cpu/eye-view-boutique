import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db, type Settings } from "@/lib/catalog";

export function SettingsPanel() {
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => { db.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }: { data: Settings }) => setS(data)); }, []);
  if (!s) return <p className="text-muted-foreground">Loading…</p>;

  const save = async () => {
    const { error } = await db.from("site_settings").update({
      shipping_fee: s.shipping_fee, free_shipping_min: s.free_shipping_min, contact_phone: s.contact_phone,
      contact_email: s.contact_email, announcement: s.announcement, payment_mode: s.payment_mode,
    }).eq("id", 1);
    if (error) toast.error(error.message); else toast.success("Settings saved");
  };
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  const set = (k: keyof Settings, v: unknown) => setS({ ...s, [k]: v });

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Store settings</h2>
      <div className="grid gap-3 rounded-xl bg-card p-5 shadow-soft sm:grid-cols-2">
        <label className="text-xs">Delivery charge (৳)<input type="number" className={input} value={s.shipping_fee} onChange={(e) => set("shipping_fee", Number(e.target.value))} /></label>
        <label className="text-xs">Free delivery above (৳)<input type="number" className={input} value={s.free_shipping_min} onChange={(e) => set("free_shipping_min", Number(e.target.value))} /></label>
        <label className="text-xs">Contact phone<input className={input} value={s.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} /></label>
        <label className="text-xs">Contact email<input className={input} value={s.contact_email} onChange={(e) => set("contact_email", e.target.value)} /></label>
        <label className="text-xs sm:col-span-2">Announcement bar (leave empty to hide)<input className={input} value={s.announcement} onChange={(e) => set("announcement", e.target.value)} /></label>
        <div className="flex justify-end sm:col-span-2"><button onClick={save} className="rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Save</button></div>
      </div>
    </div>
  );
}
