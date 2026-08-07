-- ============================================================
-- MIGRATION: Fix RLS policies & Sync schema với codebase
-- Chạy file này trong Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/tcpbxxwcljnuxwprfwvm/sql/new
-- ============================================================

-- 1. XÓA tất cả policies cũ có thể gây infinite recursion trên profiles
DROP POLICY IF EXISTS "Users can view family members" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Family members can view each other" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- 2. Tạo lại policies đúng cho profiles (đơn giản, không vòng lặp)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Chỉ đọc được profile của chính mình (server bypass bằng service_role)
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Chỉ cập nhật profile của chính mình
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Chỉ được insert khi đăng ký tài khoản mới
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Fix policies cho family_accounts
ALTER TABLE public.family_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view family accounts" ON public.family_accounts;
DROP POLICY IF EXISTS "Owner can update family" ON public.family_accounts;
DROP POLICY IF EXISTS "family_select_all" ON public.family_accounts;
DROP POLICY IF EXISTS "family_insert_own" ON public.family_accounts;
DROP POLICY IF EXISTS "family_update_own" ON public.family_accounts;

-- Mọi người đã đăng nhập đều có thể đọc family accounts (cần để join family)
CREATE POLICY "family_select_authenticated"
  ON public.family_accounts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Chỉ owner mới insert được
CREATE POLICY "family_insert_owner"
  ON public.family_accounts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Chỉ owner mới update được
CREATE POLICY "family_update_owner"
  ON public.family_accounts FOR UPDATE
  USING (auth.uid() = owner_id);

-- 4. Đảm bảo trigger tự tạo profile khi đăng ký tồn tại
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'Trưởng nhóm',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo trigger nếu chưa có
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Đảm bảo subscriptions RLS đúng
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Trips RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own trips" ON public.trips;
DROP POLICY IF EXISTS "trips_select_own_or_public" ON public.trips;

CREATE POLICY "trips_select_own_or_public"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "trips_insert_own"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trips_update_own"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "trips_delete_own"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

-- Verify
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
