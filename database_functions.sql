-- Function to update the CL total for a specific user
CREATE OR REPLACE FUNCTION aggiorna_totale_utente(user_id TEXT)
RETURNS VOID AS $$
DECLARE
    totale_cl NUMERIC;
BEGIN
    -- Calculate the sum of CL values for the user, excluding TOTALE row and null/invalid values
    SELECT COALESCE(SUM(
        CASE 
            WHEN cl IS NULL OR cl = '' OR cl = '-' THEN 0
            ELSE CAST(cl AS NUMERIC)
        END
    ), 0)
    INTO totale_cl
    FROM giocatori 
    WHERE utente = user_id 
    AND numero != 'TOTALE'
    AND cl IS NOT NULL 
    AND cl != '' 
    AND cl != '-';
    
    -- Update the TOTALE row for this user
    UPDATE giocatori 
    SET cl = CAST(totale_cl AS TEXT)
    WHERE utente = user_id 
    AND numero = 'TOTALE';
    
    -- Log the update (optional)
    RAISE NOTICE 'Updated CL total for user %: %', user_id, totale_cl;
END;
$$ LANGUAGE plpgsql;

-- Function to handle the trigger (gets the user_id from the updated row)
CREATE OR REPLACE FUNCTION trigger_aggiorna_totale_cl()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the update function for the user of the updated row
    PERFORM aggiorna_totale_utente(NEW.utente);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that fires after UPDATE on the cl column
DROP TRIGGER IF EXISTS trigger_aggiorna_totale_cl_trigger ON giocatori;
CREATE TRIGGER trigger_aggiorna_totale_cl_trigger
    AFTER UPDATE OF cl ON giocatori
    FOR EACH ROW
    WHEN (OLD.cl IS DISTINCT FROM NEW.cl)  -- Only trigger if CL value actually changed
    EXECUTE FUNCTION trigger_aggiorna_totale_cl();

-- Function to initialize totals for all users (run this once to set up existing data)
CREATE OR REPLACE FUNCTION inizializza_totale_cl_tutti_utenti()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all unique users
    FOR user_record IN 
        SELECT DISTINCT utente 
        FROM giocatori 
        WHERE numero = 'TOTALE'
    LOOP
        -- Update total for each user
        PERFORM aggiorna_totale_utente(user_record.utente);
    END LOOP;
    
    RAISE NOTICE 'Initialized CL totals for all users';
END;
$$ LANGUAGE plpgsql;

-- Optional: Function to manually recalculate totals for all users
CREATE OR REPLACE FUNCTION ricalcola_totale_cl_tutti_utenti()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all unique users
    FOR user_record IN 
        SELECT DISTINCT utente 
        FROM giocatori 
        WHERE numero != 'TOTALE'
    LOOP
        -- Update total for each user
        PERFORM aggiorna_totale_utente(user_record.utente);
    END LOOP;
    
    RAISE NOTICE 'Recalculated CL totals for all users';
END;
$$ LANGUAGE plpgsql; 

-- Funzioni per l'autenticazione e controllo privilegi
-- Da eseguire nel SQL Editor di Supabase

-- 1. Funzione per verificare se l'utente è admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Controlla se l'utente autenticato ha il ruolo admin
  -- Puoi personalizzare questa logica in base alle tue esigenze
  
  -- Opzione 1: Controlla una tabella ruoli
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
  
  -- Opzione 2: Controlla un campo specifico nella tabella profiles
  -- RETURN EXISTS (
  --   SELECT 1 FROM profiles 
  --   WHERE id = auth.uid() 
  --   AND is_admin = true
  -- );
  
  -- Opzione 3: Lista hardcoded di email admin (per test)
  -- RETURN auth.jwt() ->> 'email' IN (
  --   'admin@example.com',
  --   'superuser@example.com'
  -- );
END;
$$;

-- 2. Tabella per gestire i ruoli utente (opzionale)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. RLS (Row Level Security) per la tabella user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: gli utenti possono vedere solo i propri ruoli
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: solo gli admin possono modificare i ruoli
CREATE POLICY "Only admins can modify roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 4. Funzione helper per assegnare ruoli (solo per admin)
CREATE OR REPLACE FUNCTION assign_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica che l'utente corrente sia admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  -- Verifica che il ruolo sia valido
  IF new_role NOT IN ('user', 'admin', 'moderator') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Inserisci o aggiorna il ruolo
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- 5. Inserimento di un utente admin di esempio (modifica con la tua email)
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'admin' 
-- FROM auth.users 
-- WHERE email = 'tua-email@example.com';

-- 6. Funzione per ottenere i ruoli dell'utente corrente
CREATE OR REPLACE FUNCTION get_current_user_roles()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN ARRAY(
    SELECT role 
    FROM user_roles 
    WHERE user_id = auth.uid()
  );
END;
$$;

-- 7. Funzione per verificare se l'utente ha un ruolo specifico
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = required_role
  );
END;
$$;

-- Note per l'implementazione:
-- 1. Esegui queste funzioni nel SQL Editor di Supabase
-- 2. Modifica la logica di is_admin() in base alle tue esigenze
-- 3. Crea la tabella user_roles se vuoi gestire ruoli multipli
-- 4. Inserisci manualmente il primo admin nella tabella user_roles
-- 5. Testa le funzioni con utenti autenticati

-- Test delle funzioni (da eseguire dopo aver creato un utente admin):
-- SELECT is_admin(); -- Dovrebbe restituire true per admin, false per utenti normali
-- SELECT get_current_user_roles(); -- Restituisce array dei ruoli dell'utente corrente
-- SELECT has_role('admin'); -- Verifica se l'utente ha un ruolo specifico 