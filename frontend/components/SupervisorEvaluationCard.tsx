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
    <div id="supervisor-evaluation-card" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm shadow-slate-200/50 p-6 sm:p-7 mb-6 scroll-mt-20 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-5 border-b border-slate-100 gap-2.5">
        <div className="flex items-center space-x-2.5">
          <Award className="w-5 h-5 text-purple-600" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Supervisor Evaluation & Quality Scoring
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Sheet score, call audit score, and overall marking evaluation
            </p>
          </div>
        </div>
        {canEditSupervisorFields ? (
          <span className="inline-flex items-center text-xs font-bold text-purple-800 bg-purple-50 border border-purple-200/80 px-3 py-1 rounded-full shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
            Authorized Evaluator Mode
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-semibold text-slate-500 bg-slate-100/80 border border-slate-200 px-3 py-1 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Supervisor Restricted Fields (View Only)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Sheet Score */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-2xs transition-all hover:border-slate-300">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Sheet Score
          </label>
          <input
            type="number"
            step="0.5"
            disabled={isReadOnly}
            value={sheetScore ?? ''}
            onChange={(e) => onChange('sheet_score', e.target.value === '' ? null : parseFloat(e.target.value))}
            placeholder={isReadOnly ? 'Pending' : 'Enter score'}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
          />
          <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
            Lead & customer documentation score
          </span>
        </div>

        {/* Call Score */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-2xs transition-all hover:border-slate-300">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Call Score
          </label>
          <input
            type="number"
            step="0.5"
            disabled={isReadOnly}
            value={callScore ?? ''}
            onChange={(e) => onChange('call_score', e.target.value === '' ? null : parseFloat(e.target.value))}
            placeholder={isReadOnly ? 'Pending' : 'Enter score'}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
          />
          <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
            Audited conversation & follow-up rating
          </span>
        </div>

        {/* Overall Marking (0-100) */}
        <div className="bg-gradient-to-b from-purple-50/80 to-purple-50/30 p-4 rounded-2xl border border-purple-200/80 shadow-2xs transition-all hover:border-purple-300">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-purple-950">
              Overall Marking (0–100)
            </label>
            {marking !== null && marking !== undefined && (
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border shadow-2xs font-mono ${
                marking >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                marking >= 60 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-rose-100 text-rose-800 border-rose-200'
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
            className="w-full bg-white border border-purple-300/80 rounded-xl px-3 py-2 text-sm font-black text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
          />
          <span className="text-[10px] text-purple-700/80 font-bold mt-1.5 block">
            Monthly supervisor evaluation rating
          </span>
        </div>
      </div>

      {/* Supervisor Notes */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center space-x-1.5">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span>Supervisor Feedback & Coaching Notes</span>
        </label>
        <textarea
          rows={2}
          disabled={isReadOnly}
          value={supervisorNotes || ''}
          onChange={(e) => onChange('supervisor_notes', e.target.value)}
          placeholder={isReadOnly ? 'No notes added yet.' : 'Enter detailed coaching comments, monthly review notes, and performance feedback...'}
          className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:bg-slate-100 disabled:text-slate-500 transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
