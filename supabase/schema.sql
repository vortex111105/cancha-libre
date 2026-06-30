-- =============================================
-- CANCHA LIBRE — Supabase Schema
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/sjssmcmesbduwwwjxfal/sql
-- IMPORTANTE: prefijo cl_ en todas las tablas para no colisionar con mamina-artesanias
-- =============================================

-- Equipos (tabla principal)
create table if not exists cl_teams (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  name            text not null,
  avatar          text default '⚽',
  sport           text not null,
  level           text not null check (level in ('Principiante', 'Intermedio', 'Avanzado')),
  neighborhood    text,
  city            text default 'Buenos Aires',
  lat             float,
  lng             float,
  members         int default 1,
  wins            int default 0,
  losses          int default 0,
  draws           int default 0,
  rating          float default 0,
  rating_count    int default 0,
  description     text,
  available_days  text[] default '{}',
  color           text default '#4ADE80',
  created_at      timestamptz default now()
);

-- Usuarios (extiende auth.users, relaciona user con su equipo)
create table if not exists cl_users (
  id         uuid references auth.users(id) on delete cascade primary key,
  email      text not null,
  team_id    uuid references cl_teams(id) on delete set null,
  push_token text,
  created_at timestamptz default now()
);

-- Desafíos entre equipos
create table if not exists cl_challenges (
  id              uuid primary key default gen_random_uuid(),
  from_team       uuid references cl_teams(id) on delete cascade,
  to_team         uuid references cl_teams(id) on delete cascade,
  status          text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  proposed_date   text,
  proposed_time   text,
  field_id        uuid,
  message         text,
  is_completed    boolean default false,
  rating_from_team integer,
  rating_to_team   integer,
  score_from_team  integer,
  score_to_team    integer,
  payment_status  text default 'pending',
  created_at      timestamptz default now()
);

-- Conversaciones entre equipos
create table if not exists cl_conversations (
  id         uuid primary key default gen_random_uuid(),
  team1_id   uuid references cl_teams(id) on delete cascade,
  team2_id   uuid references cl_teams(id) on delete cascade,
  created_at timestamptz default now(),
  unique(team1_id, team2_id)
);

-- Mensajes dentro de conversaciones
create table if not exists cl_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references cl_conversations(id) on delete cascade,
  sender_team_id  uuid references cl_teams(id) on delete cascade,
  text            text not null,
  created_at      timestamptz default now()
);

-- Canchas disponibles
create table if not exists cl_fields (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  sports     text[] default '{}',
  price      numeric(10,2),
  lat        float,
  lng        float,
  rating     float,
  available  boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================

alter table cl_teams enable row level security;
alter table cl_users enable row level security;
alter table cl_challenges enable row level security;
alter table cl_conversations enable row level security;
alter table cl_messages enable row level security;
alter table cl_fields enable row level security;

-- cl_teams: cualquiera puede leer, solo el dueño puede escribir/actualizar
create policy "cl_teams_read"   on cl_teams for select using (true);
create policy "cl_teams_insert" on cl_teams for insert with check (auth.uid() = user_id);
create policy "cl_teams_update" on cl_teams for update using (auth.uid() = user_id);
create policy "cl_teams_delete" on cl_teams for delete using (auth.uid() = user_id);

-- cl_users: solo el propio usuario
create policy "cl_users_read"   on cl_users for select using (auth.uid() = id);
create policy "cl_users_insert" on cl_users for insert with check (auth.uid() = id);
create policy "cl_users_update" on cl_users for update using (auth.uid() = id);

-- cl_fields: lectura pública
create policy "cl_fields_read" on cl_fields for select using (true);

-- cl_challenges: equipos involucrados pueden leer
create policy "cl_challenges_read" on cl_challenges
  for select using (
    from_team in (select id from cl_teams where user_id = auth.uid()) or
    to_team   in (select id from cl_teams where user_id = auth.uid())
  );
create policy "cl_challenges_insert" on cl_challenges
  for insert with check (
    from_team in (select id from cl_teams where user_id = auth.uid())
  );
create policy "cl_challenges_update" on cl_challenges
  for update using (
    to_team in (select id from cl_teams where user_id = auth.uid())
  );

-- cl_conversations: participantes pueden leer e insertar
create policy "cl_conversations_read" on cl_conversations
  for select using (
    team1_id in (select id from cl_teams where user_id = auth.uid()) or
    team2_id in (select id from cl_teams where user_id = auth.uid())
  );
create policy "cl_conversations_insert" on cl_conversations
  for insert with check (
    team1_id in (select id from cl_teams where user_id = auth.uid()) or
    team2_id in (select id from cl_teams where user_id = auth.uid())
  );

-- cl_messages: participantes de la conversación
create policy "cl_messages_read" on cl_messages
  for select using (
    conversation_id in (
      select id from cl_conversations
      where team1_id in (select id from cl_teams where user_id = auth.uid())
         or team2_id in (select id from cl_teams where user_id = auth.uid())
    )
  );
create policy "cl_messages_insert" on cl_messages
  for insert with check (
    sender_team_id in (select id from cl_teams where user_id = auth.uid())
  );

-- =============================================
-- Fase 3 — Portal de Canchas (Etapa 1)
-- Ejecutar estas sentencias en Supabase SQL Editor
-- =============================================

-- Agregar nombre y rol a cl_users
alter table cl_users add column if not exists name text;
alter table cl_users add column if not exists role text default 'player'
  check (role in ('player', 'cancha_owner'));

-- Agregar owner_id, description y photos a cl_fields
alter table cl_fields add column if not exists owner_id uuid references cl_users(id);
alter table cl_fields add column if not exists description text;
alter table cl_fields add column if not exists photos text[] default '{}';

-- RLS de cl_fields: el dueño puede insertar y actualizar su propia cancha
create policy "cl_fields_insert" on cl_fields
  for insert with check (auth.uid() = owner_id);

create policy "cl_fields_update" on cl_fields
  for update using (auth.uid() = owner_id);

-- Disponibilidad horaria semanal por cancha
create table if not exists cl_field_slots (
  id           uuid primary key default gen_random_uuid(),
  field_id     uuid references cl_fields(id) on delete cascade,
  day_of_week  int  not null check (day_of_week between 0 and 6), -- 0=Dom, 1=Lun ... 6=Sab
  start_time   time not null,
  end_time     time not null,
  price        numeric(10,2),
  is_booked    boolean default false,
  created_at   timestamptz default now()
);

alter table cl_field_slots enable row level security;

-- Cualquiera puede ver la disponibilidad
create policy "cl_field_slots_read" on cl_field_slots
  for select using (true);

-- Solo el dueño de la cancha puede gestionar sus slots
create policy "cl_field_slots_write" on cl_field_slots
  for all using (
    field_id in (
      select id from cl_fields where owner_id = auth.uid()
    )
  );

-- =============================================
-- Fase 3 — Portal de Canchas Etapa 2: Chat equipo ↔ cancha
-- =============================================

-- Conversaciones entre un equipo y una cancha
create table if not exists cl_cancha_conversations (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid references cl_teams(id) on delete cascade,
  field_id   uuid references cl_fields(id) on delete cascade,
  created_at timestamptz default now(),
  unique(team_id, field_id)
);

-- Mensajes de esas conversaciones
create table if not exists cl_cancha_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references cl_cancha_conversations(id) on delete cascade,
  sender_type     text not null check (sender_type in ('team', 'cancha')),
  sender_id       uuid not null,
  text            text not null,
  created_at      timestamptz default now()
);

alter table cl_cancha_conversations enable row level security;
alter table cl_cancha_messages enable row level security;

create policy "cl_cancha_conv_read" on cl_cancha_conversations
  for select using (
    team_id  in (select id from cl_teams  where user_id  = auth.uid()) or
    field_id in (select id from cl_fields where owner_id = auth.uid())
  );
create policy "cl_cancha_conv_insert" on cl_cancha_conversations
  for insert with check (
    team_id in (select id from cl_teams where user_id = auth.uid())
  );

create policy "cl_cancha_msg_read" on cl_cancha_messages
  for select using (
    conversation_id in (
      select id from cl_cancha_conversations
      where team_id  in (select id from cl_teams  where user_id  = auth.uid())
         or field_id in (select id from cl_fields where owner_id = auth.uid())
    )
  );
create policy "cl_cancha_msg_insert" on cl_cancha_messages
  for insert with check (
    conversation_id in (
      select id from cl_cancha_conversations
      where team_id  in (select id from cl_teams  where user_id  = auth.uid())
         or field_id in (select id from cl_fields where owner_id = auth.uid())
    )
  );

-- =============================================
-- Datos iniciales de canchas (opcional)
-- =============================================
insert into cl_fields (name, address, sports, price, rating, available) values
  ('Complejo Deportivo Palermo', 'Av. del Libertador 4200, Palermo', '{"Fútbol 5vs5","Fútbol 7vs7","Básquet 5x5"}', 2800, 4.5, true),
  ('Canchas de Belgrano', 'Virrey del Pino 2400, Belgrano', '{"Fútbol 5vs5","Pádel Parejas","Pádel Single (1vs1)"}', 2400, 4.2, true),
  ('Sportclub Villa Crespo', 'Corrientes 5800, Villa Crespo', '{"Fútbol 5vs5","Fútbol 7vs7","Básquet 3x3"}', 3200, 4.7, true);
