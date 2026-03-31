import { db } from '../lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';

export interface Language {
  id: string;
  name: string;
  nativeSpelling: string;
  description: string;
  orderIndex?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  correctAnswer: string;
  options: {
    kalenjin: string;
    kikuyu: string;
    luo: string;
  };
  orderIndex: number;
}

export interface QuizResult {
  id?: string;
  userId: string;
  lessonId: string;
  languageId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

export const getLanguages = async (): Promise<Language[]> => {
  try {
    const languagesRef = collection(db, 'languages');
    const q = query(languagesRef, orderBy('orderIndex', 'asc'));
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
    const q = query(lessonsRef, orderBy('orderIndex', 'asc'));
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

export const getLesson = async (lessonId: string): Promise<Lesson | null> => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonDoc = await getDoc(lessonRef);
    if (!lessonDoc.exists()) return null;
    return {
      id: lessonDoc.id,
      ...lessonDoc.data(),
    } as Lesson;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
};

export const saveLesson = async (lesson: Partial<Lesson> & { title: string; description: string }): Promise<Lesson> => {
  try {
    if (lesson.id) {
      const lessonRef = doc(db, 'lessons', lesson.id);
      await setDoc(lessonRef, {
        ...lesson,
        updatedAt: new Date(),
      }, { merge: true });
      return { ...lesson, id: lesson.id } as Lesson;
    } else {
      const lessonsRef = collection(db, 'lessons');
      const docRef = await addDoc(lessonsRef, {
        ...lesson,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ...lesson, id: docRef.id } as Lesson;
    }
  } catch (error) {
    console.error('Error saving lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    await deleteDoc(lessonRef);
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

export const getLessonContent = async (lessonId: string): Promise<LessonContent[]> => {
  try {
    const contentRef = collection(db, 'lessonContent');
    const q = query(
      contentRef,
      where('lessonId', '==', lessonId),
      orderBy('orderIndex', 'asc')
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

export const saveLessonContent = async (content: Partial<LessonContent> & { lessonId: string; english: string }): Promise<void> => {
  try {
    if (content.id) {
      const contentRef = doc(db, 'lessonContent', content.id);
      await setDoc(contentRef, content, { merge: true });
    } else {
      const contentCollectionRef = collection(db, 'lessonContent');
      await addDoc(contentCollectionRef, content);
    }
  } catch (error) {
    console.error('Error saving lesson content:', error);
    throw error;
  }
};

export const deleteLessonContent = async (contentId: string): Promise<void> => {
  try {
    const contentRef = doc(db, 'lessonContent', contentId);
    await deleteDoc(contentRef);
  } catch (error) {
    console.error('Error deleting lesson content:', error);
    throw error;
  }
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

export const getQuizQuestions = async (lessonId: string): Promise<QuizQuestion[]> => {
  try {
    const questionsRef = collection(db, 'quizQuestions');
    const q = query(
      questionsRef,
      where('lessonId', '==', lessonId),
      orderBy('orderIndex', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QuizQuestion[];
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    return [];
  }
};

export const saveQuizQuestion = async (question: Partial<QuizQuestion> & { lessonId: string; question: string }): Promise<void> => {
  try {
    if (question.id) {
      const questionRef = doc(db, 'quizQuestions', question.id);
      await setDoc(questionRef, question, { merge: true });
    } else {
      const questionsCollectionRef = collection(db, 'quizQuestions');
      await addDoc(questionsCollectionRef, question);
    }
  } catch (error) {
    console.error('Error saving quiz question:', error);
    throw error;
  }
};

export const deleteQuizQuestion = async (questionId: string): Promise<void> => {
  try {
    const questionRef = doc(db, 'quizQuestions', questionId);
    await deleteDoc(questionRef);
  } catch (error) {
    console.error('Error deleting quiz question:', error);
    throw error;
  }
};

export const saveQuizResult = async (result: QuizResult): Promise<void> => {
  try {
    const docRef = doc(collection(db, 'users', result.userId, 'quizResults'));
    await setDoc(docRef, {
      lessonId: result.lessonId,
      languageId: result.languageId,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      completedAt: result.completedAt,
    });
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
};

export const getQuizResults = async (userId: string, lessonId?: string): Promise<QuizResult[]> => {
  try {
    const resultsRef = collection(db, 'users', userId, 'quizResults');
    let q = query(resultsRef);

    if (lessonId) {
      q = query(resultsRef, where('lessonId', '==', lessonId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      userId,
      ...doc.data(),
    })) as QuizResult[];
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return [];
  }
};

export const getBestQuizScore = async (userId: string, lessonId: string): Promise<number> => {
  try {
    const results = await getQuizResults(userId, lessonId);
    if (results.length === 0) return 0;
    return Math.max(...results.map((r) => r.percentage));
  } catch (error) {
    console.error('Error fetching best quiz score:', error);
    return 0;
  }
};
