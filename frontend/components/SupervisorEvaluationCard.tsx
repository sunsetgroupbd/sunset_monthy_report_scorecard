'use client';

import React from 'react';
import { Award, ShieldAlert, MessageSquare, CheckCircle2 } from 'lucide-react';

interface SupervisorEvaluationProps {
  sheetScore: number | null | undefined;
  callScore: number | null | undefined;
  marking: number | null | undefined;
  supervisorNotes: string | null | undefined;
  onChange: (field: string, value: any) => void;
  canEditSupervisorFields: boolean;
  disabled: boolean;
}

export default function SupervisorEvaluationCard({
  sheetScore,
  callScore,
  marking,
  supervisorNotes,
  onChange,
  canEditSupervisorFields,
  disabled
}: SupervisorEvaluationProps) {
  const isReadOnly = !canEditSupervisorFields || disabled;

  return (
    <div id="supervisor-evaluation-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-bold text-slate-800">
            Supervisor Evaluation & Quality Scoring
          </h2>
        </div>
        {canEditSupervisorFields ? (
          <span className="flex items-center text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Authorized Evaluator Mode
          </span>
        ) : (
          <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Supervisor Restricted Fields (View Only)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Sheet Score */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Sheet Score
          </label>
          <input
            type="number"
            step="0.5"
            disabled={isReadOnly}
            value={sheetScore ?? ''}
            onChange={(e) => onChange('sheet_score', e.target.value === '' ? null : parseFloat(e.target.value))}
            placeholder={isReadOnly ? 'Pending' : 'Enter score'}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Lead & customer documentation score</span>
        </div>

        {/* Call Score */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Call Score
          </label>
          <input
            type="number"
            step="0.5"
            disabled={isReadOnly}
            value={callScore ?? ''}
            onChange={(e) => onChange('call_score', e.target.value === '' ? null : parseFloat(e.target.value))}
            placeholder={isReadOnly ? 'Pending' : 'Enter score'}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Audited customer conversation evaluation</span>
        </div>

        {/* Overall Marking (0-100) */}
        <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-purple-900">
              Overall Marking (0–100)
            </label>
            {marking !== null && marking !== undefined && (
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                marking >= 80 ? 'bg-emerald-100 text-emerald-800' :
                marking >= 60 ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {marking}%
              </span>
            )}
          </div>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            disabled={isReadOnly}
            value={marking ?? ''}
            onChange={(e) => onChange('marking', e.target.value === '' ? null : Math.min(100, Math.max(0, parseFloat(e.target.value))))}
            placeholder={isReadOnly ? 'Not marked' : '0 - 100'}
            className="w-full bg-white border border-purple-200 rounded-lg px-3 py-1.5 text-sm font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="text-[10px] text-purple-600/80 mt-1 block">Monthly supervisor overall performance rating</span>
        </div>
      </div>

      {/* Supervisor Notes */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center space-x-1">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          <span>Supervisor Feedback & Coaching Notes</span>
        </label>
        <textarea
          rows={3}
          disabled={isReadOnly}
          value={supervisorNotes || ''}
          onChange={(e) => onChange('supervisor_notes', e.target.value)}
          placeholder={isReadOnly ? 'No supervisor feedback provided yet.' : 'Enter detailed evaluation, accomplishments, feedback, or PIP guidance...'}
          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-slate-50 disabled:text-slate-600"
        />
      </div>
    </div>
  );
}
