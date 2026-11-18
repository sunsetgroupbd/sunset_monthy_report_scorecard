'use client';

import React, { useState } from 'react';
import { CustomerItem, LeadStatus } from '@/types/scorecard';
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
  Sparkles, 
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  Check,
  CreditCard
} from 'lucide-react';

interface CustomerCollectionPlanProps {
  customers: CustomerItem[];
  onChangeCustomer: (index: number, field: keyof CustomerItem, value: any) => void;
  onAddCustomer: (newCustomer?: CustomerItem) => void;
  onDeleteCustomer: (index: number) => void;
  disabled: boolean;
}

const EMPTY_FORM: CustomerItem = {
  customer_name: '',
  paid_amount: 0,
  unpaid_amount: 0,
  collection_date: '',
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    const payload: CustomerItem = {
      ...formData,
      customer_name: formData.customer_name.trim(),
      paid_amount: Number(formData.paid_amount) || 0,
      unpaid_amount: Number(formData.unpaid_amount) || 0,
      new_sales_amount: Number(formData.new_sales_amount) || 0,
      tb_amount: Number(formData.tb_amount) || 0,
      emi_amount: Number(formData.emi_amount) || 0,
      total_collection: formCalculatedTotal,
      collection_probability: Number(formData.collection_probability) || 50,
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

  const leadBadgeColors: Record<string, string> = {
    HP: 'bg-rose-100 text-rose-800 border-rose-200',
    P: 'bg-amber-100 text-amber-800 border-amber-200',
    FUP: 'bg-blue-100 text-blue-800 border-blue-200',
    NI: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Table 2: Prediction Payment
            </h2>
            <p className="text-xs text-slate-500">
              Customer-level payment forecast schedule, product distribution (New Sales, TB, EMI), and lead probability.
            </p>
          </div>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prediction Payment</span>
          </button>
        )}
      </div>

      {/* SUMMARY METRIC PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Paid</span>
          <span className="text-base font-extrabold text-emerald-950 mt-0.5">{formatBDT(summary.total_paid)}</span>
        </div>
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Total Unpaid</span>
          <span className="text-base font-extrabold text-rose-950 mt-0.5">{formatBDT(summary.total_unpaid)}</span>
        </div>
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Expected Collection</span>
          <span className="text-base font-extrabold text-blue-950 mt-0.5">{formatBDT(summary.total_expected_collection)}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Clients</span>
          <span className="text-base font-extrabold text-slate-900 mt-0.5">{customers.length} Accounts</span>
        </div>
      </div>

      {/* DEDICATED DATA ENTRY MODAL FORM */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingIndex !== null ? 'Edit Prediction Payment Entry' : 'Add Prediction Payment Entry'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter customer details and collection distribution.
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
              {/* Row 1: Customer Name & In/Out Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer / Client Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => handleFormChange('customer_name', e.target.value)}
                    placeholder="e.g. Bashundhara Group Project"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    In/Out Plan
                  </label>
                  <select
                    value={formData.in_out_plan || 'In Plan'}
                    onChange={(e) => handleFormChange('in_out_plan', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="In Plan">In Plan</option>
                    <option value="Out Plan">Out Plan</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Paid & Unpaid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paid Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.paid_amount || ''}
                    onChange={(e) => handleFormChange('paid_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unpaid Amount (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.unpaid_amount || ''}
                    onChange={(e) => handleFormChange('unpaid_amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-rose-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 3: Product Breakdown (New Sales, TB, EMI) */}
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Product Distribution
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs">
                    <span className="text-slate-500">Computed Total:</span>
                    <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                      {formatBDT(formCalculatedTotal)}
                    </span>
                  </div>
                </div>

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
              </div>

              {/* Row 4: Dates (Collection Date, Date 1, Date 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Collection Date
                  </label>
                  <input
                    type="date"
                    value={formData.collection_date || ''}
                    onChange={(e) => handleFormChange('collection_date', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date 1
                  </label>
                  <input
                    type="date"
                    value={formData.date_1 || ''}
                    onChange={(e) => handleFormChange('date_1', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date 2
                  </label>
                  <input
                    type="date"
                    value={formData.date_2 || ''}
                    onChange={(e) => handleFormChange('date_2', e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 5: Lead Status & Probability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Status
                  </label>
                  <select
                    value={formData.lead_status || 'HP'}
                    onChange={(e) => handleFormChange('lead_status', e.target.value as LeadStatus)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HP">HP (High Priority)</option>
                    <option value="P">P (Priority)</option>
                    <option value="FUP">FUP (Follow Up)</option>
                    <option value="NI">NI (Not Interested)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Collection Probability: <span className="font-bold text-emerald-700">{formData.collection_probability}%</span>
                  </label>
                  <select
                    value={formData.collection_probability || 50}
                    onChange={(e) => handleFormChange('collection_probability', parseInt(e.target.value))}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                      <option key={val} value={val}>{val}% Probability</option>
                    ))}
                  </select>
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
                  placeholder="e.g. Cheque received, clearance promised by end of week..."
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
                  <span>{editingIndex !== null ? 'Update Payment Entry' : 'Save Payment Entry'}</span>
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
              Delete Payment Entry?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove &quot;{customers[deleteIndex]?.customer_name || 'this entry'}&quot; from Prediction Payment?
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

      {/* Prediction Payment Table */}
      <div className="overflow-x-auto relative border border-slate-200 rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px] whitespace-nowrap">
              <th className="py-2.5 px-3 min-w-[35px] text-center">#</th>
              <th className="py-2.5 px-3 min-w-[170px]">Customer Name *</th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-right">Paid (BDT)</th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-right">Unpaid (BDT)</th>
              <th className="py-2.5 px-2.5 min-w-[110px]">Collection Date</th>
              <th className="py-2.5 px-2 min-w-[95px]">Date 1</th>
              <th className="py-2.5 px-2 min-w-[95px]">Date 2</th>
              <th className="py-2.5 px-2 min-w-[95px]">In/Out Plan</th>
              <th className="py-2.5 px-2.5 min-w-[95px] text-right">New Sales</th>
              <th className="py-2.5 px-2.5 min-w-[95px] text-right">TB Amount</th>
              <th className="py-2.5 px-2.5 min-w-[95px] text-right">EMI Amount</th>
              <th className="py-2.5 px-2.5 min-w-[115px] text-right bg-emerald-50 text-emerald-950 font-extrabold">
                Total Collection
              </th>
              <th className="py-2.5 px-2 min-w-[75px] text-center">Status</th>
              <th className="py-2.5 px-2 min-w-[75px] text-center">Prob %</th>
              <th className="py-2.5 px-3 min-w-[140px]">Remarks</th>
              {!disabled && <th className="py-2.5 px-2 min-w-[70px] text-center">Actions</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-8 text-center text-slate-400 text-xs">
                  No prediction payment entries yet. Click &quot;Add Prediction Payment&quot; above to open the entry form.
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => {
                const totalCol = calculateCustomerTotalCollection(c);

                return (
                  <tr key={c.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Index */}
                    <td className="py-2 px-2 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Customer Name */}
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {c.customer_name || <span className="text-slate-400 italic">Untitled</span>}
                    </td>

                    {/* Paid Amount */}
                    <td className="py-2 px-2.5 text-right font-semibold text-emerald-700">
                      {formatBDT(c.paid_amount || 0)}
                    </td>

                    {/* Unpaid Amount */}
                    <td className="py-2 px-2.5 text-right font-semibold text-rose-700">
                      {formatBDT(c.unpaid_amount || 0)}
                    </td>

                    {/* Collection Date */}
                    <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                      {c.collection_date || '—'}
                    </td>

                    {/* Date 1 */}
                    <td className="py-2 px-2 text-slate-500 text-[11px]">
                      {c.date_1 || '—'}
                    </td>

                    {/* Date 2 */}
                    <td className="py-2 px-2 text-slate-500 text-[11px]">
                      {c.date_2 || '—'}
                    </td>

                    {/* In/Out Plan */}
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.in_out_plan === 'In Plan' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.in_out_plan || 'In Plan'}
                      </span>
                    </td>

                    {/* New Sales */}
                    <td className="py-2 px-2.5 text-right text-slate-700">
                      {formatBDT(c.new_sales_amount || 0)}
                    </td>

                    {/* TB Amount */}
                    <td className="py-2 px-2.5 text-right text-slate-700">
                      {formatBDT(c.tb_amount || 0)}
                    </td>

                    {/* EMI Amount */}
                    <td className="py-2 px-2.5 text-right text-slate-700">
                      {formatBDT(c.emi_amount || 0)}
                    </td>

                    {/* Total Collection */}
                    <td className="py-2 px-2.5 text-right font-extrabold text-emerald-950 bg-emerald-50/50">
                      {formatBDT(totalCol)}
                    </td>

                    {/* Lead Status */}
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${
                        leadBadgeColors[c.lead_status || 'HP'] || 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.lead_status || 'HP'}
                      </span>
                    </td>

                    {/* Probability % */}
                    <td className="py-2 px-2 text-center font-bold text-slate-700">
                      {c.collection_probability || 0}%
                    </td>

                    {/* Remarks */}
                    <td className="py-2 px-3 text-slate-500 text-[11px] truncate max-w-[160px]" title={c.remarks || ''}>
                      {c.remarks || '—'}
                    </td>

                    {/* Actions */}
                    {!disabled && (
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(idx)}
                            title="Edit Prediction Payment"
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteIndex(idx)}
                            title="Delete Payment Entry"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
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

          {/* Table Footer Totals */}
          {customers.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300 font-extrabold text-slate-900 text-xs">
                <td colSpan={2} className="py-2.5 px-3 uppercase text-[11px] tracking-wider text-slate-700">
                  Total ({customers.length} Accounts)
                </td>
                <td className="py-2.5 px-2.5 text-right text-emerald-800">
                  {formatBDT(summary.total_paid)}
                </td>
                <td className="py-2.5 px-2.5 text-right text-rose-800">
                  {formatBDT(summary.total_unpaid)}
                </td>
                <td colSpan={4}></td>
                <td className="py-2.5 px-2.5 text-right">
                  {formatBDT(customers.reduce((acc, c) => acc + (Number(c.new_sales_amount) || 0), 0))}
                </td>
                <td className="py-2.5 px-2.5 text-right">
                  {formatBDT(customers.reduce((acc, c) => acc + (Number(c.tb_amount) || 0), 0))}
                </td>
                <td className="py-2.5 px-2.5 text-right">
                  {formatBDT(customers.reduce((acc, c) => acc + (Number(c.emi_amount) || 0), 0))}
                </td>
                <td className="py-2.5 px-2.5 text-right font-black text-emerald-950 bg-emerald-100/60">
                  {formatBDT(summary.total_expected_collection)}
                </td>
                <td colSpan={3}></td>
                {!disabled && <td></td>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
