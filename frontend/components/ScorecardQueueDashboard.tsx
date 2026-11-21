'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileCheck2, 
  RefreshCw, 
  ChevronRight,
  AlertCircle,
  Filter,
  UserCheck,
  Award,
  Users
} from 'lucide-react';
import { ScorecardSubmissionItem, ScorecardStatus, Subordinate } from '@/types/scorecard';
import { fetchScorecardSubmissions } from '@/lib/api/scorecard';

interface ScorecardQueueDashboardProps {
  onSelectEmployee: (employeeId: string, month: string) => void;
  subordinates: Subordinate[];
  availableMonths: string[];
}

export default function ScorecardQueueDashboard({
  onSelectEmployee,
  subordinates,
  availableMonths
}: ScorecardQueueDashboardProps) {
  const [submissions, setSubmissions] = useState<ScorecardSubmissionItem[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'SUBMITTED' | 'ALL' | 'APPROVED' | 'CLOSED'>('SUBMITTED');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [directEmployeeSelect, setDirectEmployeeSelect] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchScorecardSubmissions('all', 'ALL');
      setSubmissions(res.submissions || []);
      setPendingCount(res.pending_count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submitted scorecards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let closed = 0;
    submissions.forEach(s => {
      if (s.status === 'SUBMITTED') pending++;
      else if (s.status === 'APPROVED') approved++;
      else if (s.status === 'CLOSED') closed++;
    });
    return { pending, approved, closed, total: submissions.length };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(item => {
      if (activeTab === 'SUBMITTED' && item.status !== 'SUBMITTED') return false;
      if (activeTab === 'APPROVED' && item.status !== 'APPROVED') return false;
      if (activeTab === 'CLOSED' && item.status !== 'CLOSED') return false;

      if (selectedMonthFilter !== 'all' && item.month !== selectedMonthFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.employee_name?.toLowerCase().includes(q);
        const codeMatch = item.employee_code?.toLowerCase().includes(q);
        const desigMatch = item.designation?.toLowerCase().includes(q);
        const teamMatch = item.team_name?.toLowerCase().includes(q);
        if (!nameMatch && !codeMatch && !desigMatch && !teamMatch) return false;
      }

      return true;
    });
  }, [submissions, activeTab, selectedMonthFilter, searchQuery]);

  const formatMonthDisplay = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-').map(Number);
      const d = new Date(year, month - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  const formatDateTime = (isoStr?: string | null) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return isoStr;
    }
  };

  const getStatusBadge = (status: ScorecardStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Submitted / Ready for Evaluation
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Approved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <Lock className="w-3.5 h-3.5 mr-1" />
            Closed / Final
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Strip for Admin */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Admin Evaluation Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Scorecard Submissions & Evaluation Queue
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Team members fill out their draft scorecards and submit them. As an Administrator, your role is to review their submitted performance numbers, enter Quality Scores (Sheet Score, Call Score, Marking / 100), and finalize approvals.
            </p>
          </div>

          {/* Quick Inspector Dropdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shrink-0 space-y-2 self-start md:self-auto min-w-[260px]">
            <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>Directly Inspect Any Member:</span>
            </label>
            <select
              value={directEmployeeSelect}
              onChange={(e) => {
                const val = e.target.value;
                setDirectEmployeeSelect(val);
                if (val) {
                  onSelectEmployee(val, availableMonths[0] || '2026-11');
                }
              }}
              className="w-full text-xs py-2 px-3 rounded-lg bg-slate-900/80 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select member to open...</option>
              {subordinates.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.full_name} ({sub.employee_id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('SUBMITTED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'SUBMITTED'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-900">{counts.pending}</span>
            {counts.pending > 0 && (
              <span className="text-[11px] font-bold text-amber-700 animate-pulse">Needs Evaluation</span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-900">{counts.approved}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('CLOSED')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'CLOSED'
              ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Closed / Final</span>
            <Lock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-purple-900">{counts.closed}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeTab === 'ALL'
              ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-300 shadow-sm'
              : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Submissions</span>
            <FileCheck2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-indigo-900">{counts.total}</span>
          </div>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/50">
          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('SUBMITTED')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'SUBMITTED'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending Evaluation</span>
              {counts.pending > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {counts.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved ({counts.approved})
            </button>

            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'CLOSED'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Closed ({counts.closed})
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({counts.total})
            </button>
          </div>

          {/* Search, Filter & Refresh */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member, ID, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
              />
            </div>

            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
              >
                <option value="all">All Months</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{formatMonthDisplay(m)}</option>
                ))}
              </select>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Queue"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {error && (
            <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading submissions queue...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileCheck2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {activeTab === 'SUBMITTED' 
                  ? 'No scorecards waiting for evaluation' 
                  : 'No scorecards match the filter'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {activeTab === 'SUBMITTED' 
                  ? 'When team members complete and submit their monthly reports, they will appear here automatically for your quality evaluation and approval.' 
                  : 'Try selecting a different month or clearing your search term.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Member Name & ID</th>
                  <th className="py-3.5 px-4">Designation / Team</th>
                  <th className="py-3.5 px-4">Month</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4 text-right">Collection Achieved</th>
                  <th className="py-3.5 px-4 text-center">Marking / 100</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((item) => (
                  <tr 
                    key={`${item.employee_id}-${item.month}`}
                    className="hover:bg-indigo-50/40 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-700 text-sm">
                        {item.employee_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        ID: {item.employee_code || item.employee_id}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-slate-800 font-medium">{item.designation || '—'}</div>
                      {item.team_name && (
                        <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {item.team_name}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800">
                      {formatMonthDisplay(item.month)}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {formatDateTime(item.submitted_at || item.updated_at)}
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-900 text-sm">
                      ৳{Number(item.total_achieved_collection || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {item.marking !== null && item.marking !== undefined ? (
                        <span className="font-bold text-indigo-700 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg inline-flex items-center space-x-1">
                          <Award className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{Number(item.marking).toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending Marking</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onSelectEmployee(item.employee_id, item.month)}
                        className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all ${
                          item.status === 'SUBMITTED'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 hover:shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{item.status === 'SUBMITTED' ? 'Check & Evaluate' : 'Review Scorecard'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
