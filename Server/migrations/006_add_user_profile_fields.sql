-- Extend users table with additional profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(25);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS diving_license VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_expiry VARCHAR(25);
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_url TEXT;

-- Maintain updated_at on update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at'
  ) THEN
    CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;


