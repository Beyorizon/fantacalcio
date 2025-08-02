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