'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileSpreadsheet, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const { loginWithPassword, loginAsRole, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      await loginWithPassword(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await loginAsRole(demoEmail);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900 tracking-tight">
            Manual Scorecard Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in with your enterprise credentials to access performance sheets
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3.5 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-slate-50/50">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 bg-transparent rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 bg-slate-50/50">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 bg-transparent rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-md transition disabled:opacity-50"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Role Selector */}
        <div className="pt-6 border-t border-slate-100">
          <div className="text-center mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Test Sign In by Role
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@scorecard.com')}
              disabled={submitting}
              className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-900 text-left transition"
            >
              <div className="font-bold flex items-center justify-between">
                <span>Admin</span>
                <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.2 rounded">Full</span>
              </div>
              <div className="text-[10px] text-rose-700 mt-0.5 truncate">admin@scorecard.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('tl@scorecard.com')}
              disabled={submitting}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-900 text-left transition"
            >
              <div className="font-bold flex items-center justify-between">
                <span>Team Leader</span>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded">TL</span>
              </div>
              <div className="text-[10px] text-purple-700 mt-0.5 truncate">tl@scorecard.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('co@scorecard.com')}
              disabled={submitting}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 text-blue-900 text-left transition"
            >
              <div className="font-bold flex items-center justify-between">
                <span>Coordinator</span>
                <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded">CO</span>
              </div>
              <div className="text-[10px] text-blue-700 mt-0.5 truncate">co@scorecard.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('employee@scorecard.com')}
              disabled={submitting}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-900 text-left transition"
            >
              <div className="font-bold flex items-center justify-between">
                <span>Employee</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded">Self</span>
              </div>
              <div className="text-[10px] text-emerald-700 mt-0.5 truncate">employee@scorecard.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
