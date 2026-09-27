import { SITE_NAME } from "@/config/site";

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} — ${SITE_NAME}` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — ${SITE_NAME}` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
