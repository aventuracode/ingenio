
BEGIN;

-- =========================================================
-- CLEANUP POLICIES
-- =========================================================

DROP POLICY IF EXISTS "Employees can view their reviewer evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "admins_create_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "admins_delete_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "admins_update_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "view_own_evaluations_or_admin"
ON public.evaluations;

DROP POLICY IF EXISTS "rrhh_admin_view_all_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "employee_view_own_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "reviewer_view_assigned_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "rrhh_admin_create_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "rrhh_admin_update_evaluations"
ON public.evaluations;

DROP POLICY IF EXISTS "admin_delete_evaluations"
ON public.evaluations;

-- =========================================================
-- ENABLE RLS
-- =========================================================

ALTER TABLE public.evaluations
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SELECT
-- ADMIN + RRHH pueden ver TODAS
-- =========================================================

CREATE POLICY "rrhh_admin_view_all_evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- SELECT
-- Employee puede ver sus propias evaluaciones
-- =========================================================

CREATE POLICY "employee_view_own_evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = evaluations.employee_id
    AND e.user_id = auth.uid()
  )
);

-- =========================================================
-- SELECT
-- Reviewer puede ver evaluaciones asignadas
-- =========================================================

CREATE POLICY "reviewer_view_assigned_evaluations"
ON public.evaluations
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT er.evaluation_id
    FROM evaluation_reviewers er
    WHERE er.reviewer_employee_id IN (
      SELECT e.id
      FROM employees e
      WHERE e.user_id = auth.uid()
    )
  )
);

-- =========================================================
-- INSERT
-- RRHH + ADMIN
-- =========================================================

CREATE POLICY "rrhh_admin_create_evaluations"
ON public.evaluations
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- UPDATE
-- RRHH + ADMIN
-- =========================================================

CREATE POLICY "rrhh_admin_update_evaluations"
ON public.evaluations
FOR UPDATE
TO authenticated
USING (
  is_admin() OR is_rrhh()
)
WITH CHECK (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- DELETE
-- SOLO ADMIN
-- =========================================================

CREATE POLICY "admin_delete_evaluations"
ON public.evaluations
FOR DELETE
TO authenticated
USING (
  is_admin()
);

COMMIT;

