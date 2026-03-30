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
    const [cardIndex, setCardIndex] = useState(0);
    const currentCard = selectedLesson.content[cardIndex];
    const isLastCard = cardIndex === selectedLesson.content.length - 1;

    const getLanguageWord = () => {
      switch (languageId) {
        case 'kalenjin':
          return currentCard.kalenjin;
        case 'kikuyu':
          return currentCard.kikuyu;
        case 'luo':
          return currentCard.luo;
        default:
          return currentCard.kalenjin;
      }
    };

    const handleNext = () => {
      if (!isLastCard) {
        setCardIndex(cardIndex + 1);
      }
    };

    const handlePrevious = () => {
      if (cardIndex > 0) {
        setCardIndex(cardIndex - 1);
      }
    };

    return (
      <>
        <button
          onClick={() => setViewMode('grid')}
          className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {selectedLesson.title}
          </h1>
          <p className="text-lg text-gray-600">
            {selectedLesson.description}
          </p>
        </div>

        <div className="flex items-center justify-center min-h-96">
          <div className="w-full max-w-2xl">
            <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-3xl shadow-2xl p-12 border border-emerald-200">
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 uppercase tracking-widest mb-3">
                    {getLanguageName(languageId)}
                  </p>
                  <p className="text-5xl font-bold text-gray-900">
                    {getLanguageWord()}
                  </p>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>

                <div>
                  <p className="text-sm font-semibold text-sky-700 uppercase tracking-widest mb-3">
                    English
                  </p>
                  <p className="text-3xl font-semibold text-gray-800">
                    {currentCard.english}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={cardIndex === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">
                  {cardIndex + 1} / {selectedLesson.content.length}
                </span>
                <div className="flex gap-1">
                  {selectedLesson.content.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition ${
                        idx === cardIndex ? 'w-8 bg-emerald-600' : 'w-2 bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={isLastCard}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {isLastCard ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {isLastCard && (
              <div className="mt-8 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-xl p-6 border border-emerald-200 text-center">
                <p className="text-lg font-semibold text-emerald-900">
                  Great job! You've completed this lesson.
                </p>
                <p className="text-gray-600 mt-2">
                  Practice these words and come back to reinforce your learning!
                </p>
              </div>
            )}
          </div>
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
