-- Agregar columna invite_code a cl_teams
ALTER TABLE cl_teams ADD COLUMN IF NOT EXISTS invite_code text unique;

-- Crear funcion para generar string random alfanumerico
CREATE OR REPLACE FUNCTION generate_invite_code(length integer DEFAULT 6)
RETURNS text AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar codigo al crear equipo
CREATE OR REPLACE FUNCTION set_team_invite_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code(6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invite_code ON cl_teams;
CREATE TRIGGER trigger_set_invite_code
BEFORE INSERT ON cl_teams
FOR EACH ROW EXECUTE FUNCTION set_team_invite_code();

-- Rellenar codigos para equipos existentes
UPDATE cl_teams SET invite_code = generate_invite_code(6) WHERE invite_code IS NULL;

-- Security Definer Function para unirse a un equipo usando el código
CREATE OR REPLACE FUNCTION join_team_by_code(p_invite_code text)
RETURNS boolean AS $$
DECLARE
  v_team_id uuid;
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No estás autenticado';
  END IF;

  -- Buscar el ID del equipo con ese código
  SELECT id INTO v_team_id FROM cl_teams WHERE invite_code = p_invite_code LIMIT 1;
  
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Código de invitación inválido o no existe';
  END IF;

  -- Actualizar el usuario actual para asignarle ese equipo
  UPDATE cl_users SET team_id = v_team_id WHERE id = v_user_id;

  -- Aumentar los miembros del equipo
  UPDATE cl_teams SET members = members + 1 WHERE id = v_team_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
