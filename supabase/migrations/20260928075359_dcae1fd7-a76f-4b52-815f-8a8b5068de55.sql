drop policy "Public views active products" on public.products;
create policy "Anyone views active products" on public.products for select to anon, authenticated using (active);