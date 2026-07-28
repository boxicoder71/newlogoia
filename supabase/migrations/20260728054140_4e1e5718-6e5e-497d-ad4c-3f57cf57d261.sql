CREATE TABLE public.logo_events (
  id BIGSERIAL PRIMARY KEY,
  event TEXT NOT NULL,
  industry TEXT,
  style TEXT,
  archetype TEXT,
  detail TEXT,
  attempts INT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.logo_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.logo_events_id_seq TO service_role;

ALTER TABLE public.logo_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Somente o servidor acessa as métricas"
  ON public.logo_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX logo_events_created_at_idx ON public.logo_events (created_at DESC);
CREATE INDEX logo_events_industry_idx ON public.logo_events (industry);

CREATE OR REPLACE FUNCTION public.logo_event_trends(_industry TEXT DEFAULT NULL, _limit INT DEFAULT 5)
RETURNS TABLE(event TEXT, detail TEXT, uses BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.event, e.detail, count(*) AS uses
    FROM public.logo_events e
   WHERE e.created_at > now() - interval '60 days'
     AND e.detail IS NOT NULL
     AND (_industry IS NULL OR e.industry = _industry)
   GROUP BY e.event, e.detail
   ORDER BY count(*) DESC
   LIMIT GREATEST(1, LEAST(_limit, 20));
$$;