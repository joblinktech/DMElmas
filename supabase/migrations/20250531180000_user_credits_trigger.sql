-- Trigger Supabase : création automatique d'une ligne user_credits à chaque nouvel utilisateur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_credits (user_id, credits)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql;

-- Création du trigger sur la table users
create trigger on_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
