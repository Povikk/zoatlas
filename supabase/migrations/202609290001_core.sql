create extension if not exists pgcrypto;
create type public.card_rarity as enum ('common','uncommon','rare','epic','mythic');
create type public.listing_status as enum ('active','sold','cancelled');
create type public.wallet_kind as enum ('credits','research');
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade,username text not null unique check (char_length(username) between 3 and 30),avatar_url text,title text not null default 'Observer',level integer not null default 1,xp bigint not null default 0 check (xp >= 0),created_at timestamptz not null default now());
create table public.species (id uuid primary key default gen_random_uuid(),slug text not null unique,scientific_name text not null unique,common_name_en text not null,common_name_fr text,kingdom text,phylum text,class_name text,order_name text,family text,genus text,description_en text,description_fr text,image_url text,image_credit text,image_creator text,image_license text,source_url text,conservation_status text,continents text[] not null default '{}',regions text[] not null default '{}',biomes text[] not null default '{}',habitats text[] not null default '{}',diet text,activity text,average_weight_kg numeric,average_length_cm numeric,average_lifespan_years numeric,top_speed_kph numeric,is_extinct boolean not null default false,is_active boolean not null default true,source text,source_identifier text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.card_editions (id uuid primary key default gen_random_uuid(),species_id uuid not null references public.species(id),name text not null,rarity public.card_rarity not null,variant_traits text[] not null default '{}',print_total integer check (print_total is null or print_total > 0),active boolean not null default true,created_at timestamptz not null default now(),unique(species_id,name,variant_traits));
create table public.card_instances (id uuid primary key default gen_random_uuid(),edition_id uuid not null references public.card_editions(id),owner_id uuid not null references public.profiles(id),serial_number integer,obtained_at timestamptz not null default now(),obtained_from text not null,is_locked boolean not null default false,created_at timestamptz not null default now());
create table public.card_events (id bigint generated always as identity primary key,card_instance_id uuid not null references public.card_instances(id),event_type text not null,from_owner_id uuid,to_owner_id uuid,reference_id uuid,occurred_at timestamptz not null default now(),metadata jsonb not null default '{}');
create table public.wallets (profile_id uuid not null references public.profiles(id),kind public.wallet_kind not null,balance bigint not null default 0 check (balance >= 0),updated_at timestamptz not null default now(),primary key(profile_id,kind));
create table public.wallet_transactions (id uuid primary key default gen_random_uuid(),profile_id uuid not null references public.profiles(id),kind public.wallet_kind not null,amount bigint not null check (amount <> 0),reason text not null,reference_id uuid,balance_after bigint not null check (balance_after >= 0),created_at timestamptz not null default now());
create table public.market_listings (id uuid primary key default gen_random_uuid(),card_instance_id uuid not null references public.card_instances(id),seller_id uuid not null references public.profiles(id),price bigint not null check (price > 0),status public.listing_status not null default 'active',buyer_id uuid references public.profiles(id),created_at timestamptz not null default now(),sold_at timestamptz);
create unique index one_active_listing_per_card on public.market_listings(card_instance_id) where status='active';
create table public.market_transactions (id uuid primary key default gen_random_uuid(),listing_id uuid not null unique references public.market_listings(id),buyer_id uuid not null references public.profiles(id),seller_id uuid not null references public.profiles(id),card_instance_id uuid not null references public.card_instances(id),species_id uuid not null references public.species(id),price bigint not null,created_at timestamptz not null default now());
create table public.pack_openings (id uuid primary key default gen_random_uuid(),profile_id uuid not null references public.profiles(id),pack_type text not null,claim_date date,idempotency_key uuid not null,result jsonb not null,opened_at timestamptz not null default now(),unique(profile_id,idempotency_key));
create unique index one_daily_pack on public.pack_openings(profile_id,claim_date,pack_type) where claim_date is not null;
create index species_family_idx on public.species(family);
create index cards_owner_idx on public.card_instances(owner_id,obtained_at desc);
create index listings_active_price_idx on public.market_listings(status,price) where status='active';
alter table public.profiles enable row level security;
alter table public.species enable row level security;
alter table public.card_editions enable row level security;
alter table public.card_instances enable row level security;
alter table public.wallets enable row level security;
alter table public.market_listings enable row level security;
create policy "catalogue is public" on public.species for select using (is_active);
create policy "editions are public" on public.card_editions for select using (active);
create policy "profiles are public" on public.profiles for select using (true);
create policy "owner reads cards" on public.card_instances for select using (owner_id=auth.uid());
create policy "owner reads wallet" on public.wallets for select using (profile_id=auth.uid());
create policy "active listings are public" on public.market_listings for select using (status='active' or seller_id=auth.uid() or buyer_id=auth.uid());
-- Sensitive mutations are deliberately not granted to browser roles. Implement pack claims,
-- recycling and market purchase as security-definer RPCs using auth.uid(), row locks,
-- ledger writes, idempotency keys and an explicit search_path.
