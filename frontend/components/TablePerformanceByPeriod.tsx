'use client';

import React, { useState } from 'react';
import { PeriodItem, PeriodMetrics } from '@/types/scorecard';
import { 
  formatBDT, 
  formatNumber, 
  calculatePeriodTotalCollection,
  calculateTotalAchieved,
  calculateAchievementPct
} from '@/lib/calculations';
import { 
  Table, 
  LayoutList, 
  Sparkles, 
  Edit3, 
  Check, 
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface PerformanceByPeriodProps {
  periods: PeriodItem[];
  onChangePeriod: (index: number, field: keyof PeriodMetrics, value: any) => void;
  disabled: boolean;
}

const PERIOD_LABELS: Record<number, { title: string; subtitle: string }> = {
  0: { title: 'Monthly Target', subtitle: 'Target Metrics' },
  1: { title: 'Period 1', subtitle: 'Day 1–7' },
  2: { title: 'Period 2', subtitle: 'Day 8–14' },
  3: { title: 'Period 3', subtitle: 'Day 15–21' },
  4: { title: 'Period 4', subtitle: 'Day 22–28' },
  5: { title: 'Period 5', subtitle: 'Day 29–End' },
};

export default function TablePerformanceByPeriod({
  periods,
  onChangePeriod,
  disabled
}: PerformanceByPeriodProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: false, 3: false, 4: false, 5: false
  });
  const [overrideModalPeriod, setOverrideModalPeriod] = useState<number | null>(null);
  const [overrideInputVal, setOverrideInputVal] = useState<string>('');

  const targetPeriod = periods.find(p => p.period_index === 0);
  const achieved = calculateTotalAchieved(periods);
  const achievementPct = calculateAchievementPct(achieved, targetPeriod);

  const toggleCard = (idx: number) => {
    setExpandedCards(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const openOverrideDialog = (pIndex: number, currentOverride?: number | null, autoCalc?: number) => {
    setOverrideModalPeriod(pIndex);
    setOverrideInputVal(currentOverride !== null && currentOverride !== undefined ? String(currentOverride) : String(autoCalc || ''));
  };

  const handleApplyOverride = () => {
    if (overrideModalPeriod === null) return;
    const val = overrideInputVal === '' ? null : parseFloat(overrideInputVal);
    onChangePeriod(overrideModalPeriod, 'total_collection_override', isNaN(Number(val)) ? null : val);
    setOverrideModalPeriod(null);
  };

  const handleResetOverride = () => {
    if (overrideModalPeriod === null) return;
    onChangePeriod(overrideModalPeriod, 'total_collection_override', null);
    setOverrideModalPeriod(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      {/* Table Header and View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2">
          <Table className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Table 1: Weekly Activity (Day 1 – End of Month)
            </h2>
            <p className="text-xs text-slate-500">
              Weekly broken-down performance metrics, monthly target, achieved totals, and achievement %.
            </p>
          </div>
        </div>

        {/* View Toggle (Table / Card Mode for Mobile) */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Card Mode</span>
          </button>
        </div>
      </div>

      {/* OVERRIDE MODAL */}
      {overrideModalPeriod !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Manual Override: Total Collection
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {PERIOD_LABELS[overrideModalPeriod]?.title} ({PERIOD_LABELS[overrideModalPeriod]?.subtitle})
            </p>

            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Custom Collection Amount (BDT)
              </label>
              <input
                type="number"
                step="500"
                min="0"
                value={overrideInputVal}
                onChange={(e) => setOverrideInputVal(e.target.value)}
                placeholder="Enter custom total collection"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Calculated value: {formatBDT(
                  Number(periods.find(p => p.period_index === overrideModalPeriod)?.new_sales || 0) +
                  Number(periods.find(p => p.period_index === overrideModalPeriod)?.tb_amount || 0) +
                  Number(periods.find(p => p.period_index === overrideModalPeriod)?.emi_amount || 0)
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleResetOverride}
                className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset to Calc</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setOverrideModalPeriod(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyOverride}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                >
                  Apply Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. TABLE VIEW (Desktop / Tablet)                             */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto relative border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Category Super-header */}
              <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3 sticky left-0 z-20 bg-slate-100 min-w-[140px] border-r border-slate-200">
                  Period / Timeline
                </th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-slate-200 bg-emerald-50/70 text-emerald-900">
                  Financial Collections (BDT)
                </th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-slate-200 bg-blue-50/70 text-blue-900">
                  Lead Pipeline
                </th>
                <th colSpan={5} className="py-2 px-3 text-center bg-purple-50/70 text-purple-900">
                  Activity Metrics
                </th>
              </tr>

              {/* Sub-column Headers */}
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] whitespace-nowrap">
                <th className="py-2.5 px-3 sticky left-0 z-20 bg-slate-50 border-r border-slate-200">Period</th>
                {/* Financial */}
                <th className="py-2 px-2.5 min-w-[100px]">New Sales</th>
                <th className="py-2 px-2.5 min-w-[100px]">TB Amount</th>
                <th className="py-2 px-2.5 min-w-[100px]">EMI Amount</th>
                <th className="py-2 px-2.5 min-w-[130px] border-r border-slate-200 bg-emerald-50/40 text-emerald-950 font-bold">
                  Total Collection
                </th>
                {/* Leads */}
                <th className="py-2 px-2 text-center min-w-[60px]">Total</th>
                <th className="py-2 px-2 text-center min-w-[55px]">Fair</th>
                <th className="py-2 px-2 text-center min-w-[55px]">FB</th>
                <th className="py-2 px-2 text-center min-w-[50px] font-bold text-emerald-700">HP</th>
                <th className="py-2 px-2 text-center min-w-[50px] font-bold text-blue-700">P</th>
                <th className="py-2 px-2 text-center min-w-[50px] border-r border-slate-200 font-bold text-amber-700">FUP</th>
                {/* Activities */}
                <th className="py-2 px-2 text-center min-w-[60px]">Dialed</th>
                <th className="py-2 px-2 text-center min-w-[65px]">Connected</th>
                <th className="py-2 px-2 text-center min-w-[65px]">Outdoor</th>
                <th className="py-2 px-2 text-center min-w-[65px]">Indoor Cx</th>
                <th className="py-2 px-2 text-center min-w-[70px]">Mtg Hours</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Target Row (Index 0) */}
              {targetPeriod && (
                <tr className="bg-amber-50/40 text-slate-800 border-b-2 border-amber-200/80">
                  <td className="py-2.5 px-3 sticky left-0 z-10 bg-amber-50 font-bold text-amber-900 border-r border-amber-200">
                    <div>Monthly Target</div>
                    <div className="text-[10px] text-amber-700 font-normal">Monthly Benchmark</div>
                  </td>
                  {/* Financial inputs for Target */}
                  <td className="py-1 px-1.5">
                    <input
                      type="number"
                      step="500"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.new_sales || ''}
                      onChange={(e) => onChangePeriod(0, 'new_sales', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white/90 border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1.5">
                    <input
                      type="number"
                      step="500"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.tb_amount || ''}
                      onChange={(e) => onChangePeriod(0, 'tb_amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white/90 border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1.5">
                    <input
                      type="number"
                      step="500"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.emi_amount || ''}
                      onChange={(e) => onChangePeriod(0, 'emi_amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white/90 border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-emerald-900 bg-amber-100/40 border-r border-amber-200">
                    {formatBDT(calculatePeriodTotalCollection(targetPeriod))}
                  </td>

                  {/* Leads Inputs */}
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.total_leads || ''}
                      onChange={(e) => onChangePeriod(0, 'total_leads', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.fair_leads || ''}
                      onChange={(e) => onChangePeriod(0, 'fair_leads', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.fb_leads || ''}
                      onChange={(e) => onChangePeriod(0, 'fb_leads', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.hp || ''}
                      onChange={(e) => onChangePeriod(0, 'hp', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center text-emerald-700 font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.p || ''}
                      onChange={(e) => onChangePeriod(0, 'p', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center text-blue-700 font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1 border-r border-amber-200">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.fup || ''}
                      onChange={(e) => onChangePeriod(0, 'fup', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center text-amber-700 font-bold focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>

                  {/* Activity Inputs */}
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.dialed_calls || ''}
                      onChange={(e) => onChangePeriod(0, 'dialed_calls', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.connected_calls || ''}
                      onChange={(e) => onChangePeriod(0, 'connected_calls', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.outdoor_visits || ''}
                      onChange={(e) => onChangePeriod(0, 'outdoor_visits', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={targetPeriod.indoor_cx || ''}
                      onChange={(e) => onChangePeriod(0, 'indoor_cx', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-1 px-1">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      disabled={disabled}
                      value={targetPeriod.meeting_hours || ''}
                      onChange={(e) => onChangePeriod(0, 'meeting_hours', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white/90 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                </tr>
              )}

              {/* Weekly Periods (1 through 5) */}
              {[1, 2, 3, 4, 5].map((idx) => {
                const period = periods.find(p => p.period_index === idx) || { period_index: idx } as PeriodItem;
                const totalCol = calculatePeriodTotalCollection(period);
                const hasOverride = period.total_collection_override !== null && period.total_collection_override !== undefined;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Period Name */}
                    <td className="py-2.5 px-3 sticky left-0 z-10 bg-white hover:bg-slate-50 font-semibold text-slate-900 border-r border-slate-200">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>{PERIOD_LABELS[idx]?.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 pl-3.5">
                        {PERIOD_LABELS[idx]?.subtitle}
                      </div>
                    </td>

                    {/* Financial Fields */}
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        step="500"
                        min="0"
                        disabled={disabled}
                        value={period.new_sales || ''}
                        onChange={(e) => onChangePeriod(idx, 'new_sales', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        step="500"
                        min="0"
                        disabled={disabled}
                        value={period.tb_amount || ''}
                        onChange={(e) => onChangePeriod(idx, 'tb_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        step="500"
                        min="0"
                        disabled={disabled}
                        value={period.emi_amount || ''}
                        onChange={(e) => onChangePeriod(idx, 'emi_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    {/* Live Total Collection with Override Button */}
                    <td className="py-1.5 px-2 text-right border-r border-slate-200 bg-emerald-50/20 font-bold">
                      <div className="flex items-center justify-end space-x-1.5">
                        <span className={hasOverride ? 'text-amber-800' : 'text-emerald-800'}>
                          {formatBDT(totalCol)}
                        </span>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => openOverrideDialog(idx, period.total_collection_override, totalCol)}
                            title={hasOverride ? 'Manually Overridden - click to edit or reset' : 'Click to manually override'}
                            className={`p-1 rounded transition ${
                              hasOverride ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {hasOverride && (
                        <span className="text-[9px] text-amber-700 font-semibold block">
                          Overridden
                        </span>
                      )}
                    </td>

                    {/* Leads Fields */}
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.total_leads || ''}
                        onChange={(e) => onChangePeriod(idx, 'total_leads', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.fair_leads || ''}
                        onChange={(e) => onChangePeriod(idx, 'fair_leads', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.fb_leads || ''}
                        onChange={(e) => onChangePeriod(idx, 'fb_leads', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.hp || ''}
                        onChange={(e) => onChangePeriod(idx, 'hp', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center text-emerald-700 font-bold focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.p || ''}
                        onChange={(e) => onChangePeriod(idx, 'p', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center text-blue-700 font-bold focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.fup || ''}
                        onChange={(e) => onChangePeriod(idx, 'fup', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center text-amber-700 font-bold focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Activity Fields */}
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.dialed_calls || ''}
                        onChange={(e) => onChangePeriod(idx, 'dialed_calls', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.connected_calls || ''}
                        onChange={(e) => onChangePeriod(idx, 'connected_calls', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.outdoor_visits || ''}
                        onChange={(e) => onChangePeriod(idx, 'outdoor_visits', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.indoor_cx || ''}
                        onChange={(e) => onChangePeriod(idx, 'indoor_cx', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        disabled={disabled}
                        value={period.meeting_hours || ''}
                        onChange={(e) => onChangePeriod(idx, 'meeting_hours', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                  </tr>
                );
              })}

              {/* --------------------------------------------------------- */}
              {/* SUMMARY ROW 1: TOTAL ACHIEVED (Sum of Periods 1 to 5)    */}
              {/* --------------------------------------------------------- */}
              <tr className="bg-emerald-50/70 border-t-2 border-emerald-300 font-bold text-slate-900">
                <td className="py-2.5 px-3 sticky left-0 z-10 bg-emerald-100 text-emerald-950 font-extrabold border-r border-emerald-300">
                  <div>Total Achieved</div>
                  <div className="text-[10px] text-emerald-800 font-normal">Sum of Periods 1–5</div>
                </td>
                <td className="py-2.5 px-2.5 text-right font-extrabold text-slate-900">
                  {formatBDT(achieved.new_sales)}
                </td>
                <td className="py-2.5 px-2.5 text-right font-extrabold text-slate-900">
                  {formatBDT(achieved.tb_amount)}
                </td>
                <td className="py-2.5 px-2.5 text-right font-extrabold text-slate-900">
                  {formatBDT(achieved.emi_amount)}
                </td>
                <td className="py-2.5 px-2.5 text-right font-extrabold text-emerald-900 bg-emerald-100/60 border-r border-emerald-300">
                  {formatBDT(achieved.total_collection)}
                </td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.total_leads)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.fair_leads)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.fb_leads)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold text-emerald-700">{formatNumber(achieved.hp)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold text-blue-700">{formatNumber(achieved.p)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold text-amber-700 border-r border-emerald-300">{formatNumber(achieved.fup)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.dialed_calls)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.connected_calls)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.outdoor_visits)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.indoor_cx)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{achieved.meeting_hours} hrs</td>
              </tr>

              {/* --------------------------------------------------------- */}
              {/* SUMMARY ROW 2: ACHIEVEMENT % (Achieved / Target * 100)    */}
              {/* --------------------------------------------------------- */}
              <tr className="bg-slate-100/80 font-extrabold text-slate-800 border-t border-slate-200">
                <td className="py-2.5 px-3 sticky left-0 z-10 bg-slate-200 text-slate-900 border-r border-slate-300">
                  <div>Achievement %</div>
                  <div className="text-[10px] text-slate-600 font-normal">Achieved ÷ Target</div>
                </td>
                <td className="py-2 px-2.5 text-right font-extrabold text-emerald-800">{achievementPct.new_sales}%</td>
                <td className="py-2 px-2.5 text-right font-extrabold text-emerald-800">{achievementPct.tb_amount}%</td>
                <td className="py-2 px-2.5 text-right font-extrabold text-emerald-800">{achievementPct.emi_amount}%</td>
                <td className="py-2 px-2.5 text-right font-extrabold text-emerald-950 bg-emerald-200/50 border-r border-slate-300">
                  {achievementPct.total_collection}%
                </td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.total_leads}%</td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.fair_leads}%</td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.fb_leads}%</td>
                <td className="py-2 px-2 text-center font-extrabold text-emerald-700">{achievementPct.hp}%</td>
                <td className="py-2 px-2 text-center font-extrabold text-blue-700">{achievementPct.p}%</td>
                <td className="py-2 px-2 text-center font-extrabold text-amber-700 border-r border-slate-300">{achievementPct.fup}%</td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.dialed_calls}%</td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.connected_calls}%</td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.outdoor_visits}%</td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.indoor_cx}%</td>
                <td className="py-2 px-2 text-center font-extrabold">{achievementPct.meeting_hours}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* 2. CARD MODE (Expandable period cards for mobile)            */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const period = periods.find(p => p.period_index === idx) || { period_index: idx } as PeriodItem;
            const totalCol = calculatePeriodTotalCollection(period);
            const isTarget = idx === 0;
            const isExpanded = expandedCards[idx] ?? false;

            return (
              <div 
                key={idx} 
                className={`rounded-xl border ${
                  isTarget ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white'
                } shadow-xs overflow-hidden`}
              >
                <div 
                  onClick={() => toggleCard(idx)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/60 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${isTarget ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {PERIOD_LABELS[idx]?.title} ({PERIOD_LABELS[idx]?.subtitle})
                      </h4>
                      <span className="text-xs text-slate-500">
                        Total Collection: <span className="font-bold text-emerald-800">{formatBDT(totalCol)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {period.total_collection_override !== null && period.total_collection_override !== undefined && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        Overridden
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-slate-100 space-y-4">
                    {/* Financial Fields */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                        Financial Collections (BDT)
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">New Sales</label>
                          <input
                            type="number"
                            step="500"
                            disabled={disabled}
                            value={period.new_sales || ''}
                            onChange={(e) => onChangePeriod(idx, 'new_sales', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">TB Amount</label>
                          <input
                            type="number"
                            step="500"
                            disabled={disabled}
                            value={period.tb_amount || ''}
                            onChange={(e) => onChangePeriod(idx, 'tb_amount', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">EMI Amount</label>
                          <input
                            type="number"
                            step="500"
                            disabled={disabled}
                            value={period.emi_amount || ''}
                            onChange={(e) => onChangePeriod(idx, 'emi_amount', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-emerald-950">Total Collection</label>
                            {!disabled && (
                              <button
                                type="button"
                                onClick={() => openOverrideDialog(idx, period.total_collection_override, totalCol)}
                                className="text-[10px] text-emerald-700 underline font-semibold"
                              >
                                Override
                              </button>
                            )}
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-900">
                            {formatBDT(totalCol)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Leads Fields */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2">
                        Lead Pipeline
                      </h5>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">Total Leads</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.total_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'total_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">Fair Leads</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.fair_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'fair_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">FB Leads</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.fb_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'fb_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-emerald-700 block">HP</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.hp || ''}
                            onChange={(e) => onChangePeriod(idx, 'hp', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center font-bold text-emerald-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-blue-700 block">P</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.p || ''}
                            onChange={(e) => onChangePeriod(idx, 'p', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center font-bold text-blue-700"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-amber-700 block">FUP</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.fup || ''}
                            onChange={(e) => onChangePeriod(idx, 'fup', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center font-bold text-amber-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Activity Fields */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
                        Activity Metrics
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">Dialed</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.dialed_calls || ''}
                            onChange={(e) => onChangePeriod(idx, 'dialed_calls', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">Connected</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.connected_calls || ''}
                            onChange={(e) => onChangePeriod(idx, 'connected_calls', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">Outdoor Visits</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.outdoor_visits || ''}
                            onChange={(e) => onChangePeriod(idx, 'outdoor_visits', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">Indoor Cx</label>
                          <input
                            type="number"
                            disabled={disabled}
                            value={period.indoor_cx || ''}
                            onChange={(e) => onChangePeriod(idx, 'indoor_cx', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-slate-600 block">Meeting Hrs</label>
                          <input
                            type="number"
                            step="0.5"
                            disabled={disabled}
                            value={period.meeting_hours || ''}
                            onChange={(e) => onChangePeriod(idx, 'meeting_hours', parseFloat(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
