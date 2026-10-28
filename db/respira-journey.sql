ALTER TABLE public.quit_profiles ADD COLUMN IF NOT EXISTS paused_at timestamptz;
CREATE TABLE public.quit_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 started_at timestamptz NOT NULL,
 ended_at timestamptz,
 cigs_per_day numeric NOT NULL CHECK(cigs_per_day>=0),
 cigs_per_pack numeric NOT NULL CHECK(cigs_per_pack>0),
 price_per_pack numeric NOT NULL CHECK(price_per_pack>=0),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(ended_at IS NULL OR ended_at>=started_at),
 UNIQUE(id,user_id)
);
CREATE UNIQUE INDEX quit_attempts_one_active ON public.quit_attempts(user_id) WHERE ended_at IS NULL;
CREATE INDEX quit_attempts_user_history ON public.quit_attempts(user_id,started_at DESC);
CREATE TABLE public.quit_checkins (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 attempt_id uuid NOT NULL,
 local_day date NOT NULL,
 time_zone text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(attempt_id,user_id) REFERENCES public.quit_attempts(id,user_id) ON DELETE CASCADE,
 UNIQUE(user_id,local_day)
);
ALTER TABLE public.quit_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quit_checkins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quit_attempts,public.quit_checkins FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.quit_attempts,public.quit_checkins TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.quit_attempts,public.quit_checkins TO service_role;
CREATE POLICY own_attempt_history ON public.quit_attempts FOR SELECT TO authenticated USING(user_id=(select auth.uid()));
CREATE POLICY own_daily_checkins ON public.quit_checkins FOR SELECT TO authenticated USING(user_id=(select auth.uid()));
CREATE POLICY server_attempts ON public.quit_attempts FOR ALL TO service_role USING(true) WITH CHECK(true);
CREATE POLICY server_checkins ON public.quit_checkins FOR ALL TO service_role USING(true) WITH CHECK(true);
