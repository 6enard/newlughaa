import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  try {
    const languagesRef = collection(db, 'languages');
    const q = query(languagesRef, orderBy('name'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Language[];
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
};

export const getLessons = async (): Promise<Lesson[]> => {
  try {
    const lessonsRef = collection(db, 'lessons');
    const q = query(lessonsRef, orderBy('orderIndex'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Lesson[];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const getLessonContent = async (lessonId: string): Promise<LessonContent[]> => {
  try {
    const contentRef = collection(db, 'lessonContent');
    const q = query(
      contentRef,
      where('lessonId', '==', lessonId),
      orderBy('orderIndex')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LessonContent[];
  } catch (error) {
    console.error('Error fetching lesson content:', error);
    return [];
  }
};

export const saveUserLanguageSelection = async (
  userId: string,
  languageId: string
): Promise<void> => {
  try {
    const userLanguageRef = doc(db, 'userLanguages', `${userId}_${languageId}`);
    await setDoc(userLanguageRef, {
      userId,
      languageId,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving language selection:', error);
  }
};

export const getUserLanguages = async (userId: string): Promise<string[]> => {
  try {
    const userLanguagesRef = collection(db, 'userLanguages');
    const q = query(userLanguagesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

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
    const progressRef = doc(db, 'userProgress', `${userId}_${lessonId}`);
    await setDoc(progressRef, {
      userId,
      lessonId,
      completed,
      completedAt: completed ? Timestamp.now() : null,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

export const getUserProgress = async (userId: string): Promise<Record<string, boolean>> => {
  try {
    const progressRef = collection(db, 'userProgress');
    const q = query(progressRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    const progressMap: Record<string, boolean> = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      progressMap[data.lessonId] = data.completed;
    });

    return progressMap;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return {};
  }
};
