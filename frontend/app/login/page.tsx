'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { loginWithPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Ambient Background Gradients (Retaining same brand palette) */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Login Card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-200/60 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-xs">
            <img
              src="/image/Sunset-Group-Logo.png"
              alt="Sunset Group Logo"
              className="h-14 w-auto object-contain transition-transform hover:scale-105 duration-200"
            />
          </div>
          
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Sunset Group Enterprise Portal</span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Monthly Scorecard
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Performance, Activity & Customer Collection System
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-5 bg-rose-50 border border-rose-200/80 text-rose-800 text-xs rounded-2xl p-3.5 flex items-start space-x-2.5 shadow-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold leading-relaxed">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address <span className="text-emerald-600">*</span>
            </label>
            <div className="relative rounded-2xl border border-slate-200/90 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-slate-50/60 transition-all shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sunsetgroupbd.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium text-slate-900 bg-transparent rounded-2xl focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password <span className="text-emerald-600">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-2xl border border-slate-200/90 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-slate-50/60 transition-all shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 bg-transparent rounded-2xl focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 shadow-md shadow-slate-900/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating Credentials...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Security Footer Badge */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Enterprise Authentication</span>
        </div>
      </div>
    </div>
  );
}
