-- Insert test admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'admin-user-id' with actual UUID from auth.users
INSERT INTO profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  company, 
  position, 
  phone, 
  linkedin_url, 
  about, 
  is_admin, 
  agreed_gdpr
) VALUES (
  'admin-user-id', -- Replace with actual admin user ID
  'admin@example.com',
  'Admin',
  'User',
  'Event Company',
  'Event Manager',
  '+421 123 456 789',
  'https://linkedin.com/in/admin',
  'Event management professional with 10+ years experience.',
  true,
  true
);

-- Insert test attendee
INSERT INTO profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  company, 
  position, 
  phone, 
  linkedin_url, 
  about, 
  is_admin, 
  agreed_gdpr
) VALUES (
  'attendee-user-id', -- Replace with actual attendee user ID
  'attendee@example.com',
  'John',
  'Doe',
  'Tech Solutions',
  'Software Developer',
  '+421 987 654 321',
  'https://linkedin.com/in/johndoe',
  'Passionate about web development and clean code.',
  false,
  true
);
