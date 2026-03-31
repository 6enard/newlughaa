import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import {
  getLesson,
  getLessonContent,
  getQuizQuestions,
  saveLesson,
  saveLessonContent,
  saveQuizQuestion,
  deleteLessonContent,
  deleteQuizQuestion,
  Lesson,
  LessonContent,
  QuizQuestion
} from '../services/dataService';

export function LessonEditor() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    orderIndex: 1,
  });

  const [contentItems, setContentItems] = useState<Partial<LessonContent>[]>([
    {
      kalenjin: '',
      kikuyu: '',
      luo: '',
      english: '',
      orderIndex: 1,
    },
  ]);

  const [quizQuestions, setQuizQuestions] = useState<Partial<QuizQuestion>[]>([
    {
      question: '',
      correctAnswer: 'kalenjin',
      options: {
        kalenjin: '',
        kikuyu: '',
        luo: '',
      },
      orderIndex: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (lessonId && lessonId !== 'new') {
      loadLessonData();
    }
  }, [lessonId]);

  const loadLessonData = async () => {
    if (!lessonId || lessonId === 'new') return;

    try {
      setLoading(true);
      const lessonData = await getLesson(lessonId);
      const content = await getLessonContent(lessonId);
      const questions = await getQuizQuestions(lessonId);

      setLesson(lessonData);

      if (content.length > 0) {
        setContentItems(content);
      }

      if (questions.length > 0) {
        setQuizQuestions(questions);
      }
    } catch (error) {
      console.error('Error loading lesson data:', error);
      alert('Failed to load lesson data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lesson.title || !lesson.description) {
      alert('Please fill in lesson title and description');
      return;
    }

    if (contentItems.length === 0 || !contentItems[0].english) {
      alert('Please add at least one content item');
      return;
    }

    if (quizQuestions.length === 0 || !quizQuestions[0].question) {
      alert('Please add at least one quiz question');
      return;
    }

    try {
      setSaving(true);

      const savedLesson = await saveLesson({
        id: lessonId && lessonId !== 'new' ? lessonId : undefined,
        title: lesson.title!,
        description: lesson.description!,
        orderIndex: lesson.orderIndex || 1,
        createdBy: user?.uid,
      });

      for (const [index, content] of contentItems.entries()) {
        if (content.english && content.kalenjin && content.kikuyu && content.luo) {
          await saveLessonContent({
            id: content.id,
            lessonId: savedLesson.id,
            kalenjin: content.kalenjin,
            kikuyu: content.kikuyu,
            luo: content.luo,
            english: content.english,
            orderIndex: index + 1,
          });
        }
      }

      for (const [index, question] of quizQuestions.entries()) {
        if (question.question && question.options) {
          await saveQuizQuestion({
            id: question.id,
            lessonId: savedLesson.id,
            question: question.question,
            correctAnswer: question.correctAnswer || 'kalenjin',
            options: question.options,
            orderIndex: index + 1,
          });
        }
      }

      alert('Lesson saved successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const addContentItem = () => {
    setContentItems([
      ...contentItems,
      {
        kalenjin: '',
        kikuyu: '',
        luo: '',
        english: '',
        orderIndex: contentItems.length + 1,
      },
    ]);
  };

  const removeContentItem = async (index: number) => {
    const item = contentItems[index];
    if (item.id) {
      try {
        await deleteLessonContent(item.id);
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
    setContentItems(contentItems.filter((_, i) => i !== index));
  };

  const updateContentItem = (index: number, field: keyof LessonContent, value: string) => {
    const updated = [...contentItems];
    updated[index] = { ...updated[index], [field]: value };
    setContentItems(updated);
  };

  const addQuizQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question: '',
        correctAnswer: 'kalenjin',
        options: {
          kalenjin: '',
          kikuyu: '',
          luo: '',
        },
        orderIndex: quizQuestions.length + 1,
      },
    ]);
  };

  const removeQuizQuestion = async (index: number) => {
    const question = quizQuestions[index];
    if (question.id) {
      try {
        await deleteQuizQuestion(question.id);
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const updated = [...quizQuestions];
    if (field.startsWith('option_')) {
      const lang = field.replace('option_', '');
      updated[index] = {
        ...updated[index],
        options: {
          ...updated[index].options,
          [lang]: value,
        },
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setQuizQuestions(updated);
  };

  if (adminLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              {lessonId === 'new' ? 'Create New Lesson' : 'Edit Lesson'}
            </h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lesson Title
              </label>
              <input
                type="text"
                value={lesson.title || ''}
                onChange={(e) => setLesson({ ...lesson, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="e.g., Basic Greetings"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={lesson.description || ''}
                onChange={(e) => setLesson({ ...lesson, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                rows={3}
                placeholder="e.g., Learn common greetings and introductions"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Index
              </label>
              <input
                type="number"
                value={lesson.orderIndex || 1}
                onChange={(e) => setLesson({ ...lesson, orderIndex: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                min="1"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                  activeTab === 'content'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Lesson Content
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                  activeTab === 'quiz'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                Quiz Questions
              </button>
            </div>

            {activeTab === 'content' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Lesson Content</h2>
                  <button
                    onClick={addContentItem}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Content
                  </button>
                </div>

                <div className="space-y-6">
                  {contentItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Card {index + 1}</h3>
                        {contentItems.length > 1 && (
                          <button
                            onClick={() => removeContentItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            English
                          </label>
                          <input
                            type="text"
                            value={item.english || ''}
                            onChange={(e) => updateContentItem(index, 'english', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            placeholder="Hello"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Kalenjin
                          </label>
                          <input
                            type="text"
                            value={item.kalenjin || ''}
                            onChange={(e) => updateContentItem(index, 'kalenjin', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            placeholder="Chamge"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Kikuyu
                          </label>
                          <input
                            type="text"
                            value={item.kikuyu || ''}
                            onChange={(e) => updateContentItem(index, 'kikuyu', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            placeholder="Wĩ mwega"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Luo
                          </label>
                          <input
                            type="text"
                            value={item.luo || ''}
                            onChange={(e) => updateContentItem(index, 'luo', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            placeholder="Oyawore"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Questions</h2>
                    <p className="text-gray-600">Select the correct answer for each question</p>
                  </div>
                  <button
                    onClick={addQuizQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {quizQuestions.map((question, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Question {index + 1}</h3>
                        {quizQuestions.length > 1 && (
                          <button
                            onClick={() => removeQuizQuestion(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Question (English word to translate)
                          </label>
                          <input
                            type="text"
                            value={question.question || ''}
                            onChange={(e) => updateQuizQuestion(index, 'question', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            placeholder="e.g., Good morning"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Kalenjin Translation
                            </label>
                            <input
                              type="text"
                              value={question.options?.kalenjin || ''}
                              onChange={(e) => updateQuizQuestion(index, 'option_kalenjin', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                              placeholder="Chamge"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Kikuyu Translation
                            </label>
                            <input
                              type="text"
                              value={question.options?.kikuyu || ''}
                              onChange={(e) => updateQuizQuestion(index, 'option_kikuyu', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                              placeholder="Wĩ mwega"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Luo Translation
                            </label>
                            <input
                              type="text"
                              value={question.options?.luo || ''}
                              onChange={(e) => updateQuizQuestion(index, 'option_luo', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                              placeholder="Oyawore"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Correct Answer
                          </label>
                          <select
                            value={question.correctAnswer || 'kalenjin'}
                            onChange={(e) => updateQuizQuestion(index, 'correctAnswer', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          >
                            <option value="kalenjin">Kalenjin</option>
                            <option value="kikuyu">Kikuyu</option>
                            <option value="luo">Luo</option>
                          </select>
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: <span className="font-semibold text-emerald-600">
                              {question.options?.[question.correctAnswer as keyof typeof question.options] || 'None'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
