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
  ChevronDown, 
  ChevronUp,
  Target
} from 'lucide-react';

interface PerformanceByPeriodProps {
  periods: PeriodItem[];
  onChangePeriod: (index: number, field: keyof PeriodMetrics, value: any) => void;
  disabled: boolean;
}

const PERIOD_LABELS: Record<number, { title: string; subtitle: string }> = {
  0: { title: 'TG', subtitle: 'Monthly Benchmark' },
  1: { title: 'Till 5th', subtitle: 'Day 1–5' },
  2: { title: 'Till 10th', subtitle: 'Day 6–10' },
  3: { title: 'Till 15th', subtitle: 'Day 11–15' },
  4: { title: 'Till 20th', subtitle: 'Day 16–20' },
  5: { title: 'Till 25th', subtitle: 'Day 21–25' },
  6: { title: 'Till 30/31st', subtitle: 'Day 26–End' },
};

export default function TablePerformanceByPeriod({
  periods,
  onChangePeriod,
  disabled
}: PerformanceByPeriodProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: false, 3: false, 4: false, 5: false, 6: false
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
              Table 1: Monthly Performance & Activity Tracking
            </h2>
            <p className="text-xs text-slate-500">
              Checkpoint performance metrics (Till 5th to Till 30/31st) and Achieved Totals.
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
                type="button"
                onClick={handleResetOverride}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Reset to Auto
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalPeriod(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyOverride}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. TABLE VIEW WITH HORIZONTAL SCROLL & STICKY COLUMN         */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto relative border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Category Grouping Headers */}
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-extrabold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="py-2 px-3 sticky left-0 z-30 bg-slate-100 border-r border-slate-200">
                  Checkpoint
                </th>
                <th colSpan={4} className="py-2 px-3 text-center border-r border-slate-200 bg-emerald-50/70 text-emerald-900">
                  Financial Performance & Collections (BDT)
                </th>
                <th colSpan={6} className="py-2 px-3 text-center border-r border-slate-200 bg-blue-50/70 text-blue-900">
                  Lead Pipeline
                </th>
                <th colSpan={5} className="py-2 px-3 text-center border-r border-slate-200 bg-purple-50/70 text-purple-900">
                  Activity Metrics
                </th>
                <th colSpan={3} className="py-2 px-3 text-center bg-amber-50/70 text-amber-900">
                  Conversion Results
                </th>
              </tr>

              {/* Sub-column Headers */}
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px] whitespace-nowrap">
                <th className="py-2.5 px-3 sticky left-0 z-20 bg-slate-50 border-r border-slate-200">Period</th>
                <th className="py-2 px-2.5 min-w-[100px]">New Sales</th>
                <th className="py-2 px-2.5 min-w-[105px]">Token / Booking</th>
                <th className="py-2 px-2.5 min-w-[95px]">EMI</th>
                <th className="py-2 px-2.5 min-w-[125px] border-r border-slate-200 bg-emerald-50/40 text-emerald-950 font-bold">
                  Total Collection
                </th>
                {/* Leads (Total Lead added between EMI/Total Collection and Current Fair Lead) */}
                <th className="py-2 px-2 text-center min-w-[65px] font-bold text-indigo-900 bg-indigo-50/50">Total Lead</th>
                <th className="py-2 px-2 text-center min-w-[60px]">Current Fair Lead</th>
                <th className="py-2 px-2 text-center min-w-[60px]">Current FB Leads</th>
                <th className="py-2 px-2 text-center min-w-[50px] font-bold text-emerald-700">HP</th>
                <th className="py-2 px-2 text-center min-w-[50px] font-bold text-blue-700">P</th>
                <th className="py-2 px-2 text-center min-w-[50px] border-r border-slate-200 font-bold text-amber-700">Fup</th>
                {/* Activities (Connected removed) */}
                <th className="py-2 px-2 text-center min-w-[65px]">Calls Dialed</th>
                <th className="py-2 px-2 text-center min-w-[50px]">Hold</th>
                <th className="py-2 px-2 text-center min-w-[55px]">Cancel</th>
                <th className="py-2 px-2 text-center min-w-[60px]">In Done</th>
                <th className="py-2 px-2 text-center min-w-[60px] border-r border-slate-200">Out Done</th>
                {/* Results (Sold Leads Breakdown) */}
                <th className="py-2 px-2 text-center min-w-[65px]">Sold Fair</th>
                <th className="py-2 px-2 text-center min-w-[65px]">Sold FB</th>
                <th className="py-2 px-2 text-center min-w-[70px]">Sold Other</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {/* Checkpoint Rows: 1=Till 5th, 2=Till 10th, 3=Till 15th, 4=Till 20th, 5=Till 25th, 6=Till 30/31st */}
              {[1, 2, 3, 4, 5, 6].map((idx) => {
                const period = periods.find(p => p.period_index === idx) || { period_index: idx } as PeriodItem;
                const totalCol = calculatePeriodTotalCollection(period);
                const hasOverride = period.total_collection_override !== null && period.total_collection_override !== undefined;

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Period Label (Sticky) */}
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
                            className={`p-1 rounded transition cursor-pointer ${
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

                    {/* Total Lead added between EMI/Total Collection and Current Fair Lead */}
                    <td className="py-2 px-1 text-center font-bold text-slate-800 bg-slate-50 font-mono">
                      {((period.fair_leads || 0) + (period.fb_leads || 0)) || '0'}
                    </td>

                    {/* Leads Fields */}
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
                        value={period.hold || ''}
                        onChange={(e) => onChangePeriod(idx, 'hold', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.cancel || ''}
                        onChange={(e) => onChangePeriod(idx, 'cancel', parseInt(e.target.value, 10) || 0)}
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
                    <td className="py-1 px-1 border-r border-slate-200">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.outdoor_visits || ''}
                        onChange={(e) => onChangePeriod(idx, 'outdoor_visits', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Results Fields */}
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.sold_fair_leads || ''}
                        onChange={(e) => onChangePeriod(idx, 'sold_fair_leads', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.sold_fb_leads || ''}
                        onChange={(e) => onChangePeriod(idx, 'sold_fb_leads', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                    <td className="py-1 px-1">
                      <input
                        type="number"
                        min="0"
                        disabled={disabled}
                        value={period.sold_other_leads || ''}
                        onChange={(e) => onChangePeriod(idx, 'sold_other_leads', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>
                  </tr>
                );
              })}

              {/* --------------------------------------------------------- */}
              {/* SUMMARY ROW: TOTAL ACHIEVED (Sum of Checkpoints 1–6)      */}
              {/* --------------------------------------------------------- */}
              <tr className="bg-emerald-50/70 border-t-2 border-emerald-300 font-bold text-slate-900">
                <td className="py-2.5 px-3 sticky left-0 z-10 bg-emerald-100 text-emerald-950 font-extrabold border-r border-emerald-300">
                  <div>Total Achieved</div>
                  <div className="text-[10px] text-emerald-800 font-normal">Sum of Checkpoints 1–6</div>
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
                {/* Total Lead Summary */}
                <td className="py-2.5 px-2 text-center font-extrabold text-indigo-900 bg-indigo-50 font-mono">
                  {formatNumber(achieved.fair_leads + achieved.fb_leads)}
                </td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.fair_leads)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.fb_leads)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold text-emerald-700">{formatNumber(achieved.hp)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold text-blue-700">{formatNumber(achieved.p)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold text-amber-700 border-r border-emerald-300">{formatNumber(achieved.fup)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.dialed_calls)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.hold)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.cancel)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.indoor_cx)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold border-r border-emerald-300">{formatNumber(achieved.outdoor_visits)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.sold_fair_leads)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.sold_fb_leads)}</td>
                <td className="py-2.5 px-2 text-center font-extrabold">{formatNumber(achieved.sold_other_leads)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* 2. CARD MODE (Expandable period cards for mobile)            */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => {
            const period = periods.find(p => p.period_index === idx) || { period_index: idx } as PeriodItem;
            const totalCol = calculatePeriodTotalCollection(period);
            const isExpanded = expandedCards[idx] ?? false;

            return (
              <div 
                key={idx} 
                className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden"
              >
                <div 
                  onClick={() => toggleCard(idx)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none bg-slate-50/60 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">New Sales</label>
                          <input
                            type="number"
                            step="500"
                            min="0"
                            disabled={disabled}
                            value={period.new_sales || ''}
                            onChange={(e) => onChangePeriod(idx, 'new_sales', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Token / Booking</label>
                          <input
                            type="number"
                            step="500"
                            min="0"
                            disabled={disabled}
                            value={period.tb_amount || ''}
                            onChange={(e) => onChangePeriod(idx, 'tb_amount', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">EMI</label>
                          <input
                            type="number"
                            step="500"
                            min="0"
                            disabled={disabled}
                            value={period.emi_amount || ''}
                            onChange={(e) => onChangePeriod(idx, 'emi_amount', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Leads Fields */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          Lead Pipeline
                        </h5>
                        <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Total Lead: {((period.fair_leads || 0) + (period.fb_leads || 0)) || '0'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Fair Leads</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.fair_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'fair_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">FB Leads</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.fb_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'fb_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-emerald-700 block mb-1">HP</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.hp || ''}
                            onChange={(e) => onChangePeriod(idx, 'hp', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center text-emerald-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-blue-700 block mb-1">P</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.p || ''}
                            onChange={(e) => onChangePeriod(idx, 'p', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center text-blue-700 font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-amber-700 block mb-1">Fup</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.fup || ''}
                            onChange={(e) => onChangePeriod(idx, 'fup', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center text-amber-700 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Activity Fields */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
                        Activity & Conversion
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Calls Dialed</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.dialed_calls || ''}
                            onChange={(e) => onChangePeriod(idx, 'dialed_calls', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Hold</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.hold || ''}
                            onChange={(e) => onChangePeriod(idx, 'hold', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Cancel</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.cancel || ''}
                            onChange={(e) => onChangePeriod(idx, 'cancel', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sold Fair</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.sold_fair_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'sold_fair_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sold FB</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.sold_fb_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'sold_fb_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Sold Other</label>
                          <input
                            type="number"
                            min="0"
                            disabled={disabled}
                            value={period.sold_other_leads || ''}
                            onChange={(e) => onChangePeriod(idx, 'sold_other_leads', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-center"
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
