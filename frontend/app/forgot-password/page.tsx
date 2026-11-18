'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div>
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3.5 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-emerald-950">Reset Instructions Sent</h3>
            <p className="text-xs text-emerald-800">
              If an account with &quot;{email}&quot; exists, we have sent a link to reset your password.
            </p>
            <Link
              href="/login"
              className="inline-block mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Work Email
              </label>
              <div className="relative rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500 bg-slate-50/50">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send Recovery Link'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
