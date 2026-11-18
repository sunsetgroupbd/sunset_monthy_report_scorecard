'use client';

import React from 'react';
import { AuditLog } from '@/types/scorecard';
import { History, X, Clock, CheckCircle2, User } from 'lucide-react';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLog[];
}

export default function AuditTrailModal({ isOpen, onClose, auditLogs }: AuditTrailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Scorecard Audit Trail & Workflow History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 flex-1 space-y-4">
          {auditLogs.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              No audit logs recorded for this scorecard yet.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {auditLogs.map((log) => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(log.created_at).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })} (Dhaka)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-600 mb-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{log.changed_by_name || 'System User'}</span>
                    </div>

                    {log.previous_status && log.new_status && (
                      <div className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded px-2 py-0.5 inline-block mb-1">
                        Status: <span className="text-slate-500">{log.previous_status}</span> &rarr; <span className="text-emerald-700">{log.new_status}</span>
                      </div>
                    )}

                    {log.notes && (
                      <p className="text-xs text-slate-600 mt-1 italic bg-white/60 p-2 rounded border border-slate-100">
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
