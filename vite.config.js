-- ============================================================
-- DISTRI COSENZA - Setup de base de datos en Supabase
-- Ejecutar en: Supabase > SQL Editor > New Query
-- ============================================================

-- 1. TABLA DE PRODUCTOS
create table if not exists products (
  id          bigint primary key generated always as identity,
  name        text not null,
  desc        text default '',
  unit        text default 'docena',
  qty_per_unit int default 12,
  cat         text default '',
  photo       text,
  photo2      text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- 2. TABLA DE CLIENTES
create table if not exists clients (
  id          bigint primary key generated always as identity,
  name        text not null,
  username    text unique not null,
  password    text not null,
  phone       text default '',
  address     text default '',
  type        text default 'Almacén',
  prices      jsonb default '{}',
  created_at  timestamptz default now()
);

-- 3. TABLA DE PEDIDOS
create table if not exists orders (
  id          bigint primary key generated always as identity,
  client_id   bigint references clients(id),
  items       jsonb not null default '[]',
  total       numeric default 0,
  status      text default 'pending',
  created_at  timestamptz default now()
);

-- 4. ACCESO PUBLICO (la app usa anon key, sin auth de Supabase)
alter table products enable row level security;
alter table clients  enable row level security;
alter table orders   enable row level security;

create policy "public read products"  on products for select using (true);
create policy "public read clients"   on clients  for select using (true);
create policy "public insert orders"  on orders   for insert with check (true);
create policy "public read orders"    on orders   for select using (true);
create policy "public write products" on products for all    using (true);
create policy "public write clients"  on clients  for all    using (true);
create policy "public write orders"   on orders   for all    using (true);

-- 5. CLIENTE DE PRUEBA
insert into clients (name, username, password, phone, type, prices)
values (
  'Almacen Don Juan',
  'donjuan',
  '123',
  '5491165001234',
  'Almacén',
  '{}'
);
