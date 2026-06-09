
BEGIN;

-- =========================================================
-- CLEANUP
-- =========================================================

DROP POLICY IF EXISTS "admin_rrhh_manage_cycles"
ON public.evaluation_cycles;

DROP POLICY IF EXISTS "rrhh_admin_create_cycles"
ON public.evaluation_cycles;

DROP POLICY IF EXISTS "rrhh_admin_update_cycles"
ON public.evaluation_cycles;

DROP POLICY IF EXISTS "admin_delete_cycles"
ON public.evaluation_cycles;

DROP POLICY IF EXISTS "authenticated_can_view_cycles"
ON public.evaluation_cycles;

-- =========================================================
-- ENABLE RLS
-- =========================================================

ALTER TABLE public.evaluation_cycles
ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SELECT
-- Todos autenticados pueden ver ciclos
-- =========================================================

CREATE POLICY "authenticated_can_view_cycles"
ON public.evaluation_cycles
FOR SELECT
TO authenticated
USING (
  true
);

-- =========================================================
-- INSERT
-- RRHH + ADMIN
-- =========================================================

CREATE POLICY "rrhh_admin_create_cycles"
ON public.evaluation_cycles
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin() OR is_rrhh()
);

-- =========================================================
-- UPDATE
-- RRHH + ADMIN
-- =========================================================

CREATE POLICY "rrhh_admin_update_cycles"
ON public.evaluation_cycles
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

CREATE POLICY "admin_delete_cycles"
ON public.evaluation_cycles
FOR DELETE
TO authenticated
USING (
  is_admin()
);

COMMIT;


-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'evaluation_reviewers'
ORDER BY policyname;


-- Resultado de policy
[
  {
    "schemaname": "public",
    "tablename": "evaluation_cycles",
    "policyname": "admin_delete_cycles",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "is_admin()",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "evaluation_cycles",
    "policyname": "authenticated_can_view_cycles",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "schemaname": "public",
    "tablename": "evaluation_cycles",
    "policyname": "rrhh_admin_create_cycles",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(is_admin() OR is_rrhh())"
  },
  {
    "schemaname": "public",
    "tablename": "evaluation_cycles",
    "policyname": "rrhh_admin_update_cycles",
    "permissive": "PERMISSIVE",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(is_admin() OR is_rrhh())",
    "with_check": "(is_admin() OR is_rrhh())"
  }
]