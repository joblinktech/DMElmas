-- Migration : Correction de l'inscription utilisateur (ordre d'insertion users/user_credits)
-- Date : 2025-05-30

-- Supprimer l'ancien trigger et la fonction qui posent problème
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS init_user_credits();

-- Nouvelle fonction qui insère dans public.users puis user_credits
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans public.users si non existant (email minimal, autres champs à compléter plus tard)
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  -- Insérer dans user_credits si non existant
  INSERT INTO user_credits (user_id, credits, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nouveau trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
