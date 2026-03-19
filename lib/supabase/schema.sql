-- ============================================================
-- Jaba Shop — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,
  currency text not null default 'XOF',
  stock integer not null default 0,
  image_url text,
  category text,
  slug text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Orders table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  country_iso text not null default 'SN',
  total_amount integer not null,
  currency text not null default 'XOF',
  status text not null default 'pending'
    check (status in ('pending','processing','paid','failed','cancelled')),
  payment_provider text,
  dexpay_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null,
  subtotal integer not null
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- Decrement stock safely (called from webhook)
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- RLS
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "products_public_read" on products;
create policy "products_public_read" on products
  for select using (is_active = true);

drop policy if exists "orders_deny_anon" on orders;
create policy "orders_deny_anon" on orders using (false);

drop policy if exists "order_items_deny_anon" on order_items;
create policy "order_items_deny_anon" on order_items using (false);

-- Sample products
insert into products (name, description, price, currency, stock, image_url, category, slug) values
  ('T-Shirt Dakar', 'T-shirt coton premium imprimé Dakar', 8500, 'XOF', 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'Vêtements', 't-shirt-dakar'),
  ('Sac Tissé', 'Sac artisanal en tissu wax coloré', 15000, 'XOF', 20, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'Accessoires', 'sac-tisse'),
  ('Bracelet Bronze', 'Bracelet artisanal en bronze africain', 5500, 'XOF', 100, 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400', 'Bijoux', 'bracelet-bronze'),
  ('Bougie Karité', 'Bougie naturelle au beurre de karité', 4200, 'XOF', 30, 'https://images.unsplash.com/photo-1602607920396-b5b09e0cde03?w=400', 'Maison', 'bougie-karite'),
  ('Huile Argan', 'Huile d''argan pure 100ml pressée à froid', 12000, 'XOF', 40, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', 'Beauté', 'huile-argan'),
  ('Masque Argile', 'Masque visage à l''argile blanche du Maroc', 6800, 'XOF', 60, 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400', 'Beauté', 'masque-argile')
on conflict (slug) do nothing;
