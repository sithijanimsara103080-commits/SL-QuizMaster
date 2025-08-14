'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  grade: string;
  age: number;
  email: string;
  score: number;
}

export default function Leaderboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [gradeUsers, setGradeUsers] = useState<User[]>([]);

  const grades = ['Grades 1-5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'];

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('allUsers');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setSelectedGrade(user.grade);
    }
    
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      setAllUsers(users);
    }
  }, []);

  useEffect(() => {
    if (selectedGrade && allUsers.length > 0) {
      const filtered = allUsers
        .filter(user => user.grade === selectedGrade)
        .sort((a, b) => b.score - a.score);
      setGradeUsers(filtered);
    }
  }, [selectedGrade, allUsers]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <i className="ri-trophy-fill text-yellow-500 text-xl"></i>;
      case 1:
        return <i className="ri-medal-fill text-gray-400 text-xl"></i>;
      case 2:
        return <i className="ri-medal-fill text-orange-400 text-xl"></i>;
      default:
        return <span className="text-gray-600 font-bold">#{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 2:
        return 'bg-gradient-to-r from-orange-300 to-orange-400';
      default:
        return 'bg-white';
    }
  };

  const currentUserRank = gradeUsers.findIndex(user => user.id === currentUser?.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 pt-8 pb-20">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 font-medium">
          <i className="ri-arrow-left-line mr-2"></i>
          Home
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-['Pacifico'] text-blue-600 mb-2">Leaderboard</h1>
        <p className="text-gray-600 text-sm">See how you rank against others</p>
      </div>

      {/* Grade Selector */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <i className="ri-graduation-cap-line mr-2"></i>
            Select Grade
          </label>
          <div className="grid grid-cols-4 gap-2">
            {grades.map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all !rounded-button ${
                  selectedGrade === grade
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {grade.replace('Grade ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current User Rank */}
      {currentUser && currentUserRank > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-white text-xl"></i>
              </div>
              <div>
                <p className="font-semibold">🏅 Your Rank</p>
                <p className="text-white/80 text-sm">{currentUser.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">#{currentUserRank}</p>
              <p className="text-white/80 text-sm">{currentUser.score} pts</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="font-semibold text-white text-center">{selectedGrade} Rankings</h2>
        </div>
        
        {gradeUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-600 mb-2">No students in {selectedGrade} yet</p>
            <p className="text-gray-500 text-sm">Be the first to take a quiz!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {gradeUsers.slice(0, 20).map((user, index) => (
              <div 
                key={user.id} 
                className={`p-4 flex items-center justify-between ${
                  user.id === currentUser?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } ${index < 3 ? getRankBg(index) : 'bg-white'} ${index < 3 ? 'text-white' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <p className={`font-semibold ${index < 3 ? 'text-white' : 'text-gray-800'}`}>
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          index < 3 ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                        }`}>
                          You
                        </span>
                      )}
                    </p>
                                          <p className={`text-sm ${index < 3 ? 'text-white/80' : 'text-gray-500'}`}>
                        🎂 Age {user.age}
                      </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${index < 3 ? 'text-white' : 'text-gray-800'}`}>
                    {user.score}
                  </p>
                  <p className={`text-xs ${index < 3 ? 'text-white/80' : 'text-gray-500'}`}>
                    points
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Link 
          href="/quiz"
          className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold text-center !rounded-button"
        >
          Take Quiz to Improve Rank
        </Link>
        
        <Link 
          href="/scoreboard"
          className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-center !rounded-button"
        >
          View All Grades Scoreboard
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-6 bg-gray-50 rounded-2xl p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Grade Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{gradeUsers.length}</p>
            <p className="text-xs text-gray-600">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {gradeUsers.length > 0 ? Math.round(gradeUsers.reduce((sum, user) => sum + user.score, 0) / gradeUsers.length) : 0}
            </p>
            <p className="text-xs text-gray-600">Average Score</p>
          </div>
        </div>
      </div>
    </div>
  );
}