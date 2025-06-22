-- Migration : Table des avis et notes utilisateurs pour DaloaMarket
-- Date : 2025-06-01

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- utilisateur noté
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- utilisateur qui note
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,       -- annonce concernée (optionnel)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),      -- note 1 à 5
  comment TEXT,                                                    -- commentaire libre
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reviewer_id, listing_id) -- Un avis par transaction/listing
);

-- Index pour accélérer les requêtes sur les profils
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON public.reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews(listing_id);
