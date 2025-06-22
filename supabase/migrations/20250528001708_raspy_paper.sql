/*
  # Migration 2 - Storage Bucket pour DaloaMarket
  
  1. Nouveau Bucket de Stockage
    - Créer un bucket public nommé 'listings' pour stocker les photos d'annonces
    
  2. Sécurité
    - Activer l'accès public au bucket
    - Ajouter des politiques pour les utilisateurs authentifiés pour uploader et gérer leurs photos
*/

-- =====================================
-- SUPPRESSION DU BUCKET EXISTANT (optionnel - pour reset complet)
-- =====================================
-- Décommentez ces lignes si vous voulez repartir de zéro
/*
DELETE FROM storage.objects WHERE bucket_id = 'listings';
DELETE FROM storage.buckets WHERE id = 'listings';
*/

-- =====================================
-- CRÉATION DU BUCKET DE STOCKAGE
-- =====================================

-- Créer le bucket seulement s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
SELECT 'listings', 'listings', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'listings'
);

-- =====================================
-- SUPPRESSION DES POLITIQUES EXISTANTES
-- =====================================

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can upload listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing photos" ON storage.objects;

-- Autres noms possibles de politiques (au cas où)
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their photos" ON storage.objects;
DROP POLICY IF EXISTS "Public access to listings" ON storage.objects;

-- =====================================
-- CRÉATION DES NOUVELLES POLITIQUES
-- =====================================

-- Permettre aux utilisateurs authentifiés d'uploader des fichiers
-- Format du dossier : {user_id}/filename.jpg
CREATE POLICY "Users can upload listing photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permettre aux utilisateurs authentifiés de modifier leurs propres fichiers
CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permettre aux utilisateurs authentifiés de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permettre l'accès public en lecture aux fichiers (pour afficher les photos)
CREATE POLICY "Public can view listing photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listings');

-- =====================================
-- CONFIGURATION AVANCÉE DU BUCKET
-- =====================================

-- Mettre à jour les paramètres du bucket si nécessaire
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB max par fichier
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'listings';

-- =====================================
-- FONCTIONS UTILITAIRES (OPTIONNEL)
-- =====================================

-- Fonction pour nettoyer les anciens fichiers orphelins
CREATE OR REPLACE FUNCTION cleanup_orphaned_photos()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Supprimer les fichiers qui ne correspondent à aucune annonce active
  DELETE FROM storage.objects 
  WHERE bucket_id = 'listings' 
    AND name NOT LIKE '%profile%' -- Garder les photos de profil
    AND NOT EXISTS (
      SELECT 1 FROM listings 
      WHERE photos @> ARRAY[
        'https://' || (SELECT ref FROM storage.buckets WHERE id = 'listings') || 
        '.supabase.co/storage/v1/object/public/listings/' || storage.objects.name
      ]
    );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================
-- VÉRIFICATION FINALE
-- =====================================

-- Vérifier que le bucket a été créé
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'listings';

-- Vérifier les politiques créées
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%listing%';

-- Exemple d'URL pour tester l'accès public
-- https://[votre-projet].supabase.co/storage/v1/object/public/listings/user-id/photo.jpg