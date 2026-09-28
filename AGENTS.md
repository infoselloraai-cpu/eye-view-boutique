<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Branding (name, tagline, logo icon, currency) lives only in src/config/site.ts — components import from it so the brand can be renamed in one place.
- Catalog is placeholder data in src/data/products.ts; cart state is a React Context (src/lib/cart.tsx) persisted to localStorage — swap for an API later without touching pages.
- Products, coupons, orders, site settings live in Lovable Cloud; storefront reads via CatalogProvider (src/lib/catalog.tsx) with static products as fallback.
- Orders are priced server-side in src/lib/orders.functions.ts; gateway calls (SSLCommerz, bKash) live in src/lib/payments.server.ts with callbacks under /api/public/payments.
- Admin dashboard at /admin (under _authenticated); first signed-up account becomes admin via DB trigger.
