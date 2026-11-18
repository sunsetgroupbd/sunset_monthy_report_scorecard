-- ====================================================================
-- Migration: 002_rls_policies.sql
-- Description: Row Level Security (RLS) policies for Manual Scorecard
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_scorecard_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_scorecard_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_scorecard_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'ADMIN' AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_access_employee(emp_profile_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles self
    WHERE self.id = auth.uid() AND self.is_active = true AND (
      self.role = 'ADMIN'
      OR self.id = emp_profile_id
      OR (self.role IN ('TL', 'CO') AND EXISTS (
        SELECT 1 FROM public.profiles target
        WHERE target.id = emp_profile_id 
          AND (target.supervisor_id = self.id OR (self.team_id IS NOT NULL AND target.team_id = self.team_id))
      ))
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ---------------------------------------------------------------------
-- Teams Policies
-- ---------------------------------------------------------------------
CREATE POLICY "Authenticated users can read teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------
-- Profiles Policies
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view accessible profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR id = auth.uid()
    OR public.can_access_employee(id)
  );

CREATE POLICY "Users can update their own profile basic info"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      id = auth.uid() 
      AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- cannot escalate role
    )
  );

CREATE POLICY "Admins can insert and delete profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------
-- Manual Scorecards Policies
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view accessible scorecards"
  ON public.manual_scorecards FOR SELECT
  TO authenticated
  USING (public.can_access_employee(employee_id));

CREATE POLICY "Users can insert scorecard for self or subordinates"
  ON public.manual_scorecards FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() 
    OR (employee_id = auth.uid()) 
    OR (public.can_access_employee(employee_id) AND public.current_user_role() IN ('TL', 'CO'))
  );

CREATE POLICY "Users can update scorecards based on workflow"
  ON public.manual_scorecards FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (
      -- Employee can only update if DRAFT
      employee_id = auth.uid() AND status = 'DRAFT'
    )
    OR (
      -- TL or CO can update if not CLOSED
      public.can_access_employee(employee_id) 
      AND public.current_user_role() IN ('TL', 'CO')
      AND status != 'CLOSED'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      employee_id = auth.uid() 
      AND status IN ('DRAFT', 'SUBMITTED')
    )
    OR (
      public.can_access_employee(employee_id) 
      AND public.current_user_role() IN ('TL', 'CO')
      AND status IN ('DRAFT', 'SUBMITTED', 'APPROVED')
    )
  );

CREATE POLICY "Admins can delete scorecards"
  ON public.manual_scorecards FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------
-- Manual Scorecard Periods Policies
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view periods of accessible scorecards"
  ON public.manual_scorecard_periods FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND public.can_access_employee(sc.employee_id)
    )
  );

CREATE POLICY "Users can insert periods"
  ON public.manual_scorecard_periods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND (
        public.is_admin() 
        OR (sc.employee_id = auth.uid() AND sc.status = 'DRAFT')
        OR (public.can_access_employee(sc.employee_id) AND public.current_user_role() IN ('TL', 'CO') AND sc.status != 'CLOSED')
      )
    )
  );

CREATE POLICY "Users can update periods"
  ON public.manual_scorecard_periods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND (
        public.is_admin() 
        OR (sc.employee_id = auth.uid() AND sc.status = 'DRAFT')
        OR (public.can_access_employee(sc.employee_id) AND public.current_user_role() IN ('TL', 'CO') AND sc.status != 'CLOSED')
      )
    )
  );

CREATE POLICY "Users can delete periods"
  ON public.manual_scorecard_periods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND (
        public.is_admin() 
        OR (sc.employee_id = auth.uid() AND sc.status = 'DRAFT')
      )
    )
  );

-- ---------------------------------------------------------------------
-- Manual Scorecard Customers Policies
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view customers of accessible scorecards"
  ON public.manual_scorecard_customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND public.can_access_employee(sc.employee_id)
    )
  );

CREATE POLICY "Users can insert customers"
  ON public.manual_scorecard_customers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND (
        public.is_admin() 
        OR (sc.employee_id = auth.uid() AND sc.status = 'DRAFT')
        OR (public.can_access_employee(sc.employee_id) AND public.current_user_role() IN ('TL', 'CO') AND sc.status != 'CLOSED')
      )
    )
  );

CREATE POLICY "Users can update customers"
  ON public.manual_scorecard_customers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND (
        public.is_admin() 
        OR (sc.employee_id = auth.uid() AND sc.status = 'DRAFT')
        OR (public.can_access_employee(sc.employee_id) AND public.current_user_role() IN ('TL', 'CO') AND sc.status != 'CLOSED')
      )
    )
  );

CREATE POLICY "Users can delete customers"
  ON public.manual_scorecard_customers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND (
        public.is_admin() 
        OR (sc.employee_id = auth.uid() AND sc.status = 'DRAFT')
        OR (public.can_access_employee(sc.employee_id) AND public.current_user_role() IN ('TL', 'CO') AND sc.status != 'CLOSED')
      )
    )
  );

-- ---------------------------------------------------------------------
-- Audit Logs Policies
-- ---------------------------------------------------------------------
CREATE POLICY "Users can view audit logs of accessible scorecards"
  ON public.manual_scorecard_audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.manual_scorecards sc
      WHERE sc.id = scorecard_id AND public.can_access_employee(sc.employee_id)
    )
  );

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.manual_scorecard_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (changed_by_id = auth.uid() OR public.is_admin());
