-- Additive migration. Does NOT replace existing commerce tables or RPCs.
begin;
create table if not exists public.nsc_rate_limits (
  key text primary key,
  hits integer not null,
  resets_at timestamptz not null
);
alter table public.nsc_rate_limits enable row level security;
revoke all on public.nsc_rate_limits from anon, authenticated;
grant select on public.nsc_rate_limits to service_role;
create index if not exists nsc_rate_limits_expiry on public.nsc_rate_limits(resets_at);

create or replace function public.nsc_take_rate_limit(p_key text, p_limit integer, p_window_ms integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_hits integer;
  v_reset timestamptz;
begin
  if p_key is null or length(p_key) > 128 or p_limit < 1 or p_limit > 10000
     or p_window_ms < 1000 or p_window_ms > 86400000 then
    raise exception 'Invalid rate limit';
  end if;
  delete from public.nsc_rate_limits where resets_at < v_now;
  insert into public.nsc_rate_limits as limits (key, hits, resets_at)
    values (p_key, 1, v_now + p_window_ms * interval '1 millisecond')
    on conflict (key) do update set
      hits = case when limits.resets_at <= v_now then 1 else limits.hits + 1 end,
      resets_at = case when limits.resets_at <= v_now then v_now + p_window_ms * interval '1 millisecond' else limits.resets_at end
    returning hits, resets_at into v_hits, v_reset;
  return jsonb_build_object('ok', v_hits <= p_limit,
    'remaining', greatest(0, p_limit - v_hits),
    'retryAfter', case when v_hits <= p_limit then 0 else greatest(1, ceil(extract(epoch from v_reset - v_now))::integer) end);
end;
$$;
create or replace function public.nsc_reset_rate_limit(p_key text)
returns void language sql security definer set search_path = '' as $$
  delete from public.nsc_rate_limits where key = p_key;
$$;
revoke all on function public.nsc_take_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.nsc_reset_rate_limit(text) from public, anon, authenticated;
grant execute on function public.nsc_take_rate_limit(text, integer, integer) to service_role;
grant execute on function public.nsc_reset_rate_limit(text) to service_role;
commit;
