
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  grade: string;
}

interface User {
  id: string;
  name: string;
  grade: string;
  age: number;
  email: string;
  score: number;
  lastQuizTime?: string;
  lastQuizTimes?: { [subject: string]: string }; // Subject-specific quiz times
}

interface QuizSettings {
  isQuizEnabled: boolean;
  nextQuizTime: string;
  lastUpdateTime: string;
}

const subjects = [
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'science', name: 'Science' },
  { id: 'english', name: 'English' },
  { id: 'history', name: 'History' },
  { id: 'sinhala', name: 'Sinhala' },
  { id: 'buddhism', name: 'Buddhism' }
];

// Function to load questions from localStorage for a specific grade and subject
const loadQuestions = (grade: string, subject?: string): Question[] => {
  const adminQuestions = localStorage.getItem('adminQuestions');
  if (adminQuestions) {
    const questions = JSON.parse(adminQuestions);
    if (questions[grade]) {
      // If subject is specified, return only questions for that subject
      if (subject && questions[grade][subject] && Array.isArray(questions[grade][subject])) {
        return questions[grade][subject];
      }
      // If it's an object (not an array), merge all subject arrays (fallback behavior)
      if (!Array.isArray(questions[grade])) {
        return Object.values(questions[grade]).flat() as Question[];
      }
      return questions[grade];
    }
  }
  return [];
};

function QuizContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [canTakeQuiz, setCanTakeQuiz] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const completeQuiz = useCallback((answers: number[]) => {
    setQuizCompleted(true);

    // Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        score += 10;
      } else if (answer !== -1) {
        score -= 5;
      }
    });

    // Update user score and last quiz time
    const now = new Date();
    const updatedUser = { 
      ...currentUser!, 
      score: currentUser!.score + score,
      lastQuizTime: now.toISOString(), // Keep for backward compatibility
      lastQuizTimes: {
        ...currentUser!.lastQuizTimes,
        [selectedSubject]: now.toISOString()
      }
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Update in all users list
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const userIndex = allUsers.findIndex((u: User) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }

    // Store quiz result
    const quizResult = {
      userId: currentUser!.id,
      questions,
      userAnswers: answers,
      score,
      completedAt: now.toISOString()
    };
    localStorage.setItem('lastQuizResult', JSON.stringify(quizResult));

    // Navigate to results
    setTimeout(() => {
      router.push('/quiz-result');
    }, 2000);
  }, [currentUser, questions, router]);

  const handleNextQuestion = useCallback(() => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedAnswer !== null ? selectedAnswer : -1;
    setUserAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      completeQuiz(newAnswers);
    }
  }, [currentQuestion, selectedAnswer, userAnswers, questions.length, completeQuiz]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
      router.push('/register');
      return;
    }

    const user = JSON.parse(savedUser);
    setCurrentUser(user);

    // Get subject from URL parameter or localStorage
    const subjectParam = searchParams.get('subject');
    const storedSubject = localStorage.getItem('selectedSubject');
    const subject = subjectParam || storedSubject || '';
    
    setSelectedSubject(subject);
    
    // Store the subject for consistency
    if (subject) {
      localStorage.setItem('selectedSubject', subject);
    }

    // Check quiz availability
    checkQuizAvailability(user, subject);
  }, [router, searchParams]);

  const checkQuizAvailability = (user: User, subject: string) => {
    // Check if admin has enabled quiz
    const quizSettings = localStorage.getItem('quizSettings');
    const adminQuestions = localStorage.getItem('adminQuestions');
    
    if (!quizSettings) {
      setErrorMessage('Quiz is currently disabled by administrator');
      setCanTakeQuiz(false);
      return;
    }

    const settings: QuizSettings = JSON.parse(quizSettings);
    
    if (!settings.isQuizEnabled) {
      setErrorMessage('Quiz is currently disabled by administrator');
      setCanTakeQuiz(false);
      return;
    }

    if (!adminQuestions) {
      setErrorMessage('No questions available for your grade');
      setCanTakeQuiz(false);
      return;
    }

    const questions = JSON.parse(adminQuestions);
    
    // Use the provided subject, or fall back to first available subject
    let selectedSubjectId = subject;
    if (!selectedSubjectId && questions[user.grade]) {
      const gradeSubjects = Object.keys(questions[user.grade]);
      selectedSubjectId = gradeSubjects.length > 0 ? gradeSubjects[0] : '';
    }
    
    if (
      !user ||
      !questions[user.grade] ||
      !selectedSubjectId ||
      !Array.isArray(questions[user.grade][selectedSubjectId]) ||
      questions[user.grade][selectedSubjectId].length === 0
    ) {
      setErrorMessage(`No quiz available for ${user.grade}${selectedSubjectId ? ' - ' + selectedSubjectId : ''}. Please contact the administrator.`);
      setCanTakeQuiz(false);
      return;
    }
    // Check if grade has enough questions (minimum 1)
    if (questions[user.grade][selectedSubjectId].length < 1) {
      setErrorMessage(`Not enough questions available for ${user.grade}. Minimum 1 question required.`);
      setCanTakeQuiz(false);
      return;
    }
    
    // Check 24-hour cooldown for this specific subject
    const lastQuizTime = user.lastQuizTimes?.[selectedSubjectId] ? new Date(user.lastQuizTimes[selectedSubjectId]) : null;
    const now = new Date();
    
    if (lastQuizTime) {
      const timeDiff = now.getTime() - lastQuizTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        const nextQuiz = new Date(lastQuizTime.getTime() + 24 * 60 * 60 * 1000);
        const hoursLeft = Math.floor((nextQuiz.getTime() - now.getTime()) / (1000 * 60 * 60));
        const minutesLeft = Math.floor(((nextQuiz.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
        
        setErrorMessage(`You can take the next ${subjects.find(s => s.id === selectedSubjectId)?.name} quiz in ${hoursLeft}h ${minutesLeft}m`);
        setCanTakeQuiz(false);
        return;
      }
    }
    
    // Load questions for the specific subject and enable quiz
    let gradeQuestions = loadQuestions(user.grade, selectedSubjectId);
    if (!Array.isArray(gradeQuestions)) {
      console.error('gradeQuestions is not an array:', gradeQuestions);
      gradeQuestions = [];
    }
    // Shuffle and take only 10 questions
    const shuffledQuestions = gradeQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffledQuestions);
    setCanTakeQuiz(true);
  };

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizStarted) {
      handleNextQuestion();
    }
  }, [timeLeft, quizStarted, quizCompleted, handleNextQuestion]);

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(30);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  // Add a placeholder isAdmin check (replace with real logic as needed)
  const isAdmin = currentUser && currentUser.email === 'admin@example.com'; // Adjust this check as needed

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!canTakeQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 pt-8 pb-20">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 font-medium">
            <i className="ri-arrow-left-line mr-2"></i>
            Back
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-['Pacifico'] text-blue-600 mb-2">Quiz Unavailable</h1>
          <p className="text-gray-600 text-sm">Unable to start quiz at this time</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-close-circle-line text-red-600 text-2xl"></i>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Cannot Start Quiz</h2>
          <p className="text-gray-600 text-sm mb-6">{errorMessage}</p>
          
          <Link 
            href="/"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold !rounded-button"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 pt-8 pb-20">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 font-medium">
            <i className="ri-arrow-left-line mr-2"></i>
            Back
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-['Pacifico'] text-blue-600 mb-2">
            {currentUser.grade} Quiz
            {selectedSubject && (
              <span className="block text-lg text-purple-600 mt-1">
                {subjects.find(s => s.id === selectedSubject)?.name || selectedSubject}
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-sm">Get ready to test your knowledge!</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <img 
            src="https://readdy.ai/api/search-image?query=Students%20taking%20quiz%20in%20modern%20classroom%2C%20focused%20teenagers%20writing%20exam%2C%20educational%20assessment%2C%20bright%20classroom%20lighting%2C%20academic%20atmosphere%2C%20clean%20white%20background%2C%20professional%20photography%20style&width=300&height=160&seq=quiz-start&orientation=landscape"
            alt="Quiz preparation"
            className="w-full h-32 object-cover object-top rounded-xl mb-4"
          />
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Quiz Instructions</h2>
            <div className="text-left space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <i className="ri-check-line text-green-600"></i>
                <span>10 multiple choice questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-time-line text-blue-600"></i>
                <span>30 seconds per question</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-add-circle-line text-green-600"></i>
                <span>+10 points for correct answers</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-subtract-line text-red-600"></i>
                <span>-5 points for wrong answers</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="ri-calendar-line text-orange-600"></i>
                <span>One attempt per 24 hours</span>
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-semibold !rounded-button"
          >
            <i className="ri-play-circle-line mr-2 text-xl"></i>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-gray-600 mb-4">Calculating your score...</p>
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 pt-8 pb-20">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-2">
            <i className="ri-time-line text-red-600"></i>
            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-800'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center justify-between">
          {question.question}
          {isAdmin && (
            <span className="ml-2 flex space-x-2">
              <button
                onClick={() => alert('Edit logic here')}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                title="Edit"
              >
                <i className="ri-edit-2-line"></i>
              </button>
              <button
                onClick={() => alert('Delete logic here')}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                title="Delete"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </span>
          )}
        </h2>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all !rounded-button ${
                selectedAnswer === index
                  ? 'border-blue-600 bg-blue-50 text-blue-800'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === index && (
                    <i className="ri-check-line text-white text-sm"></i>
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNextQuestion}
        disabled={selectedAnswer === null}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed !rounded-button"
      >
        {currentQuestion === questions.length - 1 ? (
          <>
            <i className="ri-check-double-line mr-2 text-xl"></i>
            Finish Quiz
          </>
        ) : (
          <>
            <i className="ri-arrow-right-line mr-2 text-xl"></i>
            Next Question
          </>
        )}
      </button>
    </div>
  );
}

export default function Quiz() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
