-- =====================================================
-- Auto-create profile trigger for new users
-- =====================================================
-- This trigger automatically creates a profile entry
-- when a new user signs up in auth.users
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Allow users to insert their own profile (if it doesn't exist)
-- =====================================================
-- This policy allows authenticated users to create their own profile
-- if it doesn't exist yet (for existing users without profiles)
-- Note: This policy works alongside the admin policy
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        id = auth.uid() AND
        NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- Note: For existing users without profiles, you can either:
-- 1. Run the migration above (trigger will handle new signups)
-- 2. Manually create profiles via Supabase Dashboard
-- 3. The login action will try to auto-create if profile is missing
-- =====================================================

