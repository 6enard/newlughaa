import { supabase } from '../lib/supabase';

export interface Language {
  id: string;
  name: string;
  native_spelling: string;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

export interface LessonContent {
  id: string;
  lesson_id: string;
  kalenjin: string;
  kikuyu: string;
  luo: string;
  english: string;
  order_index: number;
}

export const getLanguages = async (): Promise<Language[]> => {
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching languages:', error);
    return [];
  }

  return data || [];
};

export const getLessons = async (): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('order_index');

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return data || [];
};

export const getLessonContent = async (lessonId: string): Promise<LessonContent[]> => {
  const { data, error } = await supabase
    .from('lesson_content')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index');

  if (error) {
    console.error('Error fetching lesson content:', error);
    return [];
  }

  return data || [];
};

export const saveUserLanguageSelection = async (
  userId: string,
  languageId: string
): Promise<void> => {
  const { error } = await supabase
    .from('user_languages')
    .insert({
      user_id: userId,
      language_id: languageId,
    });

  if (error && error.code !== '23505') {
    console.error('Error saving language selection:', error);
  }
};

export const getUserLanguages = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_languages')
    .select('language_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user languages:', error);
    return [];
  }

  return data?.map((item) => item.language_id) || [];
};

export const saveUserProgress = async (
  userId: string,
  lessonId: string,
  completed: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    });

  if (error) {
    console.error('Error saving user progress:', error);
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
  data?.forEach((item) => {
    progressMap[item.lesson_id] = item.completed;
  });

  return progressMap;
};
