-- Ajoute un champ pour suivre la première annonce postée par l'utilisateur
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_listing_at TIMESTAMPTZ;
-- Optionnel : pour un booléen
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS has_posted_listing_once BOOLEAN DEFAULT FALSE;
