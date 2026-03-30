/*
  # Create Languages and Lessons Schema

  ## Overview
  This migration creates the core schema for the language learning platform,
  supporting multiple languages (Kalenjin, Kikuyu, Luo) with lessons and user progress tracking.

  ## New Tables

  ### 1. `languages`
  Stores available languages for learning
  - `id` (text, primary key) - Unique language identifier (e.g., 'kalenjin')
  - `name` (text) - Display name (e.g., 'Kalenjin')
  - `native_spelling` (text) - Name in native script
  - `description` (text) - Brief description of the language
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `lessons`
  Stores lesson information
  - `id` (text, primary key) - Unique lesson identifier
  - `title` (text) - Lesson title
  - `description` (text) - Lesson description
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `lesson_content`
  Stores the actual lesson content with translations
  - `id` (uuid, primary key) - Unique content identifier
  - `lesson_id` (text, foreign key) - Reference to lessons table
  - `kalenjin` (text) - Kalenjin translation
  - `kikuyu` (text) - Kikuyu translation
  - `luo` (text) - Luo translation
  - `english` (text) - English translation
  - `order_index` (integer) - Display order within lesson
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `user_languages`
  Tracks which languages users are learning
  - `id` (uuid, primary key) - Unique record identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `language_id` (text, foreign key) - Reference to languages table
  - `started_at` (timestamptz) - When user started learning this language
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `user_progress`
  Tracks user progress through lessons
  - `id` (uuid, primary key) - Unique record identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `lesson_id` (text, foreign key) - Reference to lessons table
  - `completed` (boolean) - Whether lesson is completed
  - `completed_at` (timestamptz) - When lesson was completed
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for languages, lessons, and lesson_content (educational content)
  - Authenticated users can manage their own language selections and progress
  - Users can only read/write their own user_languages and user_progress records

  ## Indexes
  - Index on lesson_content.lesson_id for efficient lesson queries
  - Index on user_languages(user_id, language_id) for user language lookups
  - Index on user_progress(user_id, lesson_id) for progress tracking
  - Unique constraint on user_languages(user_id, language_id) to prevent duplicates
  - Unique constraint on user_progress(user_id, lesson_id) to prevent duplicates
*/

-- Create languages table
CREATE TABLE IF NOT EXISTS languages (
  id text PRIMARY KEY,
  name text NOT NULL,
  native_spelling text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create lesson_content table
CREATE TABLE IF NOT EXISTS lesson_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  kalenjin text NOT NULL,
  kikuyu text NOT NULL,
  luo text NOT NULL,
  english text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_languages table
CREATE TABLE IF NOT EXISTS user_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language_id text NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, language_id)
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lesson_content_lesson_id ON lesson_content(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Enable Row Level Security
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for languages (public read)
CREATE POLICY "Anyone can view languages"
  ON languages FOR SELECT
  USING (true);

-- RLS Policies for lessons (public read)
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  USING (true);

-- RLS Policies for lesson_content (public read)
CREATE POLICY "Anyone can view lesson content"
  ON lesson_content FOR SELECT
  USING (true);

-- RLS Policies for user_languages
CREATE POLICY "Users can view own language selections"
  ON user_languages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own language selections"
  ON user_languages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own language selections"
  ON user_languages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own language selections"
  ON user_languages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial languages
INSERT INTO languages (id, name, native_spelling, description) VALUES
  ('kalenjin', 'Kalenjin', 'Kalenjin', 'Spoken in the Rift Valley region of Kenya'),
  ('kikuyu', 'Kikuyu', 'Gikuyu', 'Spoken by the Kikuyu people of central Kenya'),
  ('luo', 'Luo', 'Dholuo', 'Spoken by the Luo people around Lake Victoria')
ON CONFLICT (id) DO NOTHING;

-- Insert initial lessons
INSERT INTO lessons (id, title, description, order_index) VALUES
  ('greetings', 'Greetings', 'Learn basic greetings and common phrases', 1),
  ('numbers', 'Numbers', 'Count from 1 to 10 in different languages', 2),
  ('family', 'Family', 'Learn family-related vocabulary', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert lesson content for Greetings
INSERT INTO lesson_content (lesson_id, kalenjin, kikuyu, luo, english, order_index) VALUES
  ('greetings', 'Sopa', 'Wĩ mwega', 'Oyawore', 'Hello', 1),
  ('greetings', 'Sopa ok?', 'Wĩ mwega wĩ o?', 'Oyawore oyawore?', 'How are you?', 2),
  ('greetings', 'Ayai', 'Ĩrĩa rĩ cia mahoya', 'Ojaber', 'Thank you', 3),
  ('greetings', 'Kore', 'Ndĩrenda', 'Ahero', 'Goodbye', 4),
  ('greetings', 'Chamge', 'Ngaî mũno', 'Erokamano', 'Please', 5)
ON CONFLICT DO NOTHING;

-- Insert lesson content for Numbers
INSERT INTO lesson_content (lesson_id, kalenjin, kikuyu, luo, english, order_index) VALUES
  ('numbers', 'Pee', 'Mũmwe', 'Achiel', '1', 1),
  ('numbers', 'Arg', 'Meeri', 'Ariyo', '2', 2),
  ('numbers', 'Somok', 'Matatũ', 'Adek', '3', 3),
  ('numbers', 'Anguan', 'Mana', 'Ang''wan', '4', 4),
  ('numbers', 'Mut', 'Maitano', 'Abich', '5', 5),
  ('numbers', 'Mutai', 'Matatũ na matatũ', 'Auchiel', '6', 6),
  ('numbers', 'Tisap', 'Mũgwanja', 'Abiriyo', '7', 7),
  ('numbers', 'Sisit', 'Mũnana', 'Aboro', '8', 8),
  ('numbers', 'Sogol', 'Kenda', 'Ochiko', '9', 9),
  ('numbers', 'Taman', 'Ikũmi', 'Apar', '10', 10)
ON CONFLICT DO NOTHING;

-- Insert lesson content for Family
INSERT INTO lesson_content (lesson_id, kalenjin, kikuyu, luo, english, order_index) VALUES
  ('family', 'Arap', 'Baba', 'Baba', 'Father', 1),
  ('family', 'Ing', 'Nyina', 'Mama', 'Mother', 2),
  ('family', 'Tai', 'Mwana', 'Nyathi', 'Child', 3),
  ('family', 'Kou', 'Mũtumia', 'Dhako', 'Woman', 4),
  ('family', 'Muruet', 'Mũndũ mũrũme', 'Dichwo', 'Man', 5),
  ('family', 'Tai biik', 'Mũirĩtu', 'Nyar', 'Girl', 6),
  ('family', 'Tai tany', 'Kahĩĩ', 'Wuowi', 'Boy', 7)
ON CONFLICT DO NOTHING;