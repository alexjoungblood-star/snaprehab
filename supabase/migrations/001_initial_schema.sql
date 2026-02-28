-- SnapRehab Initial Database Schema
-- Run this in your Supabase SQL Editor

-- =============================================
-- PROFILES (extends Supabase Auth)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  company_name    TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  default_zip     TEXT,
  ai_provider     TEXT DEFAULT 'claude' CHECK (ai_provider IN ('claude', 'openai')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'team')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROPERTIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  address_line1   TEXT NOT NULL,
  address_line2   TEXT,
  city            TEXT NOT NULL,
  state           TEXT NOT NULL,
  zip_code        TEXT NOT NULL,
  year_built      INTEGER,
  square_footage  INTEGER,
  bedrooms        INTEGER,
  bathrooms       NUMERIC(3,1),
  property_type   TEXT DEFAULT 'single_family'
                    CHECK (property_type IN ('single_family', 'multi_family', 'condo', 'townhouse')),
  rehab_level     TEXT NOT NULL
                    CHECK (rehab_level IN ('cosmetic', 'moderate', 'full_gut')),
  status          TEXT DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'completed', 'archived')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);

-- =============================================
-- ROOMS
-- =============================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_type       TEXT NOT NULL,
  room_label      TEXT,
  floor_level     INTEGER DEFAULT 1,
  sort_order      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'photos_taken', 'analyzed', 'items_selected', 'completed')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_property_id ON public.rooms(property_id);

-- =============================================
-- PHOTOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  storage_path    TEXT,
  local_uri       TEXT,
  thumbnail_path  TEXT,
  photo_position  INTEGER NOT NULL,
  photo_type      TEXT DEFAULT 'standard'
                    CHECK (photo_type IN ('standard', 'wide_shot', 'detail', 'problem_area', 'ceiling', 'floor')),
  width           INTEGER,
  height          INTEGER,
  file_size_bytes INTEGER,
  ai_analyzed     BOOLEAN DEFAULT FALSE,
  sync_status     TEXT DEFAULT 'pending'
                    CHECK (sync_status IN ('pending', 'uploading', 'uploaded', 'analyzed', 'error')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_room_id ON public.photos(room_id);
CREATE INDEX IF NOT EXISTS idx_photos_property_id ON public.photos(property_id);

-- =============================================
-- AI ANALYSES
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  photo_id        UUID REFERENCES public.photos(id) ON DELETE SET NULL,
  ai_provider     TEXT NOT NULL CHECK (ai_provider IN ('claude', 'openai')),
  model_version   TEXT,
  prompt_used     TEXT,
  raw_response    JSONB,
  observations    JSONB NOT NULL DEFAULT '[]',
  defects         JSONB DEFAULT '[]',
  condition_score INTEGER,
  follow_up_questions JSONB DEFAULT '[]',
  suggested_repairs   JSONB DEFAULT '[]',
  narrative_summary   TEXT,
  tokens_used     INTEGER,
  latency_ms      INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_room_id ON public.ai_analyses(room_id);

-- =============================================
-- FOLLOW-UP RESPONSES
-- =============================================
CREATE TABLE IF NOT EXISTS public.followup_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id     UUID NOT NULL REFERENCES public.ai_analyses(id) ON DELETE CASCADE,
  room_id         UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  question_index  INTEGER NOT NULL,
  question_text   TEXT NOT NULL,
  response_text   TEXT NOT NULL,
  response_type   TEXT DEFAULT 'text'
                    CHECK (response_type IN ('text', 'yes_no', 'multiple_choice', 'numeric')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REPAIR ITEMS
-- =============================================
CREATE TABLE IF NOT EXISTS public.repair_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  room_id         UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  analysis_id     UUID REFERENCES public.ai_analyses(id) ON DELETE SET NULL,
  repair_code     TEXT NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  quantity        NUMERIC(10,2) NOT NULL,
  unit            TEXT NOT NULL,
  unit_cost       NUMERIC(10,2) NOT NULL,
  total_cost      NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  is_selected     BOOLEAN DEFAULT TRUE,
  is_ai_suggested BOOLEAN DEFAULT TRUE,
  is_user_added   BOOLEAN DEFAULT FALSE,
  source          TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'user', 'template')),
  notes           TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repair_items_property_id ON public.repair_items(property_id);
CREATE INDEX IF NOT EXISTS idx_repair_items_room_id ON public.repair_items(room_id);

-- =============================================
-- ESTIMATES
-- =============================================
CREATE TABLE IF NOT EXISTS public.estimates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  version         INTEGER DEFAULT 1,
  subtotal        NUMERIC(12,2),
  contingency_pct NUMERIC(4,2) DEFAULT 15.00,
  contingency_amt NUMERIC(12,2),
  total           NUMERIC(12,2),
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'exported')),
  location_factor NUMERIC(6,4) DEFAULT 1.0000,
  pdf_storage_path TEXT,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estimates_property_id ON public.estimates(property_id);

-- =============================================
-- SCOPE OF WORK
-- =============================================
CREATE TABLE IF NOT EXISTS public.scope_of_work (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  estimate_id     UUID REFERENCES public.estimates(id) ON DELETE SET NULL,
  content         JSONB NOT NULL DEFAULT '[]',
  pdf_storage_path TEXT,
  version         INTEGER DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BASE COSTS (reference table)
-- =============================================
CREATE TABLE IF NOT EXISTS public.base_costs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_code     TEXT UNIQUE NOT NULL,
  category        TEXT NOT NULL,
  subcategory     TEXT,
  description     TEXT NOT NULL,
  unit            TEXT NOT NULL,
  base_material_cost NUMERIC(10,2),
  base_labor_cost    NUMERIC(10,2),
  base_unit_cost     NUMERIC(10,2) NOT NULL,
  min_cost        NUMERIC(10,2),
  max_cost        NUMERIC(10,2),
  typical_quantity_hint TEXT,
  applicable_room_types TEXT[] DEFAULT '{}',
  rehab_levels    TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  data_source     TEXT,
  last_verified   DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_base_costs_category ON public.base_costs(category);
CREATE INDEX IF NOT EXISTS idx_base_costs_repair_code ON public.base_costs(repair_code);

-- =============================================
-- LOCATION FACTORS
-- =============================================
CREATE TABLE IF NOT EXISTS public.location_factors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_prefix      TEXT NOT NULL,
  city            TEXT,
  state           TEXT NOT NULL,
  material_factor NUMERIC(6,4) DEFAULT 1.0000,
  labor_factor    NUMERIC(6,4) DEFAULT 1.0000,
  combined_factor NUMERIC(6,4) DEFAULT 1.0000,
  data_source     TEXT DEFAULT 'hud_cci',
  effective_date  DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_location_factors_zip ON public.location_factors(zip_prefix);

-- =============================================
-- WAITLIST (for sales page)
-- =============================================
CREATE TABLE IF NOT EXISTS public.waitlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  name            TEXT,
  investor_type   TEXT,
  market          TEXT,
  source          TEXT DEFAULT 'website',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scope_of_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Property policies
CREATE POLICY "Users can CRUD own properties" ON public.properties FOR ALL USING (user_id = auth.uid());

-- Room policies
CREATE POLICY "Users can CRUD rooms of own properties" ON public.rooms FOR ALL
  USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- Photo policies
CREATE POLICY "Users can CRUD photos of own properties" ON public.photos FOR ALL
  USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- AI analysis policies
CREATE POLICY "Users can CRUD analyses of own rooms" ON public.ai_analyses FOR ALL
  USING (room_id IN (SELECT r.id FROM public.rooms r JOIN public.properties p ON r.property_id = p.id WHERE p.user_id = auth.uid()));

-- Follow-up response policies
CREATE POLICY "Users can CRUD followups of own rooms" ON public.followup_responses FOR ALL
  USING (room_id IN (SELECT r.id FROM public.rooms r JOIN public.properties p ON r.property_id = p.id WHERE p.user_id = auth.uid()));

-- Repair item policies
CREATE POLICY "Users can CRUD repair items of own properties" ON public.repair_items FOR ALL
  USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- Estimate policies
CREATE POLICY "Users can CRUD estimates of own properties" ON public.estimates FOR ALL
  USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- SOW policies
CREATE POLICY "Users can CRUD SOW of own properties" ON public.scope_of_work FOR ALL
  USING (property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid()));

-- Reference tables: read-only for authenticated users
CREATE POLICY "Authenticated users can read base costs" ON public.base_costs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read location factors" ON public.location_factors FOR SELECT
  USING (auth.role() = 'authenticated');

-- Waitlist: anyone can insert (for the landing page)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);

-- =============================================
-- STORAGE BUCKETS (create via Supabase dashboard)
-- =============================================
-- 1. property-photos (private)
-- 2. generated-pdfs (private)
-- 3. thumbnails (private)

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
