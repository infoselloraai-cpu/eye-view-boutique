ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS shipping_inside integer NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS shipping_outside integer NOT NULL DEFAULT 130,
  ADD COLUMN IF NOT EXISTS payment_number text NOT NULL DEFAULT '01885005734',
  ADD COLUMN IF NOT EXISTS business_address text NOT NULL DEFAULT 'Dhaka, Bangladesh',
  ADD COLUMN IF NOT EXISTS social jsonb NOT NULL DEFAULT '{"facebook":"","instagram":"","youtube":"","tiktok":"","whatsapp":""}'::jsonb,
  ADD COLUMN IF NOT EXISTS content jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS piprapay_url text NOT NULL DEFAULT '';
UPDATE public.site_settings SET contact_phone = COALESCE(NULLIF(contact_phone,''),'01885005734');

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS offer_percent integer NOT NULL DEFAULT 0 CHECK (offer_percent BETWEEN 0 AND 90);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_ip text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS sender_number text,
  ADD COLUMN IF NOT EXISTS prescription jsonb;

CREATE TABLE public.pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  sort integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads pages" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Admins manage pages" ON public.pages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.pages (slug,title,body,sort) VALUES
('contact','Contact Us','We are happy to help! Call, email or visit us using the details below. Our team replies within 24 hours.',1),
('return-policy','Return Policy','If your product arrives damaged or incorrect, contact us within 7 days of delivery. The item must be unused and in its original box. We will replace it or refund you after checking.',2),
('shipping-info','Shipping Info','We deliver all over Bangladesh. Inside Dhaka: 1-3 days. Outside Dhaka: 3-5 days. The delivery charge is shown at checkout.',3),
('faq','FAQ','Q: How do I pay?
A: Send money to our bKash/Nagad number and enter the transaction ID at checkout, or choose Cash on Delivery.

Q: How do I track my order?
A: Use the Track Order page with your order ID.

Q: Can I order prescription glasses?
A: Yes, upload or enter your prescription at checkout.',4),
('privacy-policy','Privacy Policy','We only collect the information needed to deliver your order (name, phone, address). We never sell your data.',5),
('terms','Terms & Conditions','By ordering from our store you agree to provide correct information. Orders may be cancelled if payment cannot be verified.',6)
ON CONFLICT (slug) DO NOTHING;

CREATE POLICY "Admins manage media" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Anyone uploads prescriptions" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'prescriptions');
CREATE POLICY "Admins read prescriptions" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'prescriptions' AND public.has_role(auth.uid(),'admin'));