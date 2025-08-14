'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  grade: string;
}

interface QuizResult {
  userId: string;
  questions: Question[];
  userAnswers: number[];
  score: number;
  completedAt: string;
}

interface User {
  id: string;
  name: string;
  grade: string;
  age: number;
  email: string;
  score: number;
}

export default function QuizResult() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedResult = localStorage.getItem('lastQuizResult');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    if (savedResult) {
      setQuizResult(JSON.parse(savedResult));
    }
  }, []);

  if (!currentUser || !quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const correctAnswers = quizResult.userAnswers.filter((answer, index) => 
    answer === quizResult.questions[index].correctAnswer
  ).length;

  const wrongAnswers = quizResult.userAnswers.filter((answer, index) => 
    answer !== -1 && answer !== quizResult.questions[index].correctAnswer
  ).length;

  const skippedAnswers = quizResult.userAnswers.filter(answer => answer === -1).length;

  const percentage = Math.round((correctAnswers / quizResult.questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 pt-8 pb-20">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 font-medium">
          <i className="ri-arrow-left-line mr-2"></i>
          Home
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-['Pacifico'] text-blue-600 mb-2">Quiz Results</h1>
        <p className="text-gray-600 text-sm">Great job completing the {currentUser.grade} quiz!</p>
      </div>

      {/* Score Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">{percentage}%</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {quizResult.score > 0 ? '+' : ''}{quizResult.score} Points
          </h2>
          <p className="text-gray-600">Your total score for this quiz</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-check-line text-green-600 text-xl"></i>
            </div>
            <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
            <p className="text-xs text-gray-600">Correct</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-close-line text-red-600 text-xl"></i>
            </div>
            <p className="text-2xl font-bold text-red-600">{wrongAnswers}</p>
            <p className="text-xs text-gray-600">Wrong</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="ri-question-line text-gray-600 text-xl"></i>
            </div>
            <p className="text-2xl font-bold text-gray-600">{skippedAnswers}</p>
            <p className="text-xs text-gray-600">Skipped</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-blue-600"></i>
            </div>
            <div>
              <p className="font-semibold text-blue-800">{currentUser.name}</p>
              <p className="text-sm text-blue-600">{currentUser.grade} • Total: {currentUser.score} points</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium mb-4 !rounded-button"
        >
          <i className={`mr-2 ${showAnswers ? 'ri-eye-off-line' : 'ri-eye-line'}`}></i>
          {showAnswers ? 'Hide' : 'Show'} Detailed Answers
        </button>
      </div>

      {/* Detailed Answers */}
      {showAnswers && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Review</h3>
          <div className="space-y-6">
            {quizResult.questions.map((question, index) => {
              const userAnswer = quizResult.userAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              const wasSkipped = userAnswer === -1;

              return (
                <div key={question.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      wasSkipped ? 'bg-gray-100' : isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {wasSkipped ? (
                        <i className="ri-question-line text-gray-600 text-sm"></i>
                      ) : isCorrect ? (
                        <i className="ri-check-line text-green-600 text-sm"></i>
                      ) : (
                        <i className="ri-close-line text-red-600 text-sm"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">{index + 1}. {question.question}</p>
                      <div className="space-y-1 text-sm">
                        {!wasSkipped && (
                          <p className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            Your answer: {question.options[userAnswer]}
                          </p>
                        )}
                        {wasSkipped && (
                          <p className="text-gray-600 font-medium">Not answered (time ran out)</p>
                        )}
                        <p className="text-green-600 font-medium">
                          Correct answer: {question.options[question.correctAnswer]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scoreboard Promotion */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 mb-6 border border-purple-200 dark:border-purple-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-bar-chart-line text-white text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200 mb-2">🏆 See How You Rank!</h3>
          <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
            Check your position on the public scoreboard and compete with students worldwide!
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-purple-600 dark:text-purple-400">
            <div className="flex items-center space-x-1">
              <i className="ri-user-line"></i>
              <span>Live Rankings</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-medal-line"></i>
              <span>Grade Champions</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-star-line"></i>
              <span>Global Competition</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link 
          href="/scoreboard"
          className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-semibold text-center !rounded-button shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <i className="ri-trophy-line mr-2 text-xl"></i>
          📈 View Public Scoreboard
        </Link>
        
        <Link 
          href="/"
          className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold text-center !rounded-button"
        >
          <i className="ri-refresh-line mr-2 text-xl"></i>
          Take Another Quiz
        </Link>
      </div>

      <div className="mt-6 bg-yellow-50 rounded-2xl p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <i className="ri-lightbulb-line text-yellow-600"></i>
          </div>
          <div>
            <p className="font-medium text-yellow-800 mb-1">Keep improving!</p>
            <p className="text-yellow-700 text-sm">Practice more quizzes to climb the public scoreboard and compete with other students worldwide!</p>
          </div>
        </div>
      </div>
    </div>
  );
}