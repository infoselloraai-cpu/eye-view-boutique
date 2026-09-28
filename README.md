# ViewPoint Commerce

Build a modern, responsive eyewear e-commerce website called "EYE VIEW" 
(tagline: "See More. Live Better.") using React + Vite + TypeScript + Tailwind CSS.

DESIGN STYLE:
- Warm cream/beige (#F5F1E8-ish) background with dark green/black (#1A2E1A) 
  accent buttons and text
- Clean sans-serif body font + a bold display font for headings
- Rounded product cards with subtle shadows, generous white space, 
  minimal editorial e-commerce look (similar to Warby Parker style)

BRANDING (must be easily editable):
- Create a single config file (src/config/site.ts) exporting:
  SITE_NAME, SITE_TAGLINE, LOGO_TEXT/LOGO_ICON, PRIMARY_COLOR, CURRENCY ("৳")
- Every page/component should pull the name & logo from this config — 
  never hardcode "EYE VIEW" directly in components, so I can rename the 
  brand/logo anytime from one file.

PAGES TO BUILD:
1. Home: hero banner (image + heading + "Shop Now"/"Explore Collections" 
   buttons), trust badges row (Free Shipping, 30 Days Return, 100% Authentic, 
   Secure Payment - bKash/Nagad/Card/COD), "Shop by Category" grid 
   (Eyeglasses, Sunglasses, Blue Light Glasses, New Arrivals), 
   banner CTA section, footer.
2. Shop/Category listing: left sidebar filters (Category, Gender, 
   Frame Shape, Price Range with slider ranges, Color swatches), 
   product grid with rating stars, price with strikethrough discount, 
   sort dropdown, pagination.
3. Product Detail page: image gallery with thumbnails, title, rating, 
   price + discount badge, color swatches, frame size selector, 
   quantity stepper, "Add to Cart" / "Buy Now" / "Add to Wishlist" buttons, 
   feature icons (UV Protection, Anti-Glare, Scratch Resistant, Lightweight), 
   tabs for Description / Specifications / Shipping & Return / Reviews.
4. Prescription & Lens Options page: tab switch between "Upload Prescription" 
   (file upload box for JPG/PNG/PDF) and "Enter Manually" (Right/Left eye 
   SPH, CYL, AXIS fields, PD input, Lens Type radio: Single Vision/
   Progressive/Reading, Lens Coatings checkboxes with prices).
5. Virtual Try-On page: tab for "Upload Photo" vs "Use Camera", uploaded 
   photo preview panel, scrollable list of frame thumbnails to try, 
   next/prev arrow.
6. Cart & Checkout: cart item list with qty controls, coupon code input, 
   order summary (Subtotal/Shipping/Total), payment method radio options 
   (bKash, Nagad, Rocket, Card, Cash on Delivery), multi-step indicator 
   (Shipping Info > Payment > Review > Confirmation).
7. Track Order page: order number/tracking ID input + Track button, 
   vertical status timeline (Order Placed > Processing > Shipped > Delivered) 
   with dates.
8. Footer (used sitewide): brand blurb, Quick Links, Customer Care links, 
   newsletter signup, social icons, payment method icons, copyright.

FUNCTIONALITY:
- Use React Router for navigation between all pages above
- Use React state (Context or Zustand) for cart state across pages
- Make it fully responsive (the mobile view should reuse the same components 
  in a single-column layout)
- Use placeholder product data (array of objects) that's easy to replace 
  with real API data later
- Structure the code cleanly (components/, pages/, config/) so it's easy 
  to connect to a real backend/database later

Currency should display in Bangladeshi Taka (৳). Keep the codebase clean 
and component-based, not a single giant file.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ba993645-4df7-4cf5-9e63-4a2184c12100).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
