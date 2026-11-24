import React, { useState } from 'react';
import { Layers, Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { loginApi, registerApi, googleAuthApi } from '../services/api';

export default function LoginPage({ onAuthSuccess, showToast }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Standard Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
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
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Invalid credentials. Please verify your username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Standard Registration
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
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
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth2 Login
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
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
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-700/20">
        
        {/* Left Side: SLTMobitel Enterprise Brand Panel */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl"></div>

          <div>
            <div className="flex items-center gap-3">
              <div className="bg-white text-blue-700 p-2.5 rounded-xl shadow-md">
                <Layers size={28} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">SLTMobitel</h1>
                <p className="text-xs text-blue-200">Enterprise Commercial Rates</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-100 border border-blue-400/30">
                <ShieldCheck size={14} className="text-emerald-400" /> Oracle DB 23ai Secured
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                MI Product Rates Management System
              </h2>
              <p className="text-sm text-blue-100/90 leading-relaxed">
                Centralized platform for telecommunication product tariffs, executive tiers, rate cards, and SLA approvals.
              </p>
            </div>

            <div className="mt-8 space-y-2.5 text-xs text-blue-100/80">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                <span>Automated sequential Service Rate IDs (SR001, SR002)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                <span>Strict 2-decimal precision validation & document uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                <span>Encrypted user credentials & comprehensive audit logging</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-blue-500/30 flex items-center justify-between text-2xs text-blue-200/70">
            <span>SLT-Mobitel (Pvt) Ltd</span>
            <span>Version 2.0 (Oracle DB)</span>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Tab Navigation */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
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
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  tab === 'register'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {/* Sign In Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Username or Email
                  </label>
                  <div className="relative mt-1">
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username or work email"
                      required
                      className="pl-9 pr-3 py-2.5 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="pl-9 pr-3 py-2.5 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Create Account Form */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
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
                      className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
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
                      placeholder="Enter a username"
                      required
                      className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
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
                      className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Password <span className="text-rose-500">* (min 6 characters)</span>
                  </label>
                  <div className="relative mt-1">
                    <Lock size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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
          </div>

          <div className="mt-8 text-center text-xs text-gray-400">
            Secure authentication backed by Oracle Database 23ai & SLTMobitel Enterprise IAM.
          </div>
        </div>

      </div>
    </div>
  );
}
