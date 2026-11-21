'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  fetchScorecard, 
  upsertScorecard, 
  updateScorecardStatus, 
  fetchSubordinates, 
  fetchMonths,
  fetchScorecardSubmissions
} from '@/lib/api/scorecard';
import { 
  ScorecardResponse, 
  Subordinate, 
  PeriodItem, 
  CustomerItem, 
  PeriodMetrics 
} from '@/types/scorecard';
import ScorecardHeader from '@/components/ScorecardHeader';
import AttendanceForecastCard from '@/components/AttendanceForecastCard';
import SupervisorEvaluationCard from '@/components/SupervisorEvaluationCard';
import PortfolioSnapshotCard from '@/components/PortfolioSnapshotCard';
import TablePerformanceByPeriod from '@/components/TablePerformanceByPeriod';
import TableCustomerCollectionPlan from '@/components/TableCustomerCollectionPlan';
import AuditTrailModal from '@/components/AuditTrailModal';
import ScorecardSubmissionsModal from '@/components/ScorecardSubmissionsModal';
import ScorecardQueueDashboard from '@/components/ScorecardQueueDashboard';
import { AlertCircle, CheckCircle2, Bell, FileCheck2, Award, ArrowLeft } from 'lucide-react';

function ManualScorecardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();

  const [scorecard, setScorecard] = useState<ScorecardResponse | null>(null);
  const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const isSupervisorOrAdmin = profile && ['ADMIN', 'TL', 'CO'].includes(profile.role);

  const refreshPendingCount = useCallback(async () => {
    if (profile && ['ADMIN', 'TL', 'CO'].includes(profile.role)) {
      try {
        const res = await fetchScorecardSubmissions('all', 'SUBMITTED');
        setPendingCount(res.pending_count || 0);
      } catch {}
    }
  }, [profile]);

  useEffect(() => {
    async function initSelectors() {
      try {
        const [subs, mList] = await Promise.all([
          fetchSubordinates().catch(() => []),
          fetchMonths().catch(() => [])
        ]);

        setSubordinates(subs);
        setAvailableMonths(mList.length > 0 ? mList : ['2026-11', '2026-10']);

        const paramEmp = searchParams.get('employee_id');
        const paramMonth = searchParams.get('month');

        let initialEmp = paramEmp || '';
        if (!initialEmp && profile?.role === 'EMPLOYEE') {
          initialEmp = profile.id;
        }
        const initialMonth = paramMonth || (mList.length > 0 ? mList[0] : '2026-11');

        setSelectedEmployeeId(initialEmp);
        setSelectedMonth(initialMonth);
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      initSelectors();
      refreshPendingCount();
    }
  }, [profile, searchParams, refreshPendingCount]);

  const loadScorecard = useCallback(async (empId: string, month: string) => {
    if (!empId || !month) return;
    setLoading(true);
    setFeedback(null);
    try {
      const data = await fetchScorecard(empId, month);
      setScorecard(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load scorecard.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEmployeeId && selectedMonth) {
      loadScorecard(selectedEmployeeId, selectedMonth);
    }
  }, [selectedEmployeeId, selectedMonth, loadScorecard]);

  useEffect(() => {
    const paramEmp = searchParams.get('employee_id');
    if (paramEmp !== null && paramEmp !== selectedEmployeeId) {
      setSelectedEmployeeId(paramEmp);
    } else if (paramEmp === null && isSupervisorOrAdmin && selectedEmployeeId) {
      setSelectedEmployeeId('');
      setScorecard(null);
    }
  }, [searchParams, isSupervisorOrAdmin]);

  const handleEmployeeChange = (newEmpId: string) => {
    setSelectedEmployeeId(newEmpId);
    router.push(`/manual-scorecard?employee_id=${newEmpId}&month=${selectedMonth}`);
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    router.push(`/manual-scorecard?employee_id=${selectedEmployeeId}&month=${newMonth}`);
  };

  const handleAttendanceForecastChange = (field: string, val: number) => {
    if (!scorecard) return;
    setScorecard({ ...scorecard, [field]: val });
  };

  const handleSupervisorEvaluationChange = (field: string, val: any) => {
    if (!scorecard) return;
    setScorecard({ ...scorecard, [field]: val });
  };

  const handlePortfolioChange = (field: string, val: number) => {
    if (!scorecard) return;
    setScorecard({ ...scorecard, [field]: val });
  };

  const handlePeriodChange = (periodIndex: number, field: keyof PeriodMetrics, value: any) => {
    if (!scorecard) return;
    const updatedPeriods = scorecard.periods.map(p => {
      if (p.period_index === periodIndex) {
        return { ...p, [field]: value };
      }
      return p;
    });
    setScorecard({ ...scorecard, periods: updatedPeriods });
  };

  const handleCustomerChange = (index: number, field: keyof CustomerItem, value: any) => {
    if (!scorecard) return;
    const updatedCustomers = [...scorecard.customers];
    updatedCustomers[index] = { ...updatedCustomers[index], [field]: value };
    setScorecard({ ...scorecard, customers: updatedCustomers });
  };

  const handleAddCustomer = (customCustomer?: CustomerItem) => {
    if (!scorecard) return;
    const newCustomer: CustomerItem = customCustomer || {
      customer_name: '',
      cx_type: 'New Sales',
      payment_type: 'Paid',
      amount: 0,
      payment_date: '',
      payment_status: 'Paid',
      paid_amount: 0,
      unpaid_amount: 0,
      in_out_plan: 'In Plan',
      new_sales_amount: 0,
      tb_amount: 0,
      emi_amount: 0,
      total_collection: 0,
      lead_status: 'HP',
      collection_probability: 50,
      remarks: ''
    };
    setScorecard({ ...scorecard, customers: [...scorecard.customers, newCustomer] });
  };

  const handleDeleteCustomer = (index: number) => {
    if (!scorecard) return;
    const updated = scorecard.customers.filter((_, i) => i !== index);
    setScorecard({ ...scorecard, customers: updated });
  };

  const handleSaveDraft = async () => {
    if (!scorecard) return;
    setSaving(true);
    setFeedback(null);

    try {
      // Sanitize customer records: convert empty string dates to null
      const sanitizedCustomers = (scorecard.customers || [])
        .filter(c => (c.customer_name && c.customer_name.trim().length > 0) || (c.amount && c.amount > 0) || (c.paid_amount && c.paid_amount > 0) || (c.total_collection && c.total_collection > 0))
        .map(c => ({
          ...c,
          customer_name: c.customer_name?.trim() || 'Customer',
          payment_date: c.payment_date && String(c.payment_date).trim() ? c.payment_date : null,
          collection_date: c.collection_date && String(c.collection_date).trim() ? c.collection_date : null,
          next_collection_date: c.next_collection_date && String(c.next_collection_date).trim() ? c.next_collection_date : null,
          next_collection_date_2: c.next_collection_date_2 && String(c.next_collection_date_2).trim() ? c.next_collection_date_2 : null,
          date_1: c.date_1 && String(c.date_1).trim() ? c.date_1 : null,
          date_2: c.date_2 && String(c.date_2).trim() ? c.date_2 : null,
        }));

      const payload = {
        employee_id: selectedEmployeeId,
        month: selectedMonth.length === 7 ? `${selectedMonth}-01` : selectedMonth,
        target: scorecard.target || 0,
        planned_leave: scorecard.planned_leave,
        unauthorized_leave: scorecard.unauthorized_leave,
        working_days: 0,
        prediction_amount: scorecard.prediction_amount,
        sheet_score: scorecard.sheet_score,
        call_score: scorecard.call_score,
        marking: scorecard.marking,
        supervisor_notes: scorecard.supervisor_notes,
        emi_due_monthly: scorecard.emi_due_monthly,
        emi_client_count: scorecard.emi_client_count,
        emi_hold_count: scorecard.emi_hold_count,
        emi_cancel_count: scorecard.emi_cancel_count,
        tb_due_amount: scorecard.tb_due_amount,
        tb_client_count: scorecard.tb_client_count,
        tb_share_count: scorecard.tb_share_count,
        tb_hold_count: scorecard.tb_hold_count,
        tb_cancel_count: scorecard.tb_cancel_count,
        periods: scorecard.periods,
        customers: sanitizedCustomers
      };

      const res = await upsertScorecard(payload);
      setScorecard(res);
      setFeedback({ type: 'success', message: 'Scorecard saved successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save scorecard.' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string, confirmationMsg: string) => {
    if (!scorecard?.id) {
      await handleSaveDraft();
    }
    if (!confirm(confirmationMsg)) return;

    setSaving(true);
    setFeedback(null);
    try {
      if (!scorecard?.id) throw new Error('Scorecard record missing ID. Save draft first.');
      const res = await updateScorecardStatus(scorecard.id, newStatus);
      setScorecard(res);
      setFeedback({ type: 'success', message: `Scorecard transitioned to ${newStatus}.` });
      refreshPendingCount();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Status transition failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectSubmission = (empId: string, month: string) => {
    setSelectedEmployeeId(empId);
    setSelectedMonth(month);
    router.push(`/manual-scorecard?employee_id=${empId}&month=${month}`);
    setShowSubmissionsModal(false);
    setTimeout(() => {
      document.getElementById('supervisor-evaluation-card')?.scrollIntoView({ behavior: 'smooth' });
    }, 450);
  };

  // If Admin / Supervisor is on the main scorecard page without selecting an employee, show the Submissions Queue
  if (isSupervisorOrAdmin && !selectedEmployeeId) {
    return (
      <div className="space-y-6 pb-12">
        <ScorecardQueueDashboard
          onSelectEmployee={(empId, m) => {
            setSelectedEmployeeId(empId);
            setSelectedMonth(m);
            router.push(`/manual-scorecard?employee_id=${empId}&month=${m}`);
          }}
          subordinates={subordinates}
          availableMonths={availableMonths}
        />
      </div>
    );
  }

  if (loading && !scorecard) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Scorecard Data...</p>
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900">Unable to load scorecard</h3>
        <p className="text-xs text-slate-500 mt-1">Please verify employee access and month parameters.</p>
      </div>
    );
  }

  const isReviewer = Boolean(isSupervisorOrAdmin && (profile?.id !== scorecard.employee_id));
  const isClosed = scorecard.status === 'CLOSED';
  const isEditingDisabled = isReviewer || !scorecard.can_edit || isClosed;

  return (
    <div className="space-y-6 pb-12">
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Reviewer / Evaluator Notice Banners */}
      {isReviewer && scorecard.status === 'SUBMITTED' && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wider">
                  Submitted for Review
                </span>
                <h4 className="text-sm font-bold">
                  Evaluating {scorecard.employee?.full_name} ({scorecard.employee?.employee_id})
                </h4>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Submitted on {scorecard.submitted_at ? new Date(scorecard.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}. Review the member's figures below and scroll down to enter Quality Scoring.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedEmployeeId('');
              setScorecard(null);
              router.push('/manual-scorecard');
            }}
            className="px-4 py-2 bg-white text-indigo-950 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-sm transition shrink-0 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Submissions Queue</span>
          </button>
        </div>
      )}

      {isReviewer && scorecard.status === 'DRAFT' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold leading-tight">
                Member Scorecard in DRAFT Status
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {scorecard.employee?.full_name} has not submitted their scorecard for this month yet. Normal editing is reserved for the member until submitted.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedEmployeeId('');
              setScorecard(null);
              router.push('/manual-scorecard');
            }}
            className="px-4 py-2 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-bold shadow-sm transition shrink-0 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Submissions Queue</span>
          </button>
        </div>
      )}

      <ScorecardHeader
        scorecard={scorecard}
        subordinates={subordinates}
        availableMonths={availableMonths}
        selectedEmployeeId={selectedEmployeeId}
        selectedMonth={selectedMonth}
        onEmployeeChange={handleEmployeeChange}
        onMonthChange={handleMonthChange}
        onSaveDraft={handleSaveDraft}
        onSubmit={() => handleStatusChange('SUBMITTED', 'Are you sure you want to SUBMIT this scorecard for supervisor review?')}
        onApprove={() => handleStatusChange('APPROVED', 'Approve this monthly scorecard?')}
        onClose={() => handleStatusChange('CLOSED', 'Close and lock this monthly scorecard? Normal editing will be restricted.')}
        onReopen={() => handleStatusChange('DRAFT', 'Reopen this closed scorecard back to DRAFT?')}
        onReject={() => handleStatusChange('DRAFT', 'Return this scorecard to the member for revisions? Status will revert to DRAFT.')}
        onOpenAuditLogs={() => setShowAuditModal(true)}
        isSaving={saving}
        canEdit={scorecard.can_edit}
        canSubmit={scorecard.can_submit}
        canApprove={scorecard.can_approve}
        canClose={scorecard.can_close}
        canReopen={scorecard.can_reopen}
        canReject={scorecard.can_reject}
        isReviewer={isReviewer}
        onBackToQueue={isSupervisorOrAdmin ? () => {
          setSelectedEmployeeId('');
          setScorecard(null);
          router.push('/manual-scorecard');
        } : undefined}
      />

      <AttendanceForecastCard
        target={scorecard.target || 0}
        plannedLeave={scorecard.planned_leave}
        unauthorizedLeave={scorecard.unauthorized_leave}
        predictionAmount={scorecard.prediction_amount}
        onChange={handleAttendanceForecastChange}
        disabled={isEditingDisabled}
      />

      <TablePerformanceByPeriod
        periods={scorecard.periods}
        onChangePeriod={handlePeriodChange}
        disabled={isEditingDisabled}
      />

      <TableCustomerCollectionPlan
        customers={scorecard.customers}
        onChangeCustomer={handleCustomerChange}
        onAddCustomer={handleAddCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        disabled={isEditingDisabled}
      />

      <PortfolioSnapshotCard
        emiDueMonthly={scorecard.emi_due_monthly}
        emiClientCount={scorecard.emi_client_count}
        emiHoldCount={scorecard.emi_hold_count}
        emiCancelCount={scorecard.emi_cancel_count}
        tbDueAmount={scorecard.tb_due_amount}
        tbClientCount={scorecard.tb_client_count}
        tbShareCount={scorecard.tb_share_count}
        tbHoldCount={scorecard.tb_hold_count}
        tbCancelCount={scorecard.tb_cancel_count}
        onChange={handlePortfolioChange}
        disabled={isEditingDisabled}
      />

      <SupervisorEvaluationCard
        sheetScore={scorecard.sheet_score}
        callScore={scorecard.call_score}
        marking={scorecard.marking}
        supervisorNotes={scorecard.supervisor_notes}
        onChange={handleSupervisorEvaluationChange}
        canEditSupervisorFields={scorecard.can_edit_supervisor_fields}
        disabled={isClosed}
      />

      <ScorecardSubmissionsModal
        isOpen={showSubmissionsModal}
        onClose={() => {
          setShowSubmissionsModal(false);
          refreshPendingCount();
        }}
        onSelectSubmission={handleSelectSubmission}
        currentMonth={selectedMonth}
      />

      <AuditTrailModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        auditLogs={scorecard.audit_logs || []}
      />
    </div>
  );
}

export default function ManualScorecardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Scorecard...</p>
      </div>
    }>
      <ManualScorecardContent />
    </Suspense>
  );
}
