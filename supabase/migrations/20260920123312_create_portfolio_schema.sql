
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Debarchan Upadhayaya',
  tagline text NOT NULL DEFAULT 'Developer & Student',
  bio text,
  photo_url text,
  location text,
  email text,
  phone text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  website_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  tech_stack text[] DEFAULT '{}',
  image_url text,
  demo_url text,
  repo_url text,
  featured boolean DEFAULT false,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  proficiency int NOT NULL DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  degree text NOT NULL,
  institution text NOT NULL,
  start_year int,
  end_year int,
  description text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  company text NOT NULL,
  start_date text,
  end_date text,
  current boolean DEFAULT false,
  description text,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  alt_text text,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_default text DEFAULT 'light',
  navbar_config jsonb DEFAULT '{}'::jsonb,
  footer_text text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_profiles" ON profiles;
CREATE POLICY "auth_insert_profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_profiles" ON profiles;
CREATE POLICY "auth_update_profiles" ON profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_profiles" ON profiles;
CREATE POLICY "auth_delete_profiles" ON profiles FOR DELETE TO authenticated USING (true);

-- PROJECTS policies
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE TO authenticated USING (true);

-- SKILLS policies
DROP POLICY IF EXISTS "anon_select_skills" ON skills;
CREATE POLICY "anon_select_skills" ON skills FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_skills" ON skills;
CREATE POLICY "auth_insert_skills" ON skills FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_skills" ON skills;
CREATE POLICY "auth_update_skills" ON skills FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_skills" ON skills;
CREATE POLICY "auth_delete_skills" ON skills FOR DELETE TO authenticated USING (true);

-- EDUCATION policies
DROP POLICY IF EXISTS "anon_select_education" ON education;
CREATE POLICY "anon_select_education" ON education FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_education" ON education;
CREATE POLICY "auth_insert_education" ON education FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_education" ON education;
CREATE POLICY "auth_update_education" ON education FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_education" ON education;
CREATE POLICY "auth_delete_education" ON education FOR DELETE TO authenticated USING (true);

-- EXPERIENCE policies
DROP POLICY IF EXISTS "anon_select_experience" ON experience;
CREATE POLICY "anon_select_experience" ON experience FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_experience" ON experience;
CREATE POLICY "auth_insert_experience" ON experience FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_experience" ON experience;
CREATE POLICY "auth_update_experience" ON experience FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_experience" ON experience;
CREATE POLICY "auth_delete_experience" ON experience FOR DELETE TO authenticated USING (true);

-- RESUME policies
DROP POLICY IF EXISTS "anon_select_resume" ON resume;
CREATE POLICY "anon_select_resume" ON resume FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_resume" ON resume;
CREATE POLICY "auth_insert_resume" ON resume FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_resume" ON resume;
CREATE POLICY "auth_update_resume" ON resume FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_resume" ON resume;
CREATE POLICY "auth_delete_resume" ON resume FOR DELETE TO authenticated USING (true);

-- MEDIA policies
DROP POLICY IF EXISTS "anon_select_media" ON media;
CREATE POLICY "anon_select_media" ON media FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_media" ON media;
CREATE POLICY "auth_insert_media" ON media FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_media" ON media;
CREATE POLICY "auth_update_media" ON media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_media" ON media;
CREATE POLICY "auth_delete_media" ON media FOR DELETE TO authenticated USING (true);

-- MESSAGES policies (anon can insert, only auth can read/delete)
DROP POLICY IF EXISTS "auth_select_messages" ON messages;
CREATE POLICY "auth_select_messages" ON messages FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_messages" ON messages;
CREATE POLICY "auth_update_messages" ON messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_messages" ON messages;
CREATE POLICY "auth_delete_messages" ON messages FOR DELETE TO authenticated USING (true);

-- SETTINGS policies
DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_settings" ON settings;
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_settings" ON settings;
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_settings" ON settings;
CREATE POLICY "auth_delete_settings" ON settings FOR DELETE TO authenticated USING (true);

-- Indexes for display ordering
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON projects(display_order);
CREATE INDEX IF NOT EXISTS idx_skills_display_order ON skills(display_order);
CREATE INDEX IF NOT EXISTS idx_education_display_order ON education(display_order);
CREATE INDEX IF NOT EXISTS idx_experience_display_order ON experience(display_order);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
