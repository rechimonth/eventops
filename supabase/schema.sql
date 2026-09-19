-- EventOps schema: Supabase (PostgreSQL)
-- SSOT: events es la raíz. Todo cuelga de event_id.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  event_date timestamptz not null,
  venue text,
  venue_lat double precision,
  venue_lng double precision,
  mode text not null default 'zen' check (mode in ('zen','mission','kiosk')),
  guest_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  full_name text not null,
  phone text,
  invite_slug text unique,
  rsvp_status text not null default 'pending' check (rsvp_status in ('pending','confirmed','declined')),
  dietary text,
  table_id text,
  source text default 'contacts' check (source in ('contacts','manual','whatsapp')),
  last_write_at timestamptz default now(),
  last_writer text,
  created_at timestamptz default now()
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  category text not null,
  name text not null,
  phone text,
  qr_token text unique not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','in_transit','at_door','load_in','live','load_out','done','late','cancelled')),
  scheduled_at timestamptz,
  duration_min int default 60,
  depends_on uuid references providers(id),
  created_at timestamptz default now()
);

create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  concept text not null,
  amount numeric(12,2) not null,
  tax_rate numeric(5,2) default 21.00,
  created_at timestamptz default now()
);

create table if not exists timeline_nodes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  sort_order int default 0
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  actor text not null,
  action text not null,
  entity text not null,
  entity_id text not null,
  diff jsonb,
  created_at timestamptz default now()
);

-- RLS mínimo viable
alter table events enable row level security;
alter table guests enable row level security;
alter table providers enable row level security;
alter table budget_items enable row level security;
alter table timeline_nodes enable row level security;
alter table audit_logs enable row level security;

-- Políticas: el dueño ve todo; invitados solo lectura de guests propios vía invite_slug (vía function).
-- Ajustar owner_id = auth.uid() en producción:
-- create policy "owner all" on events for all using (owner_id = auth.uid());

-- Trigger auditoría genérica (ejemplo guests)
create or replace function log_guest_change() returns trigger as $$
begin
  insert into audit_logs(event_id, actor, action, entity, entity_id, diff)
  values (coalesce(new.event_id, old.event_id), current_user, TG_OP, 'guests',
          coalesce(new.id::text, old.id::text),
          jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_guest_audit on guests;
create trigger trg_guest_audit after insert or update or delete on guests
for each row execute function log_guest_change();
