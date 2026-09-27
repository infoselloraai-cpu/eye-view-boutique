// Edit branding here — every page reads from this file.
export const SITE_NAME = "EYE VIEW";
export const SITE_TAGLINE = "See More. Live Better.";
export const LOGO_TEXT = "EYE VIEW";
/** Name of a lucide-react icon used as the logo mark */
export const LOGO_ICON = "Eye" as const;
export const PRIMARY_COLOR = "#1A2E1A";
export const CURRENCY = "৳";
export const FREE_SHIPPING_MIN = 1500;
export const SHIPPING_FEE = 80;

export const formatPrice = (n: number) => `${CURRENCY}${n.toLocaleString("en-IN")}`;
