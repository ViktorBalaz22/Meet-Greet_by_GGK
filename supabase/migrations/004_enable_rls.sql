-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policies are properly created
-- Users can view all non-hidden profiles
CREATE POLICY "Users can view non-hidden profiles" ON profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND hidden = false
  );

-- Users can view their own profile even if hidden
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND id = auth.uid()
  );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND id = auth.uid()
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND id = auth.uid()
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

