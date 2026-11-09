-- Only the Auth admin can set app_metadata.public_demo when provisioning a user.
create or replace function public.protect_public_demo_login()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Public demo login is managed by the operator';
end;
$$;

create or replace trigger protect_public_demo_identity
before update on auth.users
for each row when (
  old.raw_app_meta_data ->> 'public_demo' = 'true' and (
    new.email is distinct from old.email or
    new.email_change is distinct from old.email_change or
    new.phone is distinct from old.phone or
    new.encrypted_password is distinct from old.encrypted_password or
    new.deleted_at is distinct from old.deleted_at
  )
)
execute function public.protect_public_demo_login();

create or replace trigger protect_public_demo_deletion
before delete on auth.users
for each row when (old.raw_app_meta_data ->> 'public_demo' = 'true')
execute function public.protect_public_demo_login();
