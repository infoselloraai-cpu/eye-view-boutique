import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { products } from "@/data/products";
import { formatPrice } from "@/config/site";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/try-on")({
  head: () => meta("Virtual Try-On", "See how frames look on you before you buy — upload a photo or use your camera."),
  component: TryOn,
});

function TryOn() {
  const [tab, setTab] = useState<"upload" | "camera">("upload");
  const [photo, setPhoto] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [camErr, setCamErr] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const frame = products[idx];

  useEffect(() => {
    if (tab !== "camera") return;
    let stream: MediaStream | undefined;
    navigator.mediaDevices?.getUserMedia({ video: true }).then((s) => {
      stream = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    }).catch(() => setCamErr("Camera access was blocked or is unavailable."));
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [tab]);

  const move = (d: number) => setIdx((i) => (i + d + products.length) % products.length);

  return (
    <>
      <PageHeader title="Virtual Try-On" subtitle="See how you look before you buy." />
      <div className="container-page grid gap-6 lg:grid-cols-[320px_1fr_140px]">
        <div className="rounded-2xl bg-card p-5 shadow-soft">
          <div className="mb-5 grid grid-cols-2 border-b border-border">
            {(["upload", "camera"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`pb-3 text-sm ${tab === t ? "border-b-2 border-primary font-semibold" : "text-muted-foreground"}`}>{t === "upload" ? "Upload Photo" : "Use Camera"}</button>
            ))}
          </div>
          {tab === "upload" ? (
            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border px-4 py-10 text-center">
              <ImagePlus className="h-10 w-10" strokeWidth={1.5} />
              <p className="mt-3 font-semibold">Upload your photo</p>
              <p className="text-xs text-muted-foreground">JPG, PNG (Max 5MB)</p>
              <span className="mt-4 rounded-md bg-primary px-5 py-2 text-sm text-primary-foreground">Choose File</span>
              <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f)); }} />
            </label>
          ) : (
            <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border px-4 py-10 text-center text-sm">
              <Camera className="h-10 w-10" strokeWidth={1.5} />
              <p className="mt-3">{camErr || "Your camera feed appears in the preview."}</p>
            </div>
          )}
          <ol className="mt-6 space-y-2 text-xs text-muted-foreground">
            <li>1. Upload or take a photo</li><li>2. Try different frames</li><li>3. Find your perfect fit</li>
          </ol>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl bg-secondary">
          {tab === "camera" && !camErr ? (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full scale-x-[-1] object-cover" />
          ) : photo ? (
            <img src={photo} alt="Your photo" className="h-full max-h-[560px] w-full object-contain" />
          ) : (
            <p className="text-sm text-muted-foreground">Your photo will appear here</p>
          )}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-card/90 p-3 backdrop-blur">
            <button onClick={() => move(-1)} aria-label="Previous frame" className="rounded-full border border-border p-2"><ChevronLeft className="h-4 w-4" /></button>
            <div className="text-center"><p className="text-sm font-semibold">{frame.name}</p><p className="text-xs text-muted-foreground">{formatPrice(frame.price)}</p></div>
            <div className="flex items-center gap-2">
              <Link to="/product/$id" params={{ id: frame.id }} className="hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground sm:block">View</Link>
              <button onClick={() => move(1)} aria-label="Next frame" className="rounded-full border border-border p-2"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto lg:max-h-[560px] lg:flex-col lg:overflow-y-auto">
          {products.map((p, i) => (
            <button key={p.id} onClick={() => setIdx(i)} className={`w-28 shrink-0 overflow-hidden rounded-xl border-2 bg-card lg:w-full ${i === idx ? "border-primary" : "border-transparent"}`}>
              <img src={p.images[0]} alt={p.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
