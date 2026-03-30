import { ArrowLeft, BookOpen } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  nativeSpelling: string;
  description: string;
}

interface LanguageSelectorProps {
  languages: Language[];
  onSelectLanguage: (languageId: string) => void;
  onBack: () => void;
}

export function LanguageSelector({
  languages,
  onSelectLanguage,
  onBack,
}: LanguageSelectorProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Choose Your Language
        </h1>
        <p className="text-lg text-gray-600">
          Select a language to start learning today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language) => (
          <div
            key={language.id}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {language.name}
            </h3>
            <p className="text-sm text-emerald-600 font-semibold mb-3">
              {language.nativeSpelling}
            </p>
            <p className="text-gray-600 mb-4">
              {language.description}
            </p>
            <button
              onClick={() => onSelectLanguage(language.id)}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
