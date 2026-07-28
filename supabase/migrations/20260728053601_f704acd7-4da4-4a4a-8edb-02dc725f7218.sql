REVOKE EXECUTE ON FUNCTION public.purge_old_logo_assets() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_old_logo_assets() TO service_role;

REVOKE EXECUTE ON FUNCTION public.check_api_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_api_rate_limit(text, text, integer, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;