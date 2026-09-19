-- FASE 9: soft deletes + updated_at para LWW en la nube.
-- PROHIBIDO el DELETE real: la app solo escribe is_deleted = true.
alter table guests add column if not exists is_deleted boolean not null default false;
alter table providers add column if not exists is_deleted boolean not null default false;
alter table budget_items add column if not exists is_deleted boolean not null default false;
alter table timeline_nodes add column if not exists is_deleted boolean not null default false;
alter table guests add column if not exists updated_at timestamptz not null default now();
alter table providers add column if not exists updated_at timestamptz not null default now();
alter table budget_items add column if not exists updated_at timestamptz not null default now();
alter table timeline_nodes add column if not exists updated_at timestamptz not null default now();
create index if not exists idx_guests_sync on guests(event_id, updated_at) where is_deleted = false;
create index if not exists idx_providers_sync on providers(event_id, updated_at) where is_deleted = false;
