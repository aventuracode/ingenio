
BEGIN;

-- =========================================================
-- CLEANUP POLICIES
-- =========================================================

DROP POLICY IF EXISTS "Authenticated users can view active questions"
ON public.evaluation_questions;

DROP POLICY IF EXISTS "admins_manage_questions"
ON public.evaluation_questions;

DROP POLICY IF EXISTS "authenticated_can_view_questions"
ON public.evaluation_questions;

DROP POLICY IF EXISTS "rrhh_admin_manage_questions"
ON public.evaluation_questions;

DROP POLICY IF EXISTS "authenticated_view_active_questions"
ON public.evaluation_questions;

DROP POLICY IF EXISTS "admin_delete_questions"
ON public.evaluation_questions;

-- =========================================================
-- ENABLE RLS
-- =========================================================

ALTER TABLE public.evaluation_questions
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SELECT
-- Usuarios autenticados SOLO ven preguntas activas
-- =========================================================

CREATE POLICY "authenticated_view_active_questions"
ON public.evaluation_questions
FOR SELECT
TO authenticated
USING (
  active = true
);

-- =========================================================
-- SELECT
-- RRHH + ADMIN pueden ver TODAS
-- (activas e inactivas)
-- =========================================================

CREATE POLICY "rrhh_admin_view_all_questions"
ON public.evaluation_questions
FOR SELECT
TO authenticated
USING (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- INSERT
-- RRHH + ADMIN pueden crear preguntas
-- =========================================================

CREATE POLICY "rrhh_admin_create_questions"
ON public.evaluation_questions
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- UPDATE
-- RRHH + ADMIN pueden editar preguntas
-- =========================================================

CREATE POLICY "rrhh_admin_update_questions"
ON public.evaluation_questions
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
-- (aunque se recomienda soft delete)
-- =========================================================

CREATE POLICY "admin_delete_questions"
ON public.evaluation_questions
FOR DELETE
TO authenticated
USING (
  is_admin()
);

COMMIT;
