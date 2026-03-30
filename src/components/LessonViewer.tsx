import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { getLessons, getLessonContent, Lesson, LessonContent } from '../services/dataService';

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
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');

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

  if (viewMode === 'detail' && selectedLesson) {
    return (
      <>
        <button
          onClick={() => setViewMode('grid')}
          className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {selectedLesson.title}
          </h1>
          <p className="text-lg text-gray-600">
            {selectedLesson.description}
          </p>
        </div>

        <div className="space-y-6">
          {selectedLesson.content.map((item, index) => {
            const getLanguageWord = () => {
              switch (languageId) {
                case 'kalenjin':
                  return item.kalenjin;
                case 'kikuyu':
                  return item.kikuyu;
                case 'luo':
                  return item.luo;
                default:
                  return item.kalenjin;
              }
            };

            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {getLanguageName(languageId)}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {getLanguageWord()}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                      English
                    </p>
                    <p className="text-2xl font-semibold text-emerald-900">
                      {item.english}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl p-6 border border-emerald-200">
          <p className="text-sm text-gray-600">
            Keep practicing these words to reinforce your learning. Try pronouncing them out loud!
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Languages
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Learn {getLanguageName(languageId)}
        </h1>
        <p className="text-lg text-gray-600">
          Select a lesson to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => {
              setSelectedLesson(lesson);
              setViewMode('detail');
            }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-emerald-400 transition" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {lesson.title}
            </h3>

            <p className="text-gray-600 mb-6">
              {lesson.description}
            </p>

            <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition">
              Start Lesson
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
