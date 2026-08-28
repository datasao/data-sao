create extension if not exists pgcrypto;

create table if not exists public.noticias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  bajada text not null default '',
  cuerpo text not null default '',
  categoria text not null default 'Fútbol argentino',
  tags text[] not null default '{}',
  slug text not null,
  seo_descripcion text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'publicada', 'archivada')),
  imagen_url text,
  fuentes jsonb not null default '[]'::jsonb,
  hechos_confirmados jsonb not null default '[]'::jsonb,
  alertas jsonb not null default '[]'::jsonb,
  nivel_confianza text not null default 'medio' check (nivel_confianza in ('alto', 'medio', 'bajo')),
  source_fingerprint text not null unique,
  fuente_principal_url text,
  fecha_fuente timestamptz,
  orden integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.noticias enable row level security;
revoke all on public.noticias from anon, authenticated;

create index if not exists noticias_estado_orden_idx
  on public.noticias (estado, orden nulls last, created_at desc);

