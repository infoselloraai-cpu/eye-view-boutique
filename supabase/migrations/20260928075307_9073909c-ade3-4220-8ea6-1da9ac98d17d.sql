create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
create policy "Users see own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
for each row execute function public.handle_first_admin();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

create table public.products (
  id text primary key,
  name text not null,
  category text not null default 'Eyeglasses',
  gender text not null default 'Unisex',
  shape text not null default 'Rectangle',
  price integer not null default 0,
  old_price integer,
  rating numeric not null default 4.5,
  reviews integer not null default 0,
  colors jsonb not null default '[]'::jsonb,
  image_url text,
  is_new boolean not null default false,
  description text not null default '',
  stock integer not null default 0,
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public views active products" on public.products for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "Admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  percent integer not null default 10,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.coupons to authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "Admins manage coupons" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  discount integer not null default 0,
  shipping integer not null default 0,
  total integer not null default 0,
  coupon_code text,
  payment_method text not null,
  payment_status text not null default 'pending',
  status text not null default 'Order Placed',
  transaction_id text,
  gateway_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Admins view orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  shipping_fee integer not null default 80,
  free_shipping_min integer not null default 1500,
  contact_phone text not null default '+880 1700-000000',
  contact_email text not null default 'hello@eyeview.com.bd',
  announcement text not null default '',
  payment_mode text not null default 'sandbox',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Anyone reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings (id) values (1);

insert into public.coupons (code, percent) values ('EYE10', 10);

insert into public.products (id,name,category,gender,shape,price,old_price,rating,reviews,colors,is_new,stock,sort,description) values
('aviator-classic','Aviator Classic','Sunglasses','Unisex','Aviator',4500,6000,4.5,124,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Tortoise","hex":"#8b5a2b"},{"name":"Gold","hex":"#c9a84c"},{"name":"Silver","hex":"#c0c0c0"}]',false,20,1,''),
('urban-square','Urban Square','Eyeglasses','Men','Square',3800,null,4,88,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Silver","hex":"#c0c0c0"}]',false,20,2,''),
('nova-round','Nova Round','Eyeglasses','Unisex','Round',3500,4200,4.5,76,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Tortoise","hex":"#8b5a2b"}]',true,20,3,''),
('ocean-blue','Ocean Blue','Blue Light','Unisex','Rectangle',4200,null,4.5,82,'[{"name":"Navy","hex":"#1e3a8a"},{"name":"Black","hex":"#1a1a1a"}]',false,20,4,''),
('vertex-black','Vertex Black','Sunglasses','Men','Square',5800,7000,4,110,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Green","hex":"#2f5233"}]',false,20,5,''),
('willow-clear','Willow Clear','Eyeglasses','Women','Round',3200,null,4.5,94,'[{"name":"Gold","hex":"#c9a84c"},{"name":"Rose","hex":"#e8a0b0"}]',true,20,6,''),
('luna-cat','Luna Cat Eye','Sunglasses','Women','Cat Eye',5200,6500,5,58,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Rose","hex":"#e8a0b0"},{"name":"Tortoise","hex":"#8b5a2b"}]',true,20,7,''),
('pixel-guard','Pixel Guard','Blue Light','Unisex','Square',2900,3500,4,140,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Navy","hex":"#1e3a8a"}]',false,20,8,''),
('metro-rect','Metro Rectangle','Eyeglasses','Men','Rectangle',2700,null,4,63,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Silver","hex":"#c0c0c0"},{"name":"Navy","hex":"#1e3a8a"}]',false,20,9,''),
('sahara-pilot','Sahara Pilot','Sunglasses','Men','Aviator',6800,8200,4.5,47,'[{"name":"Gold","hex":"#c9a84c"},{"name":"Silver","hex":"#c0c0c0"}]',false,20,10,''),
('study-lite','Study Lite','Blue Light','Women','Round',2500,null,4.5,71,'[{"name":"Rose","hex":"#e8a0b0"},{"name":"Gold","hex":"#c9a84c"}]',true,20,11,''),
('bold-frame','Bold Frame','Eyeglasses','Unisex','Square',4100,4800,4,39,'[{"name":"Black","hex":"#1a1a1a"},{"name":"Tortoise","hex":"#8b5a2b"}]',false,20,12,'');

create policy "Public reads product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins change product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));