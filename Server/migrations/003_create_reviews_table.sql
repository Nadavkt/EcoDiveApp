-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id SERIAL PRIMARY KEY,
    club_id INTEGER,
    site_id INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (site_id) REFERENCES dive_sites(site_id) ON DELETE CASCADE
);

-- Create index on site_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_site_id ON reviews(site_id);

-- Create index on rating for filtering
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Insert sample reviews data
INSERT INTO reviews (site_id, user_name, rating, comment) VALUES
(1, 'John Diver', 5, 'Absolutely incredible experience! The visibility was amazing and the marine life was spectacular.'),
(1, 'Sarah Marine', 4, 'Great dive site, but it can get crowded. The blue hole itself is breathtaking.'),
(2, 'Mike Ocean', 5, 'The Great Barrier Reef is a must-see for any diver. The coral formations are stunning.'),
(2, 'Lisa Reef', 4, 'Amazing biodiversity, but some areas show signs of coral bleaching. Still worth the visit.'),
(3, 'Erik Glacier', 5, 'Most unique diving experience ever! The water is so clear you can see forever.'),
(3, 'Anna Ice', 4, 'Cold but worth it! The tectonic plates are fascinating to see underwater.'),
(4, 'Ahmed Red', 5, 'Perfect conditions and incredible marine life. The Red Sea never disappoints.'),
(4, 'Fatima Sea', 4, 'Beautiful reefs with lots of fish. Great for both beginners and experienced divers.'),
(5, 'Carlos Cenote', 5, 'Magical experience in the cenotes. The light effects are absolutely stunning.'),
(5, 'Maria Maya', 4, 'Unique freshwater diving. The stalactites and stalagmites are amazing.'),
(6, 'Tom Palau', 5, 'Paradise on Earth! The Rock Islands are absolutely beautiful both above and below water.'),
(6, 'Jenny Pacific', 4, 'Incredible marine life and pristine reefs. A bit remote but totally worth it.'),
(7, 'Budi Komodo', 5, 'Saw manta rays and sharks! The marine life here is incredible.'),
(7, 'Sari Dragon', 4, 'Amazing biodiversity. The currents can be strong but the rewards are worth it.'),
(8, 'Diego Galapagos', 5, 'Once in a lifetime experience! Swimming with hammerhead sharks was incredible.'),
(8, 'Isabel Darwin', 4, 'Unique marine life you won''t see anywhere else. The sea lions are so playful!')
ON CONFLICT DO NOTHING;
