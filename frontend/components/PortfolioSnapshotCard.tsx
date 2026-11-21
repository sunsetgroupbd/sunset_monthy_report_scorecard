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
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm shadow-slate-200/50 p-6 sm:p-7 mb-6 transition-all">
      <div className="flex items-center space-x-2.5 pb-4 mb-5 border-b border-slate-100">
        <Briefcase className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Portfolio Due Snapshot (Manual Entry)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Outstanding dues, active client portfolio, hold, and cancellation status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* EMI Portfolio */}
        <div className="bg-gradient-to-b from-slate-50/90 to-slate-50/50 p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">EMI Portfolio Snapshot</h3>
            </div>
            <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
              {formatBDT(emiDueMonthly)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
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
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Client Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={emiClientCount || ''}
                onChange={(e) => onChange('emi_client_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hold Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={emiHoldCount || ''}
                onChange={(e) => onChange('emi_hold_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cancel Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={emiCancelCount || ''}
                onChange={(e) => onChange('emi_cancel_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-sm font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* TB Portfolio */}
        <div className="bg-gradient-to-b from-slate-50/90 to-slate-50/50 p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Token to Booking (TB) Snapshot</h3>
            </div>
            <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
              {formatBDT(tbDueAmount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
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
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                TB Client Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbClientCount || ''}
                onChange={(e) => onChange('tb_client_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                TB Share Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbShareCount || ''}
                onChange={(e) => onChange('tb_share_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                TB Hold Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbHoldCount || ''}
                onChange={(e) => onChange('tb_hold_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                TB Cancel Count
              </label>
              <input
                type="number"
                min="0"
                disabled={disabled}
                value={tbCancelCount || ''}
                onChange={(e) => onChange('tb_cancel_count', parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-sm font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
