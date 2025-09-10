-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  position TEXT,
  phone TEXT,
  linkedin_url TEXT,
  about TEXT,
  photo_path TEXT,
  hidden BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  agreed_gdpr BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for search
CREATE INDEX idx_profiles_company ON profiles(company);
CREATE INDEX idx_profiles_first_name ON profiles(first_name);
CREATE INDEX idx_profiles_last_name ON profiles(last_name);
CREATE INDEX idx_profiles_position ON profiles(position);
CREATE INDEX idx_profiles_hidden ON profiles(hidden);

-- Create full-text search index
CREATE INDEX idx_profiles_search ON profiles USING gin(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(company, '') || ' ' || 
    COALESCE(position, '') || ' ' || 
    COALESCE(about, '')
  )
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
