import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { LOGO_ICON, LOGO_TEXT, SITE_TAGLINE } from "@/config/site";

export function Logo({ light = false }: { light?: boolean }) {
  const Icon = Icons[LOGO_ICON] as Icons.LucideIcon;
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2">
      <Icon className="h-8 w-8" strokeWidth={2.2} />
      <span className="leading-none">
        <span className="block font-display text-xl font-bold tracking-[0.12em]">{LOGO_TEXT}</span>
        <span className={`block text-[9px] uppercase tracking-[0.2em] ${light ? "opacity-70" : "text-muted-foreground"}`}>
          {SITE_TAGLINE}
        </span>
      </span>
    </Link>
  );
}
