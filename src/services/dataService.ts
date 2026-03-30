import lessonsData from '../data/lessons.json';
import { supabase } from '../lib/supabase';

export interface Language {
  id: string;
  name: string;
  nativeSpelling: string;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
}

export interface LessonContent {
  id: string;
  lessonId: string;
  kalenjin: string;
  kikuyu: string;
  luo: string;
  english: string;
  orderIndex: number;
}

export const getLanguages = async (): Promise<Language[]> => {
  return lessonsData.languages;
};

export const getLessons = async (): Promise<Lesson[]> => {
  return lessonsData.lessons;
};

export const getLessonContent = async (lessonId: string): Promise<LessonContent[]> => {
  return lessonsData.lessonContent.filter((content) => content.lessonId === lessonId);
};

export const saveUserLanguageSelection = async (
  userId: string,
  languageId: string
): Promise<void> => {
  const { error } = await supabase
    .from('user_language_selections')
    .upsert(
      { user_id: userId, language_id: languageId },
      { onConflict: 'user_id,language_id' }
    );

  if (error) {
    console.error('Error saving language selection:', error);
    throw error;
  }
};

export const getUserLanguages = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_language_selections')
    .select('language_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user languages:', error);
    return [];
  }

  return data?.map((row) => row.language_id) || [];
};

export const saveUserProgress = async (
  userId: string,
  lessonId: string,
  completed: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    );

  if (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

export const getUserProgress = async (userId: string): Promise<Record<string, boolean>> => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('lesson_id, completed')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user progress:', error);
    return {};
  }

  const progressMap: Record<string, boolean> = {};
  data?.forEach((row) => {
    progressMap[row.lesson_id] = row.completed;
  });

  return progressMap;
};
