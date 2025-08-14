'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeProvider } from '../../components/ThemeProvider';
import ThemeToggle from '../../components/ThemeToggle';
import { generateShareImage } from '../../components/ShareImageGenerator';
import BanCountdown from '../../components/BanCountdown';
import Image from 'next/image';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  grade: string;
  subject: string;
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
  { id: 'mathematics', name: 'Mathematics 📐' },
  { id: 'science', name: 'Science 🔬' },
  { id: 'english', name: 'English 🔤' },
  { id: 'history', name: 'History 🏛️' },
  { id: 'sinhala', name: 'Sinhala 📖' },
  { id: 'buddhism', name: 'Buddhism ☸️' }
];

function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('questions');
  const [selectedGrade, setSelectedGrade] = useState('Grade 6');
  const [selectedSubject, setSelectedSubject] = useState('mathematics');
  const [userFilter, setUserFilter] = useState<'all' | 'banned' | 'active'>('all');
  const [questions, setQuestions] = useState<{ [key: string]: { [key: string]: Question[] } }>({});
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', grade: '', age: '', email: '', score: 0 });
  const [banForm, setBanForm] = useState({ reason: '', duration: '24' });
  const [showBanModal, setShowBanModal] = useState(false);
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    grade: 'Grade 6',
    subject: 'mathematics'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUser, setShareUser] = useState<User | null>(null);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    isQuizEnabled: false,
    nextQuizTime: '',
    lastUpdateTime: ''
  });


  // Scoreboard state
  const [scoreboardFilter, setScoreboardFilter] = useState<'all' | 'grade'>('all');
  const [selectedScoreboardGrade, setSelectedScoreboardGrade] = useState('Grade 6');
  const [editingScoreboardUser, setEditingScoreboardUser] = useState<User | null>(null);
  const [scoreboardEditForm, setScoreboardEditForm] = useState({ name: '', grade: '', score: 0 });

  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchFilter, setUserSearchFilter] = useState<'name' | 'email' | 'grade'>('name');



  // Comprehensive user editing state
  const [editingUserModal, setEditingUserModal] = useState<User | null>(null);
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    grade: '',
    age: 0,
    email: '',
    score: 0,
    isBanned: false,
    banReason: '',
    bannedUntil: ''
  });

  // Replace grades array
  const grades = ['Grades 1-5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'];

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = () => {
    const savedQuestions = localStorage.getItem('adminQuestions');
    const savedSettings = localStorage.getItem('quizSettings');
    const savedUsers = localStorage.getItem('allUsers');

    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    }

    if (savedSettings) {
      setQuizSettings(JSON.parse(savedSettings));
    }

    if (savedUsers) {
      const users: User[] = JSON.parse(savedUsers);
      setAllUsers(users.sort((a, b) => b.score - a.score));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const encoder = new TextEncoder();
    const data = encoder.encode(loginForm.password);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    const ADMIN_USERNAME = 'SIthija';
    const ADMIN_PASSWORD_HASH = '26768552b2c35cd25967d7f53b376f28c369ae4de742b8c03041a5dad663f996';
    if (loginForm.username === ADMIN_USERNAME && hashHex === ADMIN_PASSWORD_HASH) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'authenticated');
      loadData();
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
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

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id === editingUser.id) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }

    setEditingUser(null);
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const updatedUsers = allUsers.filter(user => user.id !== userId);
    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id === userId) {
        localStorage.removeItem('currentUser');
      }
    }
  };

  const openBanModal = (user: User) => {
    setBanningUser(user);
    setShowBanModal(true);
    setBanForm({ reason: '', duration: '24' });
  };

  const banUser = () => {
    if (!banningUser || !banForm.reason.trim()) {
      alert('Please provide a ban reason');
      return;
    }

    const banDurationHours = parseInt(banForm.duration);
    const bannedUntil = new Date();
    bannedUntil.setHours(bannedUntil.getHours() + banDurationHours);

    const updatedUser = {
      ...banningUser,
      isBanned: true,
      banReason: banForm.reason,
      bannedUntil: bannedUntil.toISOString()
    };

    const updatedUsers = allUsers.map(user =>
      user.id === banningUser.id ? updatedUser : user
    );

    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    // Update current user if it's the banned user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id === banningUser.id) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }

    setShowBanModal(false);
    setBanningUser(null);
  };

  const unbanUser = (userId: string) => {
    const updatedUser = allUsers.find(user => user.id === userId);
    if (!updatedUser) return;

    const unbannedUser = {
      ...updatedUser,
      isBanned: false,
      banReason: undefined,
      bannedUntil: undefined
    };

    const updatedUsers = allUsers.map(user =>
      user.id === userId ? unbannedUser : user
    );

    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    // Update current user if it's the unbanned user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id === userId) {
        localStorage.setItem('currentUser', JSON.stringify(unbannedUser));
      }
    }
  };

  const openShareModal = (user: User) => {
    setShareUser(user);
    setShowShareModal(true);
  };

  const shareUserRank = async () => {
    if (!shareUser) return;

    try {
      const overallRank = allUsers.findIndex(u => u.id === shareUser.id) + 1;
      const gradeUsers = allUsers.filter(u => u.grade === shareUser.grade).sort((a, b) => b.score - a.score);
      const gradeRank = gradeUsers.findIndex(u => u.id === shareUser.id) + 1;

      const shareImage = generateShareImage({
        name: shareUser.name,
        rank: gradeRank,
        score: shareUser.score,
        grade: shareUser.grade,
        isChampion: gradeRank === 1
      });

      const shareText = `🎓 ${shareUser.name} is ranked #${gradeRank} in ${shareUser.grade} with ${shareUser.score} points on QuizMaster! 🏆\n\nOverall rank: #${overallRank}\n\nJoin the quiz competition at: ${window.location.origin}`;

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
        navigator.clipboard.writeText(shareText);
        const link = document.createElement('a');
        link.download = `${shareUser.name}-quizmaster-rank.png`;
        link.href = shareImage;
        link.click();
        alert('Rank shared to clipboard and image downloaded!');
      }
    } catch {
      const shareText = `🎓 ${shareUser.name} is ranked high in ${shareUser.grade} with ${shareUser.score} points on QuizMaster! 🏆\n\nJoin at: ${window.location.origin}`;
      navigator.clipboard.writeText(shareText);
      alert('Rank shared to clipboard!');
    }
    setShowShareModal(false);
  };

  const addQuestion = () => {
    if (!newQuestion.question || newQuestion.options.some(opt => !opt)) {
      alert('Please fill in all fields');
      return;
    }

    const updatedQuestions = { ...questions };
    if (!updatedQuestions[newQuestion.grade]) {
      updatedQuestions[newQuestion.grade] = {};
    }
    if (!updatedQuestions[newQuestion.grade][newQuestion.subject]) {
      updatedQuestions[newQuestion.grade][newQuestion.subject] = [];
    }

    const existingQuestions = updatedQuestions[newQuestion.grade][newQuestion.subject];
    const newId = Math.max(...(existingQuestions.map(q => q.id) || [0])) + 1;
    const questionToAdd = { ...newQuestion, id: newId };

    updatedQuestions[newQuestion.grade][newQuestion.subject].push(questionToAdd);
    setQuestions(updatedQuestions);
    localStorage.setItem('adminQuestions', JSON.stringify(updatedQuestions));

    const now = new Date();
    const updatedSettings = {
      ...quizSettings,
      lastUpdateTime: now.toISOString()
    };
    setQuizSettings(updatedSettings);
    localStorage.setItem('quizSettings', JSON.stringify(updatedSettings));

    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      grade: 'Grade 6',
      subject: 'mathematics'
    });
    setShowAddForm(false);
  };

  const deleteQuestion = (grade: string, subject: string, questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const updatedQuestions = { ...questions };
    if (updatedQuestions[grade] && updatedQuestions[grade][subject]) {
      updatedQuestions[grade][subject] = updatedQuestions[grade][subject].filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      localStorage.setItem('adminQuestions', JSON.stringify(updatedQuestions));

      const now = new Date();
      const updatedSettings = {
        ...quizSettings,
        lastUpdateTime: now.toISOString()
      };
      setQuizSettings(updatedSettings);
      localStorage.setItem('quizSettings', JSON.stringify(updatedSettings));
    }
  };

  const deleteAllQuestions = (grade: string, subject: string) => {
    const questionCount = getGradeSubjectCount(grade, subject);
    if (questionCount === 0) {
      alert('No questions to delete for this grade and subject combination.');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ALL ${questionCount} questions for ${grade} - ${subjects.find(s => s.id === subject)?.name}?\n\nThis action cannot be undone!`;
    
    if (!confirm(confirmMessage)) return;

    const updatedQuestions = { ...questions };
    if (updatedQuestions[grade] && updatedQuestions[grade][subject]) {
      updatedQuestions[grade][subject] = [];
      setQuestions(updatedQuestions);
      localStorage.setItem('adminQuestions', JSON.stringify(updatedQuestions));

      const now = new Date();
      const updatedSettings = {
        ...quizSettings,
        lastUpdateTime: now.toISOString()
      };
      setQuizSettings(updatedSettings);
      localStorage.setItem('quizSettings', JSON.stringify(updatedSettings));

      alert(`Successfully deleted all ${questionCount} questions for ${grade} - ${subjects.find(s => s.id === subject)?.name}`);
    }
  };

  const toggleQuizStatus = () => {
    // Allow enabling quiz globally - individual subjects will be available based on their question availability
    const now = new Date();
    const nextQuiz = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const updatedSettings = {
      isQuizEnabled: !quizSettings.isQuizEnabled,
      nextQuizTime: nextQuiz.toISOString(),
      lastUpdateTime: now.toISOString()
    };

    setQuizSettings(updatedSettings);
    localStorage.setItem('quizSettings', JSON.stringify(updatedSettings));
  };

  const getCurrentQuestions = () => {
    return questions[selectedGrade]?.[selectedSubject] || [];
  };

  const getTotalQuestions = () => {
    let total = 0;
    Object.values(questions).forEach(gradeQuestions => {
      Object.values(gradeQuestions).forEach(subjectQuestions => {
        total += subjectQuestions.length;
      });
    });
    return total;
  };

  const getGradeSubjectCount = (grade: string, subject: string) => {
    return questions[grade]?.[subject]?.length || 0;
  };

  const getBannedUsersCount = () => {
    return allUsers.filter(user => user.isBanned).length;
  };

  const isUserCurrentlyBanned = (user: User) => {
    if (!user.isBanned || !user.bannedUntil) return false;
    return new Date() < new Date(user.bannedUntil);
  };

  const getFilteredUsers = () => {
    switch (userFilter) {
      case 'banned':
        return allUsers.filter(user => user.isBanned && isUserCurrentlyBanned(user));
      case 'active':
        return allUsers.filter(user => !user.isBanned || !isUserCurrentlyBanned(user));
      default:
        return allUsers;
    }
  };

  const addDefaultQuestionsForAll = () => {
    const updatedQuestions = { ...questions };
    for (const grade of grades) {
      if (!updatedQuestions[grade]) updatedQuestions[grade] = {};
      for (const subject of subjects.map(s => s.id)) {
        if (!Array.isArray(updatedQuestions[grade][subject]) || updatedQuestions[grade][subject].length === 0) {
          updatedQuestions[grade][subject] = [
            {
              id: 1,
              question: `Sample question for ${grade} - ${subjects.find(s => s.id === subject)?.name}`,
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
              correctAnswer: 0,
              grade,
              subject
            }
          ];
        }
      }
    }
    setQuestions(updatedQuestions);
    localStorage.setItem('adminQuestions', JSON.stringify(updatedQuestions));
    alert('Default questions added for all grades and subjects!');
  };

  const resetAllData = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset ALL data? This will:\n\n' +
      '• Delete all users and their scores\n' +
      '• Clear all quiz questions\n' +
      '• Reset quiz settings\n' +
      '• Clear all quiz results\n' +
      '• Remove all stored preferences\n\n' +
      'This action CANNOT be undone!'
    );

    if (!confirmReset) return;

    const doubleConfirm = window.confirm(
      'This is your final warning!\n\n' +
      'ALL DATA WILL BE PERMANENTLY DELETED.\n\n' +
      'Type "RESET" in the next prompt to confirm.'
    );

    if (!doubleConfirm) return;

    const finalConfirmation = window.prompt(
      'Type "RESET" (in capital letters) to permanently delete all data:'
    );

    if (finalConfirmation !== 'RESET') {
      alert('Reset cancelled. Data was not deleted.');
      return;
    }

    try {
      // Clear all localStorage data
      const keysToRemove = [
        'currentUser',
        'allUsers', 
        'adminQuestions',
        'quizSettings',
        'selectedSubject',
        'lastQuizResult',
        'adminAuth'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Reset component state
      setAllUsers([]);
      setQuestions({});
      setQuizSettings({
        isQuizEnabled: false,
        nextQuizTime: '',
        lastUpdateTime: ''
      });
      setSelectedSubject('mathematics');
      setSelectedGrade('Grades 1-5');

      // Log out admin
      setIsAuthenticated(false);

      alert('All data has been successfully reset! You will now be redirected to the home page.');
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error('Error during reset:', error);
      alert('An error occurred while resetting data. Please try again.');
    }
  };

  // Scoreboard functions
  const getScoreboardUsers = () => {
    if (scoreboardFilter === 'grade') {
      return allUsers.filter(user => user.grade === selectedScoreboardGrade).sort((a, b) => b.score - a.score);
    }
    return allUsers.sort((a, b) => b.score - a.score);
  };

  const startEditScoreboardUser = (user: User) => {
    setEditingScoreboardUser(user);
    setScoreboardEditForm({
      name: user.name,
      grade: user.grade,
      score: user.score
    });
  };

  const saveScoreboardUserEdit = () => {
    if (!editingScoreboardUser) return;

    const updatedUser = {
      ...editingScoreboardUser,
      name: scoreboardEditForm.name,
      grade: scoreboardEditForm.grade,
      score: scoreboardEditForm.score
    };

    const updatedUsers = allUsers.map(user =>
      user.id === editingScoreboardUser.id ? updatedUser : user
    );

    setAllUsers(updatedUsers.sort((a, b) => b.score - a.score));
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    // Update current user if it's the edited user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id === editingScoreboardUser.id) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }

    setEditingScoreboardUser(null);
  };

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

  // User search functions
  const getSearchedUsers = () => {
    if (!userSearchQuery.trim()) {
      return getFilteredUsers();
    }

    const query = userSearchQuery.toLowerCase().trim();
    return getFilteredUsers().filter(user => {
      switch (userSearchFilter) {
        case 'name':
          return user.name.toLowerCase().includes(query);
        case 'email':
          return user.email.toLowerCase().includes(query);
        case 'grade':
          return user.grade.toLowerCase().includes(query);
        default:
          return user.name.toLowerCase().includes(query) ||
                 user.email.toLowerCase().includes(query) ||
                 user.grade.toLowerCase().includes(query);
      }
    });
  };



  // Comprehensive user editing functions
  const startEditUserModal = (user: User) => {
    setEditingUserModal(user);
    setUserEditForm({
      name: user.name,
      grade: user.grade,
      age: user.age,
      email: user.email,
      score: user.score,
      isBanned: user.isBanned || false,
      banReason: user.banReason || '',
      bannedUntil: user.bannedUntil || ''
    });
  };

  const saveUserModalEdit = () => {
    if (!editingUserModal) return;

    const updatedUser = {
      ...editingUserModal,
      name: userEditForm.name.trim(),
      grade: userEditForm.grade,
      age: Math.max(1, userEditForm.age),
      email: userEditForm.email.trim(),
      score: Math.max(0, userEditForm.score),
      isBanned: userEditForm.isBanned,
      banReason: userEditForm.banReason.trim(),
      bannedUntil: userEditForm.bannedUntil
    };

    const updatedUsers = allUsers.map(user =>
      user.id === editingUserModal.id ? updatedUser : user
    );

    setAllUsers(updatedUsers.sort((a, b) => b.score - a.score));
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

    // Update current user if it's the edited user
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (user.id === editingUserModal.id) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }

    setEditingUserModal(null);
    setUserEditForm({
      name: '',
      grade: '',
      age: 0,
      email: '',
      score: 0,
      isBanned: false,
      banReason: '',
      bannedUntil: ''
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 pt-8 pb-20">
        <div className="absolute top-8 right-4">
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
            <i className="ri-arrow-left-line mr-2"></i>
            Back to App
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-[\'Pacifico\'] text-blue-600 dark:text-blue-400 mb-2">Admin Login</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Access the administration panel</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 max-w-sm mx-auto">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold !rounded-button"
            >
              Login
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <p className="text-blue-800 dark:text-blue-300 text-xs font-medium mb-1">Admin Credentials</p>
            <p className="text-blue-800 dark:text-blue-300 text-xs font-medium mb-1">Developer - E.J. Sithija Nimsara <i className="ri-handshake-line"></i> QuizMaster</p>  
            <p className="text-blue-800 dark:text-blue-300 text-xs font-medium mb-1">Email - sithijanimsara103080@gmail.com</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 pt-8 pb-20">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
          <i className="ri-arrow-left-line mr-2"></i>
          Back to App
        </Link>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium !rounded-button"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-[\'Pacifico\'] text-blue-600 dark:text-blue-400 mb-2">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Manage questions, users and quiz settings</p>
      </div>

      {/* Quiz Status Control */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Quiz Status</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Global quiz control - subjects are available based on question availability</p>
          </div>
          <button
            onClick={toggleQuizStatus}
            className={`px-6 py-3 rounded-xl font-semibold !rounded-button ${
              quizSettings.isQuizEnabled
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}
          >
            {quizSettings.isQuizEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {quizSettings.lastUpdateTime && (
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <p>Last Updated: {new Date(quizSettings.lastUpdateTime).toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-5 gap-1">
          {[
            { id: 'questions', label: 'Questions', icon: 'ri-question-line' },
            { id: 'users', label: 'Users', icon: 'ri-user-line' },
            { id: 'scoreboard', label: 'Scoreboard', icon: 'ri-trophy-line' },
            { id: 'stats', label: 'Statistics', icon: 'ri-bar-chart-line' },
            { id: 'settings', label: 'Settings', icon: 'ri-settings-line' }
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

      {/* Questions Management */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Grade and Subject Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Grade</label>
              <div className="grid grid-cols-4 gap-2">
                {grades.map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all !rounded-button ${
                      selectedGrade === grade
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {grade.replace('Grade ', '')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Subject</label>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map(subject => {
                  const questionCount = getGradeSubjectCount(selectedGrade, subject.id);
                  const hasQuestions = questionCount > 0;
                  return (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition-all !rounded-button relative ${
                        selectedSubject === subject.id
                          ? 'bg-purple-600 text-white'
                          : hasQuestions
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{subject.name}</span>
                        {hasQuestions ? (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1 rounded">
                            {questionCount}/10
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1 rounded">
                            No Qs
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add Question Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-semibold !rounded-button"
          >
            <i className="ri-add-line mr-2"></i>
            Add New Question
          </button>

          {/* Add Question Form */}
          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Add New Question</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-question-grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade</label>
                    <select
                      id="add-question-grade"
                      value={newQuestion.grade}
                      onChange={(e) => setNewQuestion({ ...newQuestion, grade: e.target.value })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {grades.map(grade => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="add-question-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <select
                      id="add-question-subject"
                      value={newQuestion.subject}
                      onChange={(e) => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-20"
                    placeholder="Enter the question"
                  />
                </div>
                {newQuestion.options.map((option, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Option {index + 1}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder={`Enter option ${index + 1}`}
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="add-question-correct-answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Answer</label>
                  <select
                    id="add-question-correct-answer"
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {newQuestion.options.map((option, index) => (
                      <option key={index} value={index}>
                        Option {index + 1}: {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={addQuestion}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold !rounded-button"
                  >
                    Add Question
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-semibold !rounded-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <h2 className="font-semibold">{selectedGrade} - {subjects.find(s => s.id === selectedSubject)?.name}</h2>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {getCurrentQuestions().length}/10
                  </span>
                </div>
                {getCurrentQuestions().length > 0 && (
                  <button
                    onClick={() => deleteAllQuestions(selectedGrade, selectedSubject)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors !rounded-button"
                    title="Delete all questions for this grade and subject"
                  >
                    <span className="mr-1 inline-flex items-center">❌</span>
                    Delete All
                  </button>
                )}
              </div>
            </div>

            {getCurrentQuestions().length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-question-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">No questions for this combination</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Add 10 questions to enable quiz!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {getCurrentQuestions().map((question, index) => (
                  <div key={question.id} className="p-4 border-b border-gray-700 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          {index + 1}. {question.question}
                        </p>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <p
                              key={optIndex}
                              className={`text-sm ${
                                optIndex === question.correctAnswer
                                  ? 'text-green-600 dark:text-green-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {optIndex === question.correctAnswer && '✓ '} {option}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <button
                          onClick={() => {
                            // Edit button logic can be implemented here if needed in the future
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg !rounded-button"
                          title="Edit"
                        >
                          <span className="text-xl">📝</span>
                        </button>
                        <button
                          onClick={() => deleteQuestion(selectedGrade, selectedSubject, question.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg !rounded-button"
                          title="Delete"
                        >
                          <span className="text-xl">❌</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4 flex justify-end">
            <button
              onClick={addDefaultQuestionsForAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Add Default Quiz for All
            </button>
          </div>
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="flex items-center justify-between text-white">
                <h2 className="font-semibold">All Users ({getFilteredUsers().length})</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                    {getBannedUsersCount()} banned
                  </span>
                </div>
              </div>
            </div>

            {/* User Filter */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      userFilter === 'all'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All ({allUsers.length})
                  </button>
                  <button
                    onClick={() => setUserFilter('active')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      userFilter === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Active ({allUsers.length - getBannedUsersCount()})
                  </button>
                  <button
                    onClick={() => setUserFilter('banned')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      userFilter === 'banned'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Banned ({getBannedUsersCount()})
                  </button>
                </div>
              </div>
            </div>

            {/* User Search */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="w-full p-3 pl-10 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <select
                  title="User search filter"
                  value={userSearchFilter}
                  onChange={(e) => setUserSearchFilter(e.target.value as 'name' | 'email' | 'grade')}
                  className="p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="name">Search by Name</option>
                  <option value="email">Search by Email</option>
                  <option value="grade">Search by Grade</option>
                </select>
                {userSearchQuery && (
                  <button
                    onClick={() => setUserSearchQuery('')}
                    className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Clear search"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </div>
              {userSearchQuery && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Found {getSearchedUsers().length} user{getSearchedUsers().length !== 1 ? 's' : ''} matching &quot;{userSearchQuery}&quot;
                </div>
              )}
            </div>

            {getSearchedUsers().length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {userSearchQuery ? `No users found matching "${userSearchQuery}"` :
                   userFilter === 'banned' ? 'No banned users' : 
                   userFilter === 'active' ? 'No active users' : 'No users registered yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {getSearchedUsers().map((user, index) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div>
                      {editingUser?.id === user.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                              placeholder="Name"
                            />
                            <select
                              value={editForm.grade}
                              onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                              className="p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                              title="Select user grade"
                            >
                              {grades.map(grade => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              type="number"
                              value={editForm.age}
                              onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                              className="p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                              placeholder="Age"
                            />
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                              placeholder="Email"
                            />
                            <input
                              type="number"
                              value={editForm.score}
                              onChange={(e) => setEditForm({ ...editForm, score: parseInt(e.target.value) || 0 })}
                              className="p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm"
                              placeholder="Score"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={saveUserEdit}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm !rounded-button"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm !rounded-button"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative ${
                            user.isBanned && isUserCurrentlyBanned(user) 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                          }`}>
                            #{index + 1}
                            {user.isBanned && isUserCurrentlyBanned(user) && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 rounded-full flex items-center justify-center">
                                <i className="ri-shield-line text-white text-xs"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {user.name}
                              {user.isBanned && isUserCurrentlyBanned(user) && (
                                <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                                  BANNED
                                </span>
                              )}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>{user.grade}</span>
                              <span>•</span>
                              <span>Age {user.age}</span>
                              <span>•</span>
                              <span>{user.score} pts</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            {user.isBanned && isUserCurrentlyBanned(user) && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs text-red-600 dark:text-red-400">
                                  <p className="font-medium">Ban Reason:</p>
                                  <p className="text-gray-600 dark:text-gray-400">{user.banReason}</p>
                                </div>
                                <div className="text-xs">
                                  <p className="text-red-600 dark:text-red-400 font-medium mb-1">Time Remaining:</p>
                                  {user.bannedUntil && (
                                    <BanCountdown 
                                      bannedUntil={user.bannedUntil} 
                                      onExpire={() => {
                                        // Refresh the page or update user list when ban expires
                                        loadData();
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditUserModal(user)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg !rounded-button"
                        title="Edit All User Details"
                      >
                        <span className="text-xl">📝</span>
                      </button>
                      <button
                        onClick={() => openShareModal(user)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg !rounded-button"
                        title="Share Rank"
                      >
                        <span className="text-xl">🔗</span>
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg !rounded-button"
                        title="Delete User"
                      >
                        <span className="text-xl">❌</span>
                      </button>
                      {user.isBanned && isUserCurrentlyBanned(user) ? (
                        <button
                          onClick={() => unbanUser(user.id)}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg !rounded-button"
                          title="Unban User"
                        >
                          <span className="text-xl">🔓</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openBanModal(user)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg !rounded-button"
                          title="Ban User"
                        >
                          <span className="text-xl">⛔</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 dark:text-green-400 text-xl">📝</span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getTotalQuestions()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">📝 Total Questions</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 dark:text-purple-400 text-xl">👥</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{allUsers.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">👥 Total Users</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 dark:text-blue-400 text-xl">✅</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{allUsers.length - getBannedUsersCount()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">✅ Active Users</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 dark:text-red-400 text-xl">⛔</span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{getBannedUsersCount()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">⛔ Banned Users</p>
              {getBannedUsersCount() > 0 && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  {allUsers.filter(u => u.isBanned && isUserCurrentlyBanned(u) && u.bannedUntil).length} active bans
                </p>
              )}
            </div>
          </div>

          {/* Quiz Status Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              <i className="ri-dashboard-line mr-2"></i>
              Quiz Status Overview
            </h3>
            <div
              className={`p-4 rounded-xl ${
                quizSettings.isQuizEnabled
                  ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800 dark:text-gray-200">Current Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    quizSettings.isQuizEnabled
                      ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                  }`}
                >
                  {quizSettings.isQuizEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {quizSettings.lastUpdateTime && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last Updated: {new Date(quizSettings.lastUpdateTime).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Subject Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              <i className="ri-book-open-line mr-2"></i>
              Questions by Subject
            </h3>
            <div className="space-y-4">
              {subjects.map(subject => {
                let totalForSubject = 0;
                grades.forEach(grade => {
                  totalForSubject += getGradeSubjectCount(grade, subject.id);
                });

                return (
                  <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{subject.name}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{totalForSubject}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard Tab */}
      {activeTab === 'scoreboard' && (
        <div className="space-y-6">
          {/* Scoreboard Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-lg border border-purple-500 dark:border-purple-400">
            <div className="text-center text-white">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-trophy-line text-white text-2xl"></i>
                </div>
                <h2 className="text-2xl font-['Pacifico'] font-bold">📈 Admin Scoreboard</h2>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-bar-chart-line text-white text-2xl"></i>
                </div>
              </div>
              <p className="text-purple-100 text-lg font-medium mb-2">Manage Rankings & Scores</p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <i className="ri-user-line"></i>
                  <span>{allUsers.length} Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-medal-line"></i>
                  <span>Editable Rankings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-star-line"></i>
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Point Management */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <i className="ri-settings-3-line mr-2 text-orange-600"></i>
                  Bulk Point Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add or subtract points from multiple users at once</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <i className="ri-group-line text-orange-600 dark:text-orange-400 text-xl"></i>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="scoreboard-grade-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Grade</label>
                <select
                  id="scoreboard-grade-select"
                  title="Select target grade"
                  value={selectedScoreboardGrade}
                  onChange={(e) => setSelectedScoreboardGrade(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="all">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Point Adjustment</label>
                <input
                  type="number"
                  id="bulkPoints"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Enter points (+ or -)"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const points = parseInt((document.getElementById('bulkPoints') as HTMLInputElement)?.value || '0');
                  if (points === 0) {
                    alert('Please enter a valid point value');
                    return;
                  }
                  
                  const targetUsers = selectedScoreboardGrade === 'all' 
                    ? allUsers 
                    : allUsers.filter(user => user.grade === selectedScoreboardGrade);
                  
                  if (targetUsers.length === 0) {
                    alert('No users found for the selected criteria');
                    return;
                  }

                  const confirmMessage = `Are you sure you want to ${points > 0 ? 'add' : 'subtract'} ${Math.abs(points)} points to ${targetUsers.length} user${targetUsers.length > 1 ? 's' : ''}?`;
                  
                  if (confirm(confirmMessage)) {
                    const updatedUsers = allUsers.map(user => {
                      if (selectedScoreboardGrade === 'all' || user.grade === selectedScoreboardGrade) {
                        return {
                          ...user,
                          score: Math.max(0, user.score + points)
                        };
                      }
                      return user;
                    });

                    setAllUsers(updatedUsers.sort((a, b) => b.score - a.score));
                    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

                    // Update current user if affected
                    const currentUser = localStorage.getItem('currentUser');
                    if (currentUser) {
                      const user = JSON.parse(currentUser);
                      const updatedUser = updatedUsers.find(u => u.id === user.id);
                      if (updatedUser) {
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                      }
                    }

                    alert(`Successfully ${points > 0 ? 'added' : 'subtracted'} ${Math.abs(points)} points to ${targetUsers.length} user${targetUsers.length > 1 ? 's' : ''}!`);
                    (document.getElementById('bulkPoints') as HTMLInputElement).value = '';
                  }
                }}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3 rounded-xl font-semibold transition-all !rounded-button"
              >
                <i className="ri-settings-3-line mr-2"></i>
                Apply Bulk Points
              </button>
              <button
                onClick={() => {
                  const targetUsers = selectedScoreboardGrade === 'all' 
                    ? allUsers 
                    : allUsers.filter(user => user.grade === selectedScoreboardGrade);
                  
                  if (targetUsers.length === 0) {
                    alert('No users found for the selected criteria');
                    return;
                  }

                  if (confirm(`Are you sure you want to reset all scores to 0 for ${targetUsers.length} user${targetUsers.length > 1 ? 's' : ''}?`)) {
                    const updatedUsers = allUsers.map(user => {
                      if (selectedScoreboardGrade === 'all' || user.grade === selectedScoreboardGrade) {
                        return {
                          ...user,
                          score: 0
                        };
                      }
                      return user;
                    });

                    setAllUsers(updatedUsers.sort((a, b) => b.score - a.score));
                    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

                    // Update current user if affected
                    const currentUser = localStorage.getItem('currentUser');
                    if (currentUser) {
                      const user = JSON.parse(currentUser);
                      const updatedUser = updatedUsers.find(u => u.id === user.id);
                      if (updatedUser) {
                        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                      }
                    }

                    alert(`Successfully reset scores for ${targetUsers.length} user${targetUsers.length > 1 ? 's' : ''}!`);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition-all !rounded-button"
              >
                <i className="ri-refresh-line mr-2"></i>
                Reset All Scores
              </button>
            </div>
          </div>

          {/* Scoreboard Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Scoreboard Filters</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Showing:</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setScoreboardFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      scoreboardFilter === 'all'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Users ({allUsers.length})
                  </button>
                  <button
                    onClick={() => setScoreboardFilter('grade')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      scoreboardFilter === 'grade'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    By Grade
                  </button>
                </div>
              </div>
            </div>

            {scoreboardFilter === 'grade' && (
              <div className="grid grid-cols-4 gap-2">
                {grades.map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedScoreboardGrade(grade)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition-all !rounded-button ${
                      selectedScoreboardGrade === grade
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {grade.replace('Grade ', '')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scoreboard List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center justify-between text-white">
                <h3 className="font-semibold">
                  {scoreboardFilter === 'grade' ? `${selectedScoreboardGrade} Rankings` : 'Overall Rankings'}
                </h3>
                <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                  {getScoreboardUsers().length} Students
                </span>
              </div>
            </div>

            {getScoreboardUsers().length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-user-line text-gray-400 text-2xl"></i>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">No students found</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  {scoreboardFilter === 'grade' ? `No students in ${selectedScoreboardGrade}` : 'No students registered yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {getScoreboardUsers().map((user, index) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                          {user.isBanned && isUserCurrentlyBanned(user) && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                              BANNED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{user.grade}</span>
                          <span>•</span>
                          <span>Age {user.age}</span>
                          <span>•</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">{user.score} points</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditScoreboardUser(user)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg !rounded-button"
                        title="Edit User"
                      >
                        <span className="text-xl">📝</span>
                      </button>
                      <button
                        onClick={() => openShareModal(user)}
                        className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg !rounded-button"
                        title="Share Rank"
                      >
                        <span className="text-xl">🔗</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>





          {/* Comprehensive User Edit Modal moved to global section */}

          {/* Edit User Modal */}
          {editingScoreboardUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                <div className="text-center mb-6">
                                     <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                   </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Edit User Score</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update {editingScoreboardUser.name}&apos;s information</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={scoreboardEditForm.name}
                      onChange={(e) => setScoreboardEditForm({ ...scoreboardEditForm, name: e.target.value })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade</label>
                    <select
                      value={scoreboardEditForm.grade}
                      onChange={(e) => setScoreboardEditForm({ ...scoreboardEditForm, grade: e.target.value })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      title="Select user grade"
                    >
                      {grades.map(grade => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Score</label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={scoreboardEditForm.score}
                        onChange={(e) => setScoreboardEditForm({ ...scoreboardEditForm, score: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter score"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setScoreboardEditForm({ ...scoreboardEditForm, score: scoreboardEditForm.score + 10 })}
                          className="flex-1 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
                        >
                          +10 Points
                        </button>
                        <button
                          type="button"
                          onClick={() => setScoreboardEditForm({ ...scoreboardEditForm, score: scoreboardEditForm.score + 50 })}
                          className="flex-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                        >
                          +50 Points
                        </button>
                        <button
                          type="button"
                          onClick={() => setScoreboardEditForm({ ...scoreboardEditForm, score: Math.max(0, scoreboardEditForm.score - 10) })}
                          className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                        >
                          -10 Points
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setScoreboardEditForm({ ...scoreboardEditForm, score: 0 })}
                          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Reset to 0
                        </button>
                        <button
                          type="button"
                          onClick={() => setScoreboardEditForm({ ...scoreboardEditForm, score: 100 })}
                          className="flex-1 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
                        >
                          Set to 100
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={saveScoreboardUserEdit}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold !rounded-button"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingScoreboardUser(null)}
                    className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-semibold !rounded-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* System Reset */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  <i className="ri-refresh-line mr-2 text-red-600"></i>
                  Reset All Data
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete all users, questions, scores, and settings. This action cannot be undone.
                </p>
              </div>
                             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                 <span className="text-xl">❌</span>
               </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-xl mt-0.5"></i>
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">Danger Zone</h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    This will delete ALL data including:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-400 mt-2 space-y-1 ml-4">
                    <li>• All user accounts and scores</li>
                    <li>• All quiz questions and answers</li>
                    <li>• All quiz results and history</li>
                    <li>• Quiz settings and configurations</li>
                    <li>• Admin authentication</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={resetAllData}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-2xl font-semibold transition-all !rounded-button"
            >
              <span className="mr-2 inline-block align-middle">❌</span>
              Reset All Data
            </button>
          </div>

          {/* Delete All Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                               <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                   <span className="mr-2 inline-flex items-center">❌</span>
                   Delete All Questions
                 </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Delete all questions for a specific grade and subject combination. Users and other data will remain intact.
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <i className="ri-question-line text-orange-600 dark:text-orange-400 text-xl"></i>
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <i className="ri-error-warning-line text-orange-600 dark:text-orange-400 text-xl mt-0.5"></i>
                <div>
                  <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-1">Question Management</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    This will delete all questions for the selected combination:
                  </p>
                  <ul className="text-sm text-orange-700 dark:text-orange-400 mt-2 space-y-1 ml-4">
                    <li>• All questions for the selected grade and subject</li>
                    <li>• Quiz availability for that combination will be disabled</li>
                    <li>• Users and their scores will remain unchanged</li>
                    <li>• Other subjects and grades will be unaffected</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  title="Select grade"
                >
                  {grades.map(grade => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  title="Select subject"
                >
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({getGradeSubjectCount(selectedGrade, subject.id)} questions)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => deleteAllQuestions(selectedGrade, selectedSubject)}
              disabled={getGradeSubjectCount(selectedGrade, selectedSubject) === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-2xl font-semibold transition-all !rounded-button disabled:cursor-not-allowed"
            >
                             <span className="mr-2 inline-block align-middle">❌</span>
               Delete All Questions for {selectedGrade} - {subjects.find(s => s.id === selectedSubject)?.name}
            </button>
          </div>

          {/* Application Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
              <i className="ri-information-line mr-2"></i>
              Application Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">👥 Total Users</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{allUsers.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">📝 Total Questions</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{getTotalQuestions()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Quiz Status</span>
                <span className={`font-medium ${quizSettings.isQuizEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {quizSettings.isQuizEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">⛔ Banned Users</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{getBannedUsersCount()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive User Edit Modal (global) */}
      {editingUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-settings-line text-blue-600 dark:text-blue-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Edit User Details</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update {editingUserModal.name}&apos;s information</p>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <i className="ri-user-line mr-2 text-blue-600"></i>
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={userEditForm.name}
                      onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade</label>
                    <select
                      value={userEditForm.grade}
                      onChange={(e) => setUserEditForm({ ...userEditForm, grade: e.target.value })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      title="Select user grade"
                    >
                      {grades.map(grade => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age</label>
                    <input
                      type="number"
                      value={userEditForm.age}
                      onChange={(e) => setUserEditForm({ ...userEditForm, age: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter age"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={userEditForm.email}
                      onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter email"
                    />
                  </div>
                </div>
              </div>

              {/* Score Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <i className="ri-trophy-line mr-2 text-green-600"></i>
                  Score Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Score</label>
                    <div className="p-3 bg-white dark:bg-gray-700 rounded-lg text-center">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">{editingUserModal.score}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">points</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Score</label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={userEditForm.score}
                        onChange={(e) => setUserEditForm({ ...userEditForm, score: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Enter new score"
                        min="0"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setUserEditForm({ ...userEditForm, score: userEditForm.score + 10 })}
                          className="flex-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserEditForm({ ...userEditForm, score: userEditForm.score + 50 })}
                          className="flex-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                        >
                          +50
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserEditForm({ ...userEditForm, score: Math.max(0, userEditForm.score - 10) })}
                          className="flex-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                        >
                          -10
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ban Status */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <i className="ri-shield-line mr-2 text-red-600"></i>
                  Ban Status
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isBanned"
                      checked={userEditForm.isBanned}
                      onChange={(e) => setUserEditForm({ ...userEditForm, isBanned: e.target.checked })}
                      className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="isBanned" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      User is banned
                    </label>
                  </div>
                  {userEditForm.isBanned && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ban Reason</label>
                        <textarea
                          value={userEditForm.banReason}
                          onChange={(e) => setUserEditForm({ ...userEditForm, banReason: e.target.value })}
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          placeholder="Enter ban reason"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ban Until (Optional)</label>
                        <input
                          type="datetime-local"
                          value={userEditForm.bannedUntil}
                          onChange={(e) => setUserEditForm({ ...userEditForm, bannedUntil: e.target.value })}
                          className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          title="Ban until date and time (optional)"
                          placeholder="Select ban end date and time (optional)"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty for permanent ban</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz History */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <i className="ri-time-line mr-2 text-purple-600"></i>
                  Quiz History
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Quiz Time:</span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {editingUserModal.lastQuizTime ? new Date(editingUserModal.lastQuizTime).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  {editingUserModal.lastQuizTimes && Object.keys(editingUserModal.lastQuizTimes).length > 0 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Subject-specific times:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(editingUserModal.lastQuizTimes).map(([subject, time]) => (
                          <div key={subject} className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">{subject}:</span>
                            <span className="text-gray-700 dark:text-gray-300">{new Date(time).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={saveUserModalEdit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all !rounded-button"
              >
                <i className="ri-save-line mr-2"></i>
                Save All Changes
              </button>
              <button
                onClick={() => {
                  setEditingUserModal(null);
                  setUserEditForm({
                    name: '',
                    grade: '',
                    age: 0,
                    email: '',
                    score: 0,
                    isBanned: false,
                    banReason: '',
                    bannedUntil: ''
                  });
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold transition-all !rounded-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && banningUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-line text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Temporarily Ban User</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ban {banningUser.name} from the platform</p>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {allUsers.findIndex(u => u.id === banningUser.id) + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{banningUser.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{banningUser.grade} • {banningUser.score} points</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ban Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm h-20"
                  placeholder="Enter the reason for banning this user..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {banForm.reason.length}/500 characters
                </p>
              </div>

              <div>
                <label htmlFor="ban-duration-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ban Duration</label>
                <select
                  id="ban-duration-select"
                  title="Select ban duration"
                  value={banForm.duration}
                  onChange={(e) => setBanForm({ ...banForm, duration: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="1">1 Hour</option>
                  <option value="6">6 Hours</option>
                  <option value="24">1 Day</option>
                  <option value="72">3 Days</option>
                  <option value="168">1 Week</option>
                  <option value="720">1 Month</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ban will expire on: {(() => {
                    const now = new Date();
                    const duration = parseInt(banForm.duration);
                    const endTime = new Date(now.getTime() + duration * 60 * 60 * 1000);
                    return endTime.toLocaleString();
                  })()}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={banUser}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold !rounded-button disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!banForm.reason.trim()}
              >
                <i className="ri-shield-line mr-2"></i>
                Ban User
              </button>
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-semibold !rounded-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
                          <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Share User Rank</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Share {shareUser.name}&apos;s achievement with rank image and app link!</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{shareUser.name}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  #{allUsers.filter(u => u.grade === shareUser.grade).sort((a, b) => b.score - a.score).findIndex(u => u.id === shareUser.id) + 1}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{shareUser.grade} Rank</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">{shareUser.score} points</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={shareUserRank}
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
    </div>
  );
}

export default function AdminPanel() {
  return (
    <ThemeProvider>
      <AdminContent />
    </ThemeProvider>
  );
}
