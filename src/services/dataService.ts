import lessonsData from '../data/lessons.json';

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

interface UserLanguageSelection {
  userId: string;
  languageId: string;
  createdAt: string;
}

interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
}

const STORAGE_KEYS = {
  USER_LANGUAGES: 'lugha47_user_languages',
  USER_PROGRESS: 'lugha47_user_progress',
};

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
  const stored = localStorage.getItem(STORAGE_KEYS.USER_LANGUAGES);
  const selections: UserLanguageSelection[] = stored ? JSON.parse(stored) : [];

  const existingIndex = selections.findIndex(
    (s) => s.userId === userId && s.languageId === languageId
  );

  const newSelection: UserLanguageSelection = {
    userId,
    languageId,
    createdAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    selections[existingIndex] = newSelection;
  } else {
    selections.push(newSelection);
  }

  localStorage.setItem(STORAGE_KEYS.USER_LANGUAGES, JSON.stringify(selections));
};

export const getUserLanguages = async (userId: string): Promise<string[]> => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_LANGUAGES);
  const selections: UserLanguageSelection[] = stored ? JSON.parse(stored) : [];

  return selections
    .filter((s) => s.userId === userId)
    .map((s) => s.languageId);
};

export const saveUserProgress = async (
  userId: string,
  lessonId: string,
  completed: boolean
): Promise<void> => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  const progressList: UserProgress[] = stored ? JSON.parse(stored) : [];

  const existingIndex = progressList.findIndex(
    (p) => p.userId === userId && p.lessonId === lessonId
  );

  const newProgress: UserProgress = {
    userId,
    lessonId,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    progressList[existingIndex] = newProgress;
  } else {
    progressList.push(newProgress);
  }

  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progressList));
};

export const getUserProgress = async (userId: string): Promise<Record<string, boolean>> => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  const progressList: UserProgress[] = stored ? JSON.parse(stored) : [];

  const progressMap: Record<string, boolean> = {};
  progressList
    .filter((p) => p.userId === userId)
    .forEach((p) => {
      progressMap[p.lessonId] = p.completed;
    });

  return progressMap;
};
