REVOKE ALL ON FUNCTION public.logo_event_trends(TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.logo_event_trends(TEXT, INT) TO service_role;