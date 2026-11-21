'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ScorecardResponse, 
  Subordinate, 
  ScorecardStatus 
} from '@/types/scorecard';
import { 
  Calendar, 
  User, 
  Printer, 
  Save, 
  Send, 
  CheckCircle, 
  Lock, 
  Unlock, 
  History,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  Award
} from 'lucide-react';

interface ScorecardHeaderProps {
  scorecard: ScorecardResponse;
  subordinates: Subordinate[];
  availableMonths: string[];
  selectedEmployeeId: string;
  selectedMonth: string;
  onEmployeeChange: (id: string) => void;
  onMonthChange: (month: string) => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onClose: () => void;
  onReopen: () => void;
  onReject?: () => void;
  onOpenAuditLogs: () => void;
  isSaving: boolean;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canClose: boolean;
  canReopen: boolean;
  canReject?: boolean;
  isReviewer?: boolean;
  onBackToQueue?: () => void;
}

export default function ScorecardHeader({
  scorecard,
  subordinates,
  availableMonths,
  selectedEmployeeId,
  selectedMonth,
  onEmployeeChange,
  onMonthChange,
  onSaveDraft,
  onSubmit,
  onApprove,
  onClose,
  onReopen,
  onReject,
  onOpenAuditLogs,
  isSaving,
  canEdit,
  canSubmit,
  canApprove,
  canClose,
  canReopen,
  canReject,
  isReviewer,
  onBackToQueue
}: ScorecardHeaderProps) {
  const employee = scorecard.employee;

  const statusBadgeStyle: Record<ScorecardStatus, { bg: string; text: string; border: string; label: string }> = {
    DRAFT: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', label: 'DRAFT' },
    SUBMITTED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: 'SUBMITTED' },
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', label: 'APPROVED' },
    CLOSED: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'CLOSED / LOCKED' },
  };

  const statusStyle = statusBadgeStyle[scorecard.status] || statusBadgeStyle.DRAFT;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      {/* Top Bar: Title & Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manual Monthly Scorecard
            </h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              {statusStyle.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manual performance tracking, customer collection forecasting, and portfolio metrics.
          </p>
        </div>

        {/* Selectors and Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
            <Calendar className="w-4 h-4 text-slate-500 mr-2" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Selector (if multiple subordinates available) */}
          {subordinates.length > 1 && (
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
              <User className="w-4 h-4 text-slate-500 mr-2" />
              <select
                value={selectedEmployeeId}
                onChange={(e) => onEmployeeChange(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[220px] truncate"
              >
                {subordinates.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.full_name} ({sub.employee_id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Audit Logs button */}
          <button
            onClick={onOpenAuditLogs}
            title="View Audit Trail"
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Audit Trail</span>
          </button>

          {/* Print button */}
          <Link
            href={`/manual-scorecard/print?employee_id=${selectedEmployeeId}&month=${selectedMonth}`}
            target="_blank"
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </Link>
        </div>
      </div>

      {/* Employee Profile Information Strip */}
      <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Employee Name</span>
          <span className="text-sm font-semibold text-slate-800 truncate block mt-0.5">
            {employee?.full_name || '—'}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Employee ID</span>
          <span className="text-sm font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
            {employee?.employee_id || '—'}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Designation</span>
          <span className="text-sm font-medium text-slate-700 truncate block mt-0.5">
            {employee?.designation || '—'}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block uppercase tracking-wider">Role</span>
          <span className="text-sm font-bold text-slate-800 block mt-0.5">
            {employee?.role || 'EMPLOYEE'}
          </span>
        </div>
      </div>

      {/* Workflow Action Bar */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          {scorecard.status === 'CLOSED' ? (
            <span className="flex items-center text-purple-700 font-medium">
              <Lock className="w-4 h-4 mr-1 text-purple-600" />
              This scorecard is locked against editing.
            </span>
          ) : isReviewer ? (
            <span className="flex items-center text-indigo-700 font-medium">
              <Award className="w-4 h-4 mr-1 text-indigo-600" />
              Reviewing member scorecard. Enter Sheet/Call scores and Quality Marking below.
            </span>
          ) : (
            <span>
              All values must be entered manually. Remember to save drafts regularly.
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Back to Submissions Queue (Admin / Reviewer) */}
          {onBackToQueue && (
            <button
              onClick={onBackToQueue}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Submissions Queue</span>
            </button>
          )}

          {/* Member Save Draft */}
          {canEdit && !isReviewer && (
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          )}

          {/* Reviewer / Admin Save Evaluation */}
          {isReviewer && scorecard.can_edit_supervisor_fields && scorecard.status !== 'CLOSED' && (
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Evaluation'}</span>
            </button>
          )}

          {/* Submit (only for member/owner in DRAFT) */}
          {canSubmit && !isReviewer && (
            <button
              onClick={onSubmit}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Submit Scorecard</span>
            </button>
          )}

          {/* Request Changes / Return to Draft (Reviewer in SUBMITTED status) */}
          {canReject && onReject && (
            <button
              onClick={onReject}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Request Changes / Return to Draft</span>
            </button>
          )}

          {/* Approve */}
          {canApprove && (
            <button
              onClick={onApprove}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Scorecard</span>
            </button>
          )}

          {/* Close / Lock */}
          {canClose && (
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>Close / Lock Scorecard</span>
            </button>
          )}

          {/* Reopen (Admin only) */}
          {canReopen && (
            <button
              onClick={onReopen}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>Reopen Scorecard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
