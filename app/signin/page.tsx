
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeProvider } from '../../components/ThemeProvider';
import ThemeToggle from '../../components/ThemeToggle';

function SignInContent() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Check if user exists
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const user = allUsers.find((u: any) => u.email === formData.email);

    if (user) {
      // For demo purposes, accept any password for existing users
      localStorage.setItem('currentUser', JSON.stringify(user));
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      setError('User not found. Please check your email or sign up first.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-4 pt-8 pb-20">
      <div className="absolute top-8 right-4">
        <ThemeToggle />
      </div>

      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium">
          <i className="ri-arrow-left-line mr-2"></i>
          Back to Home
        </Link>
      </div>

      <div className="text-center mb-8">
        <img 
          src="https://readdy.ai/api/search-image?query=Modern%20educational%20quiz%20app%20logo%2C%20students%20learning%20with%20tablets%2C%20bright%20classroom%20environment%2C%20academic%20competition%20theme%2C%20clean%20white%20background%2C%20professional%20illustration%20style&width=80&height=80&seq=signin-logo&orientation=squarish"
          alt="QuizMaster Logo"
          className="w-16 h-16 object-cover object-top rounded-2xl mx-auto mb-4 shadow-sm"
        />
        <h1 className="text-2xl font-['Pacifico'] text-blue-600 dark:text-blue-400 mb-2">Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Welcome back to QuizMaster</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold disabled:opacity-50 !rounded-button"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line mr-2 animate-spin"></i>
                Signing in...
              </>
            ) : (
              <>
                <i className="ri-login-box-line mr-2 text-xl"></i>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="ri-information-line text-blue-600 dark:text-blue-400 text-sm"></i>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Demo Access:</h3>
            <p className="text-blue-700 dark:text-blue-400 text-xs">
              For demo purposes, you can sign in with any registered email address using any password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <ThemeProvider>
      <SignInContent />
    </ThemeProvider>
  );
}
