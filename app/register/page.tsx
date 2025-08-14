'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    age: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const grades = [
    'Grades 1-5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 
    'Grade 11'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.grade || !formData.age || !formData.email) {
      return;
    }

    setIsSubmitting(true);
    
    const newUser = {
      id: Date.now().toString(),
      name: formData.name,
      grade: formData.grade,
      age: parseInt(formData.age),
      email: formData.email,
      score: 0
    };

    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Add to users list
    const existingUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(existingUsers));

    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 px-4 pt-8 pb-20">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 font-medium">
          <i className="ri-arrow-left-line mr-2"></i>
          Back
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-['Pacifico'] text-blue-600 mb-2">Join QuizMaster</h1>
        <p className="text-gray-600 text-sm">Create your account to start competing</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🎓 Grade Level</label>
            <div className="relative">
              <select
                aria-label="Grade Level"
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                required
              >
                <option value="">Select your grade</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
              <i className="ri-arrow-down-s-line absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🎂 Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your age"
              min="10"
              max="20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50 !rounded-button"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line mr-2 animate-spin"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="ri-user-add-line mr-2 text-xl"></i>
                Create Account
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-blue-600 text-sm"></i>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">How it works:</h3>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Answer 10-20 MCQs for your grade level</li>
              <li>• Earn +10 points for correct answers</li>
              <li>• Lose -5 points for wrong answers</li>
              <li>• Compete with students in your grade</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}