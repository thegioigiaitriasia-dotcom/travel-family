-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR FAMILY TRAVEL PLANNER (GIA ĐÌNH VI VU)
-- giadinhvivu.com — Production ready với Row Level Security (RLS) đúng chuẩn
-- Phiên bản: 2.0 — Cập nhật bảo mật và membership
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS public.places_cache CASCADE;
DROP TABLE IF EXISTS public.trip_comments CASCADE;
DROP TABLE IF EXISTS public.diaries CASCADE;
DROP TABLE IF EXISTS public.poi_database CASCADE;
DROP TABLE IF EXISTS public.saved_places CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.family_accounts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ====================================================================
-- 2. Profiles Table (Tài khoản người dùng)
-- Liên kết 1-1 với auth.users của Supabase
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'Thành viên',       -- 'Thành viên' | 'Trưởng nhóm' | 'Super Admin'
  is_admin BOOLEAN DEFAULT false,        -- True chỉ cho Super Admin hệ thống
  family_account_id TEXT,
  status TEXT DEFAULT 'active',          -- 'active' | 'suspended' | 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. Family Accounts Table (Nhóm gia đình)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.family_accounts (
  id TEXT PRIMARY KEY,
  family_name TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  avatar TEXT,
  members_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Subscriptions Table (Gói thành viên) — MỚI
-- Quản lý gói dùng thử và gói trả phí
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free',          -- 'free' | 'quarterly' | 'yearly'
  status TEXT NOT NULL DEFAULT 'trial',       -- 'trial' | 'active' | 'expired' | 'suspended' | 'none'
  trial_ends_at TIMESTAMPTZ,                  -- Thời điểm kết thúc dùng thử 30 ngày
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,             -- Thời điểm hết hạn gói trả phí
  sepay_transaction_id TEXT,                  -- Mã giao dịch SePay để tham chiếu
  amount_paid INT DEFAULT 0,                  -- Số tiền đã thanh toán (VND)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. Payments Table (Lịch sử thanh toán) — MỚI
-- Ghi lại mọi giao dịch thanh toán qua SePay
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  sepay_transaction_id TEXT UNIQUE,           -- Mã giao dịch từ SePay webhook
  amount INT NOT NULL,                        -- Số tiền (VND)
  plan TEXT NOT NULL,                         -- Gói đã mua
  status TEXT DEFAULT 'pending',              -- 'pending' | 'completed' | 'failed' | 'refunded'
  raw_webhook JSONB DEFAULT '{}'::jsonb,      -- Payload raw từ SePay webhook
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. Trips Table (Chuyến đi)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_id TEXT REFERENCES public.family_accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  cover_image TEXT,
  start_date TEXT,
  end_date TEXT,
  duration_days INT DEFAULT 1,
  status TEXT DEFAULT 'upcoming',             -- upcoming, ongoing, completed, planning
  destinations JSONB DEFAULT '[]'::jsonb,
  budget JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,             -- full TravelBook JSON payload
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,          -- Admin có thể đánh dấu chuyến đi nổi bật
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. Saved Places Table (Địa điểm đã lưu — Cá nhân)
-- Địa điểm YÊU THÍCH của từng user
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.saved_places (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT,
  city TEXT,                                  -- Thành phố để tìm kiếm nhanh
  rating NUMERIC(2,1) DEFAULT 4.5,
  image_url TEXT,
  description TEXT,
  price_level TEXT,
  is_favorite BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. POI Database (Cơ sở dữ liệu địa điểm cộng đồng) — MỚI (Tách khỏi saved_places)
-- Địa điểm được tích lũy từ kế hoạch AI, chia sẻ cho toàn bộ người dùng
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.poi_database (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Attraction',
  address TEXT,
  city TEXT,
  province TEXT,
  country TEXT DEFAULT 'Việt Nam',
  rating NUMERIC(2,1) DEFAULT 4.5,
  image_url TEXT,
  description TEXT,
  price_level TEXT DEFAULT 'Medium',
  tags JSONB DEFAULT '[]'::jsonb,
  google_place_id TEXT,                       -- Google Places ID nếu có
  source TEXT DEFAULT 'ai_generated',         -- 'ai_generated' | 'google_places' | 'user_uploaded' | 'admin'
  contributed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  use_count INT DEFAULT 1,                    -- Số lần địa điểm này được tham chiếu
  is_verified BOOLEAN DEFAULT false,          -- Admin xác minh thông tin chính xác
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, city)                          -- Tránh duplicate theo tên + thành phố
);

-- ====================================================================
-- 9. Travel Diaries Table (Nhật ký hành trình)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.diaries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id TEXT REFERENCES public.trips(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  cover_image TEXT,
  introduction TEXT,
  entry_count INT DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,             -- full TravelDiary payload
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 10. Google Places Cache Table (Bộ nhớ đệm Google Places API)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.places_cache (
  place_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  user_ratings_total INT DEFAULT 0,
  category TEXT DEFAULT 'Attraction',
  price_level TEXT DEFAULT 'Medium',
  cover_image TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  location JSONB DEFAULT '{}'::jsonb,
  formatted_phone TEXT,
  website TEXT,
  source TEXT DEFAULT 'google_places',
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 11. Trip Comments Table (Ghi chú & Thảo luận theo chuyến đi)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.trip_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) — ĐÚNG CHUẨN BẢO MẬT
-- Mỗi user chỉ thấy và sửa được dữ liệu của chính họ
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poi_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places_cache ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
-- User chỉ xem/sửa profile của chính mình
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin có thể xem tất cả profiles
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============ FAMILY ACCOUNTS ============
-- Chỉ owner của family account mới xem/sửa được
CREATE POLICY "family_select_member" ON public.family_accounts
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT family_account_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "family_insert_owner" ON public.family_accounts
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "family_update_owner" ON public.family_accounts
  FOR UPDATE USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ============ SUBSCRIPTIONS ============
-- User chỉ xem subscription của chính mình
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Chỉ service_role (backend) mới được tạo/sửa subscription
-- (Người dùng không tự set trạng thái subscription của mình)
CREATE POLICY "subscriptions_admin_all" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============ PAYMENTS ============
-- User xem lịch sử thanh toán của chính mình
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

-- Chỉ admin/service role mới insert payment (xử lý webhook)
CREATE POLICY "payments_admin_all" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============ TRIPS ============
-- User chỉ xem/sửa/xóa chuyến đi của mình
CREATE POLICY "trips_select_own" ON public.trips
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "trips_insert_own" ON public.trips
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "trips_update_own" ON public.trips
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "trips_delete_own" ON public.trips
  FOR DELETE USING (user_id = auth.uid());

-- Admin xem tất cả trips (để moderation)
CREATE POLICY "trips_admin_all" ON public.trips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============ SAVED PLACES ============
-- User chỉ xem/sửa/xóa địa điểm đã lưu của mình
CREATE POLICY "saved_places_select_own" ON public.saved_places
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "saved_places_insert_own" ON public.saved_places
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_places_update_own" ON public.saved_places
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "saved_places_delete_own" ON public.saved_places
  FOR DELETE USING (user_id = auth.uid());

-- ============ POI DATABASE (Cộng đồng) ============
-- Mọi user đã đăng nhập đều ĐỌC ĐƯỢC POI cộng đồng
CREATE POLICY "poi_select_authenticated" ON public.poi_database
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Chỉ user đã đăng nhập mới được đóng góp POI mới
CREATE POLICY "poi_insert_authenticated" ON public.poi_database
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin có thể sửa/xóa POI (xác minh thông tin)
CREATE POLICY "poi_admin_manage" ON public.poi_database
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============ DIARIES ============
-- User chỉ xem/sửa/xóa nhật ký của mình
CREATE POLICY "diaries_select_own" ON public.diaries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "diaries_insert_own" ON public.diaries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "diaries_update_own" ON public.diaries
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "diaries_delete_own" ON public.diaries
  FOR DELETE USING (user_id = auth.uid());

-- ============ TRIP COMMENTS ============
-- Tất cả thành viên trong cùng family có thể xem comment
CREATE POLICY "trip_comments_select" ON public.trip_comments
  FOR SELECT USING (
    user_id = auth.uid()
    OR trip_id IN (
      SELECT id FROM public.trips WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "trip_comments_insert" ON public.trip_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "trip_comments_delete_own" ON public.trip_comments
  FOR DELETE USING (user_id = auth.uid());

-- ============ PLACES CACHE (Chỉ đọc cho mọi người) ============
-- Cache Google Places là dữ liệu công khai, ai cũng đọc được
CREATE POLICY "places_cache_select_all" ON public.places_cache
  FOR SELECT USING (true);

-- Chỉ admin / backend service mới cập nhật cache
CREATE POLICY "places_cache_admin_write" ON public.places_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ====================================================================
-- FUNCTIONS & TRIGGERS
-- ====================================================================

-- Tự động tạo profile sau khi user đăng ký qua Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'Trưởng nhóm',
    'active',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Tự động tạo trial subscription 30 ngày cho user mới
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at, created_at)
  VALUES (
    NEW.id,
    'free',
    'trial',
    NOW() + INTERVAL '30 days',
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn trigger vào auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at ON public.subscriptions(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_sepay_id ON public.payments(sepay_transaction_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_family_id ON public.trips(family_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON public.saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON public.diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_comments_trip_id ON public.trip_comments(trip_id);
CREATE INDEX IF NOT EXISTS idx_poi_database_city ON public.poi_database(city);
CREATE INDEX IF NOT EXISTS idx_poi_database_category ON public.poi_database(category);
CREATE INDEX IF NOT EXISTS idx_poi_database_name ON public.poi_database(name);
CREATE INDEX IF NOT EXISTS idx_places_cache_name ON public.places_cache(name);

-- ====================================================================
-- REALTIME (Chỉ enable cho các bảng cần cộng tác thời gian thực)
-- ====================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_comments;

-- ====================================================================
-- GHI CHÚ QUAN TRỌNG — ADMIN SETUP
-- ====================================================================
-- Sau khi chạy schema này:
-- 1. Tạo tài khoản admin trong Supabase Auth > Authentication > Users
--    Email: admin@giadinhvivu.com  |  Password: [mật khẩu mạnh]
-- 2. Sau khi tạo, chạy câu lệnh sau để set admin flag:
--    UPDATE public.profiles SET is_admin = true, role = 'Super Admin'
--    WHERE email = 'admin@giadinhvivu.com';
-- 3. Đây là cách DUY NHẤT để tạo admin — không thể bypass qua UI
-- ====================================================================
