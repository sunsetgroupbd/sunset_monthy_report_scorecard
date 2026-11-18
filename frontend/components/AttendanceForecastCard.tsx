'use client';

import React from 'react';
import { Clock, TrendingUp, CalendarDays } from 'lucide-react';
import { formatBDT } from '@/lib/calculations';

interface AttendanceForecastProps {
  plannedLeave: number;
  unauthorizedLeave: number;
  workingDays: number;
  predictionAmount: number;
  onChange: (field: string, value: number) => void;
  disabled: boolean;
}

export default function AttendanceForecastCard({
  plannedLeave,
  unauthorizedLeave,
  workingDays,
  predictionAmount,
  onChange,
  disabled
}: AttendanceForecastProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
        <CalendarDays className="w-5 h-5 text-emerald-600" />
        <h2 className="text-base font-bold text-slate-800">
          Attendance & Monthly Sales Forecast
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Working Days */}
        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Working Days
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            disabled={disabled}
            value={workingDays || ''}
            onChange={(e) => onChange('working_days', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Expected business days in month</span>
        </div>

        {/* Planned Leave */}
        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Planned Leave
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            disabled={disabled}
            value={plannedLeave || ''}
            onChange={(e) => onChange('planned_leave', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Pre-approved annual or casual leave</span>
        </div>

        {/* Unauthorized Leave */}
        <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <label className="text-xs font-semibold text-slate-600 block mb-1">
            Unauthorized Leave
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            disabled={disabled}
            value={unauthorizedLeave || ''}
            onChange={(e) => onChange('unauthorized_leave', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Unapproved absence days</span>
        </div>

        {/* Prediction Amount (BDT) */}
        <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80">
          <label className="text-xs font-bold text-emerald-900 block mb-1 flex items-center justify-between">
            <span>Prediction Amount (BDT)</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            disabled={disabled}
            value={predictionAmount || ''}
            onChange={(e) => onChange('prediction_amount', parseFloat(e.target.value) || 0)}
            placeholder="৳ 0.00"
            className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <span className="text-[10px] text-emerald-700/80 mt-1 font-semibold block">
            Current: {formatBDT(predictionAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
