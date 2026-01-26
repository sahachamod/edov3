'use client';

import { useState, FormEvent } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginResponse {
  message?: string;
  token?: string;
  user?: any;
  [key: string]: any;
}

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // ---- 1. Try BUYER login first ----
      let userType: 'buyer' | 'admin' = 'buyer';
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Auth/buyer-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let text = await response.text();
      let data: LoginResponse = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn('Buyer login response parsing failed:', text);
      }

      console.log('Buyer login attempt →', { ok: response.ok, data });

      // ---- 2. If buyer fails → try ADMIN login ----
      if (!response.ok) {
        userType = 'admin';
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/Auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.warn('Admin login response parsing failed:', text);
        }
        console.log('Admin login attempt →', { ok: response.ok, data });
      }

      // ---- 3. Final success check (after both attempts) ----
      // We check if response.ok is true OR if we have a valid token (sometimes APIs return 200 ok but empty body if auth fails logic elsewhere, but here rely on standard token presence)
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userType', userType);

        const dashboardRoute =
          userType === 'admin' ? '/admin/dashboard' : '/buyer/invoices';

        setSuccess(`Login successful! Redirecting to ${userType} dashboard...`);
        console.log(`Redirecting ${userType} → ${dashboardRoute}`);

        setTimeout(() => {
          window.location.href = dashboardRoute;
        }, 1500);
      } else {
        const msg = data.message || 'Invalid email or password.';
        setError(msg);
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1s infinite' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) 0.5s infinite' }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-300">Sign in to continue to your account</p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="block w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="block w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            {/* <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 bg-slate-700 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-300">Remember me</span>
              </label>
              <button type="button" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Forgot password?
              </button>
            </div> */}

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-200 text-sm">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !email || !password}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Sign-up link */}
          {/* <div className="text-center text-sm text-gray-300">
            Don't have an account?{' '}
            <button type="button" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
              Sign up
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );

}