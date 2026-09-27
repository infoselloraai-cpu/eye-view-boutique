import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { formatPrice } from "@/config/site";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/prescription")({
  head: () => meta("Prescription & Lens Options", "Upload your eye prescription or enter it manually, and choose lens type and coatings."),
  component: Prescription,
});

const range = (from: number, to: number, step: number) => {
  const out: string[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push((v > 0 ? "+" : "") + v.toFixed(2));
  return out;
};
const SPH = range(-10, 6, 0.25);
const CYL = range(-4, 0, 0.25);
const AXIS = Array.from({ length: 181 }, (_, i) => String(i));
const LENS_TYPES = ["Single Vision", "Progressive", "Reading"];
const COATINGS = [
  { name: "Anti-reflective", price: 1000 },
  { name: "Blue-light", price: 1000 },
  { name: "Photochromic", price: 1500 },
];

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}
      <select defaultValue="" className="mt-1 block w-full rounded-md border border-input bg-card px-2 py-2 text-sm text-foreground">
        <option value="">–</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Eye({ title }: { title: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        <Select label="SPH" options={SPH} /><Select label="CYL" options={CYL} /><Select label="AXIS" options={AXIS} />
      </div>
    </div>
  );
}

function Prescription() {
  const [tab, setTab] = useState<"upload" | "manual">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [lens, setLens] = useState("Single Vision");
  const [coats, setCoats] = useState<string[]>([]);
  const extra = COATINGS.filter((c) => coats.includes(c.name)).reduce((a, c) => a + c.price, 0);

  return (
    <>
      <PageHeader title="Prescription & Lens Options" subtitle="Upload your prescription or enter manually. We'll make your lenses with precision." />
      <div className="container-page">
        <div className="rounded-2xl bg-card p-6 shadow-soft md:p-8">
          <div className="mb-6 grid grid-cols-2 border-b border-border">
            {(["upload", "manual"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm ${tab === t ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"}`}>
                {t === "upload" ? "Upload Prescription" : "Enter Manually"}
              </button>
            ))}
          </div>

          {tab === "upload" ? (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-14 text-center">
              <FileUp className="h-10 w-10" strokeWidth={1.5} />
              <p className="mt-3 font-semibold">{file ? file.name : "Upload Prescription"}</p>
              <p className="text-xs text-muted-foreground">JPG, PNG or PDF (Max 5MB)</p>
              <span className="mt-4 rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Choose File</span>
              <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return; }
                setFile(f ?? null);
              }} />
            </label>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2"><Eye title="Right Eye (OD)" /><Eye title="Left Eye (OS)" /></div>
              <label className="block max-w-xs text-sm font-medium">
                PD (Pupillary Distance)
                <div className="mt-1 flex items-center rounded-md border border-input bg-card pr-3">
                  <input type="number" min={50} max={80} placeholder="63" className="w-full bg-transparent px-3 py-2 outline-none" />
                  <span className="text-xs text-muted-foreground">mm</span>
                </div>
                <span className="text-xs font-normal text-muted-foreground">Usually 52 – 74 mm</span>
              </label>
            </div>
          )}

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 font-semibold">Lens Type</p>
              <div className="flex flex-wrap gap-3">
                {LENS_TYPES.map((l) => (
                  <label key={l} className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm ${lens === l ? "border-primary" : "border-border"}`}>
                    <input type="radio" name="lens" checked={lens === l} onChange={() => setLens(l)} className="accent-primary" /> {l}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 font-semibold">Lens Coatings</p>
              {COATINGS.map((c) => (
                <label key={c.name} className="flex items-center gap-2 py-1 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-primary" checked={coats.includes(c.name)} onChange={() => setCoats(coats.includes(c.name) ? coats.filter((x) => x !== c.name) : [...coats, c.name])} />
                  {c.name} <span className="text-muted-foreground">(+{formatPrice(c.price)})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
            <p className="text-sm">Lens add-ons: <b>{formatPrice(extra)}</b></p>
            <button onClick={() => toast.success("Prescription saved")} className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">Save & Continue</button>
          </div>
        </div>
      </div>
    </>
  );
}
