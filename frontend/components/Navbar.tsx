'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileSpreadsheet, 
  LogOut,
  Bell,
  FileCheck2
} from 'lucide-react';
import { fetchScorecardSubmissions } from '@/lib/api/scorecard';
import ScorecardSubmissionsModal from './ScorecardSubmissionsModal';

export default function Navbar() {
  const { profile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState<boolean>(false);

  const isSupervisorOrAdmin = profile && ['ADMIN', 'TL', 'CO'].includes(profile.role);

  const checkPendingSubmissions = async () => {
    if (!isSupervisorOrAdmin) return;
    try {
      const res = await fetchScorecardSubmissions('all', 'SUBMITTED');
      setPendingCount(res.pending_count || 0);
    } catch {
      // ignore network errors in polling
    }
  };

  useEffect(() => {
    if (isSupervisorOrAdmin) {
      checkPendingSubmissions();
      const interval = setInterval(checkPendingSubmissions, 45000);
      return () => clearInterval(interval);
    }
  }, [profile?.id, profile?.role]);

  const handleSelectSubmission = (employeeId: string, month: string) => {
    router.push(`/manual-scorecard?employee_id=${employeeId}&month=${month}`);
    setIsSubmissionsOpen(false);
  };

  if (!profile) return null;

  const roleBadgeColors: Record<string, string> = {
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    TL: 'bg-purple-100 text-purple-800 border-purple-200',
    CO: 'bg-blue-100 text-blue-800 border-blue-200',
    EMPLOYEE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link href="/manual-scorecard" className="flex items-center space-x-3">
                <img
                  src="/image/Sunset-Group-Logo.png"
                  alt="Sunset Group Logo"
                  className="h-10 w-auto object-contain max-w-[140px]"
                />
                <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 leading-tight text-sm">Monthly Scorecard</span>
                  <span className="text-[11px] text-slate-500 font-medium">Performance Portal</span>
                </div>
              </Link>

              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  href="/manual-scorecard"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Monthly Scorecard</span>
                </Link>

                {isSupervisorOrAdmin && (
                  <button
                    onClick={() => setIsSubmissionsOpen(true)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/70 transition-colors border border-transparent hover:border-indigo-100"
                  >
                    <FileCheck2 className="w-4 h-4 text-indigo-600" />
                    <span>Submissions</span>
                    {pendingCount > 0 && (
                      <span className="ml-1 px-2 py-0.2 text-xs font-bold rounded-full bg-rose-500 text-white animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notification Bell for Superadmins / Supervisors */}
              {isSupervisorOrAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setIsSubmissionsOpen(true)}
                    title={pendingCount > 0 ? `${pendingCount} pending scorecard submissions` : 'View submissions'}
                    className={`relative p-2 rounded-xl transition-all border ${
                      pendingCount > 0 
                        ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 ring-2 ring-rose-200' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1 text-[11px] font-bold text-white bg-rose-600 rounded-full border-2 border-white shadow-sm animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                </div>
              )}

              <div className="hidden sm:flex flex-col items-end pl-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-slate-800">{profile.full_name}</span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${roleBadgeColors[profile.role] || 'bg-slate-100 text-slate-800'}`}>
                    {profile.role}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  ID: {profile.employee_id} {profile.team?.name ? `• ${profile.team.name}` : ''}
                </span>
              </div>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Submissions Modal */}
      {isSupervisorOrAdmin && (
        <ScorecardSubmissionsModal
          isOpen={isSubmissionsOpen}
          onClose={() => {
            setIsSubmissionsOpen(false);
            checkPendingSubmissions();
          }}
          onSelectSubmission={handleSelectSubmission}
        />
      )}
    </>
  );
}
