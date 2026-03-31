/*
  # Create Quiz Results Table

  1. New Tables
    - `quiz_results`
      - `id` (uuid, primary key) - Unique identifier for each quiz attempt
      - `user_id` (text) - Firebase user ID
      - `lesson_id` (text) - ID of the lesson the quiz is for
      - `language_id` (text) - Language being learned (kalenjin, kikuyu, luo)
      - `score` (integer) - Number of correct answers
      - `total_questions` (integer) - Total number of questions in the quiz
      - `percentage` (integer) - Score percentage
      - `completed_at` (timestamptz) - When the quiz was completed
      - `created_at` (timestamptz) - Record creation timestamp

  2. Indexes
    - Index on user_id for fast user-specific queries
    - Index on lesson_id for lesson-specific analytics
    - Composite index on (user_id, lesson_id) for user progress tracking

  3. Security
    - Enable RLS on `quiz_results` table
    - Users can only view their own quiz results
    - Users can only insert their own quiz results
*/

CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  lesson_id text NOT NULL,
  language_id text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL,
  percentage integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_lesson_id ON quiz_results(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_lesson ON quiz_results(user_id, lesson_id);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  USING (user_id = current_user);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update own quiz results"
  ON quiz_results FOR UPDATE
  USING (user_id = current_user)
  WITH CHECK (user_id = current_user);

CREATE POLICY "Users can delete own quiz results"
  ON quiz_results FOR DELETE
  USING (user_id = current_user);
