import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';

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

interface QuizProps {
  questions: QuizQuestion[];
  languageId: string;
  onComplete: (score: number, total: number) => void;
  onRetry: () => void;
}

export function Quiz({ questions, languageId, onComplete, onRetry }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const getLanguageName = (lang: string) => {
    const names: Record<string, string> = {
      kalenjin: 'Kalenjin',
      kikuyu: 'Kikuyu',
      luo: 'Luo',
    };
    return names[lang] || lang;
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
      const finalScore = selectedAnswer === currentQuestion.correctAnswer ? score + 1 : score;
      onComplete(finalScore, questions.length);
    }
  };

  const getScorePercentage = () => {
    return Math.round((score / questions.length) * 100);
  };

  const getScoreMessage = () => {
    const percentage = getScorePercentage();
    if (percentage === 100) return "Perfect score! You're a natural!";
    if (percentage >= 80) return "Excellent work! You're doing great!";
    if (percentage >= 60) return "Good job! Keep practicing!";
    return "Keep learning! Practice makes perfect!";
  };

  if (isComplete) {
    const percentage = getScorePercentage();

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-3xl shadow-2xl p-12 border border-emerald-200 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz Complete!
          </h2>

          <div className="mb-6">
            <div className="text-6xl font-bold text-emerald-600 mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-xl text-gray-700 font-semibold">
              {percentage}% Correct
            </p>
          </div>

          <p className="text-lg text-gray-600 mb-8">
            {getScoreMessage()}
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onRetry}
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Back to Lessons
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            Score: {score}/{questions.length}
          </span>
        </div>

        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full transition ${
                idx < currentQuestionIndex
                  ? 'bg-emerald-500'
                  : idx === currentQuestionIndex
                  ? 'bg-emerald-300'
                  : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-3xl shadow-2xl p-10 border border-emerald-200">
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-700 uppercase tracking-widest mb-3">
            Translate to {getLanguageName(languageId)}
          </p>
          <h2 className="text-4xl font-bold text-gray-900">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-4">
          {Object.entries(currentQuestion.options).map(([lang, translation]) => {
            const isCorrect = lang === currentQuestion.correctAnswer;
            const isSelected = selectedAnswer === lang;

            let buttonClass = 'w-full p-5 rounded-xl border-2 text-left font-semibold text-lg transition ';

            if (!isAnswered) {
              buttonClass += 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50';
            } else if (isSelected && isCorrect) {
              buttonClass += 'border-emerald-500 bg-emerald-100 text-emerald-900';
            } else if (isSelected && !isCorrect) {
              buttonClass += 'border-red-500 bg-red-100 text-red-900';
            } else if (isCorrect) {
              buttonClass += 'border-emerald-500 bg-emerald-100 text-emerald-900';
            } else {
              buttonClass += 'border-gray-200 bg-white opacity-50';
            }

            return (
              <button
                key={lang}
                onClick={() => handleAnswerSelect(lang)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{translation}</span>
                  {isAnswered && isSelected && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  {isAnswered && !isSelected && isCorrect && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8">
            <button
              onClick={handleNext}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              {isLastQuestion ? 'See Results' : 'Next Question'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
