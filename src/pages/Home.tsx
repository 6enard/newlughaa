import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Languages, BookOpen, Trophy, TrendingUp, LogOut, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getLanguages, saveUserLanguageSelection } from '../services/dataService';
import { LanguageSelector } from '../components/LanguageSelector';
import { LessonViewer } from '../components/LessonViewer';

type HomeView = 'dashboard' | 'languages' | 'lessons';

export function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<HomeView>('dashboard');
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const languagesData = await getLanguages();
        setLanguages(languagesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectLanguage = async (languageId: string) => {
    setSelectedLanguage(languageId);
    setView('lessons');
    try {
      if (user) {
        await saveUserLanguageSelection(user.uid, languageId);
      }
    } catch (error) {
      console.error('Error saving language selection:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">LUGHA47</span>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {view === 'dashboard' && (
          <>
            <div className="mb-16 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Preserve Kenya's<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                  Rich Linguistic Heritage
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Connect with your roots and keep Kenyan languages alive for future generations.
                Learn Kalenjin, Kikuyu, and Luo through interactive lessons designed to honor our culture.
              </p>
            </div>

            <div className="mb-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-lg p-10 border border-amber-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Mission</h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Every language carries the wisdom, stories, and identity of its people.
                  LUGHA47 is dedicated to preserving Kenya's indigenous languages by making
                  them accessible, engaging, and relevant for modern learners.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-amber-300">
                    <Languages className="w-8 h-8 text-amber-700" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Cultural Identity</h3>
                  <p className="text-gray-600">
                    Language is the heart of culture. Keep your heritage alive.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
                    <BookOpen className="w-8 h-8 text-emerald-700" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Learning</h3>
                  <p className="text-gray-600">
                    Engaging lessons that make language learning natural and fun.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-sky-300">
                    <TrendingUp className="w-8 h-8 text-sky-700" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Track Your Journey</h3>
                  <p className="text-gray-600">
                    Monitor your progress as you master your native language.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Languages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:border-emerald-300 transition group cursor-pointer"
                    onClick={() => setView('languages')}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                      <Languages className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{lang.name}</h3>
                    <p className="text-emerald-600 font-semibold text-lg mb-3">{lang.nativeSpelling}</p>
                    <p className="text-gray-600 mb-4">{lang.description}</p>
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition">
                      Start Learning <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-sky-700 rounded-3xl shadow-2xl p-12 text-white mb-16">
              <div className="max-w-3xl mx-auto text-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Begin Your Language Journey Today</h2>
                <p className="text-emerald-50 mb-8 text-lg leading-relaxed">
                  Join thousands of Kenyans reconnecting with their linguistic roots.
                  Whether you're learning your mother tongue or exploring Kenya's diverse cultures,
                  LUGHA47 makes it easy, engaging, and meaningful.
                </p>
                <button
                  onClick={() => setView('languages')}
                  className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition shadow-lg hover:shadow-xl"
                >
                  Choose Your Language
                </button>
              </div>
            </div>

            <div className="text-center text-gray-600">
              <p className="text-sm">
                Preserving our languages means preserving our identity, our stories, and our future.
              </p>
            </div>
          </>
        )}

        {view === 'languages' && (
          <LanguageSelector
            languages={languages}
            onSelectLanguage={handleSelectLanguage}
            onBack={() => setView('dashboard')}
          />
        )}

        {view === 'lessons' && selectedLanguage && (
          <LessonViewer
            languageId={selectedLanguage}
            onBack={() => setView('languages')}
          />
        )}
      </main>
    </div>
  );
}
