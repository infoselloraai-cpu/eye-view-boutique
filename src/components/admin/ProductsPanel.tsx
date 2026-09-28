import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db, type ProductRow } from "@/lib/catalog";
import { categoryImage } from "@/data/products";
import { formatPrice } from "@/config/site";

const empty: ProductRow = { id: "", name: "", category: "Eyeglasses", gender: "Unisex", shape: "Rectangle", price: 0, old_price: null, rating: 4.5, reviews: 0, colors: [{ name: "Black", hex: "#1a1a1a" }], image_url: null, is_new: false, description: "", stock: 10, active: true, sort: 0 };
const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ProductsPanel() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [edit, setEdit] = useState<(ProductRow & { _new?: boolean }) | null>(null);

  const load = async () => {
    const { data, error } = await db.from("products").select("*").order("sort");
    if (error) toast.error(error.message); else setRows(data);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit) return;
    const { _new, ...row } = edit;
    if (!row.name.trim()) { toast.error("Name is required"); return; }
    if (_new) row.id = slug(row.name) || `p-${Date.now()}`;
    const { error } = _new ? await db.from("products").insert(row) : await db.from("products").update(row).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setEdit(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  const set = (k: keyof ProductRow, v: unknown) => setEdit((e) => (e ? { ...e, [k]: v } : e));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Products</h2>
        <button onClick={() => setEdit({ ...empty, sort: rows.length + 1, _new: true })} className="flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"><Plus className="h-4 w-4" /> Add product</button>
      </div>

      {edit && (
        <div className="grid gap-3 rounded-xl bg-card p-5 shadow-soft sm:grid-cols-2">
          <label className="text-xs">Name<input className={input} value={edit.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className="text-xs">Category<select className={input} value={edit.category} onChange={(e) => set("category", e.target.value)}>{["Eyeglasses", "Sunglasses", "Blue Light"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="text-xs">Gender<select className={input} value={edit.gender} onChange={(e) => set("gender", e.target.value)}>{["Men", "Women", "Unisex"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="text-xs">Shape<select className={input} value={edit.shape} onChange={(e) => set("shape", e.target.value)}>{["Rectangle", "Round", "Square", "Aviator", "Cat Eye"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label className="text-xs">Price (৳)<input type="number" className={input} value={edit.price} onChange={(e) => set("price", Number(e.target.value))} /></label>
          <label className="text-xs">Old price (optional)<input type="number" className={input} value={edit.old_price ?? ""} onChange={(e) => set("old_price", e.target.value ? Number(e.target.value) : null)} /></label>
          <label className="text-xs">Stock<input type="number" className={input} value={edit.stock} onChange={(e) => set("stock", Number(e.target.value))} /></label>
          <label className="text-xs">Image link (optional)<input className={input} placeholder="https://…" value={edit.image_url ?? ""} onChange={(e) => set("image_url", e.target.value || null)} /></label>
          <label className="text-xs sm:col-span-2">Colors (Name:#hex, comma separated)
            <input className={input} value={edit.colors.map((c) => `${c.name}:${c.hex}`).join(", ")} onChange={(e) => set("colors", e.target.value.split(",").map((x) => x.trim()).filter(Boolean).map((x) => { const [name, hex] = x.split(":"); return { name: name!.trim(), hex: (hex ?? "#1a1a1a").trim() }; }))} />
          </label>
          <label className="text-xs sm:col-span-2">Description<textarea className={input} rows={3} value={edit.description} onChange={(e) => set("description", e.target.value)} /></label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={edit.active} onChange={(e) => set("active", e.target.checked)} /> Visible in shop</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={edit.is_new} onChange={(e) => set("is_new", e.target.checked)} /> "New" badge</label>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button onClick={() => setEdit(null)} className="rounded-md border border-border px-4 py-2 text-sm">Cancel</button>
            <button onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="flex items-center gap-3 p-3"><img src={r.image_url || categoryImage(r.category)} alt="" className="h-10 w-10 rounded object-cover" />{r.name}</td>
                <td>{r.category}</td><td>{formatPrice(r.price)}</td>
                <td className={r.stock <= 0 ? "text-destructive" : ""}>{r.stock}</td>
                <td>{r.active ? "Visible" : "Hidden"}</td>
                <td className="whitespace-nowrap pr-3 text-right">
                  <button onClick={() => setEdit(r)} className="p-1.5" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => remove(r.id)} className="p-1.5 text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
