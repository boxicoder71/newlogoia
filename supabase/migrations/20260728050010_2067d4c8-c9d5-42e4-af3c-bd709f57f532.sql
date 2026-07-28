CREATE TABLE public.api_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  ip TEXT NOT NULL,
  route TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX api_rate_limits_lookup_idx ON public.api_rate_limits (ip, route, created_at DESC);

GRANT ALL ON public.api_rate_limits TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.api_rate_limits_id_seq TO service_role;

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  _ip TEXT,
  _route TEXT,
  _limit INT DEFAULT 5,
  _window_seconds INT DEFAULT 600
)
RETURNS TABLE (allowed BOOLEAN, used INT, retry_after_seconds INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INT;
  _oldest TIMESTAMPTZ;
BEGIN
  DELETE FROM public.api_rate_limits
   WHERE created_at < now() - make_interval(secs => _window_seconds * 6);

  SELECT count(*), min(created_at)
    INTO _count, _oldest
    FROM public.api_rate_limits
   WHERE ip = _ip
     AND route = _route
     AND created_at > now() - make_interval(secs => _window_seconds);

  IF _count >= _limit THEN
    RETURN QUERY SELECT
      false,
      _count,
      GREATEST(1, CEIL(EXTRACT(EPOCH FROM (_oldest + make_interval(secs => _window_seconds) - now())))::INT);
    RETURN;
  END IF;

  INSERT INTO public.api_rate_limits (ip, route) VALUES (_ip, _route);

  RETURN QUERY SELECT true, _count + 1, 0;
END;
$$;

REVOKE ALL ON FUNCTION public.check_api_rate_limit(TEXT, TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_api_rate_limit(TEXT, TEXT, INT, INT) TO service_role;