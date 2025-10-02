-- Create dive_sites table
CREATE TABLE IF NOT EXISTS dive_sites (
    site_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on location for faster lookups
CREATE INDEX IF NOT EXISTS idx_dive_sites_location ON dive_sites(location);

-- Create index on coordinates for map queries
CREATE INDEX IF NOT EXISTS idx_dive_sites_coordinates ON dive_sites(latitude, longitude);

-- Insert sample dive sites data
INSERT INTO dive_sites (name, location, latitude, longitude, description) VALUES
('Blue Hole', 'Belize', 17.3159, -87.5346, 'Famous underwater sinkhole, one of the most spectacular dive sites in the world. Known for its crystal clear waters and diverse marine life.'),
('Great Barrier Reef', 'Australia', -18.2871, 147.6992, 'The world''s largest coral reef system, home to thousands of species of fish, coral, and marine life.'),
('Silfra Fissure', 'Iceland', 64.2556, -20.4144, 'Crack between the North American and Eurasian tectonic plates. Crystal clear glacial water with visibility up to 100 meters.'),
('Red Sea Reefs', 'Egypt', 27.8406, 34.3081, 'World-renowned coral reefs with exceptional visibility and diverse marine life including sharks, rays, and colorful fish.'),
('Cenotes', 'Mexico', 20.2114, -87.4654, 'Freshwater sinkholes connected to underground rivers. Unique diving experience in crystal clear waters with stunning rock formations.'),
('Palau Rock Islands', 'Palau', 7.1619, 134.3239, 'UNESCO World Heritage site with pristine coral reefs, WWII wrecks, and unique marine ecosystems.'),
('Komodo National Park', 'Indonesia', -8.5450, 119.4897, 'Diverse marine life including manta rays, sharks, and colorful coral reefs in the heart of the Coral Triangle.'),
('Galapagos Islands', 'Ecuador', -0.7893, -91.0543, 'Unique marine life including hammerhead sharks, sea lions, and marine iguanas. One of the world''s most biodiverse marine environments.')
ON CONFLICT DO NOTHING;
