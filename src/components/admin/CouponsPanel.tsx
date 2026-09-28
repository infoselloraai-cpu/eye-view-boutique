import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { db } from "@/lib/catalog";

interface Coupon { id: string; code: string; percent: number; active: boolean }

export function CouponsPanel() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState(10);

  const load = async () => {
    const { data, error } = await db.from("coupons").select("*").order("created_at");
    if (error) toast.error(error.message); else setRows(data);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c || percent < 1 || percent > 90) { toast.error("Enter a code and 1–90% off"); return; }
    const { error } = await db.from("coupons").insert({ code: c, percent });
    if (error) { toast.error(error.message); return; }
    setCode(""); load();
  };
  const toggle = async (c: Coupon) => { await db.from("coupons").update({ active: !c.active }).eq("id", c.id); load(); };
  const remove = async (id: string) => { await db.from("coupons").delete().eq("id", id); load(); };

  const input = "rounded-md border border-input bg-background px-3 py-2 text-sm";
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Coupons</h2>
      <form onSubmit={add} className="flex flex-wrap gap-2 rounded-xl bg-card p-4 shadow-soft">
        <input className={input} placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className={`${input} w-24`} type="number" value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
        <span className="self-center text-sm">% off</span>
        <button className="rounded-md bg-primary px-4 text-sm text-primary-foreground">Add</button>
      </form>
      <div className="space-y-2">
        {rows.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-soft">
            <span className="font-mono font-semibold">{c.code}</span><span className="text-sm">{c.percent}% off</span>
            <label className="ml-auto flex items-center gap-2 text-sm"><input type="checkbox" checked={c.active} onChange={() => toggle(c)} /> Active</label>
            <button onClick={() => remove(c.id)} className="text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
