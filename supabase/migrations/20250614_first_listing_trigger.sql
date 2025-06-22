-- Migration : Trigger pour verrouiller la gratuité de la première annonce
-- Date : 2025-06-14

CREATE OR REPLACE FUNCTION public.set_first_listing_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET first_listing_at = NOW()
  WHERE id = NEW.user_id AND first_listing_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_first_listing_created ON listings;

CREATE TRIGGER on_first_listing_created
AFTER INSERT ON listings
FOR EACH ROW
EXECUTE FUNCTION public.set_first_listing_at();
