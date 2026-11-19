'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchScorecard } from '@/lib/api/scorecard';
import { ScorecardResponse, PeriodItem, CustomerItem } from '@/types/scorecard';
import { 
  formatNumber, 
  calculatePeriodTotalCollection, 
  calculateTotalAchieved, 
  calculateCustomerTotalCollection 
} from '@/lib/calculations';
import { Printer, ArrowLeft, Maximize2, LayoutTemplate, Layers } from 'lucide-react';
import Link from 'next/link';

function getPriorMonthLabel(baseMonthStr: string, monthsAgo: number): string {
  try {
    const parts = baseMonthStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const d = new Date(year, month - monthsAgo, 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
  } catch {
    return `M-${monthsAgo}`;
  }
}

function getFormattedMonthName(baseMonthStr: string): string {
  try {
    const parts = baseMonthStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const d = new Date(year, month, 1);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return baseMonthStr;
  }
}

function ScorecardPrintContent() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('employee_id') || '';
  const month = searchParams.get('month') || '';

  const [scorecard, setScorecard] = useState<ScorecardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  // Default to Landscape for optimal 18-column Excel sheet fidelity
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  // Row count selector to guarantee exact 1-page fit with generous spacing
  const [rowLimit, setRowLimit] = useState<number>(8);

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
      <div className="p-8 text-center text-xs text-slate-500 font-mono">
        Loading official scorecard sheet...
      </div>
    );
  }

  const achieved = calculateTotalAchieved(scorecard.periods || []);
  const totalLeadPeriod = scorecard.periods?.find(p => p.period_index === 0);
  const employee = scorecard.employee;

  // Period mappings: 1=Till 5th, 2=Till 10th, 3=Till 15th, 4=Till 20th, 5=Till 25th, 6=Till 30/31st
  const periodRows = [
    { label: 'Till 5th', idx: 1 },
    { label: 'Till 10th', idx: 2 },
    { label: 'Till 15th', idx: 3 },
    { label: 'Till 20th', idx: 4 },
    { label: 'Till 25th', idx: 5 },
    { label: 'Till 30/31st', idx: 6 },
  ];

  const m3 = getPriorMonthLabel(month, 3);
  const m2 = getPriorMonthLabel(month, 2);
  const m1 = getPriorMonthLabel(month, 1);
  const monthFullName = getFormattedMonthName(month);

  const isPortrait = orientation === 'portrait';

  // Total accumulated leads for Total Lead row
  const totalFairLeads = (totalLeadPeriod?.fair_leads || 0) > 0 ? (totalLeadPeriod?.fair_leads || 0) : achieved.fair_leads;
  const totalFbLeads = (totalLeadPeriod?.fb_leads || 0) > 0 ? (totalLeadPeriod?.fb_leads || 0) : achieved.fb_leads;
  const totalHpLeads = (totalLeadPeriod?.hp || 0) > 0 ? (totalLeadPeriod?.hp || 0) : achieved.hp;
  const totalPLeads = (totalLeadPeriod?.p || 0) > 0 ? (totalLeadPeriod?.p || 0) : achieved.p;
  const totalFupLeads = (totalLeadPeriod?.fup || 0) > 0 ? (totalLeadPeriod?.fup || 0) : achieved.fup;
  const totalDialedCalls = (totalLeadPeriod?.dialed_calls || 0) > 0 ? (totalLeadPeriod?.dialed_calls || 0) : achieved.dialed_calls;
  const totalHold = (totalLeadPeriod?.hold || 0) > 0 ? (totalLeadPeriod?.hold || 0) : (achieved.hold || 0);
  const totalCancel = (totalLeadPeriod?.cancel || 0) > 0 ? (totalLeadPeriod?.cancel || 0) : (achieved.cancel || 0);
  const totalIndoorCx = (totalLeadPeriod?.indoor_cx || 0) > 0 ? (totalLeadPeriod?.indoor_cx || 0) : achieved.indoor_cx;
  const totalOutdoorVisits = (totalLeadPeriod?.outdoor_visits || 0) > 0 ? (totalLeadPeriod?.outdoor_visits || 0) : achieved.outdoor_visits;
  const totalSoldFair = (totalLeadPeriod?.sold_fair_leads || 0) > 0 ? (totalLeadPeriod?.sold_fair_leads || 0) : (achieved.sold_fair_leads || 0);
  const totalSoldFb = (totalLeadPeriod?.sold_fb_leads || 0) > 0 ? (totalLeadPeriod?.sold_fb_leads || 0) : (achieved.sold_fb_leads || 0);
  const totalSoldOther = (totalLeadPeriod?.sold_other_leads || 0) > 0 ? (totalLeadPeriod?.sold_other_leads || 0) : (achieved.sold_other_leads || 0);

  // Customer rows calibrated to strictly guarantee single-page (1/1) print without overflowing onto page 2
  const customers = scorecard.customers || [];
  const targetRowCount = Math.max(rowLimit, customers.length);
  const paddedCustomerRows: (CustomerItem | null)[] = [...customers];
  while (paddedCustomerRows.length < targetRowCount) {
    paddedCustomerRows.push(null);
  }

  return (
    <div className="w-full bg-slate-100 print:bg-white text-black min-h-screen p-2 sm:p-4 print:p-0">
      {/* Dynamic Print CSS for Strict 1-Page Output */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: ${isPortrait ? 'portrait A4' : 'landscape A4'};
              margin: 4mm 4mm;
            }
            html, body {
              background: #fff !important;
              color: #000 !important;
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
              max-height: 100vh !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .scorecard-sheet {
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              margin: 0 auto !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-before: avoid !important;
              break-before: avoid !important;
            }
          }
        `
      }} />

      {/* Screen-Only Control Toolbar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-300 print:hidden max-w-[1320px] mx-auto bg-white p-3 rounded-lg shadow-sm">
        <Link
          href={`/manual-scorecard?employee_id=${employeeId}&month=${month}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interactive Scorecard</span>
        </Link>

        {/* Orientation Switcher, Row Count & Print Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <span className="font-semibold text-slate-700">Customer Rows:</span>
            <select
              value={rowLimit}
              onChange={(e) => setRowLimit(parseInt(e.target.value, 10))}
              className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-medium cursor-pointer"
            >
              <option value={6}>6 Rows (Most Compact)</option>
              <option value={8}>8 Rows (Recommended - 1 Page)</option>
              <option value={10}>10 Rows (Full View)</option>
              <option value={12}>12 Rows</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setOrientation('landscape')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                !isPortrait 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Landscape A4 (Recommended)</span>
            </button>
            <button
              type="button"
              onClick={() => setOrientation('portrait')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                isPortrait 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Portrait A4</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (Single Page)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* THE OFFICIAL PHYSICAL SCORECARD SHEET GRID                    */}
      {/* ------------------------------------------------------------- */}
      <div 
        className={`scorecard-sheet mx-auto bg-white border-[1.5px] border-black text-black select-none shadow-lg print:shadow-none transition-all ${
          isPortrait 
            ? 'w-full max-w-[200mm] text-[7.5px]' 
            : 'w-full max-w-[287mm] text-[8.5px]'
        }`}
      >
        
        {/* ROW 1: TOP HEADER INFO (18 cols) */}
        <div className={`grid grid-cols-18 border-b border-black text-center font-bold ${isPortrait ? 'h-[26px]' : 'h-[28px]'}`}>
          <div className="col-span-1 p-0.5 bg-slate-50 border-r border-black flex items-center justify-center font-extrabold text-center leading-tight">
            Name
          </div>
          <div className="col-span-5 p-0.5 border-r border-black flex items-center justify-between px-2 text-left font-semibold">
            <span className="truncate font-bold">{employee?.full_name || '—'}</span>
            <span className="text-slate-600 font-normal text-[0.9em] whitespace-nowrap">TL : </span>
            <span className="text-slate-600 font-normal text-[0.9em] whitespace-nowrap">CO : </span>
          </div>
          <div className="col-span-1 p-0.5 bg-slate-50 border-r border-black flex items-center justify-center font-extrabold text-center leading-tight">
            Position
          </div>
          <div className="col-span-2 p-0.5 border-r border-black flex items-center justify-center font-semibold truncate px-1">
            {employee?.designation || 'Executive'}
          </div>
          <div className="col-span-2 p-0.5 border-r border-black flex flex-col justify-center items-center bg-slate-50 leading-tight">
            <span className="text-[0.85em]">Marking (Out of 100)</span>
            <span className="font-extrabold text-[1.1em]">{scorecard.marking ?? ''}</span>
          </div>
          <div className="col-span-2 p-0.5 border-r border-black flex flex-col justify-center items-center bg-slate-50 leading-tight">
            <span className="text-[0.85em]">Planned Leave</span>
            <span className="font-extrabold text-[1.1em]">{scorecard.planned_leave || ''}</span>
          </div>
          <div className="col-span-2 p-0.5 border-r border-black flex flex-col justify-center items-center bg-slate-50 leading-tight">
            <span className="text-[0.85em]">Un-Authorize Leave</span>
            <span className="font-extrabold text-[1.1em]">{scorecard.unauthorized_leave || ''}</span>
          </div>
          <div className="col-span-3 p-0.5 flex flex-col justify-center items-center bg-slate-50 leading-tight">
            <span className="text-[0.85em]">Month Name</span>
            <span className="font-extrabold text-[1.1em]">{monthFullName}</span>
          </div>
        </div>

        {/* ROW 2: PORTFOLIO & LEAD SUMMARY METRICS (18 cols) */}
        <div className={`grid grid-cols-18 border-b border-black text-center font-bold bg-white ${isPortrait ? 'h-[28px] text-[7px]' : 'h-[32px] text-[8px]'}`}>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between bg-slate-50 py-0.5">
            <span className="leading-none">EMI Due Monthly</span>
            <span className="font-mono font-bold text-[1.05em]">{formatNumber(scorecard.emi_due_monthly)}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">EMI Client</span>
            <span className="font-mono text-[1.05em]">{scorecard.emi_client_count || ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">EMI Hold</span>
            <span className="font-mono text-[1.05em]">{scorecard.emi_hold_count || ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">EMI cancel</span>
            <span className="font-mono text-[1.05em]">{scorecard.emi_cancel_count || ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between bg-slate-50 py-0.5">
            <span className="leading-none">TB Due</span>
            <span className="font-mono font-bold text-[1.05em]">{formatNumber(scorecard.tb_due_amount)}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">TB Client</span>
            <span className="font-mono text-[1.05em]">{scorecard.tb_client_count || ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">TB Share</span>
            <span className="font-mono text-[1.05em]">{scorecard.tb_share_count || ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">TB Hold</span>
            <span className="font-mono text-[1.05em]">{scorecard.tb_hold_count || ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">TB cancel</span>
            <span className="font-mono text-[1.05em]">{scorecard.tb_cancel_count || ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">Total Fair Lead</span>
            <span className="font-mono text-[1.05em]">{formatNumber(totalFairLeads)}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">Total FB Lead</span>
            <span className="font-mono text-[1.05em]">{formatNumber(totalFbLeads)}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">Sheet Score</span>
            <span className="font-mono font-bold text-[1.05em]">{scorecard.sheet_score ?? ''}</span>
          </div>
          <div className="col-span-1 p-0.5 border-r border-black flex flex-col justify-between py-0.5">
            <span className="leading-none">Call Score</span>
            <span className="font-mono font-bold text-[1.05em]">{scorecard.call_score ?? ''}</span>
          </div>
          <div className="col-span-2 p-0.5 border-r border-black flex flex-col justify-between bg-slate-50 py-0.5">
            <span className="leading-none">Prediction Amt from Emp</span>
            <span className="font-mono font-extrabold text-[1.05em]">{formatNumber(scorecard.prediction_amount)}</span>
          </div>
          <div className="col-span-3 p-0.5 flex items-center justify-center text-slate-300">
            {/* Blank right box matching sheet */}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* TABLE 1: MONTHLY PERFORMANCE TRACKING (EXACT ORDER, NO TG)   */}
        {/* ----------------------------------------------------------- */}
        {/* Table 1 Header Row: 18 columns matching exact requested layout */}
        <div className={`grid grid-cols-18 border-b border-black text-center font-extrabold bg-slate-100 ${isPortrait ? 'h-[22px] text-[6.5px]' : 'h-[24px] text-[7.5px]'}`}>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Month</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">New Sales</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Token to Booking</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">EMI</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight font-black bg-slate-200/60">Total Collection</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Current Fair Lead</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Current FB Lead</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none font-bold">HP</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none font-bold">P</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none font-bold">Fup</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Total Calls Dialed</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Hold</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Cancel</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">In Done</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Out Done</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Sold from Fair Leads</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Sold from FB Leads</div>
          <div className="p-0.5 flex items-center justify-center leading-tight">Sold from Other Leads</div>
        </div>

        {/* Historical Rows: Sep-26, Oct-26, Nov-26 */}
        {[m3, m2, m1].map((histLabel, idx) => (
          <div key={`hist-${idx}`} className={`grid grid-cols-18 border-b border-black text-center bg-white ${isPortrait ? 'h-[18px] text-[7px]' : 'h-[19px] text-[8px]'}`}>
            <div className="p-0.5 border-r border-black flex items-center justify-center font-bold bg-slate-50">
              {histLabel}
            </div>
            {Array.from({ length: 17 }).map((_, cIdx) => (
              <div key={cIdx} className="p-0.5 border-r border-black last:border-r-0 flex items-center justify-center text-slate-300">
                —
              </div>
            ))}
          </div>
        ))}

        {/* DEDICATED TOTAL LEAD SUMMARY ROW (Replacing TG / Target) */}
        <div className={`grid grid-cols-18 border-b-2 border-black text-center bg-indigo-50/70 font-extrabold ${isPortrait ? 'h-[19px] text-[7px]' : 'h-[20px] text-[8px]'}`}>
          <div className="p-0.5 border-r border-black flex items-center justify-center bg-indigo-100/90 text-indigo-950 font-black">
            Total Lead
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center text-slate-400">—</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center text-slate-400">—</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center text-slate-400">—</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center text-slate-400 bg-indigo-100/30">—</div>
          {/* Accumulated Lead Pipeline Totals */}
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold bg-indigo-100/40">
            {totalFairLeads || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold bg-indigo-100/40">
            {totalFbLeads || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalHpLeads || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalPLeads || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalFupLeads || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalDialedCalls || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalHold || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalCancel || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalIndoorCx || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalOutdoorVisits || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalSoldFair || ''}
          </div>
          <div className="p-0.5 border-r border-black flex items-center justify-center font-mono font-bold">
            {totalSoldFb || ''}
          </div>
          <div className="p-0.5 flex items-center justify-center font-mono font-bold">
            {totalSoldOther || ''}
          </div>
        </div>

        {/* 6 Periodic Activity Checkpoint Rows: Till 5th .. Till 30/31st */}
        {periodRows.map((pRow) => {
          const p = scorecard.periods?.find(item => item.period_index === pRow.idx) || {} as PeriodItem;
          const tc = calculatePeriodTotalCollection(p);
          return (
            <div key={`prow-${pRow.idx}`} className={`grid grid-cols-18 border-b border-black text-center ${isPortrait ? 'h-[18px] text-[7px]' : 'h-[19px] text-[8px]'}`}>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold bg-slate-50">
                {pRow.label}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {p.new_sales ? formatNumber(p.new_sales) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {p.tb_amount ? formatNumber(p.tb_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {p.emi_amount ? formatNumber(p.emi_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-bold font-mono bg-slate-100/50">
                {tc > 0 ? formatNumber(tc) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.fair_leads || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.fb_leads || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold font-mono">
                {p.hp || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold font-mono">
                {p.p || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold font-mono">
                {p.fup || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.dialed_calls || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.hold || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.cancel || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.indoor_cx || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.outdoor_visits || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.sold_fair_leads || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {p.sold_fb_leads || ''}
              </div>
              <div className="p-0.5 flex items-center justify-center font-mono">
                {p.sold_other_leads || ''}
              </div>
            </div>
          );
        })}

        {/* ----------------------------------------------------------- */}
        {/* TABLE 2: CX CUSTOMER COLLECTION TRACKING TABLE (18 cols)     */}
        {/* ----------------------------------------------------------- */}
        {/* Table 2 Header Row */}
        <div className={`grid grid-cols-18 border-b border-black text-center font-extrabold bg-slate-100 ${isPortrait ? 'h-[22px] text-[6.5px]' : 'h-[24px] text-[7.5px]'}`}>
          <div className="col-span-2 p-0.5 border-r border-black flex items-center justify-center leading-none">Cx Name</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Paid</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Unpaid</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Collection Date</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Next Collec Date</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Next Collec Date</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">IN / Out Plan</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Date-1</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">Date 2</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">New Sales</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">TB</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-none">EMI</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">New Lead Status</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight font-bold bg-slate-200/50">Total Collection</div>
          <div className="p-0.5 border-r border-black flex items-center justify-center leading-tight">Collection Probability %</div>
          <div className="col-span-2 p-0.5 flex items-center justify-center leading-none">Remarks</div>
        </div>

        {/* Customer Data / Blank Rows - Compacted to strictly guarantee 1 page */}
        {paddedCustomerRows.map((c, rIdx) => {
          const tc = c ? calculateCustomerTotalCollection(c) : 0;
          return (
            <div 
              key={`cx-${rIdx}`} 
              className={`grid grid-cols-18 border-b border-black last:border-b-0 ${
                isPortrait 
                  ? 'h-[18px] text-[7px]' 
                  : 'h-[19px] text-[8px]'
              }`}
            >
              <div className="col-span-2 p-0.5 border-r border-black px-1 flex items-center font-semibold truncate">
                {c?.customer_name || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {c?.paid_amount ? formatNumber(c.paid_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {c?.unpaid_amount ? formatNumber(c.unpaid_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {c?.collection_date || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {c?.next_collection_date || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {c?.next_collection_date_2 || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {c?.in_out_plan || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {c?.date_1 || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-mono">
                {c?.date_2 || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {c?.new_sales_amount ? formatNumber(c.new_sales_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {c?.tb_amount ? formatNumber(c.tb_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono">
                {c?.emi_amount ? formatNumber(c.emi_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold">
                {c?.lead_status || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono font-bold bg-slate-100/50">
                {tc > 0 ? formatNumber(tc) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {c?.collection_probability ? `${c.collection_probability}%` : ''}
              </div>
              <div className="col-span-2 p-0.5 px-1 flex items-center truncate text-[0.9em] text-slate-700">
                {c?.remarks || ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global CSS for the 18-column grid layout */}
      <style jsx global>{`
        .grid-cols-18 {
          display: grid;
          grid-template-columns: repeat(18, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
}

export default function ScorecardPrintPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-xs text-slate-500 font-mono">
        Loading official scorecard sheet...
      </div>
    }>
      <ScorecardPrintContent />
    </Suspense>
  );
}
