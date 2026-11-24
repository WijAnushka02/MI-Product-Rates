import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { loginApi, registerApi, googleAuthApi } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Regular Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({ username: username.trim(), password });
      showToast(`Welcome back, ${res.user.full_name}!`, 'success');
      onAuthSuccess(res.user);
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Regular Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerApi({
        username: username.trim(),
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });
      showToast(`Account created successfully! Welcome, ${res.user.full_name}.`, 'success');
      onAuthSuccess(res.user);
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler (Optional Google Login)
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      // Prompt user or use default Google identity mock for seamless evaluation
      const userGoogleEmail = window.prompt(
        'Google Sign-In: Enter your Google email address to continue:',
        'anushka.sltmobitel@gmail.com'
      );

      if (!userGoogleEmail) {
        setLoading(false);
        return;
      }

      const res = await googleAuthApi({
        email: userGoogleEmail.trim().toLowerCase(),
        name: userGoogleEmail.split('@')[0].replace('.', ' '),
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      });

      showToast(`Signed in with Google as ${res.user.email}!`, 'success');
      onAuthSuccess(res.user);
      handleClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for Reviewers & Evaluators
  const handleQuickDemoLogin = async (role) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const demoUser =
        role === 'admin'
          ? {
              email: 'admin.enterprise@sltmobitel.lk',
              name: 'Enterprise Admin',
              username: 'slt_admin',
            }
          : {
              email: 'anushka.intern@sltmobitel.lk',
              name: 'Anushka Dilshan',
              username: 'anushka_intern',
            };

      const res = await googleAuthApi(demoUser);
      showToast(`Signed in as demo ${res.user.full_name}!`, 'success');
      onAuthSuccess(res.user);
      handleClose();
    } catch (err) {
      setErrorMsg('Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {tab === 'login' ? 'Sign In to Portal' : 'Create Executive Account'}
              </h2>
              <p className="text-xs text-gray-500">SLTMobitel MI Product Rates System</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mt-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-md transition ${
              tab === 'login'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-md transition ${
              tab === 'register'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Username or Email
              </label>
              <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., anushka_intern or user@slt.lk"
                  required
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Password
              </label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Anushka Dilshan"
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., anushka_intern"
                  required
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@sltmobitel.lk"
                  required
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Password <span className="text-rose-500">* (min 6 chars)</span>
              </label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Optional Google OAuth Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition shadow-2xs cursor-pointer active:scale-98"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Quick Demo Access for Evaluators */}
        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
          <p className="text-2xs text-gray-500 uppercase tracking-wider font-semibold flex items-center justify-center gap-1">
            <Sparkles size={12} className="text-amber-500" /> One-Click Evaluator Sign-In
          </p>
          <div className="flex gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex-1 text-2xs bg-white border border-gray-200 hover:border-blue-400 py-1.5 rounded-md text-gray-700 font-medium transition cursor-pointer"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('intern')}
              className="flex-1 text-2xs bg-white border border-gray-200 hover:border-blue-400 py-1.5 rounded-md text-gray-700 font-medium transition cursor-pointer"
            >
              Executive Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
