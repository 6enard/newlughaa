/*
  # Create Admin Panel and Lessons Schema

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, unique)
      - `created_at` (timestamptz)
    
    - `languages`
      - `id` (text, primary key)
      - `name` (text)
      - `native_spelling` (text)
      - `description` (text)
      - `order_index` (integer)
      - `created_at` (timestamptz)
    
    - `lessons`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `order_index` (integer)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lesson_content`
      - `id` (uuid, primary key)
      - `lesson_id` (uuid, references lessons)
      - `kalenjin` (text)
      - `kikuyu` (text)
      - `luo` (text)
      - `english` (text)
      - `order_index` (integer)
      - `created_at` (timestamptz)
    
    - `quiz_questions`
      - `id` (uuid, primary key)
      - `lesson_id` (uuid, references lessons)
      - `question` (text)
      - `correct_answer` (text) - 'kalenjin', 'kikuyu', or 'luo'
      - `option_kalenjin` (text)
      - `option_kikuyu` (text)
      - `option_luo` (text)
      - `order_index` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can read and write all data
    - Users can only read lessons, content, and questions
    - Admin check function for authorization

  3. Initial Data
    - Insert tester@gmail.com as admin
    - Insert default languages (Kalenjin, Kikuyu, Luo)
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id text PRIMARY KEY,
  name text NOT NULL,
  native_spelling text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create lesson_content table
CREATE TABLE IF NOT EXISTS lesson_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  kalenjin text NOT NULL,
  kikuyu text NOT NULL,
  luo text NOT NULL,
  english text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('kalenjin', 'kikuyu', 'luo')),
  option_kalenjin text NOT NULL,
  option_kikuyu text NOT NULL,
  option_luo text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admins table
CREATE POLICY "Admins can view all admin records"
  ON admins FOR SELECT
  TO authenticated
  USING (is_current_user_admin());

CREATE POLICY "Only existing admins can insert new admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

-- RLS Policies for languages table
CREATE POLICY "Anyone can view languages"
  ON languages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert languages"
  ON languages FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can update languages"
  ON languages FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can delete languages"
  ON languages FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- RLS Policies for lessons table
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert lessons"
  ON lessons FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can update lessons"
  ON lessons FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can delete lessons"
  ON lessons FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- RLS Policies for lesson_content table
CREATE POLICY "Anyone can view lesson content"
  ON lesson_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert lesson content"
  ON lesson_content FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can update lesson content"
  ON lesson_content FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can delete lesson content"
  ON lesson_content FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- RLS Policies for quiz_questions table
CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert quiz questions"
  ON quiz_questions FOR INSERT
  TO authenticated
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can update quiz questions"
  ON quiz_questions FOR UPDATE
  TO authenticated
  USING (is_current_user_admin())
  WITH CHECK (is_current_user_admin());

CREATE POLICY "Only admins can delete quiz questions"
  ON quiz_questions FOR DELETE
  TO authenticated
  USING (is_current_user_admin());

-- Insert default admin (will be associated when user signs up)
INSERT INTO admins (email, created_at)
VALUES ('tester@gmail.com', now())
ON CONFLICT (email) DO NOTHING;

-- Insert default languages
INSERT INTO languages (id, name, native_spelling, description, order_index)
VALUES 
  ('kalenjin', 'Kalenjin', 'Kalenjin', 'Learn the language of the Kalenjin community', 1),
  ('kikuyu', 'Kikuyu', 'Gĩkũyũ', 'Discover the Kikuyu language and culture', 2),
  ('luo', 'Luo', 'Dholuo', 'Master the Luo language', 3)
ON CONFLICT (id) DO NOTHING;