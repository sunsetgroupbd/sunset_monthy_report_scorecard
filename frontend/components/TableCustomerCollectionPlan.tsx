'use client';

import React, { useState } from 'react';
import { CustomerItem, LeadStatus, CXType, PaymentType, PaymentStatus } from '@/types/scorecard';
import { 
  formatBDT, 
  calculateCustomerTotalCollection, 
  calculateCustomerSummary 
} from '@/lib/calculations';
import { 
  Plus, 
  Trash2, 
  Edit3,
  AlertTriangle, 
  Check, 
  CreditCard,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';

interface CustomerCollectionPlanProps {
  customers: CustomerItem[];
  onChangeCustomer: (index: number, field: keyof CustomerItem, value: any) => void;
  onAddCustomer: (newCustomer?: CustomerItem) => void;
  onDeleteCustomer: (index: number) => void;
  disabled: boolean;
}

const CX_TYPE_OPTIONS: CXType[] = ['New Sales', 'TB', 'EMI'];
const PAYMENT_TYPE_OPTIONS: PaymentType[] = ['Payable Amount', 'Paid'];
const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  'HP',
  'P',
  'Fup',
  'Cancel',
  'Hold',
  'Next Month',
  'Next Year',
  'NR'
];

const LEAD_BADGE_STYLES: Record<LeadStatus, { bg: string; text: string; border: string }> = {
  HP: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  P: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  Fup: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  Cancel: { bg: 'bg-red-50', text: 'text-red-700 line-through', border: 'border-red-300' },
  Hold: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
  'Next Month': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Next Year': { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300' },
  NR: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

const EMPTY_FORM: CustomerItem = {
  customer_name: '',
  cx_type: 'New Sales',
  payment_type: 'Paid',
  amount: 0,
  payment_date: '',
  payment_status: 'Paid',
  paid_amount: 0,
  unpaid_amount: 0,
  collection_date: '',
  next_collection_date: '',
  next_collection_date_2: '',
  date_1: '',
  date_2: '',
  in_out_plan: 'In Plan',
  new_sales_amount: 0,
  tb_amount: 0,
  emi_amount: 0,
  total_collection: 0,
  lead_status: 'HP',
  collection_probability: 50,
  remarks: ''
};

export default function TableCustomerCollectionPlan({
  customers,
  onChangeCustomer,
  onAddCustomer,
  onDeleteCustomer,
  disabled
}: CustomerCollectionPlanProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomerItem>(EMPTY_FORM);
  const [formError, setFormError] = useState<string>('');

  const summary = calculateCustomerSummary(customers);

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      onDeleteCustomer(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ ...EMPTY_FORM });
    setEditingIndex(null);
    setFormError('');
    setFormOpen(true);
  };

  const handleOpenEdit = (idx: number) => {
    const cust = customers[idx];
    if (!cust) return;
    setFormData({ ...cust });
    setEditingIndex(idx);
    setFormError('');
    setFormOpen(true);
  };

  const handleFormChange = (field: keyof CustomerItem, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Conditional payment logic when payment_type or amount changes:
      if (field === 'payment_type' || field === 'amount' || field === 'cx_type') {
        const amt = Number(field === 'amount' ? value : updated.amount) || 0;
        const pType = field === 'payment_type' ? value : updated.payment_type;
        const cType = field === 'cx_type' ? value : updated.cx_type;

        if (pType === 'Payable Amount') {
          updated.unpaid_amount = amt;
          updated.paid_amount = 0;
          updated.payment_status = 'Pending';
        } else {
          updated.paid_amount = amt;
          updated.unpaid_amount = 0;
          updated.payment_status = 'Paid';
        }

        // Auto-assign product distribution if user hasn't split it manually
        if (cType === 'New Sales') {
          updated.new_sales_amount = amt;
          updated.tb_amount = 0;
          updated.emi_amount = 0;
        } else if (cType === 'TB') {
          updated.tb_amount = amt;
          updated.new_sales_amount = 0;
          updated.emi_amount = 0;
        } else if (cType === 'EMI') {
          updated.emi_amount = amt;
          updated.new_sales_amount = 0;
          updated.tb_amount = 0;
        }
      }

      return updated;
    });
  };

  // Quick 1-click status toggle directly from the table (Pending <-> Paid)
  const handleTogglePaymentStatus = (idx: number) => {
    if (disabled) return;
    const cust = customers[idx];
    if (!cust) return;

    const isPending = cust.payment_status === 'Pending' || (!cust.paid_amount && (cust.unpaid_amount || cust.amount));
    const amt = Number(cust.amount || cust.paid_amount || cust.unpaid_amount || 0);

    if (isPending) {
      // Mark as Paid
      onChangeCustomer(idx, 'payment_status', 'Paid');
      onChangeCustomer(idx, 'payment_type', 'Paid');
      onChangeCustomer(idx, 'paid_amount', amt);
      onChangeCustomer(idx, 'unpaid_amount', 0);
      if (!cust.payment_date) {
        onChangeCustomer(idx, 'payment_date', new Date().toISOString().split('T')[0]);
      }
    } else {
      // Mark as Pending / Payable Amount
      onChangeCustomer(idx, 'payment_status', 'Pending');
      onChangeCustomer(idx, 'payment_type', 'Payable Amount');
      onChangeCustomer(idx, 'paid_amount', 0);
      onChangeCustomer(idx, 'unpaid_amount', amt);
    }
  };

  const formCalculatedTotal = 
    (Number(formData.new_sales_amount) || 0) + 
    (Number(formData.tb_amount) || 0) + 
    (Number(formData.emi_amount) || 0);

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim()) {
      setFormError('Customer Name is required.');
      return;
    }

    const amt = Number(formData.amount) || 0;
    const isPaid = formData.payment_type === 'Paid';

    const payload: CustomerItem = {
      ...formData,
      customer_name: formData.customer_name.trim(),
      cx_type: formData.cx_type || 'New Sales',
      payment_type: formData.payment_type || 'Paid',
      amount: amt,
      payment_date: formData.payment_date || undefined,
      payment_status: isPaid ? 'Paid' : 'Pending',
      paid_amount: isPaid ? amt : (Number(formData.paid_amount) || 0),
      unpaid_amount: !isPaid ? amt : (Number(formData.unpaid_amount) || 0),
      new_sales_amount: Number(formData.new_sales_amount) || 0,
      tb_amount: Number(formData.tb_amount) || 0,
      emi_amount: Number(formData.emi_amount) || 0,
      total_collection: formCalculatedTotal || amt,
      collection_probability: Number(formData.collection_probability) || 50,
      lead_status: formData.lead_status || 'HP'
    };

    if (editingIndex !== null) {
      // Update existing customer
      Object.keys(payload).forEach((k) => {
        onChangeCustomer(editingIndex, k as keyof CustomerItem, (payload as any)[k]);
      });
    } else {
      // Add new customer
      onAddCustomer(payload);
    }

    setFormOpen(false);
    setEditingIndex(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Table 2: CX Customer Collection Tracking
            </h2>
            <p className="text-xs text-slate-500">
              Customer-level payment tracking (New Sales, TB, EMI), payable vs. paid status, and collection probabilities.
            </p>
          </div>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer Record</span>
          </button>
        )}
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 rounded-xl">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Total Paid Collection
          </div>
          <div className="text-lg font-extrabold text-emerald-950 mt-1">
            {formatBDT(summary.total_paid)}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">
            Verified received payments
          </div>
        </div>

        <div className="bg-rose-50/70 border border-rose-100 p-3.5 rounded-xl">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
            Total Payable / Pending
          </div>
          <div className="text-lg font-extrabold text-rose-950 mt-1">
            {formatBDT(summary.total_unpaid)}
          </div>
          <div className="text-[10px] text-rose-700 mt-0.5">
            Outstanding receivables
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
            Forecasted Net Collection
          </div>
          <div className="text-lg font-extrabold text-blue-950 mt-1">
            {formatBDT(summary.total_expected_collection)}
          </div>
          <div className="text-[10px] text-blue-700 mt-0.5">
            Weighted by probability %
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingIndex !== null ? 'Edit Customer Collection Entry' : 'Add New Customer Collection Entry'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter customer details, payment type (New Sales, TB, EMI), and amounts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Row 1: CX Name & CX Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CX Name (Customer Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => handleFormChange('customer_name', e.target.value)}
                    placeholder="e.g. Bashundhara Project - Client Name"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CX Type (Product)
                  </label>
                  <select
                    value={formData.cx_type || 'New Sales'}
                    onChange={(e) => handleFormChange('cx_type', e.target.value as CXType)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CX_TYPE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Payment Type Dropdown, Amount, and Date */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amount / Payment Type
                    </label>
                    <select
                      value={formData.payment_type || 'Paid'}
                      onChange={(e) => handleFormChange('payment_type', e.target.value as PaymentType)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    >
                      {PAYMENT_TYPE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {formData.payment_type === 'Payable Amount' ? 'Payable Amount (BDT)' : 'Paid Amount (BDT)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formData.amount || ''}
                      onChange={(e) => handleFormChange('amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 ${
                        formData.payment_type === 'Payable Amount' ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {formData.payment_type === 'Payable Amount' ? 'Expected Due Date' : 'Payment Received Date'}
                    </label>
                    <input
                      type="date"
                      value={formData.payment_date || ''}
                      onChange={(e) => handleFormChange('payment_date', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500">
                    Status: <strong className={formData.payment_type === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>
                      {formData.payment_type === 'Paid' ? 'Paid / Settled' : 'Pending / Outstanding'}
                    </strong>
                  </span>
                  <span className="text-slate-500">
                    Auto assigned to: <strong className="text-slate-800">{formData.cx_type || 'New Sales'}</strong>
                  </span>
                </div>
              </div>

              {/* Row 3: Product Breakdown manual adjustments if needed */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    New Sales (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.new_sales_amount || ''}
                    onChange={(e) => handleFormChange('new_sales_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    TB Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.tb_amount || ''}
                    onChange={(e) => handleFormChange('tb_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    EMI Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.emi_amount || ''}
                    onChange={(e) => handleFormChange('emi_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 4: Status and Probability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Lead Status
                  </label>
                  <select
                    value={formData.lead_status || 'HP'}
                    onChange={(e) => handleFormChange('lead_status', e.target.value as LeadStatus)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    {LEAD_STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IN / OUT Plan
                  </label>
                  <select
                    value={formData.in_out_plan || 'In Plan'}
                    onChange={(e) => handleFormChange('in_out_plan', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="In Plan">In Plan</option>
                    <option value="Out Plan">Out Plan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Collection Probability % ({formData.collection_probability || 50}%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="5"
                    value={formData.collection_probability || 50}
                    onChange={(e) => handleFormChange('collection_probability', parseInt(e.target.value, 10) || 50)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 5: Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Collection Date
                  </label>
                  <input
                    type="date"
                    value={formData.collection_date || ''}
                    onChange={(e) => handleFormChange('collection_date', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Next Collec Date
                  </label>
                  <input
                    type="date"
                    value={formData.next_collection_date || ''}
                    onChange={(e) => handleFormChange('next_collection_date', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date-1
                  </label>
                  <input
                    type="date"
                    value={formData.date_1 || ''}
                    onChange={(e) => handleFormChange('date_1', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date-2
                  </label>
                  <input
                    type="date"
                    value={formData.date_2 || ''}
                    onChange={(e) => handleFormChange('date_2', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 6: Remarks */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks || ''}
                  onChange={(e) => handleFormChange('remarks', e.target.value)}
                  placeholder="e.g. Cheque clearance promised, client requested follow-up..."
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingIndex !== null ? 'Update Customer' : 'Save Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Customer Entry?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove &quot;{customers[deleteIndex]?.customer_name || 'this entry'}&quot;?
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteIndex(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Payment Table with Horizontal Scroll */}
      <div className="overflow-x-auto relative border border-slate-200 rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">
              <th className="py-2.5 px-3 min-w-[35px] text-center sticky left-0 z-20 bg-slate-100 border-r border-slate-200">#</th>
              <th className="py-2.5 px-3 min-w-[160px] sticky left-[35px] z-20 bg-slate-100 border-r border-slate-200">Customer Name *</th>
              <th className="py-2.5 px-2 min-w-[95px] text-center">CX Type</th>
              <th className="py-2.5 px-2.5 min-w-[110px] text-center">Payment Status</th>
              <th className="py-2.5 px-2.5 min-w-[95px] text-right">Amount</th>
              <th className="py-2.5 px-2.5 min-w-[95px] text-right text-emerald-800">Paid</th>
              <th className="py-2.5 px-2.5 min-w-[95px] text-right text-rose-800">Unpaid</th>
              <th className="py-2.5 px-2.5 min-w-[105px]">Payment Date</th>
              <th className="py-2.5 px-2.5 min-w-[105px]">Collection Date</th>
              <th className="py-2.5 px-2.5 min-w-[105px]">Next Collec</th>
              <th className="py-2.5 px-2 min-w-[85px] text-center">Plan</th>
              <th className="py-2.5 px-2 min-w-[85px]">Date-1</th>
              <th className="py-2.5 px-2 min-w-[85px]">Date-2</th>
              <th className="py-2.5 px-2.5 min-w-[90px] text-right">New Sales</th>
              <th className="py-2.5 px-2.5 min-w-[90px] text-right">TB</th>
              <th className="py-2.5 px-2.5 min-w-[90px] text-right">EMI</th>
              <th className="py-2.5 px-2.5 min-w-[110px] text-right bg-emerald-50 text-emerald-950 font-extrabold">
                Total Collection
              </th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-center">Lead Status</th>
              <th className="py-2.5 px-2 min-w-[65px] text-center">Prob %</th>
              <th className="py-2.5 px-3 min-w-[130px]">Remarks</th>
              {!disabled && <th className="py-2.5 px-2 min-w-[70px] text-center sticky right-0 z-20 bg-slate-100 border-l border-slate-200">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={21} className="py-8 text-center text-slate-400 text-xs">
                  No customer collection records yet. Click &quot;Add Customer Record&quot; above to enter records.
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => {
                const totalCol = calculateCustomerTotalCollection(c);
                const isPaid = c.payment_status === 'Paid' || (Number(c.paid_amount) > 0 && Number(c.unpaid_amount) === 0);
                const badgeStyle = LEAD_BADGE_STYLES[c.lead_status] || LEAD_BADGE_STYLES.HP;

                return (
                  <tr key={c.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Index */}
                    <td className="py-2 px-2 text-center text-slate-400 font-mono text-[11px] sticky left-0 z-10 bg-white hover:bg-slate-50 border-r border-slate-200">
                      {idx + 1}
                    </td>

                    {/* Customer Name */}
                    <td className="py-2 px-3 font-bold text-slate-900 sticky left-[35px] z-10 bg-white hover:bg-slate-50 border-r border-slate-200 truncate max-w-[200px]">
                      {c.customer_name || <span className="text-slate-400 italic">Untitled</span>}
                    </td>

                    {/* CX Type Dropdown */}
                    <td className="py-1 px-2 text-center">
                      <select
                        disabled={disabled}
                        value={c.cx_type || 'New Sales'}
                        onChange={(e) => onChangeCustomer(idx, 'cx_type', e.target.value as CXType)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        {CX_TYPE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>

                    {/* Payment Status (Quick Toggle Button) */}
                    <td className="py-1 px-2 text-center">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleTogglePaymentStatus(idx)}
                        title="Click to toggle Paid / Pending"
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                          isPaid 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-2.5 text-right font-bold text-slate-900 font-mono">
                      {formatBDT(c.amount ?? (Number(c.paid_amount || 0) + Number(c.unpaid_amount || 0)))}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-2 px-2.5 text-right font-bold text-emerald-700 font-mono">
                      {formatBDT(c.paid_amount || 0)}
                    </td>

                    {/* Unpaid Amount */}
                    <td className="py-2 px-2.5 text-right font-bold text-rose-700 font-mono">
                      {formatBDT(c.unpaid_amount || 0)}
                    </td>

                    {/* Payment Date */}
                    <td className="py-2 px-2.5 text-slate-600 text-[11px] font-mono">
                      {c.payment_date || '—'}
                    </td>

                    {/* Collection Date */}
                    <td className="py-2 px-2.5 text-slate-600 text-[11px] font-mono">
                      {c.collection_date || '—'}
                    </td>

                    {/* Next Collection Date */}
                    <td className="py-2 px-2.5 text-slate-600 text-[11px] font-mono">
                      {c.next_collection_date || '—'}
                    </td>

                    {/* In/Out Plan */}
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.in_out_plan === 'In Plan' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.in_out_plan || 'In Plan'}
                      </span>
                    </td>

                    {/* Date 1 */}
                    <td className="py-2 px-2 text-slate-500 text-[11px] font-mono">
                      {c.date_1 || '—'}
                    </td>

                    {/* Date 2 */}
                    <td className="py-2 px-2 text-slate-500 text-[11px] font-mono">
                      {c.date_2 || '—'}
                    </td>

                    {/* New Sales */}
                    <td className="py-2 px-2.5 text-right font-mono text-slate-800">
                      {formatBDT(c.new_sales_amount || 0)}
                    </td>

                    {/* TB */}
                    <td className="py-2 px-2.5 text-right font-mono text-slate-800">
                      {formatBDT(c.tb_amount || 0)}
                    </td>

                    {/* EMI */}
                    <td className="py-2 px-2.5 text-right font-mono text-slate-800">
                      {formatBDT(c.emi_amount || 0)}
                    </td>

                    {/* Total Collection */}
                    <td className="py-2 px-2.5 text-right font-extrabold text-emerald-950 bg-emerald-50/70 font-mono">
                      {formatBDT(totalCol)}
                    </td>

                    {/* Lead Status Dropdown with visually distinguishable badges */}
                    <td className="py-1 px-2 text-center">
                      <select
                        disabled={disabled}
                        value={c.lead_status || 'HP'}
                        onChange={(e) => onChangeCustomer(idx, 'lead_status', e.target.value as LeadStatus)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} focus:ring-1 focus:ring-emerald-500 cursor-pointer`}
                      >
                        {LEAD_STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt} className="bg-white text-slate-900 font-semibold">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Prob % */}
                    <td className="py-2 px-2 text-center font-bold text-slate-700">
                      {c.collection_probability || 50}%
                    </td>

                    {/* Remarks */}
                    <td className="py-2 px-3 text-slate-600 truncate max-w-[160px] text-[11px]" title={c.remarks}>
                      {c.remarks || '—'}
                    </td>

                    {/* Actions */}
                    {!disabled && (
                      <td className="py-2 px-2 text-center sticky right-0 z-10 bg-white hover:bg-slate-50 border-l border-slate-200">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(idx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteIndex(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
