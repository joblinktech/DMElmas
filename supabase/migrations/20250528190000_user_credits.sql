/*
  # Migration 3 - Système de Crédits Utilisateurs pour DaloaMarket (CORRIGÉE)
  
  1. Table user_credits
    - Stockage des crédits pour chaque utilisateur
    - Historique des modifications
    
  2. Sécurité
    - Row Level Security activé
    - Chaque utilisateur ne peut voir que ses propres crédits
    
  3. Automatisation
    - Trigger pour initialiser les crédits des nouveaux utilisateurs
    - Fonction de gestion des crédits
*/

-- =====================================
-- SUPPRESSION DES ÉLÉMENTS EXISTANTS (seulement s'ils existent)
-- =====================================

-- Supprimer le trigger existant (seulement s'il existe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer la fonction existante (seulement si elle existe)
DROP FUNCTION IF EXISTS init_user_credits();
DROP FUNCTION IF EXISTS add_user_credits(UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS check_user_credits(UUID, INTEGER);

-- Supprimer la vue existante (seulement si elle existe)
DROP VIEW IF EXISTS user_credits_stats;

-- =====================================
-- CRÉATION DE LA TABLE USER_CREDITS
-- =====================================

-- Table des crédits utilisateurs pour DaloaMarket
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  last_update TIMESTAMPTZ DEFAULT now(),
  total_earned INTEGER NOT NULL DEFAULT 0,  -- Total des crédits gagnés (historique)
  total_spent INTEGER NOT NULL DEFAULT 0,   -- Total des crédits dépensés (historique)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================
-- ACTIVATION ROW LEVEL SECURITY
-- =====================================

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- =====================================
-- SUPPRESSION DES POLITIQUES EXISTANTES (maintenant que la table existe)
-- =====================================

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can insert their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON user_credits;

-- =====================================
-- CRÉATION DES POLITIQUES RLS
-- =====================================

-- Politique pour SELECT (lecture) - chaque utilisateur ne voit que ses crédits
CREATE POLICY "Users can view their own credits" 
ON user_credits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Politique pour INSERT (création) - utilisateur peut créer ses propres crédits
CREATE POLICY "Users can insert their own credits" 
ON user_credits
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Politique pour UPDATE (modification) - utilisateur peut modifier ses propres crédits
CREATE POLICY "Users can update their own credits" 
ON user_credits
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =====================================
-- CRÉATION DES INDEX POUR OPTIMISATION
-- =====================================

-- Supprimer les index existants d'abord
DROP INDEX IF EXISTS idx_user_credits_user_id;
DROP INDEX IF EXISTS idx_user_credits_last_update;

-- Index principal pour optimiser les requêtes par user_id
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- Index pour les requêtes de statistiques
CREATE INDEX idx_user_credits_last_update ON user_credits(last_update DESC);

-- =====================================
-- FONCTIONS DE GESTION DES CRÉDITS
-- =====================================

-- Fonction pour initialiser les crédits d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION init_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer les crédits initiaux pour le nouvel utilisateur
  INSERT INTO user_credits (user_id, credits, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING; -- Éviter les doublons
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour ajouter des crédits à un utilisateur
CREATE OR REPLACE FUNCTION add_user_credits(
  target_user_id UUID,
  credit_amount INTEGER,
  reason TEXT DEFAULT 'Manual adjustment'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Mettre à jour les crédits
  UPDATE user_credits 
  SET 
    credits = credits + credit_amount,
    total_earned = total_earned + GREATEST(credit_amount, 0),
    total_spent = total_spent + GREATEST(-credit_amount, 0),
    last_update = now()
  WHERE user_id = target_user_id;
  
  -- Si l'utilisateur n'a pas encore de ligne de crédits, la créer
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, credits, total_earned, total_spent)
    VALUES (
      target_user_id, 
      GREATEST(credit_amount, 0),
      GREATEST(credit_amount, 0),
      GREATEST(-credit_amount, 0)
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a assez de crédits
CREATE OR REPLACE FUNCTION check_user_credits(
  target_user_id UUID,
  required_credits INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER := 0;
BEGIN
  -- Récupérer les crédits actuels
  SELECT credits INTO current_credits
  FROM user_credits 
  WHERE user_id = target_user_id;
  
  -- Si pas de ligne trouvée, l'utilisateur a 0 crédits
  IF NOT FOUND THEN
    current_credits := 0;
  END IF;
  
  -- Retourner true si l'utilisateur a assez de crédits
  RETURN current_credits >= required_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- CRÉATION DU TRIGGER
-- =====================================

-- Trigger pour créer automatiquement les crédits lors de l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION init_user_credits();

-- =====================================
-- INITIALISATION DES CRÉDITS POUR LES UTILISATEURS EXISTANTS
-- =====================================

-- Ajouter des crédits pour tous les utilisateurs existants qui n'en ont pas encore
INSERT INTO user_credits (user_id, credits, total_earned, total_spent)
SELECT 
  u.id,
  0,  -- Crédits initiaux
  0,  -- Total gagné
  0   -- Total dépensé
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_credits c WHERE c.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================
-- VUES UTILES POUR LES STATISTIQUES
-- =====================================

-- Vue pour les statistiques des crédits par utilisateur
CREATE OR REPLACE VIEW user_credits_stats AS
SELECT 
  uc.user_id,
  u.full_name,
  u.email,
  uc.credits AS current_credits,
  uc.total_earned,
  uc.total_spent,
  uc.last_update,
  uc.created_at
FROM user_credits uc
JOIN users u ON u.id = uc.user_id;

-- =====================================
-- VÉRIFICATION FINALE
-- =====================================

-- Vérifier que la table a été créée avec les bonnes colonnes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_credits' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_credits' 
  AND schemaname = 'public';

-- Vérifier que le trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Compter les utilisateurs avec des crédits
SELECT 
  COUNT(*) as total_users_with_credits,
  SUM(credits) as total_credits_in_system,
  AVG(credits) as average_credits_per_user
FROM user_credits;