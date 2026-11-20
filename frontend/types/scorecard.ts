export type UserRole = 'ADMIN' | 'TL' | 'CO' | 'EMPLOYEE';
export type ScorecardStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'CLOSED';
export type LeadStatus = 'HP' | 'P' | 'Fup' | 'Cancel' | 'Hold' | 'Next Month' | 'Next Year' | 'NR';
export type CXType = 'New Sales' | 'TB' | 'EMI';
export type PaymentType = 'Payable Amount' | 'Paid';
export type PaymentStatus = 'Paid' | 'Pending';

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
  target?: number; // Dedicated Target amount
  new_sales: number;
  tb_amount: number; // Token to Booking amount
  emi_amount: number;
  total_collection: number;
  total_collection_override?: number | null;
  total_achieved_override?: number | null;

  total_leads?: number;
  fair_leads: number;
  fb_leads: number;
  hp: number;
  p: number;
  fup: number;

  dialed_calls: number;
  connected_calls?: number;
  outdoor_visits: number;
  indoor_cx: number;
  meeting_hours?: number;

  // New fields from physical scorecard
  hold?: number;
  cancel?: number;
  sold_fair_leads?: number;
  sold_fb_leads?: number;
  sold_other_leads?: number;
}

export interface PeriodItem extends PeriodMetrics {
  id?: string;
  period_index: number; // 0=Target, 1..6=Weekly Periods (Till 5th..Till 30/31st)
}

export interface CustomerItem {
  id?: string;
  customer_name: string;
  cx_type?: CXType;
  payment_type?: PaymentType;
  amount?: number;
  payment_date?: string;
  payment_status?: PaymentStatus;
  paid_amount: number;
  unpaid_amount: number;
  collection_date?: string;
  next_collection_date?: string;
  next_collection_date_2?: string;
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

  // Dedicated Target
  target?: number;

  // Attendance
  planned_leave: number;
  unauthorized_leave: number;
  working_days?: number;

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

export interface ScorecardSubmissionItem {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  designation: string;
  team_name?: string | null;
  month: string;
  status: ScorecardStatus;
  submitted_at?: string | null;
  submitted_by_name?: string | null;
  target: number;
  prediction_amount: number;
  marking?: number | null;
  sheet_score?: number | null;
  call_score?: number | null;
  total_achieved_collection: number;
  updated_at?: string | null;
}

export interface ScorecardSubmissionsResponse {
  pending_count: number;
  submissions: ScorecardSubmissionItem[];
}

