-- ============================================
-- RLS POLICIES: evaluation_general_comments
-- ============================================

-- Habilitar RLS
ALTER TABLE public.evaluation_general_comments ENABLE ROW LEVEL SECURITY;

-- Política: Los reviewers pueden insertar sus propios comentarios
CREATE POLICY "Reviewers pueden crear sus comentarios"
ON public.evaluation_general_comments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.evaluation_reviewers
    WHERE evaluation_reviewers.evaluation_id = evaluation_general_comments.evaluation_id
    AND evaluation_reviewers.reviewer_employee_id = evaluation_general_comments.reviewer_employee_id
  )
);

-- Política: Los reviewers pueden actualizar sus propios comentarios
CREATE POLICY "Reviewers pueden actualizar sus comentarios"
ON public.evaluation_general_comments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.evaluation_reviewers
    WHERE evaluation_reviewers.evaluation_id = evaluation_general_comments.evaluation_id
    AND evaluation_reviewers.reviewer_employee_id = evaluation_general_comments.reviewer_employee_id
  )
);

-- Política: Los reviewers pueden ver sus propios comentarios
CREATE POLICY "Reviewers pueden ver sus comentarios"
ON public.evaluation_general_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.evaluation_reviewers
    WHERE evaluation_reviewers.evaluation_id = evaluation_general_comments.evaluation_id
    AND evaluation_reviewers.reviewer_employee_id = evaluation_general_comments.reviewer_employee_id
  )
);

-- Política: Los empleados evaluados pueden ver los comentarios de sus evaluaciones (sin ver quién los escribió)
CREATE POLICY "Empleados pueden ver comentarios de sus evaluaciones"
ON public.evaluation_general_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.evaluations
    WHERE evaluations.id = evaluation_general_comments.evaluation_id
    AND evaluations.employee_id IN (
      SELECT id FROM public.employees
      WHERE employees.user_id = auth.uid()
    )
  )
);
