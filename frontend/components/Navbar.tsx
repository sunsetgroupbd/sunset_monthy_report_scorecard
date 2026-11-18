'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileSpreadsheet, 
  LayoutDashboard, 
  Users, 
  LogOut, 
  ShieldCheck, 
  UserCircle 
} from 'lucide-react';

export default function Navbar() {
  const { profile, logout } = useAuth();
  const pathname = usePathname();

  if (!profile) return null;

  const roleBadgeColors: Record<string, string> = {
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    TL: 'bg-purple-100 text-purple-800 border-purple-200',
    CO: 'bg-blue-100 text-blue-800 border-blue-200',
    EMPLOYEE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/manual-scorecard', label: 'Manual Scorecard', icon: FileSpreadsheet },
    ...(profile.role === 'ADMIN' ? [{ href: '/admin/users', label: 'User Management', icon: Users }] : []),
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
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

            <div className="hidden md:flex space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
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
  );
}
