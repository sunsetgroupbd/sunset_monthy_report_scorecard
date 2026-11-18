'use client';

import React from 'react';
import { Briefcase, CreditCard, PieChart } from 'lucide-react';
import { formatBDT } from '@/lib/calculations';

interface PortfolioSnapshotProps {
  // EMI
  emiDueMonthly: number;
  emiClientCount: number;
  emiHoldCount: number;
  emiCancelCount: number;
  // TB
  tbDueAmount: number;
  tbClientCount: number;
  tbShareCount: number;
  tbHoldCount: number;
  tbCancelCount: number;
  onChange: (field: string, value: number) => void;
  disabled: boolean;
}

export default function PortfolioSnapshotCard({
  emiDueMonthly,
  emiClientCount,
  emiHoldCount,
  emiCancelCount,
  tbDueAmount,
  tbClientCount,
  tbShareCount,
  tbHoldCount,
  tbCancelCount,
  onChange,
  disabled
}: PortfolioSnapshotProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
        <Briefcase className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Portfolio Due Snapshot (Manual Entry)
          </h2>
          <p className="text-xs text-slate-500">
            Current outstanding dues, active client portfolio, hold, and cancellation status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EMI Portfolio */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">EMI Portfolio Snapshot</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
              {formatBDT(emiDueMonthly)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Monthly EMI Due (BDT)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                disabled={disabled}
                value={emiDueMonthly || ''}
                onChange={(e) => onChange('emi_due_monthly', parseFloat(e.target.value) || 0)}
                placeholder="৳ 0.00"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Client Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={emiClientCount || ''}
                onChange={(e) => onChange('emi_client_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Hold Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={emiHoldCount || ''}
                onChange={(e) => onChange('emi_hold_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Cancel Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={emiCancelCount || ''}
                onChange={(e) => onChange('emi_cancel_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* TB Portfolio */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">TB Portfolio Snapshot</h3>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-100/60 px-2.5 py-0.5 rounded-full">
              {formatBDT(tbDueAmount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                TB Due Amount (BDT)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                disabled={disabled}
                value={tbDueAmount || ''}
                onChange={(e) => onChange('tb_due_amount', parseFloat(e.target.value) || 0)}
                placeholder="৳ 0.00"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Client Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbClientCount || ''}
                onChange={(e) => onChange('tb_client_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Share Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbShareCount || ''}
                onChange={(e) => onChange('tb_share_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Hold Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbHoldCount || ''}
                onChange={(e) => onChange('tb_hold_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Cancel Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbCancelCount || ''}
                onChange={(e) => onChange('tb_cancel_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
