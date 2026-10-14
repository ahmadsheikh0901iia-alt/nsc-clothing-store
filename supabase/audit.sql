-- READ ONLY. Run in the project's SQL editor. No customer records are selected.
-- Do not replace production order functions with guessed versions.
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in
('products', 'orders', 'messages', 'subscribers', 'admin_log', 'nsc_rate_limits');

select table_name, column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name in ('products', 'orders')
order by table_name, ordinal_position;

select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in
('place_order', 'track_order', 'set_order_status', 'admin_stats', 'nsc_take_rate_limit', 'nsc_reset_rate_limit');

select tablename, policyname, roles, cmd, qual, with_check from pg_policies
where schemaname = 'public';

select id, public, file_size_limit, allowed_mime_types from storage.buckets
where id = 'product-images';
