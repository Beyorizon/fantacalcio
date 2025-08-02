-- Add constraint to ensure ruolo column only accepts predefined values
ALTER TABLE giocatori 
ADD CONSTRAINT check_ruolo_valid 
CHECK (ruolo IN (
  'Por', 'DC', 'DD E', 'DS E', 'DC DS E', 'DD DS E', 'DC DS', 'DC DD',
  'B DS E', 'B DD E', 'E', 'EW', 'EM', 'EC',
  'M', 'MC', 'C', 'CT', 'CW', 'CWT',
  'T', 'W', 'WT', 'WA', 'TA', 'A', 'Pc'
));

-- Create an enum type for better performance (optional)
CREATE TYPE ruolo_type AS ENUM (
  'Por', 'DC', 'DD E', 'DS E', 'DC DS E', 'DD DS E', 'DC DS', 'DC DD',
  'B DS E', 'B DD E', 'E', 'EW', 'EM', 'EC',
  'M', 'MC', 'C', 'CT', 'CW', 'CWT',
  'T', 'W', 'WT', 'WA', 'TA', 'A', 'Pc'
);

-- Function to get all valid role options
CREATE OR REPLACE FUNCTION get_ruolo_options()
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY[
    'Por', 'DC', 'DD E', 'DS E', 'DC DS E', 'DD DS E', 'DC DS', 'DC DD',
    'B DS E', 'B DD E', 'E', 'EW', 'EM', 'EC',
    'M', 'MC', 'C', 'CT', 'CW', 'CWT',
    'T', 'W', 'WT', 'WA', 'TA', 'A', 'Pc'
  ];
END;
$$ LANGUAGE plpgsql; 