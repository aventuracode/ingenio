
BEGIN;

-- =========================================================
-- CLEANUP POLICIES
-- =========================================================

DROP POLICY IF EXISTS "Reviewers can complete own reviews"
ON public.evaluation_reviewers;

DROP POLICY IF EXISTS "Reviewers can view assigned evaluations"
ON public.evaluation_reviewers;

DROP POLICY IF EXISTS "admins_manage_reviewers"
ON public.evaluation_reviewers;

DROP POLICY IF EXISTS "reviewers_can_view_assignments"
ON public.evaluation_reviewers;

DROP POLICY IF EXISTS "rrhh_admin_manage_reviewers"
ON public.evaluation_reviewers;

DROP POLICY IF EXISTS "reviewer_view_own_assignments"
ON public.evaluation_reviewers;

DROP POLICY IF EXISTS "reviewer_complete_own_reviews"
ON public.evaluation_reviewers;

DROP POLICY IF EXISTS "admin_delete_reviewers"
ON public.evaluation_reviewers;

-- =========================================================
-- ENABLE RLS
-- =========================================================

ALTER TABLE public.evaluation_reviewers
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SELECT
-- RRHH + ADMIN pueden ver todas las asignaciones
-- =========================================================

CREATE POLICY "rrhh_admin_view_all_reviewers"
ON public.evaluation_reviewers
FOR SELECT
TO authenticated
USING (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- SELECT
-- Reviewer puede ver SOLO sus asignaciones
-- =========================================================

CREATE POLICY "reviewer_view_own_assignments"
ON public.evaluation_reviewers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = evaluation_reviewers.reviewer_employee_id
    AND e.user_id = auth.uid()
  )
);

-- =========================================================
-- INSERT
-- RRHH + ADMIN pueden asignar reviewers
-- =========================================================

CREATE POLICY "rrhh_admin_create_reviewers"
ON public.evaluation_reviewers
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- UPDATE
-- RRHH + ADMIN pueden editar asignaciones
-- =========================================================

CREATE POLICY "rrhh_admin_update_reviewers"
ON public.evaluation_reviewers
FOR UPDATE
TO authenticated
USING (
  is_admin() OR is_rrhh()
)
WITH CHECK (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- UPDATE
-- Reviewer puede marcar completed SOLO en reviews propias
-- =========================================================

CREATE POLICY "reviewer_complete_own_reviews"
ON public.evaluation_reviewers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = evaluation_reviewers.reviewer_employee_id
    AND e.user_id = auth.uid()
  )
);

-- =========================================================
-- DELETE
-- SOLO ADMIN
-- =========================================================

CREATE POLICY "admin_delete_reviewers"
ON public.evaluation_reviewers
FOR DELETE
TO authenticated
USING (
  is_admin()
);

COMMIT;
