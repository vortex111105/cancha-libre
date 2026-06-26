-- =============================================
-- CANCHA LIBRE — Agentes Libres
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================

-- Agregar campos de perfil a cl_users
ALTER TABLE cl_users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE cl_users ADD COLUMN IF NOT EXISTS avatar text default '🏃';
ALTER TABLE cl_users ADD COLUMN IF NOT EXISTS sport_preference text;
ALTER TABLE cl_users ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE cl_users ADD COLUMN IF NOT EXISTS looking_for_team boolean default false;
ALTER TABLE cl_users ADD COLUMN IF NOT EXISTS bio text;

-- Si los usuarios ya existen, intentar rescatar su nombre de los metadatos de auth
UPDATE cl_users
SET name = (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = cl_users.id)
WHERE name IS NULL;

-- Permitir que cualquiera lea a los usuarios (necesario para buscar jugadores libres)
DROP POLICY IF EXISTS "cl_users_read" ON cl_users;
CREATE POLICY "cl_users_read" ON cl_users FOR SELECT USING (true);
