-- Create users table for EcoDive registration
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    license_front_url TEXT,
    license_back_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on id_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_id_number ON users(id_number);

