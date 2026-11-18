-- ====================================================================
-- Migration: 004_performance_fixes.sql
-- Description: Indexes for unindexed foreign keys and initplan optimization
-- ====================================================================

-- 1. Covering indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON public.manual_scorecard_audit_logs(changed_by_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_submitted_by ON public.manual_scorecards(submitted_by_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_approved_by ON public.manual_scorecards(approved_by_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_closed_by ON public.manual_scorecards(closed_by_id);

-- 2. Clean up multiple permissive policies on teams
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
CREATE POLICY "Admins can insert update delete teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Optimize RLS with (select auth.uid()) for initplan caching
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;
CREATE POLICY "Users can view accessible profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR id = (select auth.uid())
    OR public.can_access_employee(id)
  );

DROP POLICY IF EXISTS "Users can update their own profile basic info" ON public.profiles;
CREATE POLICY "Users can update their own profile basic info"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()) OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      id = (select auth.uid()) 
      AND role = (SELECT role FROM public.profiles WHERE id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can insert scorecard for self or subordinates" ON public.manual_scorecards;
CREATE POLICY "Users can insert scorecard for self or subordinates"
  ON public.manual_scorecards FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() 
    OR (employee_id = (select auth.uid())) 
    OR (public.can_access_employee(employee_id) AND public.current_user_role() IN ('TL', 'CO'))
  );

DROP POLICY IF EXISTS "Users can update scorecards based on workflow" ON public.manual_scorecards;
CREATE POLICY "Users can update scorecards based on workflow"
  ON public.manual_scorecards FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (
      employee_id = (select auth.uid()) AND status = 'DRAFT'
    )
    OR (
      public.can_access_employee(employee_id) 
      AND public.current_user_role() IN ('TL', 'CO')
      AND status != 'CLOSED'
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      employee_id = (select auth.uid()) 
      AND status IN ('DRAFT', 'SUBMITTED')
    )
    OR (
      public.can_access_employee(employee_id) 
      AND public.current_user_role() IN ('TL', 'CO')
      AND status IN ('DRAFT', 'SUBMITTED', 'APPROVED')
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.manual_scorecard_audit_logs;
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.manual_scorecard_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (changed_by_id = (select auth.uid()) OR public.is_admin());
