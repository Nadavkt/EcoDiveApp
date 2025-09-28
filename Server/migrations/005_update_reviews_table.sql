-- Make site_id nullable to allow club reviews
ALTER TABLE reviews ALTER COLUMN site_id DROP NOT NULL;

-- Add a check constraint to ensure either site_id or club_id is provided
ALTER TABLE reviews ADD CONSTRAINT check_site_or_club 
CHECK (site_id IS NOT NULL OR club_id IS NOT NULL);
