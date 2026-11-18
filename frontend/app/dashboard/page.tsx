'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  fetchSubordinates, 
  fetchMonths 
} from '@/lib/api/scorecard';
import { Subordinate } from '@/types/scorecard';
import { 
  FileSpreadsheet, 
  Users, 
  Award, 
  ArrowRight, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Briefcase,
  Shield,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [subs, mList] = await Promise.all([
          fetchSubordinates().catch(() => []),
          fetchMonths().catch(() => []),
        ]);
        setSubordinates(subs);
        setMonths(mList);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentMonth = months[0] || '2026-11';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Role: {profile?.role}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome, {profile?.full_name}!
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {profile?.designation} • {profile?.team?.name || 'Dhaka Alpha Sales Team'} (ID: {profile?.employee_id})
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/manual-scorecard?employee_id=${profile?.id}&month=${currentMonth}`}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Open My Monthly Scorecard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            {profile?.role === 'ADMIN' && (
              <Link
                href="/admin/users"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition"
              >
                <Users className="w-4 h-4" />
                <span>Manage Users & Teams</span>
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Month</span>
            <h3 className="text-xl font-bold text-slate-900">{currentMonth}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Accessible Members</span>
            <h3 className="text-xl font-bold text-slate-900">{subordinates.length} Employees</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Role Scope</span>
            <h3 className="text-xl font-bold text-slate-900">
              {profile?.role === 'ADMIN' ? 'All Organization' : profile?.role === 'TL' ? 'Team Lead Scope' : profile?.role === 'CO' ? 'Coordinator Scope' : 'Personal Scorecard'}
            </h3>
          </div>
        </div>
      </div>

      {/* Accessible Subordinates List (For TL, CO, ADMIN) */}
      {subordinates.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Accessible Employee Scorecards
              </h2>
              <p className="text-xs text-slate-500">
                Select an employee below to view, enter supervisor marks, or review performance.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {subordinates.length} Members
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subordinates.map((sub) => (
              <div 
                key={sub.id} 
                className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      ID: {sub.employee_id}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      sub.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                      sub.role === 'TL' ? 'bg-purple-100 text-purple-800' :
                      sub.role === 'CO' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {sub.role}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{sub.full_name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{sub.designation}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{sub.team_name || 'Dhaka Team'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-end">
                  <Link
                    href={`/manual-scorecard?employee_id=${sub.id}&month=${currentMonth}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                  >
                    <span>View Scorecard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance System Guidelines */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Manual Scorecard Workflow & Instructions</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-600 mt-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-900 block mb-1">1. DRAFT</span>
            Employee enters weekly collections, leads, visits, calls, and customer plans manually.
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-bold text-blue-900 block mb-1">2. SUBMITTED</span>
            Employee locks their submission. TL and CO review numbers and enter quality marking.
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-bold text-emerald-900 block mb-1">3. APPROVED</span>
            Team Leader or Coordinator approves evaluated scorecard after feedback.
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="font-bold text-purple-900 block mb-1">4. CLOSED</span>
            Admin or TL permanently closes and locks the scorecard. Only Admin can reopen.
          </div>
        </div>
      </div>
    </div>
  );
}
