'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchScorecard } from '@/lib/api/scorecard';
import { ScorecardResponse } from '@/types/scorecard';
import { 
  formatBDT, 
  formatNumber, 
  calculatePeriodTotalCollection, 
  calculateTotalAchieved, 
  calculateAchievementPct,
  calculateCustomerTotalCollection,
  calculateCustomerSummary
} from '@/lib/calculations';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PERIOD_LABELS: Record<number, string> = {
  0: 'Target',
  1: 'P1 (1–7)',
  2: 'P2 (8–14)',
  3: 'P3 (15–21)',
  4: 'P4 (22–28)',
  5: 'P5 (29–End)',
};

function ScorecardPrintContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employee_id') || '';
  const month = searchParams.get('month') || '';

  const [scorecard, setScorecard] = useState<ScorecardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (employeeId && month) {
        try {
          const data = await fetchScorecard(employeeId, month);
          setScorecard(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [employeeId, month]);

  if (loading || !scorecard) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading printable scorecard...
      </div>
    );
  }

  const targetPeriod = scorecard.periods.find(p => p.period_index === 0);
  const achieved = calculateTotalAchieved(scorecard.periods);
  const achievementPct = calculateAchievementPct(achieved, targetPeriod);
  const custSummary = calculateCustomerSummary(scorecard.customers);
  const employee = scorecard.employee;

  return (
    <div className="max-w-[297mm] mx-auto bg-white text-slate-900 p-4 sm:p-6 print:p-0">
      {/* Print Trigger & Back Bar (Hidden during actual print) */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 print:hidden">
        <Link
          href={`/manual-scorecard?employee_id=${employeeId}&month=${month}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interactive Editor</span>
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF (A4 Landscape)</span>
        </button>
      </div>

      {/* Formal Executive Print Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
              Manual Monthly Performance Scorecard
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Official Performance Appraisal & Customer Collection Document • Month: <span className="font-bold text-slate-900">{scorecard.month}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-900 bg-slate-50">
              Status: {scorecard.status}
            </span>
            <div className="text-[9px] text-slate-400 mt-1">Generated: {new Date().toLocaleDateString('en-GB')} (Dhaka)</div>
          </div>
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-6 gap-2 mt-3 pt-2 border-t border-slate-200 text-[11px]">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Employee</span>
            <span className="font-bold text-slate-900">{employee?.full_name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">ID</span>
            <span className="font-mono font-bold text-emerald-800">{employee?.employee_id}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Designation</span>
            <span>{employee?.designation}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Team</span>
            <span>{employee?.team?.name || 'Dhaka Team'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Joining Date</span>
            <span>{employee?.joining_date}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Role</span>
            <span className="font-bold">{employee?.role}</span>
          </div>
        </div>
      </div>

      {/* Attendance & Forecast Bar */}
      <div className="grid grid-cols-4 gap-2 mb-3 bg-slate-50 p-2 rounded border border-slate-200 text-[10px]">
        <div>
          <span className="text-slate-500 font-semibold">Working Days:</span>{' '}
          <span className="font-bold text-slate-900">{scorecard.working_days} days</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Planned Leave:</span>{' '}
          <span className="font-bold text-slate-900">{scorecard.planned_leave} days</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Unauthorized Leave:</span>{' '}
          <span className="font-bold text-rose-700">{scorecard.unauthorized_leave} days</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold">Sales Prediction:</span>{' '}
          <span className="font-bold text-emerald-800">{formatBDT(scorecard.prediction_amount)}</span>
        </div>
      </div>

      {/* TABLE 1: PERFORMANCE BY PERIOD */}
      <div className="mb-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
          Table 1: Weekly Period Breakdown & Achievements
        </h2>
        <table className="w-full border-collapse border border-slate-300 text-[9px]">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-center">
              <th className="border border-slate-300 p-1 text-left">Period</th>
              <th className="border border-slate-300 p-1">New Sales</th>
              <th className="border border-slate-300 p-1">TB Amount</th>
              <th className="border border-slate-300 p-1">EMI Amount</th>
              <th className="border border-slate-300 p-1 bg-emerald-100/70 text-emerald-950">Total Collection</th>
              <th className="border border-slate-300 p-1">Total Lds</th>
              <th className="border border-slate-300 p-1">Fair</th>
              <th className="border border-slate-300 p-1">FB</th>
              <th className="border border-slate-300 p-1">HP</th>
              <th className="border border-slate-300 p-1">P</th>
              <th className="border border-slate-300 p-1">FUP</th>
              <th className="border border-slate-300 p-1">Dialed</th>
              <th className="border border-slate-300 p-1">Connected</th>
              <th className="border border-slate-300 p-1">Outdoor</th>
              <th className="border border-slate-300 p-1">Indoor</th>
              <th className="border border-slate-300 p-1">Hours</th>
            </tr>
          </thead>
          <tbody>
            {targetPeriod && (
              <tr className="bg-amber-50/60 font-semibold">
                <td className="border border-slate-300 p-1 font-bold text-amber-900">Target</td>
                <td className="border border-slate-300 p-1 text-right">{formatNumber(targetPeriod.new_sales)}</td>
                <td className="border border-slate-300 p-1 text-right">{formatNumber(targetPeriod.tb_amount)}</td>
                <td className="border border-slate-300 p-1 text-right">{formatNumber(targetPeriod.emi_amount)}</td>
                <td className="border border-slate-300 p-1 text-right font-bold text-emerald-900 bg-amber-100/40">{formatBDT(calculatePeriodTotalCollection(targetPeriod))}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.total_leads}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.fair_leads}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.fb_leads}</td>
                <td className="border border-slate-300 p-1 text-center font-bold">{targetPeriod.hp}</td>
                <td className="border border-slate-300 p-1 text-center font-bold">{targetPeriod.p}</td>
                <td className="border border-slate-300 p-1 text-center font-bold">{targetPeriod.fup}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.dialed_calls}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.connected_calls}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.outdoor_visits}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.indoor_cx}</td>
                <td className="border border-slate-300 p-1 text-center">{targetPeriod.meeting_hours}</td>
              </tr>
            )}

            {[1, 2, 3, 4, 5].map((idx) => {
              const p = scorecard.periods.find(item => item.period_index === idx) || {} as any;
              const tc = calculatePeriodTotalCollection(p);
              return (
                <tr key={idx} className="text-slate-800">
                  <td className="border border-slate-300 p-1 font-medium">{PERIOD_LABELS[idx]}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(p.new_sales)}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(p.tb_amount)}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(p.emi_amount)}</td>
                  <td className="border border-slate-300 p-1 text-right font-bold text-emerald-900">{formatBDT(tc)}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.total_leads || 0}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.fair_leads || 0}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.fb_leads || 0}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{p.hp || 0}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{p.p || 0}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{p.fup || 0}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.dialed_calls || 0}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.connected_calls || 0}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.outdoor_visits || 0}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.indoor_cx || 0}</td>
                  <td className="border border-slate-300 p-1 text-center">{p.meeting_hours || 0}</td>
                </tr>
              );
            })}

            <tr className="bg-emerald-100/70 font-extrabold text-slate-950 border-t-2 border-slate-400">
              <td className="border border-slate-300 p-1 uppercase">Total Achieved</td>
              <td className="border border-slate-300 p-1 text-right">{formatBDT(achieved.new_sales)}</td>
              <td className="border border-slate-300 p-1 text-right">{formatBDT(achieved.tb_amount)}</td>
              <td className="border border-slate-300 p-1 text-right">{formatBDT(achieved.emi_amount)}</td>
              <td className="border border-slate-300 p-1 text-right font-extrabold text-emerald-950">{formatBDT(achieved.total_collection)}</td>
              <td className="border border-slate-300 p-1 text-center">{formatNumber(achieved.total_leads)}</td>
              <td className="border border-slate-300 p-1 text-center">{formatNumber(achieved.fair_leads)}</td>
              <td className="border border-slate-300 p-1 text-center">{formatNumber(achieved.fb_leads)}</td>
              <td className="border border-slate-300 p-1 text-center font-bold">{formatNumber(achieved.hp)}</td>
              <td className="border border-slate-300 p-1 text-center font-bold">{formatNumber(achieved.p)}</td>
              <td className="border border-slate-300 p-1 text-center font-bold">{formatNumber(achieved.fup)}</td>
              <td className="border border-slate-300 p-1 text-center">{formatNumber(achieved.dialed_calls)}</td>
              <td className="border border-slate-300 p-1 text-center">{formatNumber(achieved.connected_calls)}</td>
              <td className="border border-slate-300 p-1 text-center">{formatNumber(achieved.outdoor_visits)}</td>
              <td className="border border-slate-300 p-1 text-center">{formatNumber(achieved.indoor_cx)}</td>
              <td className="border border-slate-300 p-1 text-center">{achieved.meeting_hours} hrs</td>
            </tr>

            <tr className="bg-slate-100 font-extrabold text-slate-800">
              <td className="border border-slate-300 p-1 uppercase">Achievement %</td>
              <td className="border border-slate-300 p-1 text-right text-emerald-800">{achievementPct.new_sales}%</td>
              <td className="border border-slate-300 p-1 text-right text-emerald-800">{achievementPct.tb_amount}%</td>
              <td className="border border-slate-300 p-1 text-right text-emerald-800">{achievementPct.emi_amount}%</td>
              <td className="border border-slate-300 p-1 text-right font-extrabold text-emerald-950">{achievementPct.total_collection}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.total_leads}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.fair_leads}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.fb_leads}%</td>
              <td className="border border-slate-300 p-1 text-center font-bold">{achievementPct.hp}%</td>
              <td className="border border-slate-300 p-1 text-center font-bold">{achievementPct.p}%</td>
              <td className="border border-slate-300 p-1 text-center font-bold">{achievementPct.fup}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.dialed_calls}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.connected_calls}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.outdoor_visits}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.indoor_cx}%</td>
              <td className="border border-slate-300 p-1 text-center">{achievementPct.meeting_hours}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TABLE 2: CUSTOMER COLLECTION PLAN */}
      <div className="mb-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-1">
          Table 2: Customer Collection Plan
        </h2>
        <table className="w-full border-collapse border border-slate-300 text-[9px]">
          <thead>
            <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-center">
              <th className="border border-slate-300 p-1 text-left">Customer Name</th>
              <th className="border border-slate-300 p-1 text-right">Paid</th>
              <th className="border border-slate-300 p-1 text-right">Unpaid</th>
              <th className="border border-slate-300 p-1">Date</th>
              <th className="border border-slate-300 p-1">Plan</th>
              <th className="border border-slate-300 p-1 text-right">New Sales</th>
              <th className="border border-slate-300 p-1 text-right">TB Amount</th>
              <th className="border border-slate-300 p-1 text-right">EMI Amount</th>
              <th className="border border-slate-300 p-1 text-right bg-emerald-100/70 text-emerald-950">Total Collection</th>
              <th className="border border-slate-300 p-1">Status</th>
              <th className="border border-slate-300 p-1">Prob %</th>
              <th className="border border-slate-300 p-1 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.customers.length === 0 ? (
              <tr>
                <td colSpan={12} className="border border-slate-300 p-2 text-center text-slate-400">
                  No customers scheduled in this collection plan.
                </td>
              </tr>
            ) : (
              scorecard.customers.map((c, idx) => (
                <tr key={idx} className="text-slate-800">
                  <td className="border border-slate-300 p-1 font-semibold">{c.customer_name}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(c.paid_amount)}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(c.unpaid_amount)}</td>
                  <td className="border border-slate-300 p-1 text-center">{c.collection_date || '—'}</td>
                  <td className="border border-slate-300 p-1 text-center">{c.in_out_plan || 'In Plan'}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(c.new_sales_amount)}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(c.tb_amount)}</td>
                  <td className="border border-slate-300 p-1 text-right">{formatNumber(c.emi_amount)}</td>
                  <td className="border border-slate-300 p-1 text-right font-bold text-emerald-900">{formatBDT(calculateCustomerTotalCollection(c))}</td>
                  <td className="border border-slate-300 p-1 text-center font-bold">{c.lead_status}</td>
                  <td className="border border-slate-300 p-1 text-center">{c.collection_probability}%</td>
                  <td className="border border-slate-300 p-1">{c.remarks || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-extrabold text-[9px]">
              <td className="border border-slate-300 p-1 text-right uppercase">Totals:</td>
              <td className="border border-slate-300 p-1 text-right text-emerald-800">{formatBDT(custSummary.total_paid)}</td>
              <td className="border border-slate-300 p-1 text-right text-rose-800">{formatBDT(custSummary.total_unpaid)}</td>
              <td colSpan={5} className="border border-slate-300 p-1 text-right uppercase">Weighted Expected Collection:</td>
              <td className="border border-slate-300 p-1 text-right font-extrabold text-emerald-950 bg-emerald-100">{formatBDT(custSummary.total_expected_collection)}</td>
              <td colSpan={3} className="border border-slate-300 p-1"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* TABLE 3: PORTFOLIO SNAPSHOT & SUPERVISOR EVALUATION */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-300">
        <div className="border border-slate-300 p-2 rounded text-[9px]">
          <h3 className="font-bold uppercase text-slate-800 mb-1 border-b pb-1">
            Table 3: Portfolio Due Snapshot
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold text-slate-700 block">EMI Due: {formatBDT(scorecard.emi_due_monthly)}</span>
              <span>Clients: {scorecard.emi_client_count} • Hold: {scorecard.emi_hold_count} • Cancel: {scorecard.emi_cancel_count}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">TB Due: {formatBDT(scorecard.tb_due_amount)}</span>
              <span>Clients: {scorecard.tb_client_count} • Shares: {scorecard.tb_share_count} • Hold: {scorecard.tb_hold_count}</span>
            </div>
          </div>
        </div>

        <div className="border border-slate-300 p-2 rounded text-[9px]">
          <h3 className="font-bold uppercase text-slate-800 mb-1 border-b pb-1">
            Supervisor Evaluation & Marks
          </h3>
          <div className="flex justify-between items-center mb-1">
            <span>Sheet Score: <strong className="font-bold">{scorecard.sheet_score ?? '—'}</strong></span>
            <span>Call Score: <strong className="font-bold">{scorecard.call_score ?? '—'}</strong></span>
            <span>Overall Marking: <strong className="font-bold text-emerald-800">{scorecard.marking ? `${scorecard.marking}/100` : '—'}</strong></span>
          </div>
          <div className="text-[9px] text-slate-600 italic">
            &quot;{scorecard.supervisor_notes || 'No supervisor notes recorded.'}&quot;
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-3 gap-8 pt-10 text-center text-[10px] text-slate-600 font-semibold">
        <div className="border-t border-slate-400 pt-1">Employee Signature</div>
        <div className="border-t border-slate-400 pt-1">Supervisor / Team Leader</div>
        <div className="border-t border-slate-400 pt-1">Head of Department / Admin</div>
      </div>
    </div>
  );
}

export default function ScorecardPrintPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-slate-500">
        Loading printable scorecard...
      </div>
    }>
      <ScorecardPrintContent />
    </Suspense>
  );
}
