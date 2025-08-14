
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '../../components/ThemeProvider';
import ThemeToggle from '../../components/ThemeToggle';
import { generateShareImage } from '../../components/ShareImageGenerator';

interface User {
  id: string;
  name: string;
  grade: string;
  age: number;
  email: string;
  score: number;
}

function ScoreboardContent() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [gradeChampions, setGradeChampions] = useState<{ [key: string]: User }>({});
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareUser, setShareUser] = useState<User | null>(null);
  const [shareRankPosition, setShareRankPosition] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', grade: '', age: '', email: '', score: 0 });

  const grades = useMemo(() => ['Grades 1-5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'], []);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedUsers = localStorage.getItem('allUsers');
    const adminAuth = localStorage.getItem('adminAuth');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    if (adminAuth === 'authenticated') {
      setIsAdmin(true);
    }

    if (savedUsers) {
      const users: User[] = JSON.parse(savedUsers);
      setAllUsers(users.sort((a, b) => b.score - a.score));

      // Find champions for each grade
      const champions: { [key: string]: User } = {};
      grades.forEach(grade => {
        const gradeUsers = users.filter(user => user.grade === grade);
        if (gradeUsers.length > 0) {
          champions[grade] = gradeUsers.sort((a, b) => b.score - a.score)[0];
        }
      });
      setGradeChampions(champions);
    }
  }, [grades]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <i className="ri-trophy-fill text-yellow-500 text-xl"></i>;
      case 1:
        return <i className="ri-medal-fill text-gray-400 text-xl"></i>;
      case 2:
        return <i className="ri-medal-fill text-orange-400 text-xl"></i>;
      default:
        return <span className="text-gray-600 dark:text-gray-400 font-bold text-sm">#{index + 1}</span>;
    }
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'Grades 1-5': 'from-pink-400 to-rose-400',
      'Grade 6': 'from-red-400 to-pink-400',
      'Grade 7': 'from-orange-400 to-yellow-400',
      'Grade 8': 'from-green-400 to-emerald-400',
      'Grade 9': 'from-blue-400 to-cyan-400',
      'Grade 10': 'from-indigo-400 to-purple-400',
      'Grade 11': 'from-purple-400 to-pink-400'
    };
    return colors[grade as keyof typeof colors] || 'from-gray-400 to-gray-500';
  };

  const openShareModal = (user: User) => {
    const rank = allUsers.findIndex(u => u.id === user.id) + 1;
    setShareUser(user);
    setShareRankPosition(rank);
    setShowShareModal(true);
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      grade: user.grade,
      age: user.age.toString(),
      email: user.email,
      score: user.score
    });
    setShowAdminModal(true);
  };

  const saveUserEdit = () => {
    if (!editingUser) return;

    const updatedUser = {
      ...editingUser,
      name: editForm.name,
      grade: editForm.grade,
      age: parseInt(editForm.age),
      email: editForm.email,
      score: editForm.score
    };

    const updatedUsers = allUsers.map(user =>
      user.id === editingUser.id ? updatedUser : user
    );

    setAllUsers(updatedUsers.sort((a, b) => b.score - a.score));
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const user = JSON.parse(currentUserData);
      if (user.id === editingUser.id) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }

    // Recalculate champions
    const champions: { [key: string]: User } = {};
    grades.forEach(grade => {
      const gradeUsers = updatedUsers.filter(user => user.grade === grade);
      if (gradeUsers.length > 0) {
        champions[grade] = gradeUsers.sort((a, b) => b.score - a.score)[0];
      }
    });
    setGradeChampions(champions);

    setEditingUser(null);
    setShowAdminModal(false);
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const updatedUsers = allUsers.filter(user => user.id !== userId);
    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const user = JSON.parse(currentUserData);
      if (user.id === userId) {
        localStorage.removeItem('currentUser');
      }
    }

    // Recalculate champions
    const champions: { [key: string]: User } = {};
    grades.forEach(grade => {
      const gradeUsers = updatedUsers.filter(user => user.grade === grade);
      if (gradeUsers.length > 0) {
        champions[grade] = gradeUsers.sort((a, b) => b.score - a.score)[0];
      }
    });
    setGradeChampions(champions);
  };

  const handleShare = async () => {
    if (!shareUser) return;

    try {
      const gradeRank = allUsers.filter(u => u.grade === shareUser.grade)
        .sort((a, b) => b.score - a.score)
        .findIndex(u => u.id === shareUser.id) + 1;

      const shareImage = generateShareImage({
        name: shareUser.name,
        rank: gradeRank,
        score: shareUser.score,
        grade: shareUser.grade,
        isChampion: gradeRank === 1
      });

      const isChampion = Object.values(gradeChampions).some(champion => champion.id === shareUser.id);
      const championText = isChampion ? ' 🏆 CHAMPION!' : '';

      const shareText = `🎓 ${shareUser.name} is ranked #${shareRankPosition} overall with ${shareUser.score} points on QuizMaster!${championText}\n\n📚 ${shareUser.grade} Rank: #${gradeRank}\n\nJoin the quiz competition and test your knowledge!`;

      const response = await fetch(shareImage);
      const blob = await response.blob();
      const file = new File([blob], `${shareUser.name}-rank.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${shareUser.name}'s QuizMaster Rank`,
          text: shareText,
          files: [file],
          url: window.location.origin
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `${shareUser.name}'s QuizMaster Rank`,
          text: shareText,
          url: window.location.origin
        });
      } else {
        copyToClipboard(shareText);
        const link = document.createElement('a');
        link.download = `${shareUser.name}-quizmaster-rank.png`;
        link.href = shareImage;
        link.click();
        alert('Rank shared to clipboard and image downloaded!');
      }
    } catch {
      const shareText = `🎓 ${shareUser.name} is ranked high in ${shareUser.grade} with ${shareUser.score} points on QuizMaster! 🏆`;
      copyToClipboard(shareText);
    }
    setShowShareModal(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowShareModal(false);
      alert('Rank shared to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 pt-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
          <i className="ri-arrow-left-line mr-2"></i>
          Home
        </Link>
        <ThemeToggle />
      </div>

      {/* Highlighted Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 mb-8 shadow-lg border border-purple-500 dark:border-purple-400">
        <div className="text-center text-white">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-trophy-line text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-['Pacifico'] font-bold">📈 Public Scoreboard</h1>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-bar-chart-line text-white text-2xl"></i>
            </div>
          </div>
          <p className="text-purple-100 text-lg font-medium mb-2">Live Rankings & Global Competition</p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <i className="ri-user-line"></i>
              <span>{allUsers.length} Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="ri-medal-line"></i>
              <span>{Object.keys(gradeChampions).length} Champions</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="ri-star-line"></i>
              <span>Live Updates</span>
            </div>
          </div>
          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-yellow-200 text-sm font-medium">👑 Admin Mode - Full Editing Available</p>
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 mb-6 shadow-lg border border-blue-400 dark:border-blue-300">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">🚀 Ready to Compete?</h2>
          <p className="text-blue-100 mb-4">Take quizzes in different subjects to climb the rankings!</p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/"
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:border-white/50"
            >
              <i className="ri-home-line mr-2"></i>
              Take Quiz
            </Link>
            <button
              onClick={() => {
                if (currentUser) {
                  openShareModal(currentUser);
                }
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:border-white/50"
            >
              <i className="ri-share-line mr-2"></i>
              Share Rank
            </button>
          </div>
        </div>
      </div>

      {/* Grade Champions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <i className="ri-trophy-fill mr-2 text-yellow-500"></i>
          Grade Champions
        </h2>
        <div className="space-y-3">
          {grades.map(grade => {
            const champion = gradeChampions[grade];
            if (!champion) return null;

            return (
              <div
                key={grade}
                className={`bg-gradient-to-r ${getGradeColor(grade)} rounded-2xl p-4 text-white shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="ri-crown-line text-white text-xl"></i>
                    </div>
                    <div>
                      <p className="font-semibold">{champion.name}</p>
                      <p className="text-white/80 text-sm">{grade} Champion</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-xl font-bold">{champion.score}</p>
                      <p className="text-white/80 text-xs">points</p>
                    </div>
                    <button
                      onClick={() => openShareModal(champion)}
                      className="bg-white/20 p-2 rounded-lg !rounded-button"
                      title={`Share ${champion.name}'s rank`}
                      aria-label={`Share ${champion.name}'s rank`}
                    >
                      <i className="ri-share-line text-white"></i>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => startEditUser(champion)}
                        className="bg-white/20 p-2 rounded-lg !rounded-button"
                        title={`Edit ${champion.name}'s info`}
                        aria-label={`Edit ${champion.name}'s info`}
                      >
                        <i className="ri-edit-line text-white"></i>
                      </button>
                    )}
                  </div>
                </div>
                {champion.id === currentUser?.id && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-white/90 text-sm font-medium">🎉 Congratulations! You are the champion!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Rankings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <h2 className="font-semibold text-white text-center">🏆 Overall Rankings</h2>
          <p className="text-white/80 text-xs text-center mt-1">Top performers across all grades</p>
        </div>

        {allUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-gray-400 text-2xl"></i>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">No students registered yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">Be the first to join!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {allUsers.slice(0, 50).map((user, index) => (
              <div
                key={user.id}
                className={`p-4 flex items-center justify-between ${
                  user.id === currentUser?.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                      {user.id === currentUser?.id && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                          You
                        </span>
                      )}
                      {Object.values(gradeChampions).some(champion => champion.id === user.id) && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-full">
                          Champion
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getGradeColor(user.grade)} text-white`}>
                        {user.grade}
                      </span>
                      <span>🎂 Age {user.age}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800 dark:text-gray-200">{user.score}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
                  </div>
                  <button
                    onClick={() => openShareModal(user)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg !rounded-button"
                    title="Share Rank"
                  >
                    <span className="text-lg">🔗</span>
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => startEditUser(user)}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg !rounded-button"
                        title="Edit User"
                      >
                        <span className="text-lg">📝</span>
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg !rounded-button"
                        title="Delete User"
                      >
                        <span className="text-lg">❌</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {allUsers.length > 50 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                <p className="text-sm">Showing top 50 students</p>
                <p className="text-xs">Total registered: {allUsers.length}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Platform Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{allUsers.length}</p>
            <p className="text-xs text-blue-800 dark:text-blue-300">Total Students</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{Object.keys(gradeChampions).length}</p>
            <p className="text-xs text-green-800 dark:text-green-300">Active Grades</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {allUsers.length > 0 ? Math.round(allUsers.reduce((sum, user) => sum + user.score, 0) / allUsers.length) : 0}
            </p>
            <p className="text-xs text-purple-800 dark:text-purple-300">Average Score</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/quiz"
          className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold text-center !rounded-button"
        >
          Take Quiz to Climb Rankings
        </Link>
      </div>

      {/* Share Modal */}
      {showShareModal && shareUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-share-line text-blue-600 dark:text-blue-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Share Rank</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Share {shareUser.name}&apos;s achievement with rank image!</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{shareUser.name}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">#{shareRankPosition}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Rank</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">{shareUser.score} points</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{shareUser.grade}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleShare}
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

      {/* Admin Edit Modal */}
      {showAdminModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-edit-line text-orange-600 dark:text-orange-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Edit User</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Modify user details and score</p>
            </div>

            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Name"
              />
              <label htmlFor="edit-grade-select" className="sr-only">
                Grade
              </label>
              <select
                id="edit-grade-select"
                title="Select grade"
                value={editForm.grade}
                onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={editForm.age}
                  onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                  className="p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Age"
                />
                <input
                  type="number"
                  value={editForm.score}
                  onChange={(e) => setEditForm({ ...editForm, score: parseInt(e.target.value) || 0 })}
                  className="p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Score"
                />
              </div>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Email"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={saveUserEdit}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold !rounded-button"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowAdminModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-semibold !rounded-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Scoreboard() {
  return (
    <ThemeProvider>
      <ScoreboardContent />
    </ThemeProvider>
  );
}
