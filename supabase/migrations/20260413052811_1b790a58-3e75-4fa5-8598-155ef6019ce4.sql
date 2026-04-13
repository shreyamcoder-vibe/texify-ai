
-- Create user_credits table
CREATE TABLE public.user_credits (
  user_id uuid PRIMARY KEY,
  daily_credits_used integer NOT NULL DEFAULT 0,
  daily_reset_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  monthly_bonus_used integer NOT NULL DEFAULT 0,
  monthly_reset_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  is_pro boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.user_credits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
ON public.user_credits FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create requests_log table for rate limiting
CREATE TABLE public.requests_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tone text NOT NULL,
  input_length integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.requests_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
ON public.requests_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
ON public.requests_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create user_credits on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_credits
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_credits();

-- Backfill: create user_credits for existing users who don't have one
INSERT INTO public.user_credits (user_id)
SELECT p.user_id FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.user_credits uc WHERE uc.user_id = p.user_id);
