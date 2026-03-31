import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { Languages, BookOpen, Plus, CreditCard as Edit2, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import {
  getLessons,
  deleteLesson,
  Lesson
} from '../services/dataService';

export function Admin() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const lessonsData = await getLessons();
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This will also delete all associated content and quiz questions.')) {
      return;
    }

    try {
      await deleteLesson(lessonId);
      await loadLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setView('edit');
  };

  if (adminLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">LUGHA47</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">ADMIN</span>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Lesson Management</h1>
                <p className="text-lg text-gray-600">Create and manage lessons for all languages</p>
              </div>
              <button
                onClick={() => {
                  setSelectedLesson(null);
                  setView('create');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create New Lesson
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
            ) : lessons.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Lessons Yet</h3>
                <p className="text-gray-600 mb-6">Create your first lesson to get started</p>
                <button
                  onClick={() => {
                    setSelectedLesson(null);
                    setView('create');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Create Lesson
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Edit lesson"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete lesson"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    <div className="text-sm text-gray-500">
                      Order: {lesson.orderIndex}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {(view === 'create' || view === 'edit') && (
          <LessonForm
            lesson={selectedLesson}
            onBack={() => {
              setView('list');
              setSelectedLesson(null);
              loadLessons();
            }}
          />
        )}
      </main>
    </div>
  );
}

interface LessonFormProps {
  lesson: Lesson | null;
  onBack: () => void;
}

function LessonForm({ lesson, onBack }: LessonFormProps) {
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Lessons
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {lesson ? 'Edit Lesson' : 'Create New Lesson'}
        </h2>
        <p className="text-gray-600 mb-8">
          This feature will be implemented with the lesson creation form component.
        </p>
        <button
          onClick={() => navigate(`/admin/lesson/${lesson?.id || 'new'}`)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
        >
          Continue to Lesson Editor
        </button>
      </div>
    </div>
  );
}
