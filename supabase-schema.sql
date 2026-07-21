-- ============================================================
-- Accesorios Shop — Schema + Seed
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES (vinculado a auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger: crea perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. PRODUCTS
create table public.products (
  id bigint primary key generated always as identity,
  name text not null,
  price numeric not null,
  category text not null check (category in ('collares','aretes','pulseras','anillos')),
  images text[] default '{}',
  description text,
  stock int default 0,
  featured boolean default false,
  is_new boolean default false,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Anyone can view products"
  on public.products for select
  to anon, authenticated
  using (true);


-- 3. ORDERS
create table public.orders (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users,
  status text default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  total numeric not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  address text not null,
  city text not null,
  state text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Anyone can create orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);


-- 4. ORDER ITEMS
create table public.order_items (
  id bigint primary key generated always as identity,
  order_id bigint references public.orders on delete cascade not null,
  product_id bigint references public.products,
  product_name text not null,
  product_image text,
  qty int not null check (qty > 0),
  price numeric not null
);

alter table public.order_items enable row level security;

create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Anyone can insert order items"
  on public.order_items for insert
  to anon, authenticated
  with check (true);


-- ============================================================
-- SEED: 8 productos iniciales
-- ============================================================
-- ============================================================
-- NOTA: `profiles` también tiene columnas `role` (text) e
-- `is_admin` (boolean) agregadas manualmente en el dashboard,
-- fuera de este archivo. La función get_all_users() y la policy
-- is_admin()-based también viven solo en el dashboard.
-- ============================================================

-- Usuarios: soft-delete / desactivación desde admin/usuarios
alter table public.profiles add column if not exists is_active boolean not null default true;

drop function if exists public.get_all_users();

create function public.get_all_users()
returns table(id uuid, email text, full_name text, phone text, role text, is_active boolean, created_at timestamptz)
language plpgsql
security definer
set search_path to 'public'
as $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
    SELECT
      au.id,
      au.email::text,
      COALESCE(p.full_name, '')::text  AS full_name,
      COALESCE(p.phone,     '')::text  AS phone,
      COALESCE(p.role,   'user')::text AS role,
      COALESCE(p.is_active, true)      AS is_active,
      au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON p.id = au.id
    ORDER BY au.created_at DESC;
END;
$function$;


insert into public.products (name, price, category, images, description, stock, featured, is_new) values
  ('Collar Luna Dorada',      185000, 'collares',  array['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'], 'Collar delicado con dije de luna en baño de oro 18k. Cadena ajustable de 40 a 45 cm.',  8,  true,  true),
  ('Aretes Perla Clásica',    120000, 'aretes',    array['https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&q=80'], 'Aretes de perla cultivada con base de plata 925. Cierre de mariposa.',                  15, true,  false),
  ('Pulsera Celestial',        95000, 'pulseras',  array['https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80'], 'Pulsera fina con estrellas en baño de oro rosado. Talla ajustable.',                    12, true,  true),
  ('Anillo Solitario Rosa',   210000, 'anillos',   array['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80'], 'Anillo en plata 925 con piedra de cuarzo rosa. Disponible en tallas 5 a 9.',            6,  false, false),
  ('Collar Cadena Minimalista',145000,'collares',  array['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=80'], 'Cadena delgada en plata 925 con baño de oro. Longitud 42 cm.',                          20, false, true),
  ('Aretes Aro Fino',          88000, 'aretes',    array['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80'], 'Aros lisos en plata 925 baño de oro. Diámetro 2 cm. Ultraligeros.',                     18, false, false),
  ('Pulsera Corazón',          78000, 'pulseras',  array['https://images.unsplash.com/photo-1620656798579-1984d9e87df7?w=600&q=80'], 'Pulsera fina con charm de corazón en baño de oro 18k. Cierre de langosta.',             10, true,  false),
  ('Anillo Apilable Slim',     65000, 'anillos',   array['https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=600&q=80'], 'Anillo delgado liso en plata 925. Perfecto para apilar. Tallas 5 a 9.',                 25, false, true);
