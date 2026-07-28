CREATE TABLE public.logo_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clean_png TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.logo_assets TO service_role;

ALTER TABLE public.logo_assets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.logo_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.logo_assets(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL DEFAULT 7900,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.logo_orders TO service_role;

ALTER TABLE public.logo_orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX logo_assets_created_at_idx ON public.logo_assets (created_at);
CREATE INDEX logo_orders_asset_id_idx ON public.logo_orders (asset_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_logo_orders_updated_at
BEFORE UPDATE ON public.logo_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.purge_old_logo_assets()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.logo_assets a
   WHERE a.created_at < now() - interval '7 days'
     AND NOT EXISTS (
       SELECT 1 FROM public.logo_orders o
        WHERE o.asset_id = a.id AND o.status = 'paid'
     );
$$;