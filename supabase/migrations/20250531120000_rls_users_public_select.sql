-- Migration : Politique RLS pour lecture publique des profils utilisateurs
-- Permettre à tout utilisateur authentifié de lire les infos publiques des autres utilisateurs

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view user profiles" ON users;

CREATE POLICY "Public can view user profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- (Optionnel) Si tu veux aussi permettre aux visiteurs non connectés de voir les profils :
-- TO public OU TO anon
-- Mais pour la sécurité, on limite ici à authenticated
