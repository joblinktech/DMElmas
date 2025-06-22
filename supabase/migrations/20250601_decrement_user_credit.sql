-- Migration : Fonction robuste pour décrémenter un crédit utilisateur (empêche les crédits négatifs)
-- Date : 2025-06-01

CREATE OR REPLACE FUNCTION public.decrement_user_credit(user_id_input UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM user_credits WHERE user_id = user_id_input FOR UPDATE;
  IF current_credits IS NULL THEN
    RETURN FALSE;
  END IF;
  IF current_credits <= 0 THEN
    RETURN FALSE;
  END IF;
  UPDATE user_credits
  SET credits = credits - 1,
      total_spent = total_spent + 1,
      last_update = now()
  WHERE user_id = user_id_input;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
