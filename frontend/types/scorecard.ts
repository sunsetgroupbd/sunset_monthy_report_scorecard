export type UserRole = 'ADMIN' | 'TL' | 'CO' | 'EMPLOYEE';
export type ScorecardStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'CLOSED';
export type LeadStatus = 'HP' | 'P' | 'FUP' | 'NI';

export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  designation: string;
  team_id?: string;
  joining_date: string;
  role: UserRole;
  supervisor_id?: string;
  is_active: boolean;
  team?: Team;
  created_at: string;
  updated_at: string;
}

export interface Subordinate {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  designation: string;
  role: UserRole;
  team_id?: string;
  team_name?: string;
}

export interface PeriodMetrics {
  new_sales: number;
  tb_amount: number;
  emi_amount: number;
  total_collection: number;
  total_collection_override?: number | null;
  total_achieved_override?: number | null;

  total_leads: number;
  fair_leads: number;
  fb_leads: number;
  hp: number;
  p: number;
  fup: number;

  dialed_calls: number;
  connected_calls: number;
  outdoor_visits: number;
  indoor_cx: number;
  meeting_hours: number;
}

export interface PeriodItem extends PeriodMetrics {
  id?: string;
  period_index: number; // 0=Target, 1..5=Weekly Periods
}

export interface CustomerItem {
  id?: string;
  customer_name: string;
  paid_amount: number;
  unpaid_amount: number;
  collection_date?: string;
  date_1?: string;
  date_2?: string;
  in_out_plan?: string;
  new_sales_amount: number;
  tb_amount: number;
  emi_amount: number;
  total_collection: number;
  lead_status: LeadStatus;
  collection_probability: number;
  remarks?: string;
}

export interface AuditLog {
  id: string;
  changed_by_name?: string;
  previous_status?: string | null;
  new_status?: string | null;
  action: string;
  notes?: string | null;
  created_at: string;
}

export interface CustomerSummary {
  total_paid: number;
  total_unpaid: number;
  total_expected_collection: number;
}

export interface ScorecardResponse {
  id?: string | null;
  employee_id: string;
  month: string;
  status: ScorecardStatus;

  // Attendance
  planned_leave: number;
  unauthorized_leave: number;
  working_days: number;

  // Forecast (BDT)
  prediction_amount: number;

  // Supervisor Evaluation
  sheet_score?: number | null;
  call_score?: number | null;
  marking?: number | null;
  supervisor_notes?: string | null;

  // Portfolio Due Snapshot
  emi_due_monthly: number;
  emi_client_count: number;
  emi_hold_count: number;
  emi_cancel_count: number;

  tb_due_amount: number;
  tb_client_count: number;
  tb_share_count: number;
  tb_hold_count: number;
  tb_cancel_count: number;

  // Timestamps
  submitted_at?: string | null;
  submitted_by_id?: string | null;
  approved_at?: string | null;
  approved_by_id?: string | null;
  closed_at?: string | null;
  closed_by_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  // Relations
  employee?: Profile | null;
  periods: PeriodItem[];
  customers: CustomerItem[];
  audit_logs: AuditLog[];

  // Computed Summaries
  total_achieved: PeriodMetrics;
  achievement_pct: PeriodMetrics;
  customer_summary: CustomerSummary;

  // Permissions flags
  can_edit: boolean;
  can_edit_supervisor_fields: boolean;
  can_submit: boolean;
  can_approve: boolean;
  can_close: boolean;
  can_reopen: boolean;
}
