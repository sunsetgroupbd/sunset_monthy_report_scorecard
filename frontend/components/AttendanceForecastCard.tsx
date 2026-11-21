'use client';

import React from 'react';
import { Target, TrendingUp, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatBDT } from '@/lib/calculations';

interface AttendanceForecastProps {
  target: number;
  plannedLeave: number;
  unauthorizedLeave: number;
  predictionAmount: number;
  onChange: (field: string, value: number) => void;
  disabled: boolean;
}

export default function AttendanceForecastCard({
  target,
  plannedLeave,
  unauthorizedLeave,
  predictionAmount,
  onChange,
  disabled
}: AttendanceForecastProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm shadow-slate-200/50 p-6 sm:p-7 mb-6 transition-all">
      <div className="flex items-center space-x-2.5 pb-4 mb-5 border-b border-slate-100">
        <CalendarDays className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Monthly Target & Attendance Forecast
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Financial benchmarks and monthly leave planning
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dedicated Monthly Target (BDT) */}
        <div className="bg-gradient-to-b from-amber-50/70 to-amber-50/30 p-4 rounded-2xl border border-amber-200/80 shadow-2xs transition-all hover:border-amber-300">
          <label className="text-xs font-bold text-amber-950 block mb-1.5 flex items-center justify-between">
            <span>Target Benchmark</span>
            <Target className="w-4 h-4 text-amber-600" />
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-amber-600 pointer-events-none">
              ৳
            </span>
            <input
              type="number"
              min="0"
              step="5000"
              disabled={disabled}
              value={target || ''}
              onChange={(e) => onChange('target', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-white border border-amber-300/80 rounded-xl pl-7 pr-3 py-2 text-sm font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
            />
          </div>
          <span className="text-[11px] text-amber-900 font-bold mt-1.5 block">
            Target: {formatBDT(target)}
          </span>
        </div>

        {/* Prediction Amount (BDT) */}
        <div className="bg-gradient-to-b from-emerald-50/70 to-emerald-50/30 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs transition-all hover:border-emerald-300">
          <label className="text-xs font-bold text-emerald-950 block mb-1.5 flex items-center justify-between">
            <span>Prediction Amount</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-emerald-600 pointer-events-none">
              ৳
            </span>
            <input
              type="number"
              min="0"
              step="1000"
              disabled={disabled}
              value={predictionAmount || ''}
              onChange={(e) => onChange('prediction_amount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-white border border-emerald-300/80 rounded-xl pl-7 pr-3 py-2 text-sm font-black text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
            />
          </div>
          <span className="text-[11px] text-emerald-800 font-bold mt-1.5 block">
            Forecast: {formatBDT(predictionAmount)}
          </span>
        </div>

        {/* Planned Leave */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-2xs transition-all hover:border-slate-300">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
            <span>Planned Leave (Days)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            disabled={disabled}
            value={plannedLeave || ''}
            onChange={(e) => onChange('planned_leave', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
          />
          <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
            Pre-approved annual/casual leave
          </span>
        </div>

        {/* Unauthorized Leave */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-2xs transition-all hover:border-slate-300">
          <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
            <span>Unauthorized Leave (Days)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            disabled={disabled}
            value={unauthorizedLeave || ''}
            onChange={(e) => onChange('unauthorized_leave', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
          />
          <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">
            Unapproved absence days
          </span>
        </div>
      </div>
    </div>
  );
}
