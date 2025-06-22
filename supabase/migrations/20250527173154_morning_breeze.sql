/*
  # Migration 1 - Schema Principal pour DaloaMarket
  
  1. Tables principales
    - `users` - Profils utilisateurs avec informations personnelles
    - `listings` - Annonces produits avec détails et photos
    - `messages` - Messages de chat entre utilisateurs
    - `transactions` - Enregistrements de paiement pour annonces et boosts
    - `reviews` - Notes et avis utilisateurs
  
  2. Sécurité
    - Activation Row Level Security (RLS) sur toutes les tables
    - Ajout des politiques pour utilisateurs authentifiés
*/

-- =====================================
-- SUPPRESSION DES TABLES EXISTANTES (optionnel - pour reset complet)
-- =====================================
-- Décommentez ces lignes si vous voulez repartir de zéro
/*
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
*/

-- =====================================
-- CRÉATION DES TABLES
-- =====================================

-- Table Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  district TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  rating NUMERIC(3,2) DEFAULT NULL
);

-- Table Listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  district TEXT NOT NULL,
  photos TEXT[] NOT NULL,
  boosted_until TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- Table Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false
);

-- Table Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  paydunya_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================
-- ACTIVATION ROW LEVEL SECURITY
-- =====================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =====================================
-- POLITIQUES RLS - TABLE USERS
-- =====================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Public can view user profiles" ON users;

-- Recréer les politiques
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() AND email = auth.email());

CREATE POLICY "Public can view user profiles"
  ON users
  FOR SELECT
  TO anon
  USING (true);

-- =====================================
-- POLITIQUES RLS - TABLE LISTINGS
-- =====================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can create their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

-- Recréer les politiques
CREATE POLICY "Anyone can view active listings"
  ON listings
  FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================
-- POLITIQUES RLS - TABLE MESSAGES
-- =====================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Recréer les politiques
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- =====================================
-- POLITIQUES RLS - TABLE TRANSACTIONS
-- =====================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;

-- Recréer les politiques
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =====================================
-- POLITIQUES RLS - TABLE REVIEWS
-- =====================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- Recréer les politiques
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (reviewer_id = auth.uid());

-- =====================================
-- INDEX POUR OPTIMISATION
-- =====================================

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);

-- =====================================
-- VÉRIFICATION FINALE
-- =====================================

-- Afficher les tables créées
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'listings', 'messages', 'transactions', 'reviews')
ORDER BY table_name;