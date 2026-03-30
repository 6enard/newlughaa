import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { languages, lessons } from '../utils/languages';

export const initializeLanguagesData = async () => {
  try {
    const languagesRef = collection(db, 'languages');

    for (const lang of languages) {
      const langDoc = doc(languagesRef, lang.id);
      const docSnap = await getDoc(langDoc);

      if (!docSnap.exists()) {
        await setDoc(langDoc, lang);
      }
    }

    const lessonsRef = collection(db, 'lessons');

    for (const lesson of lessons) {
      const lessonDoc = doc(lessonsRef, lesson.id);
      const docSnap = await getDoc(lessonDoc);

      if (!docSnap.exists()) {
        await setDoc(lessonDoc, lesson);
      }
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

export const getLanguages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'languages'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
};

export const getLessons = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'lessons'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
};

export const getUserSelectedLanguages = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.data()?.selectedLanguages || [];
  } catch (error) {
    console.error('Error fetching user languages:', error);
    return [];
  }
};

export const saveUserLanguageSelection = async (
  userId: string,
  languageId: string
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        selectedLanguages: [languageId],
        createdAt: new Date(),
      });
    } else {
      const currentLanguages = userDoc.data()?.selectedLanguages || [];
      if (!currentLanguages.includes(languageId)) {
        await updateDoc(userRef, {
          selectedLanguages: [...currentLanguages, languageId],
        });
      }
    }
  } catch (error) {
    console.error('Error saving language selection:', error);
  }
};
