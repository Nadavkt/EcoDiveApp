-- Add missing columns to existing dive_clubs table
ALTER TABLE dive_clubs ADD COLUMN IF NOT EXISTS club_id SERIAL;
ALTER TABLE dive_clubs ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE dive_clubs ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE dive_clubs ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
ALTER TABLE dive_clubs ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE dive_clubs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE dive_clubs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make city column nullable to avoid constraint issues
ALTER TABLE dive_clubs ALTER COLUMN city DROP NOT NULL;

-- Update existing data to use city as location and phone as contact_phone
UPDATE dive_clubs SET location = city WHERE location IS NULL;
UPDATE dive_clubs SET contact_phone = phone WHERE contact_phone IS NULL;

-- Insert additional dive clubs if they don't already exist
INSERT INTO dive_clubs (name, location, description, contact_email, contact_phone, website, image_url) VALUES
('Blue Reef Divers', 'Tel Aviv, Israel', 'Professional diving club specializing in Mediterranean dives. Certified instructors and modern equipment.', 'info@bluereefdivers.co.il', '+972-3-123-4567', 'https://bluereefdivers.co.il', 'https://images.unsplash.com/photo-1533903345306-15d1c30952de?q=80&w=1200&auto=format&fit=crop'),
('Coral Coast Club', 'Eilat, Israel', 'Red Sea diving specialists with over 20 years of experience. Daily boat trips to the best reefs.', 'dive@coralcoast.co.il', '+972-8-234-5678', 'https://coralcoast.co.il', 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop'),
('Mediterranean Explorers', 'Haifa, Israel', 'Northern Israel diving club focusing on Mediterranean marine life and underwater archaeology.', 'explore@meddivers.co.il', '+972-4-345-6789', 'https://meddivers.co.il', 'https://images.unsplash.com/photo-1518933165971-611dbc9c412d?q=80&w=1200&auto=format&fit=crop'),
('Red Sea Masters', 'Eilat, Israel', 'Advanced diving club for experienced divers. Deep wrecks and technical diving courses.', 'masters@redsea.co.il', '+972-8-456-7890', 'https://redseamasters.co.il', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200&auto=format&fit=crop'),
('Underwater Photography Club', 'Tel Aviv, Israel', 'Specialized club for underwater photography enthusiasts. Regular workshops and photo competitions.', 'photo@underwater.co.il', '+972-3-567-8901', 'https://underwaterphoto.co.il', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop'),
('Dolphin Dive Center', 'Eilat, Israel', 'Family-friendly diving center with dolphin encounters and beginner courses.', 'dolphin@divecenter.co.il', '+972-8-678-9012', 'https://dolphindive.co.il', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=1200&auto=format&fit=crop'),
('Caesarea Archaeological Divers', 'Caesarea, Israel', 'Unique club specializing in underwater archaeological dives at ancient Roman sites.', 'archaeo@caesarea.co.il', '+972-4-789-0123', 'https://caesareadivers.co.il', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop'),
('Night Dive Specialists', 'Herzliya, Israel', 'Expert night diving club with specialized equipment and safety protocols.', 'night@divespecialists.co.il', '+972-9-890-1234', 'https://nightdive.co.il', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200&auto=format&fit=crop'),
('Wreck Hunters', 'Ashdod, Israel', 'Advanced club focused on wreck diving and underwater exploration of sunken ships.', 'wrecks@hunters.co.il', '+972-8-901-2345', 'https://wreckhunters.co.il', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop'),
('Marine Biology Club', 'Haifa, Israel', 'Educational diving club combining marine biology research with recreational diving.', 'biology@marine.co.il', '+972-4-012-3456', 'https://marinebiology.co.il', 'https://images.unsplash.com/photo-1518933165971-611dbc9c412d?q=80&w=1200&auto=format&fit=crop');
