import lessonsData from '../data/lessons.json';
import { db } from '../lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

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
  try {
    const docRef = doc(db, 'users', userId, 'languages', languageId);
    await setDoc(docRef, {
      languageId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving language selection:', error);
    throw error;
  }
};

export const getUserLanguages = async (userId: string): Promise<string[]> => {
  try {
    const languagesRef = collection(db, 'users', userId, 'languages');
    const snapshot = await getDocs(languagesRef);
    return snapshot.docs.map((doc) => doc.data().languageId);
  } catch (error) {
    console.error('Error fetching user languages:', error);
    return [];
  }
};

export const saveUserProgress = async (
  userId: string,
  lessonId: string,
  completed: boolean
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'progress', lessonId);
    await setDoc(docRef, {
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

export const getUserProgress = async (userId: string): Promise<Record<string, boolean>> => {
  try {
    const progressRef = collection(db, 'users', userId, 'progress');
    const snapshot = await getDocs(progressRef);

    const progressMap: Record<string, boolean> = {};
    snapshot.docs.forEach((doc) => {
      progressMap[doc.data().lessonId] = doc.data().completed;
    });

    return progressMap;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return {};
  }
};
