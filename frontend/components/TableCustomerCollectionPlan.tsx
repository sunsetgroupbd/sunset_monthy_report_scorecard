'use client';

import React, { useState } from 'react';
import { CustomerItem, LeadStatus } from '@/types/scorecard';
import { 
  formatBDT, 
  calculateCustomerTotalCollection, 
  calculateCustomerSummary 
} from '@/lib/calculations';
import { 
  Users, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

interface CustomerCollectionPlanProps {
  customers: CustomerItem[];
  onChangeCustomer: (index: number, field: keyof CustomerItem, value: any) => void;
  onAddCustomer: () => void;
  onDeleteCustomer: (index: number) => void;
  disabled: boolean;
}

export default function TableCustomerCollectionPlan({
  customers,
  onChangeCustomer,
  onAddCustomer,
  onDeleteCustomer,
  disabled
}: CustomerCollectionPlanProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const summary = calculateCustomerSummary(customers);

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      onDeleteCustomer(deleteIndex);
      setDeleteIndex(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Table 2: Customer Collection Plan
            </h2>
            <p className="text-xs text-slate-500">
              Account-level collection schedule, product distribution (New Sales, TB, EMI), and lead probability.
            </p>
          </div>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={onAddCustomer}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer Row</span>
          </button>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Delete Customer Row?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to remove &quot;{customers[deleteIndex]?.customer_name || 'this customer'}&quot; from the collection plan? This cannot be undone.
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

      {/* Customer Collection Table */}
      <div className="overflow-x-auto relative border border-slate-200 rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px] whitespace-nowrap">
              <th className="py-2.5 px-3 min-w-[35px] text-center">#</th>
              <th className="py-2.5 px-3 min-w-[170px]">Customer Name *</th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-right">Paid (BDT)</th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-right">Unpaid (BDT)</th>
              <th className="py-2.5 px-2.5 min-w-[120px]">Collection Date</th>
              <th className="py-2.5 px-2 min-w-[110px]">Date 1</th>
              <th className="py-2.5 px-2 min-w-[110px]">Date 2</th>
              <th className="py-2.5 px-2 min-w-[100px]">In/Out Plan</th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-right">New Sales</th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-right">TB Amount</th>
              <th className="py-2.5 px-2.5 min-w-[100px] text-right">EMI Amount</th>
              <th className="py-2.5 px-2.5 min-w-[120px] text-right bg-emerald-50 text-emerald-950 font-extrabold">
                Total Collection
              </th>
              <th className="py-2.5 px-2 min-w-[75px] text-center">Status</th>
              <th className="py-2.5 px-2 min-w-[85px] text-center">Prob %</th>
              <th className="py-2.5 px-3 min-w-[150px]">Remarks</th>
              {!disabled && <th className="py-2.5 px-2 min-w-[50px] text-center">Action</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-8 text-center text-slate-400 text-xs">
                  No customers added yet. Click &quot;Add Customer Row&quot; above to begin your collection forecast.
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
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        disabled={disabled}
                        value={c.customer_name || ''}
                        onChange={(e) => onChangeCustomer(idx, 'customer_name', e.target.value)}
                        placeholder="Client/Project Name"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Paid Amount */}
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        disabled={disabled}
                        value={c.paid_amount || ''}
                        onChange={(e) => onChangeCustomer(idx, 'paid_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right text-emerald-700 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Unpaid Amount */}
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        disabled={disabled}
                        value={c.unpaid_amount || ''}
                        onChange={(e) => onChangeCustomer(idx, 'unpaid_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right text-rose-700 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Collection Date */}
                    <td className="py-1 px-1.5">
                      <input
                        type="date"
                        disabled={disabled}
                        value={c.collection_date || ''}
                        onChange={(e) => onChangeCustomer(idx, 'collection_date', e.target.value || null)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Date 1 */}
                    <td className="py-1 px-1">
                      <input
                        type="date"
                        disabled={disabled}
                        value={c.date_1 || ''}
                        onChange={(e) => onChangeCustomer(idx, 'date_1', e.target.value || null)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Date 2 */}
                    <td className="py-1 px-1">
                      <input
                        type="date"
                        disabled={disabled}
                        value={c.date_2 || ''}
                        onChange={(e) => onChangeCustomer(idx, 'date_2', e.target.value || null)}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-[11px] focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* In / Out Plan */}
                    <td className="py-1 px-1.5">
                      <select
                        disabled={disabled}
                        value={c.in_out_plan || 'In Plan'}
                        onChange={(e) => onChangeCustomer(idx, 'in_out_plan', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-medium focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      >
                        <option value="In Plan">In Plan</option>
                        <option value="Out Plan">Out Plan</option>
                      </select>
                    </td>

                    {/* New Sales Amount */}
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        disabled={disabled}
                        value={c.new_sales_amount || ''}
                        onChange={(e) => onChangeCustomer(idx, 'new_sales_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* TB Amount */}
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        disabled={disabled}
                        value={c.tb_amount || ''}
                        onChange={(e) => onChangeCustomer(idx, 'tb_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* EMI Amount */}
                    <td className="py-1 px-1.5">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        disabled={disabled}
                        value={c.emi_amount || ''}
                        onChange={(e) => onChangeCustomer(idx, 'emi_amount', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-right focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Auto-calculated Total Collection */}
                    <td className="py-2 px-2.5 text-right font-bold text-emerald-900 bg-emerald-50/40">
                      {formatBDT(totalCol)}
                    </td>

                    {/* Lead Status */}
                    <td className="py-1 px-1 text-center">
                      <select
                        disabled={disabled}
                        value={c.lead_status || 'HP'}
                        onChange={(e) => onChangeCustomer(idx, 'lead_status', e.target.value as LeadStatus)}
                        className={`border rounded px-1 py-1 text-xs font-bold text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50 ${
                          c.lead_status === 'HP' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          c.lead_status === 'P' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          c.lead_status === 'FUP' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="HP">HP</option>
                        <option value="P">P</option>
                        <option value="FUP">FUP</option>
                        <option value="NI">NI</option>
                      </select>
                    </td>

                    {/* Probability % (10% to 100%) */}
                    <td className="py-1 px-1">
                      <select
                        disabled={disabled}
                        value={c.collection_probability || 50}
                        onChange={(e) => onChangeCustomer(idx, 'collection_probability', parseInt(e.target.value, 10))}
                        className="w-full bg-white border border-slate-200 rounded px-1 py-1 text-xs font-bold text-center focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      >
                        {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pct) => (
                          <option key={pct} value={pct}>{pct}%</option>
                        ))}
                      </select>
                    </td>

                    {/* Remarks */}
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        disabled={disabled}
                        value={c.remarks || ''}
                        onChange={(e) => onChangeCustomer(idx, 'remarks', e.target.value)}
                        placeholder="Notes / next action"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-50"
                      />
                    </td>

                    {/* Delete button */}
                    {!disabled && (
                      <td className="py-1 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => setDeleteIndex(idx)}
                          title="Delete Row"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer */}
          <tfoot>
            <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-extrabold text-slate-900 text-xs">
              <td colSpan={2} className="py-3 px-3 text-right uppercase tracking-wider text-[11px] text-slate-600">
                Customer Plan Totals:
              </td>
              <td className="py-3 px-2.5 text-right font-extrabold text-emerald-800">
                {formatBDT(summary.total_paid)}
              </td>
              <td className="py-3 px-2.5 text-right font-extrabold text-rose-800">
                {formatBDT(summary.total_unpaid)}
              </td>
              <td colSpan={7} className="py-3 px-2 text-right uppercase tracking-wider text-[11px] text-slate-600">
                Total Weighted Expected Collection:
              </td>
              <td className="py-3 px-2.5 text-right font-extrabold text-emerald-950 bg-emerald-200/60">
                {formatBDT(summary.total_expected_collection)}
              </td>
              <td colSpan={!disabled ? 4 : 3} className="py-3 px-3 text-xs text-slate-500 font-normal">
                (Sums of customer Total Collection × Probability %)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
