'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  fetchEmployees, 
  fetchTeams, 
  createUserProfile, 
  updateUserProfile,
  createTeam 
} from '@/lib/api/scorecard';
import { Profile, Team, UserRole } from '@/types/scorecard';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Building2, 
  Edit, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus
} from 'lucide-react';

export default function AdminUsersPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // User Form State
  const [empId, setEmpId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [teamId, setTeamId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [joiningDate, setJoiningDate] = useState('2024-01-01');
  const [isActive, setIsActive] = useState(true);

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [teamDesc, setTeamDesc] = useState('');

  const loadData = async () => {
    try {
      const [uList, tList] = await Promise.all([
        fetchEmployees().catch(() => []),
        fetchTeams().catch(() => [])
      ]);
      setUsers(uList);
      setTeams(tList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (profile?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        loadData();
      }
    }
  }, [profile, authLoading, router]);

  const openCreateUser = () => {
    setEditingUser(null);
    setEmpId('');
    setFullName('');
    setEmail('');
    setDesignation('');
    setRole('EMPLOYEE');
    setTeamId(teams[0]?.id || '');
    setSupervisorId('');
    setJoiningDate('2024-01-01');
    setIsActive(true);
    setShowUserModal(true);
  };

  const openEditUser = (u: Profile) => {
    setEditingUser(u);
    setEmpId(u.employee_id);
    setFullName(u.full_name);
    setEmail(u.email);
    setDesignation(u.designation);
    setRole(u.role);
    setTeamId(u.team_id || '');
    setSupervisorId(u.supervisor_id || '');
    setJoiningDate(u.joining_date);
    setIsActive(u.is_active);
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (empId.length !== 8 || !/^\d{8}$/.test(empId)) {
      alert('Employee ID must be exactly 8 digits (e.g. 10001001).');
      return;
    }

    try {
      if (editingUser) {
        await updateUserProfile(editingUser.id, {
          full_name: fullName,
          designation,
          role,
          team_id: teamId || null,
          supervisor_id: supervisorId || null,
          joining_date: joiningDate,
          is_active: isActive
        });
        setFeedback({ type: 'success', message: 'Employee updated successfully.' });
      } else {
        await createUserProfile({
          employee_id: empId,
          full_name: fullName,
          email,
          designation,
          role,
          team_id: teamId || null,
          supervisor_id: supervisorId || null,
          joining_date: joiningDate,
          is_active: isActive
        });
        setFeedback({ type: 'success', message: 'Employee profile created successfully.' });
      }
      setShowUserModal(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await createTeam({
        name: teamName,
        code: teamCode.toUpperCase(),
        description: teamDesc
      });
      setFeedback({ type: 'success', message: 'Team created successfully.' });
      setShowTeamModal(false);
      setTeamName('');
      setTeamCode('');
      setTeamDesc('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create team.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">User & Team Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Admin console for managing organization hierarchy, team assignments, roles, and supervisor mapping.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTeamModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Add Team</span>
          </button>
          <button
            onClick={openCreateUser}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Registered Employees ({users.length})
          </h2>
          <span className="text-xs text-slate-400">Supabase Profiles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-4">Employee ID</th>
                <th className="py-2.5 px-4">Full Name</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Designation</th>
                <th className="py-2.5 px-4">Team</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">{u.employee_id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{u.full_name}</td>
                  <td className="py-3 px-4 text-slate-500">{u.email}</td>
                  <td className="py-3 px-4 text-slate-700">{u.designation}</td>
                  <td className="py-3 px-4 text-slate-700">{u.team?.name || 'Unassigned'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                      u.role === 'TL' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'CO' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditUser(u)}
                      className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition"
                      title="Edit Profile"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER MODAL (Create / Edit) */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingUser ? 'Edit Employee Profile' : 'Add New Employee'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">8-digit Employee ID *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  maxLength={8}
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="e.g. 10001001"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Employee Full Name"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Relationship Officer"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="CO">CO (Coordinator)</option>
                    <option value="TL">TL (Team Leader)</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Team</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">No Team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supervisor</label>
                  <select
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">No Supervisor</option>
                    {users.filter(u => u.id !== editingUser?.id).map((u) => (
                      <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="font-semibold text-slate-700">Account is Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {editingUser ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Team</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Sylhet Eagles Sales"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Team Code *</label>
                <input
                  type="text"
                  required
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  placeholder="e.g. SYL-EAGLE"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Regional territory or division details..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
