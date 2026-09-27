import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { SITE_NAME, SITE_TAGLINE } from "@/config/site";
import { PaymentBadges } from "./PaymentBadges";

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm opacity-75">
            {SITE_TAGLINE} Premium eyewear brand in Bangladesh. Stylish frames, clear vision, a better you.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/try-on">Virtual Try-On</Link></li>
            <li><Link to="/prescription">Prescription</Link></li>
            <li><Link to="/track">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Customer Care</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>Contact Us</li><li>Return Policy</li><li>Shipping Info</li><li>FAQ</li><li>Privacy Policy</li><li>Terms & Conditions</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">{SITE_NAME} Club</h4>
          <p className="text-sm opacity-75">Get exclusive offers, new arrivals and style tips.</p>
          {done ? (
            <p className="mt-3 text-sm">Thanks for subscribing!</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }} className="mt-3 flex">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="min-w-0 flex-1 rounded-l-md bg-primary-foreground/10 px-3 py-2 text-sm placeholder:text-primary-foreground/50 outline-none" />
              <button className="rounded-r-md bg-primary-foreground px-4 text-sm font-medium text-primary">Subscribe</button>
            </form>
          )}
          <div className="mt-5 flex gap-4 opacity-80">
            <Facebook className="h-5 w-5" /><Instagram className="h-5 w-5" /><Youtube className="h-5 w-5" /><Twitter className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs opacity-80 sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <PaymentBadges />
        </div>
      </div>
    </footer>
  );
}
