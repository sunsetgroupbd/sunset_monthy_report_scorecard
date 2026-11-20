import { ScorecardResponse, Subordinate, Profile, Team, ScorecardSubmissionsResponse } from '@/types/scorecard';
import { supabase } from '@/lib/supabase/client';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/+$/, '');

async function getAuthHeader(): Promise<HeadersInit> {
  let token: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || null;
  } catch (err) {
    // console.warn('Supabase getSession error:', err);
  }

  // Fallback to local storage test token if stored
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('scorecard_auth_token');
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function fetchScorecard(employeeId: string, month: string): Promise<ScorecardResponse> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/manual-scorecard?employee_id=${encodeURIComponent(employeeId)}&month=${encodeURIComponent(month)}`, {
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch scorecard (${res.status})`);
  }
  return res.json();
}

export async function upsertScorecard(payload: any): Promise<ScorecardResponse> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/manual-scorecard`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to save scorecard (${res.status})`);
  }
  return res.json();
}

export async function updateScorecardStatus(
  scorecardId: string,
  newStatus: string,
  notes?: string
): Promise<ScorecardResponse> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/manual-scorecard/${scorecardId}/status`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ status: newStatus, notes })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update status (${res.status})`);
  }
  return res.json();
}

export async function fetchSubordinates(): Promise<Subordinate[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/manual-scorecard/subordinates`, {
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch subordinates');
  }
  return res.json();
}

export async function fetchEmployees(): Promise<Profile[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/manual-scorecard/employees`, {
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch employees');
  }
  return res.json();
}

export async function fetchMonths(): Promise<string[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/manual-scorecard/months`, {
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function fetchScorecardSubmissions(
  month?: string,
  status?: string
): Promise<ScorecardSubmissionsResponse> {
  const headers = await getAuthHeader();
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (status) params.append('status', status);

  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/manual-scorecard/submissions${qs}`, {
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch scorecard submissions');
  }
  return res.json();
}


export async function fetchCurrentUserProfile(): Promise<Profile> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch current user profile');
  }
  return res.json();
}

export async function fetchTeams(): Promise<Team[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/teams`, {
    headers,
    cache: 'no-store'
  });

  if (!res.ok) return [];
  return res.json();
}

export async function createTeam(data: { name: string; code: string; description?: string }): Promise<Team> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create team');
  }
  return res.json();
}

export async function createUserProfile(data: any): Promise<Profile> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to create user profile');
  }
  return res.json();
}

export async function updateUserProfile(id: string, data: any): Promise<Profile> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update user profile');
  }
  return res.json();
}

export async function getDevToken(email: string): Promise<{ access_token: string; profile_id: string; email: string; role: string; full_name: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/dev-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to obtain dev token');
  }
  return res.json();
}
