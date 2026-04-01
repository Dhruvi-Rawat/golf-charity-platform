
-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'expired');
CREATE TYPE public.plan_type AS ENUM ('monthly', 'yearly');
CREATE TYPE public.draw_status AS ENUM ('draft', 'simulated', 'published');
CREATE TYPE public.draw_type AS ENUM ('random', 'algorithmic');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.payout_status AS ENUM ('pending', 'paid');

-- USER_ROLES TABLE (first, so other policies can reference it)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- CHARITIES TABLE
CREATE TABLE public.charities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  website_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active charities" ON public.charities FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage charities" ON public.charities FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  selected_charity_id UUID REFERENCES public.charities(id),
  charity_percentage INTEGER NOT NULL DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  plan_type plan_type NOT NULL DEFAULT 'monthly',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- SCORES TABLE
CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);

-- Trigger: max 5 scores per user
CREATE OR REPLACE FUNCTION public.enforce_max_scores()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.scores WHERE id IN (
    SELECT id FROM public.scores WHERE user_id = NEW.user_id ORDER BY created_at DESC OFFSET 5
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER enforce_max_scores_trigger AFTER INSERT ON public.scores FOR EACH ROW EXECUTE FUNCTION public.enforce_max_scores();

-- DRAWS TABLE
CREATE TABLE public.draws (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE NOT NULL,
  draw_type draw_type NOT NULL DEFAULT 'random',
  winning_numbers INTEGER[] DEFAULT '{}',
  status draw_status NOT NULL DEFAULT 'draft',
  jackpot_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_rollover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published draws" ON public.draws FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage draws" ON public.draws FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- DRAW_ENTRIES TABLE
CREATE TABLE public.draw_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scores INTEGER[] NOT NULL,
  match_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entries" ON public.draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage entries" ON public.draw_entries FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- WINNERS TABLE
CREATE TABLE public.winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_type INTEGER NOT NULL CHECK (match_type IN (3, 4, 5)),
  prize_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  proof_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  payout_status payout_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wins" ON public.winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own proof" ON public.winners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage winners" ON public.winners FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- CONTRIBUTIONS TABLE
CREATE TABLE public.contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id),
  amount DECIMAL(12,2) NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  period_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own contributions" ON public.contributions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage contributions" ON public.contributions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- PRIZE_POOL TABLE
CREATE TABLE public.prize_pool (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  total_pool DECIMAL(12,2) NOT NULL DEFAULT 0,
  five_match_pool DECIMAL(12,2) NOT NULL DEFAULT 0,
  four_match_pool DECIMAL(12,2) NOT NULL DEFAULT 0,
  three_match_pool DECIMAL(12,2) NOT NULL DEFAULT 0,
  rollover_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.prize_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view prize pools" ON public.prize_pool FOR SELECT USING (true);
CREATE POLICY "Admins can manage prize pools" ON public.prize_pool FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STORAGE BUCKET FOR WINNER PROOFS
INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', false);
CREATE POLICY "Users can upload own proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'winner-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own proofs" ON storage.objects FOR SELECT USING (bucket_id = 'winner-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all proofs" ON storage.objects FOR SELECT USING (bucket_id = 'winner-proofs' AND public.has_role(auth.uid(), 'admin'));

-- INDEXES
CREATE INDEX idx_scores_user_id ON public.scores(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_draw_entries_draw_id ON public.draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id ON public.draw_entries(user_id);
CREATE INDEX idx_winners_draw_id ON public.winners(draw_id);
CREATE INDEX idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX idx_contributions_charity_id ON public.contributions(charity_id);
