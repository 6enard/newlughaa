import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Languages, BookOpen, Trophy, TrendingUp, LogOut } from 'lucide-react';

export function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">LUGHA47</span>
            </div>
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to LUGHA47!
          </h1>
          <p className="text-lg text-gray-600">
            Master new languages with interactive lessons and real-world practice
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Learning</h3>
            <p className="text-gray-600 mb-4">
              Begin your journey with interactive lessons tailored to your level
            </p>
            <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
              Browse Courses →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600 mb-4">
              Monitor your learning journey with detailed analytics and insights
            </p>
            <button className="text-sky-600 font-semibold hover:text-sky-700 transition">
              View Stats →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Earn Rewards</h3>
            <p className="text-gray-600 mb-4">
              Complete challenges and earn badges as you master new languages
            </p>
            <button className="text-amber-600 font-semibold hover:text-amber-700 transition">
              View Achievements →
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-sky-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Ready to start your journey?</h2>
            <p className="text-emerald-50 mb-6 text-lg">
              Choose from over 47 languages and start learning at your own pace with personalized lessons
            </p>
            <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition">
              Choose Your Language
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
