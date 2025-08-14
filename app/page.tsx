"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '../components/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';
import { generateShareImage } from '../components/ShareImageGenerator';
interface User {
  id: string;
  name: string;
  grade: string;
  age: number;
  email: string;
  score: number;
  lastQuizTime?: string;
  lastQuizTimes?: { [subject: string]: string }; // Subject-specific quiz times
  isBanned?: boolean;
  banReason?: string;
  bannedUntil?: string;
}

interface QuizSettings {
  isQuizEnabled: boolean;
  nextQuizTime: string;
  lastUpdateTime: string;
}

const subjects = [
  { id: 'mathematics', name: 'Mathematics', icon: '📐', color: 'from-blue-500 to-cyan-500' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-500' },
  { id: 'english', name: 'English', icon: '🔤', color: 'from-purple-500 to-pink-500' },
  { id: 'history', name: 'History', icon: '🏛️', color: 'from-orange-500 to-red-500' },
  { id: 'sinhala', name: 'Sinhala', icon: '📖', color: 'from-indigo-500 to-purple-500' },
  { id: 'buddhism', name: 'Buddhism', icon: '☸️', color: 'from-yellow-500 to-orange-500' }
];

function HomeContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userRank, setUserRank] = useState<number>(0);
  const [gradeRank, setGradeRank] = useState<number>(0);
  const [canTakeQuiz, setCanTakeQuiz] = useState<boolean>(false);
  const [nextQuizTime, setNextQuizTime] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const [activeTab, setActiveTab] = useState<string>('home');
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('allUsers');
    const savedSubject = localStorage.getItem('selectedSubject');
    
    if (savedSubject) {
      setSelectedSubject(savedSubject);
    }
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      checkQuizAvailability(user);
    }
    
    if (savedUsers) {
      const users: User[] = JSON.parse(savedUsers);
      setAllUsers(users);
      
      if (savedUser) {
        const user = JSON.parse(savedUser);
        calculateRanks(user, users);
      }
    }
  }, []);

  // Re-check quiz availability when selectedSubject changes
  useEffect(() => {
    if (currentUser && selectedSubject) {
      checkQuizAvailability(currentUser);
    }
  }, [selectedSubject]);

  const getAvailableSubjects = (user: User) => {
    const adminQuestions = localStorage.getItem('adminQuestions');
    if (!adminQuestions) return [];
    
    const questions = JSON.parse(adminQuestions);
    if (!questions[user.grade]) return [];
    
    return subjects.filter(subject => {
      const subjectQuestions = questions[user.grade][subject.id];
      return Array.isArray(subjectQuestions) && subjectQuestions.length > 0;
    });
  };

  const checkQuizAvailability = (user: User) => {
    const quizSettings = localStorage.getItem('quizSettings');
    const adminQuestions = localStorage.getItem('adminQuestions');
    
    if (!quizSettings || !adminQuestions) {
      setCanTakeQuiz(false);
      return;
    }

    const settings: QuizSettings = JSON.parse(quizSettings);
    const questions = JSON.parse(adminQuestions);

    // Use selectedSubject from state or localStorage, fallback to user's last subject if available
    let subjectId = selectedSubject;
    if (!subjectId) {
      subjectId = localStorage.getItem('selectedSubject') || '';
    }
    if (!subjectId && (user as any).subject) {
      subjectId = (user as any).subject;
    }

    // Check if quiz is globally enabled
    if (!settings.isQuizEnabled) {
      setCanTakeQuiz(false);
      return;
    }

    // Check if the selected subject has questions available
    if (
      !questions[user.grade] ||
      !Array.isArray(questions[user.grade][subjectId]) ||
      questions[user.grade][subjectId].length === 0
    ) {
      setCanTakeQuiz(false);
      return;
    }

    // Check 24-hour cooldown for this specific subject
    const lastQuizTime = user.lastQuizTimes?.[subjectId] ? new Date(user.lastQuizTimes[subjectId]) : null;
    const now = new Date();
    
    if (lastQuizTime) {
      const timeDiff = now.getTime() - lastQuizTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setCanTakeQuiz(false);
        const nextQuiz = new Date(lastQuizTime.getTime() + 24 * 60 * 60 * 1000);
        setNextQuizTime(nextQuiz.toISOString());
        return;
      }
    }
    
    setCanTakeQuiz(true);
  };

  const calculateRanks = (user: User, users: User[]) => {
    const sortedUsers = users.sort((a, b) => b.score - a.score);
    const overallRank = sortedUsers.findIndex(u => u.id === user.id) + 1;
    setUserRank(overallRank);
    
    const gradeUsers = users.filter(u => u.grade === user.grade).sort((a, b) => b.score - a.score);
    const gradeRankPosition = gradeUsers.findIndex(u => u.id === user.id) + 1;
    setGradeRank(gradeRankPosition);
  };

  const getTimeUntilNextQuiz = () => {
    if (!nextQuizTime) return '';
    
    const now = new Date();
    const nextQuiz = new Date(nextQuizTime);
    const timeDiff = nextQuiz.getTime() - now.getTime();
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    localStorage.setItem('selectedSubject', subjectId);
    
    // Re-check quiz availability for the new subject
    if (currentUser) {
      checkQuizAvailability(currentUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setShowLogoutModal(false);
  };

  const shareRank = async () => {
    if (!currentUser) return;
    
    try {
      const selectedSubjectName = selectedSubject ? 
        subjects.find(s => s.id === selectedSubject)?.name || '' : '';
      
      const shareImage = generateShareImage({
        name: currentUser.name,
        rank: gradeRank,
        score: currentUser.score,
        grade: currentUser.grade,
        subject: selectedSubjectName,
        isChampion: gradeRank === 1
      });
      
      const shareText = `🎓 I'm ranked #${gradeRank} in ${currentUser.grade}${selectedSubjectName ? ` - ${selectedSubjectName}` : ''} with ${currentUser.score} points on SL QuizMaster! 🏆\n\nOverall rank: #${userRank}\n\nCan you beat my score? Join the quiz competition!`;
      
      // Convert image to blob
      const response = await fetch(shareImage);
      const blob = await response.blob();
      const file = new File([blob], 'my-rank.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My SL QuizMaster Rank',
          text: shareText,
          files: [file],
          url: window.location.origin
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My SL QuizMaster Rank',
          text: shareText,
          url: window.location.origin
        });
      } else {
        copyToClipboard(shareText);
        
        // Download image as fallback
        const link = document.createElement('a');
        link.download = 'my-SL QuizMaster-rank.png';
        link.href = shareImage;
        link.click();
        alert('Rank shared to clipboard and image downloaded!');
      }
    } catch {
      const shareText = `🎓 I'm ranked #${gradeRank} in ${currentUser.grade} with ${currentUser.score} points on SL QuizMaster! 🏆\n\nOverall rank: #${userRank}\n\nCan you beat my score?`;
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowShareModal(false);
      alert('Rank shared to clipboard!');
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 pt-8 pb-20">
        <div className="absolute top-8 right-4">
          <ThemeToggle />
        </div>
        
        <div className="text-center mb-12">
          <img 
            src="https://raw.githubusercontent.com/sithijanimsara103080-commits/SL-QuizMaster/70bb89c0ae679d51f5e881ba0ebb72755add020d/logo.png"
            alt="SL QuizMaster Logo"
            className="w-20 h-20 object-cover object-top rounded-2xl mx-auto mb-4 shadow-sm"
          />
          <h1 className="text-3xl font-['Pacifico'] text-blue-600 dark:text-blue-400 mb-2">SL QuizMaster</h1>
          <p className="text-gray-600 dark:text-gray-300">Competitive Learning Platform</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <img 
              src="https://img.freepik.com/premium-photo/young-students-studying-with-laptop-books_488220-35308.jpg"
              alt="Students learning"
              className="w-full h-32 object-cover object-top rounded-xl mb-4"
            />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Welcome to SL QuizMaster!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Join the ultimate educational quiz competition. Test your knowledge, earn points, and climb the leaderboards!
            </p>
            <div className="flex space-x-3">
              <Link 
                href="/signin"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-center !rounded-button"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold text-center !rounded-button"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">🎯 How It Works</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 text-sm">📝</span>
                </div>
                <span>Register with your grade level</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm">📚</span>
                </div>
                <span>Choose subject and take quizzes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm">🏆</span>
                </div>
                <span>Compete and climb rankings</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">📚 Available Subjects</h3>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center space-x-2"
                >
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center`}>
                    <span className="text-white text-sm">{subject.icon}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{subject.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/admin"
            className="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300"
          >
            <span className="mr-1">⚙️</span>
            Admin Panel
          </Link>
        </div>
      </div>
    );
  }

  if (currentUser && currentUser.isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300 dark:from-gray-900 dark:to-red-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-red-200 dark:border-red-700 text-center max-w-md mx-auto">
          <div className="mb-4">
            <i className="ri-forbid-2-line text-5xl text-red-500"></i>
          </div>
          <h1 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Account Banned</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{currentUser.banReason ? `Reason: ${currentUser.banReason}` : 'You have been banned by the administrator.'}</p>
          {currentUser.bannedUntil && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">Banned until: {new Date(currentUser.bannedUntil).toLocaleString()}</p>
          )}
          <p className="text-gray-500 dark:text-gray-500 text-sm">If you believe this is a mistake, please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 pt-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-['Pacifico'] text-blue-600 dark:text-blue-400">SL QuizMaster</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Welcome back, {currentUser.name}!</p>
        </div>
                  <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setActiveTab('profile')}
              className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              title="Profile"
              aria-label="Open profile"
            >
              <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">{currentUser.name.charAt(0).toUpperCase()}</span>
            </button>
          </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: 'home', label: 'Home', icon: 'ri-home-line' },
            { id: 'scoreboard', label: 'Scoreboard', icon: 'ri-trophy-line' },
            { id: 'profile', label: 'Profile', icon: 'ri-user-line' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all !rounded-button ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Home Tab */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* User Stats */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Your Score</p>
                <p className="text-2xl font-bold">{currentUser.score} points</p>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-white/20 p-3 rounded-xl !rounded-button"
                title="Share your score"
                aria-label="Share your score"
              >
                <span className="text-white text-xl">🔗</span>
                <span className="font-semibold">#{gradeRank}</span>
              </button>
            </div>
            <div>
              <span className="text-white/80">🏅 Overall Rank: </span>
              <span className="font-semibold">#{userRank}</span>
            </div>
            <div className="mt-3 text-xs text-white/80">
              {currentUser.grade} • 🎂 Age {currentUser.age}
            </div>
          </div>

          {/* Subjects Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">🎯 Choose Subject</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Select a subject for your quiz</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-xl">📚</span>
              </div>
            </div>

            {/* Subject Grid */}
            {currentUser && getAvailableSubjects(currentUser).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {getAvailableSubjects(currentUser).map((subject) => {
                  const isSelected = selectedSubject === subject.id;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectSelect(subject.id)}
                      className={`p-4 rounded-xl border-2 transition-all !rounded-button ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${subject.color} flex items-center justify-center mb-2 mx-auto`}>
                        <span className="text-white text-lg">{subject.icon}</span>
                      </div>
                      <p className={`text-sm font-medium ${
                        isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {subject.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-book-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">No subjects available</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">No questions have been added for your grade yet.</p>
              </div>
            )}

            {/* Battle Button */}
            <div className="mb-4">
              <Link 
                href="/battle"
                className="block w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-center !rounded-button hover:from-red-600 hover:to-pink-600 transition-all duration-200"
              >
                <i className="ri-sword-line mr-2 text-xl"></i>
                Join MCQ Battle
              </Link>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                Real-time multiplayer quiz battles
              </p>
            </div>

            {/* Quiz Button */}
            {currentUser && getAvailableSubjects(currentUser).length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No subjects available for your grade</p>
              </div>
            ) : selectedSubject ? (
              canTakeQuiz ? (
                <Link 
                  href={`/quiz?subject=${selectedSubject}`}
                  className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold text-center !rounded-button"
                >
                  <i className="ri-play-circle-line mr-2 text-xl"></i>
                  Start {subjects.find(s => s.id === selectedSubject)?.name} Quiz
                </Link>
              ) : (
                <div>
                  <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-400">
                      <i className="ri-time-line"></i>
                      <span className="font-medium">Quiz Unavailable</span>
                    </div>
                    <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">
                      {nextQuizTime 
                        ? `Next quiz in: ${getTimeUntilNextQuiz()}`
                        : 'Quiz is currently disabled or not enough questions available'
                      }
                    </p>
                  </div>
                  <button 
                    disabled
                    className="w-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 py-4 rounded-2xl font-semibold cursor-not-allowed !rounded-button"
                  >
                    Quiz Unavailable
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Please select a subject first</p>
              </div>
            )}
          </div>

          {/* Quiz Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Quiz Tips</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-3">
                <i className="ri-lightbulb-line text-yellow-500"></i>
                <span>Read questions carefully before answering</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="ri-time-line text-blue-500"></i>
                <span>You have 30 seconds per question</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="ri-trophy-line text-purple-500"></i>
                <span>+10 points for correct, -5 for wrong answers</span>
              </div>
              <div className="flex items-center space-x-3">
                <i className="ri-calendar-line text-green-500"></i>
                <span>One quiz attempt per 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard Tab */}
      {activeTab === 'scoreboard' && (
        <div className="space-y-6">
          {/* Highlighted Public Scoreboard */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-lg border border-purple-500 dark:border-purple-400">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Public Scoreboard</h3>
                  <p className="text-purple-100 text-sm">Compete with students worldwide!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-xs">Live Rankings</div>
                <div className="text-white font-bold">{allUsers.length} Students</div>
              </div>
            </div>
            
            <Link
              href="/scoreboard"
              className="block w-full bg-white/20 hover:bg-white/30 text-white py-4 rounded-xl font-semibold text-center transition-all duration-200 border border-white/30 hover:border-white/50"
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl">📈</span>
                <span>View Complete Rankings</span>
                <span>➡️</span>
              </div>
            </Link>
          </div>

          {/* Your Rankings - Enhanced */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Your Rankings</h3>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <i className="ri-user-line"></i>
                <span>Personal Stats</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🏅</span>
                  </div>
                  <span className="text-blue-800 dark:text-blue-300 font-medium">Overall Rank</span>
                </div>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">#{userRank}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🏅</span>
                  </div>
                  <span className="text-purple-800 dark:text-purple-300 font-medium">{currentUser.grade} Rank</span>
                </div>
                <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">#{gradeRank}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🧮</span>
                  </div>
                  <span className="text-green-800 dark:text-green-300 font-medium">Total Score</span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">{currentUser.score} pts</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareRank()}
                className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium text-sm transition-all hover:from-blue-600 hover:to-blue-700"
              >
                <span>🔗</span>
                Share Rank
              </button>
              <Link
                href="/admin"
                className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-medium text-sm transition-all hover:from-gray-600 hover:to-gray-700 text-center"
              >
                <span>⚙️</span>
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">{currentUser.name.charAt(0).toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{currentUser.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400">🎓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Grade</span>
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{currentUser.grade}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400">🎂</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Age</span>
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{currentUser.age} years</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400">🎯</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Score</span>
                </div>
                <span className="font-bold text-purple-600 dark:text-purple-400">{currentUser.score} points</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 dark:text-orange-400">🏅</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Overall Rank</span>
                </div>
                <span className="font-bold text-orange-600 dark:text-orange-400">#{userRank}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400">🏅</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Grade Rank</span>
                </div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">#{gradeRank}</span>
              </div>
            </div>
          </div>

          {/* Profile Actions */}
          <div className="space-y-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-semibold !rounded-button flex items-center justify-center space-x-2"
            >
              <span>🔗</span>
              <span>Share My Achievement</span>
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-semibold !rounded-button flex items-center justify-center space-x-2"
            >
                              <span>🚪</span>
                <span>Logout</span>
            </button>
          </div>

          {/* Account Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{allUsers.length}</p>
                <p className="text-xs text-blue-800 dark:text-blue-300">Total Students</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {allUsers.filter(u => u.grade === currentUser.grade).length}
                </p>
                <p className="text-xs text-green-800 dark:text-green-300">Grade Peers</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">🔗</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Share Your Rank</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Share with rank image!</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{gradeRank}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentUser.grade} Rank</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">{currentUser.score} points</p>
                {selectedSubject && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Subject: {subjects.find(s => s.id === selectedSubject)?.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={shareRank}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold !rounded-button"
              >
                Share with Image
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-semibold !rounded-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-logout-box-line text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Logout</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to logout?</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold !rounded-button"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-semibold !rounded-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Link */}
      <div className="text-center">
        <Link 
          href="/admin"
          className="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-300"
        >
          <span className="mr-1">⚙️</span>
          Admin Panel
        </Link>
      </div>
    </div>
  );
}


export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
