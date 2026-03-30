import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { getLessons, getLessonContent, Lesson, LessonContent } from '../services/firestoreService';

interface LessonViewerProps {
  languageId: string;
  onBack: () => void;
}

interface LessonWithContent extends Lesson {
  content: LessonContent[];
}

export function LessonViewer({ languageId, onBack }: LessonViewerProps) {
  const [lessons, setLessons] = useState<LessonWithContent[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonWithContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const lessonsData = await getLessons();
        const lessonsWithContent = await Promise.all(
          lessonsData.map(async (lesson) => {
            const content = await getLessonContent(lesson.id);
            return { ...lesson, content };
          })
        );
        setLessons(lessonsWithContent);
        if (lessonsWithContent.length > 0) {
          setSelectedLesson(lessonsWithContent[0]);
        }
      } catch (error) {
        console.error('Error loading lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      kalenjin: 'Kalenjin',
      kikuyu: 'Kikuyu',
      luo: 'Luo',
    };
    return names[lang] || lang;
  };

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Languages
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Learn {getLanguageName(languageId)}
        </h1>
        <p className="text-lg text-gray-600">
          Complete lessons to master the language
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Lessons</h2>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition font-semibold ${
                    selectedLesson?.id === lesson.id
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {lesson.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedLesson && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedLesson.title}
              </h2>
              <p className="text-gray-600 mb-8">
                {selectedLesson.description}
              </p>

              <div className="space-y-6">
                {selectedLesson.content.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-md transition"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Kalenjin
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {item.kalenjin}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Kikuyu
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {item.kikuyu}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Luo
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {item.luo}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                          English
                        </p>
                        <p className="text-lg font-semibold text-emerald-900">
                          {item.english}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl p-6 border border-emerald-200">
                <p className="text-sm text-gray-600">
                  Keep practicing these words to reinforce your learning. Try pronouncing them out loud!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
