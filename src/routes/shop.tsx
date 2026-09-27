import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { products, type Category, type Gender, type Shape } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { PageHeader } from "@/components/PageHeader";
import { formatPrice } from "@/config/site";
import { Slider } from "@/components/ui/slider";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>) => ({
    category: typeof s.category === "string" ? s.category : undefined,
  }),
  head: () => meta("Shop All Eyewear", "Browse eyeglasses, sunglasses and blue light glasses. Filter by shape, gender, price and color."),
  component: Shop,
});

const CATS: Category[] = ["Eyeglasses", "Sunglasses", "Blue Light"];
const GENDERS: Gender[] = ["Men", "Women", "Unisex"];
const SHAPES: Shape[] = ["Rectangle", "Round", "Square", "Aviator", "Cat Eye"];
const COLORS = Array.from(new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values());
const PER_PAGE = 6;
const MAX = 10000;

function toggle<T>(arr: T[], v: T) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function Shop() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [cats, setCats] = useState<string[]>(category && category !== "New" ? [category] : []);
  const [onlyNew, setOnlyNew] = useState(category === "New");
  const [genders, setGenders] = useState<Gender[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [range, setRange] = useState<number[]>([0, MAX]);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const list = useMemo(() => {
    let r = products.filter(
      (p) =>
        (!cats.length || cats.includes(p.category)) &&
        (!onlyNew || p.isNew) &&
        (!genders.length || genders.includes(p.gender)) &&
        (!shapes.length || shapes.includes(p.shape)) &&
        (!colors.length || p.colors.some((c) => colors.includes(c.name))) &&
        p.price >= range[0] && p.price <= range[1],
    );
    if (sort === "low") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "high") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    return r;
  }, [cats, onlyNew, genders, shapes, colors, range, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const count = (fn: (p: (typeof products)[number]) => boolean) => products.filter(fn).length;
  const reset = () => { setPage(1); };

  const Check = ({ label, checked, onChange, n }: { label: string; checked: boolean; onChange: () => void; n: number }) => (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <input type="checkbox" checked={checked} onChange={() => { onChange(); reset(); }} className="h-4 w-4 accent-primary" />
      {label} <span className="text-muted-foreground">({n})</span>
    </label>
  );

  return (
    <>
      <PageHeader title="Shop All" subtitle="Find your perfect pair. From everyday classics to bold statements." />
      <div className="container-page grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} space-y-6 md:block`}>
          <div>
            <h3 className="mb-2 font-semibold">Categories</h3>
            {CATS.map((c) => <Check key={c} label={c} n={count((p) => p.category === c)} checked={cats.includes(c)} onChange={() => { setCats(toggle(cats, c)); navigate({ search: {} }); }} />)}
            <Check label="New Arrivals" n={count((p) => !!p.isNew)} checked={onlyNew} onChange={() => setOnlyNew(!onlyNew)} />
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Gender</h3>
            {GENDERS.map((g) => <Check key={g} label={g} n={count((p) => p.gender === g)} checked={genders.includes(g)} onChange={() => setGenders(toggle(genders, g))} />)}
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Frame Shape</h3>
            {SHAPES.map((s) => <Check key={s} label={s} n={count((p) => p.shape === s)} checked={shapes.includes(s)} onChange={() => setShapes(toggle(shapes, s))} />)}
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Price Range</h3>
            <Slider min={0} max={MAX} step={500} value={range} onValueChange={(v) => { setRange(v); reset(); }} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{formatPrice(range[0])}</span><span>{formatPrice(range[1])}{range[1] === MAX ? "+" : ""}</span></div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Color</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c.name} title={c.name} onClick={() => { setColors(toggle(colors, c.name)); reset(); }} className={`h-7 w-7 rounded-full border-2 ${colors.includes(c.name) ? "border-primary ring-2 ring-primary/30" : "border-card"}`} style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm md:hidden"><SlidersHorizontal className="h-4 w-4" /> Filters</button>
              <span className="text-sm font-medium">{list.length} Products</span>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm">
              <option value="featured">Sort by: Featured</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          {shown.length ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{shown.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          ) : (
            <p className="py-20 text-center text-muted-foreground">No products match these filters.</p>
          )}
          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`h-8 w-8 rounded-md text-sm ${n === current ? "bg-primary text-primary-foreground" : "border border-border"}`}>{n}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
