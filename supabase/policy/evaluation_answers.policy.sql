
BEGIN;

-- =========================================================
-- CLEANUP POLICIES
-- =========================================================

DROP POLICY IF EXISTS "Reviewers can insert answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "Reviewers can view own answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "admins_delete_answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "reviewers_insert_own_answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "reviewers_update_own_answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "view_answers_secure"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "rrhh_admin_view_all_answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "reviewer_view_own_answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "employee_view_own_feedback"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "reviewer_insert_own_answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "reviewer_update_own_answers"
ON public.evaluation_answers;

DROP POLICY IF EXISTS "admin_delete_answers"
ON public.evaluation_answers;

-- =========================================================
-- ENABLE RLS
-- =========================================================

ALTER TABLE public.evaluation_answers
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SELECT
-- RRHH + ADMIN pueden ver TODAS las respuestas
-- =========================================================

CREATE POLICY "rrhh_admin_view_all_answers"
ON public.evaluation_answers
FOR SELECT
TO authenticated
USING (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- SELECT
-- Reviewer puede ver SOLO sus respuestas
-- =========================================================

CREATE POLICY "reviewer_view_own_answers"
ON public.evaluation_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = evaluation_answers.reviewer_employee_id
    AND e.user_id = auth.uid()
  )
);

-- =========================================================
-- SELECT
-- Employee puede ver feedback de SUS evaluaciones
-- =========================================================

CREATE POLICY "employee_view_own_feedback"
ON public.evaluation_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM evaluations ev
    JOIN employees e
      ON e.id = ev.employee_id
    WHERE ev.id = evaluation_answers.evaluation_id
    AND e.user_id = auth.uid()
  )
);

-- =========================================================
-- INSERT
-- Reviewer puede insertar SOLO respuestas propias
-- =========================================================

CREATE POLICY "reviewer_insert_own_answers"
ON public.evaluation_answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = evaluation_answers.reviewer_employee_id
    AND e.user_id = auth.uid()
  )
);

-- =========================================================
-- UPDATE
-- Reviewer puede editar SOLO respuestas propias
-- =========================================================

CREATE POLICY "reviewer_update_own_answers"
ON public.evaluation_answers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = evaluation_answers.reviewer_employee_id
    AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = evaluation_answers.reviewer_employee_id
    AND e.user_id = auth.uid()
  )
);

-- =========================================================
-- DELETE
-- SOLO ADMIN
-- =========================================================

CREATE POLICY "admin_delete_answers"
ON public.evaluation_answers
FOR DELETE
TO authenticated
USING (
  is_admin()
);

COMMIT;
