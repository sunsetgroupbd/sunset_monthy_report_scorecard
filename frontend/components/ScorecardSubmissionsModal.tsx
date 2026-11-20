'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileCheck2, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Filter
} from 'lucide-react';
import { ScorecardSubmissionItem, ScorecardStatus } from '@/types/scorecard';
import { fetchScorecardSubmissions } from '@/lib/api/scorecard';

interface ScorecardSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubmission: (employeeId: string, month: string) => void;
  currentMonth?: string;
}

export default function ScorecardSubmissionsModal({
  isOpen,
  onClose,
  onSelectSubmission,
  currentMonth
}: ScorecardSubmissionsModalProps) {
  const [submissions, setSubmissions] = useState<ScorecardSubmissionItem[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'SUBMITTED' | 'ALL' | 'APPROVED' | 'CLOSED'>('SUBMITTED');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchScorecardSubmissions('all', 'ALL');
      setSubmissions(res.submissions || []);
      setPendingCount(res.pending_count || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Extract unique available months from submissions for filter dropdown
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    submissions.forEach(s => {
      if (s.month) set.add(s.month);
    });
    return Array.from(set).sort().reverse();
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(item => {
      // Tab filter
      if (activeTab === 'SUBMITTED' && item.status !== 'SUBMITTED') return false;
      if (activeTab === 'APPROVED' && item.status !== 'APPROVED') return false;
      if (activeTab === 'CLOSED' && item.status !== 'CLOSED') return false;

      // Month filter
      if (selectedMonthFilter !== 'all' && item.month !== selectedMonthFilter) return false;

      // Search query
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

  if (!isOpen) return null;

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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            Submitted
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <Lock className="w-3 h-3 mr-1" />
            Closed / Final
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">Scorecard Submissions</h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {pendingCount} Pending Review
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Review submitted employee scorecards, evaluate scores, and finalize approvals.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh submissions"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Bar: Tabs, Search, Month Filter */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('SUBMITTED')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'SUBMITTED'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Pending Review</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ALL'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({submissions.length})
            </button>

            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>

            <button
              onClick={() => setActiveTab('CLOSED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'CLOSED'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Closed / Final
            </button>
          </div>

          {/* Search & Month Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 md:w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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
          </div>
        </div>

        {/* Content Table / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No scorecards found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {activeTab === 'SUBMITTED' 
                  ? 'There are currently no submitted scorecards awaiting evaluation.' 
                  : 'No submissions matched your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-3">Designation / Team</th>
                      <th className="py-3 px-3">Month</th>
                      <th className="py-3 px-3">Submitted At</th>
                      <th className="py-3 px-3 text-right">Collection Achieved</th>
                      <th className="py-3 px-3 text-center">Marking / 100</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((item) => (
                      <tr 
                        key={`${item.employee_id}-${item.month}`}
                        className="hover:bg-indigo-50/40 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-700">
                            {item.employee_name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ID: {item.employee_code || item.employee_id}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">{item.designation || '—'}</div>
                          {item.team_name && (
                            <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {item.team_name}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {formatMonthDisplay(item.month)}
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          {formatDateTime(item.submitted_at || item.updated_at)}
                        </td>

                        <td className="py-3 px-3 text-right font-semibold text-slate-900">
                          ৳{Number(item.total_achieved_collection || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {item.marking !== null && item.marking !== undefined ? (
                            <span className="font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded">
                              {Number(item.marking).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not evaluated</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(item.status)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              onSelectSubmission(item.employee_id, item.month);
                              onClose();
                            }}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                              item.status === 'SUBMITTED'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200 hover:shadow-md'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{item.status === 'SUBMITTED' ? 'Evaluate & Finalize' : 'Open Scorecard'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredSubmissions.length}</span> scorecards
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
