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
import { Printer, ArrowLeft } from 'lucide-react';
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

  const targetPeriod = scorecard.periods.find(p => p.period_index === 0) || {} as PeriodItem;
  const achieved = calculateTotalAchieved(scorecard.periods);
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

  // Pad customer rows to at least 14 rows to match physical paper sheet
  const customers = scorecard.customers || [];
  const TOTAL_CUSTOMER_ROWS = Math.max(14, customers.length);
  const paddedCustomerRows: (CustomerItem | null)[] = [...customers];
  while (paddedCustomerRows.length < TOTAL_CUSTOMER_ROWS) {
    paddedCustomerRows.push(null);
  }

  return (
    <div className="w-full bg-white text-black min-h-screen p-2 sm:p-4 print:p-0">
      {/* Print Trigger & Return Navigation (Hidden during physical print) */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-300 print:hidden max-w-[1300px] mx-auto">
        <Link
          href={`/manual-scorecard?employee_id=${employeeId}&month=${month}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Interactive Scorecard</span>
        </Link>
        <div className="flex items-center space-x-3">
          <span className="text-[11px] text-slate-500 italic">
            Exact match to official printed report format
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (Landscape A4)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* THE OFFICIAL PHYSICAL SCORECARD SHEET GRID                    */}
      {/* ------------------------------------------------------------- */}
      <div className="scorecard-sheet mx-auto max-w-[1320px] border-[1.5px] border-black bg-white text-[9px] leading-tight select-none">
        
        {/* ROW 1: TOP HEADER INFO */}
        <div className="grid grid-cols-18 border-b border-black text-center font-bold">
          <div className="col-span-1 p-1 bg-slate-50 border-r border-black flex items-center justify-center font-extrabold text-[9.5px]">
            Name
          </div>
          <div className="col-span-5 p-1 border-r border-black flex items-center justify-between px-2 text-left font-semibold text-[9.5px]">
            <span>{employee?.full_name || '—'}</span>
            <span className="text-[8.5px] text-slate-600 font-normal">TL : </span>
            <span className="text-[8.5px] text-slate-600 font-normal">CO : </span>
          </div>
          <div className="col-span-1 p-1 bg-slate-50 border-r border-black flex items-center justify-center font-extrabold text-[9.5px]">
            Position
          </div>
          <div className="col-span-2 p-1 border-r border-black flex items-center justify-center font-semibold text-[9.5px]">
            {employee?.designation || 'Executive'}
          </div>
          <div className="col-span-2 p-1 border-r border-black flex flex-col justify-center items-center text-[8px] bg-slate-50">
            <span>Marking (Out of 100)</span>
            <span className="font-extrabold text-[9.5px] mt-0.5">{scorecard.marking ?? ''}</span>
          </div>
          <div className="col-span-2 p-1 border-r border-black flex flex-col justify-center items-center text-[8px] bg-slate-50">
            <span>Planned Leave</span>
            <span className="font-extrabold text-[9.5px] mt-0.5">{scorecard.planned_leave || ''}</span>
          </div>
          <div className="col-span-2 p-1 border-r border-black flex flex-col justify-center items-center text-[8px] bg-slate-50">
            <span>Un-Authorize Leave</span>
            <span className="font-extrabold text-[9.5px] mt-0.5">{scorecard.unauthorized_leave || ''}</span>
          </div>
          <div className="col-span-3 p-1 flex flex-col justify-center items-center text-[8px] bg-slate-50">
            <span>Month Name</span>
            <span className="font-extrabold text-[9.5px] mt-0.5">{monthFullName}</span>
          </div>
        </div>

        {/* ROW 2: PORTFOLIO & LEAD SUMMARY METRICS */}
        <div className="grid grid-cols-18 border-b border-black text-center text-[7.5px] font-bold bg-white">
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between bg-slate-50">
            <span className="leading-tight">EMI Due Monthly</span>
            <span className="font-mono text-[8.5px] mt-0.5 font-bold">{formatNumber(scorecard.emi_due_monthly)}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>EMI Client</span>
            <span className="font-mono text-[8.5px] mt-0.5">{scorecard.emi_client_count || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>EMI Hold</span>
            <span className="font-mono text-[8.5px] mt-0.5">{scorecard.emi_hold_count || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>EMI cancel</span>
            <span className="font-mono text-[8.5px] mt-0.5">{scorecard.emi_cancel_count || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between bg-slate-50">
            <span>TB Due</span>
            <span className="font-mono text-[8.5px] mt-0.5 font-bold">{formatNumber(scorecard.tb_due_amount)}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>TB Client</span>
            <span className="font-mono text-[8.5px] mt-0.5">{scorecard.tb_client_count || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>TB Share</span>
            <span className="font-mono text-[8.5px] mt-0.5">{scorecard.tb_share_count || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>TB Hold</span>
            <span className="font-mono text-[8.5px] mt-0.5">{scorecard.tb_hold_count || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>TB cancel</span>
            <span className="font-mono text-[8.5px] mt-0.5">{scorecard.tb_cancel_count || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>Total Fair Lead</span>
            <span className="font-mono text-[8.5px] mt-0.5">{achieved.fair_leads || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>Total FB Lead</span>
            <span className="font-mono text-[8.5px] mt-0.5">{achieved.fb_leads || ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>Sheet Score</span>
            <span className="font-mono text-[8.5px] mt-0.5 font-bold">{scorecard.sheet_score ?? ''}</span>
          </div>
          <div className="col-span-1 p-1 border-r border-black flex flex-col justify-between">
            <span>Call Score</span>
            <span className="font-mono text-[8.5px] mt-0.5 font-bold">{scorecard.call_score ?? ''}</span>
          </div>
          <div className="col-span-2 p-1 border-r border-black flex flex-col justify-between bg-slate-50">
            <span>Prediction Amt from Emp</span>
            <span className="font-mono text-[8.5px] mt-0.5 font-extrabold">{formatNumber(scorecard.prediction_amount)}</span>
          </div>
          <div className="col-span-3 p-1 flex items-center justify-center text-slate-300">
            {/* Blank right box matching sheet */}
          </div>
        </div>

        {/* ----------------------------------------------------------- */}
        {/* TABLE 1: WEEKLY ACTIVITY                                    */}
        {/* ----------------------------------------------------------- */}
        {/* Table 1 Header Row (18 columns) */}
        <div className="grid grid-cols-18 border-b border-black text-center text-[7.5px] font-extrabold bg-slate-100">
          <div className="p-1 border-r border-black flex items-center justify-center">Month</div>
          <div className="p-1 border-r border-black flex items-center justify-center">TG</div>
          <div className="p-1 border-r border-black flex items-center justify-center">New Sales</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Token to Booking</div>
          <div className="p-1 border-r border-black flex items-center justify-center">EMI</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Total Lead</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Current Fair Lead</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Current FB Leads</div>
          <div className="p-1 border-r border-black flex items-center justify-center">HP</div>
          <div className="p-1 border-r border-black flex items-center justify-center">P</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Fup</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Total Calls Dialed</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Hold</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Cancel</div>
          <div className="p-1 border-r border-black flex items-center justify-center">In done</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Out Done</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Sold from Fair Leads</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Sold From FB Leads</div>
        </div>

        {/* Historical Rows: M-3, M-2, M-1 */}
        {[m3, m2, m1].map((histLabel, idx) => (
          <div key={idx} className="grid grid-cols-18 border-b border-black text-center text-[8px] h-5 bg-white">
            <div className="p-0.5 border-r border-black flex items-center justify-center font-bold bg-slate-50">
              {histLabel}
            </div>
            {Array.from({ length: 17 }).map((_, cIdx) => (
              <div key={cIdx} className="p-0.5 border-r border-black last:border-r-0 flex items-center justify-center">
                {/* Historical data cell */}
              </div>
            ))}
          </div>
        ))}

        {/* Target Benchmark Row (TG) */}
        {targetPeriod && (
          <div className="grid grid-cols-18 border-b border-black text-center text-[8px] h-5.5 bg-amber-50/50 font-bold">
            <div className="p-0.5 border-r border-black flex items-center justify-center font-extrabold bg-amber-100/60">
              TG (Target)
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-end px-1">
              {formatNumber(calculatePeriodTotalCollection(targetPeriod))}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-end px-1">
              {formatNumber(targetPeriod.new_sales)}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-end px-1">
              {formatNumber(targetPeriod.tb_amount)}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-end px-1">
              {formatNumber(targetPeriod.emi_amount)}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.total_leads || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.fair_leads || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.fb_leads || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.hp || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.p || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.fup || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.dialed_calls || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.hold || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.cancel || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.indoor_cx || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.outdoor_visits || ''}
            </div>
            <div className="p-0.5 border-r border-black flex items-center justify-center">
              {targetPeriod.sold_fair_leads || ''}
            </div>
            <div className="p-0.5 flex items-center justify-center">
              {targetPeriod.sold_fb_leads || ''}
            </div>
          </div>
        )}

        {/* 6 Periodic Activity Rows: Till 5th, Till 10th, Till 15th, Till 20th, Till 25th, Till 30/31st */}
        {periodRows.map((pRow) => {
          const p = scorecard.periods.find(item => item.period_index === pRow.idx) || {} as PeriodItem;
          const tc = calculatePeriodTotalCollection(p);
          return (
            <div key={pRow.idx} className="grid grid-cols-18 border-b border-black text-center text-[8px] h-5.5 hover:bg-slate-50">
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold bg-slate-50 text-[8.5px]">
                {pRow.label}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-bold">
                {tc > 0 ? formatNumber(tc) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1">
                {p.new_sales ? formatNumber(p.new_sales) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1">
                {p.tb_amount ? formatNumber(p.tb_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1">
                {p.emi_amount ? formatNumber(p.emi_amount) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.total_leads || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.fair_leads || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.fb_leads || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold">
                {p.hp || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold">
                {p.p || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center font-bold">
                {p.fup || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.dialed_calls || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.hold || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.cancel || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.indoor_cx || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.outdoor_visits || ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {p.sold_fair_leads || ''}
              </div>
              <div className="p-0.5 flex items-center justify-center">
                {p.sold_fb_leads || ''}
              </div>
            </div>
          );
        })}

        {/* ----------------------------------------------------------- */}
        {/* TABLE 2: PREDICTION PAYMENT (CUSTOMER COLLECTION PLAN)      */}
        {/* ----------------------------------------------------------- */}
        {/* Header Row for Prediction Payment */}
        <div className="grid grid-cols-18 border-b border-black text-center text-[7.5px] font-extrabold bg-slate-100">
          <div className="col-span-2 p-1 border-r border-black flex items-center justify-center">Cx Name</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Paid</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Unpaid</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Collection Date</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Next Collec Date</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Next Collec Date</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">IN / Out Plan</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Date-1</div>
          <div className="p-1 border-r border-black flex items-center justify-center">Date 2</div>
          <div className="p-1 border-r border-black flex items-center justify-center">New Sales</div>
          <div className="p-1 border-r border-black flex items-center justify-center">TB</div>
          <div className="p-1 border-r border-black flex items-center justify-center">EMI</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">New Lead Status</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Total Collection</div>
          <div className="p-1 border-r border-black flex items-center justify-center leading-tight">Collection Probability %</div>
          <div className="col-span-2 p-1 flex items-center justify-center">Remarks</div>
        </div>

        {/* Customer Data / Blank Rows (14 to 15 rows) */}
        {paddedCustomerRows.map((c, rIdx) => {
          const tc = c ? calculateCustomerTotalCollection(c) : 0;
          return (
            <div key={rIdx} className="grid grid-cols-18 border-b border-black text-[7.5px] h-5.5 hover:bg-slate-50 last:border-b-0">
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
              <div className="p-0.5 border-r border-black flex items-center justify-end px-1 font-mono font-bold">
                {tc > 0 ? formatNumber(tc) : ''}
              </div>
              <div className="p-0.5 border-r border-black flex items-center justify-center">
                {c?.collection_probability ? `${c.collection_probability}%` : ''}
              </div>
              <div className="col-span-2 p-0.5 px-1 flex items-center truncate text-[7px] text-slate-700">
                {c?.remarks || ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Print-specific style tag for crisp borders and landscape A4 */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape A4;
            margin: 5mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
            color: black !important;
          }
          .scorecard-sheet {
            border: 1.5px solid black !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
          }
          .scorecard-sheet div {
            border-color: black !important;
          }
        }
        /* Custom 18-column grid for the exact paper sheet alignment */
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
