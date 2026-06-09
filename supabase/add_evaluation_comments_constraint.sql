-- Agregar constraint único para evitar duplicados de comentarios
-- Un reviewer solo puede tener un comentario general por evaluación

ALTER TABLE public.evaluation_general_comments
ADD CONSTRAINT evaluation_general_comments_unique_reviewer 
UNIQUE (evaluation_id, reviewer_employee_id);

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_evaluation_general_comments_evaluation_id 
ON public.evaluation_general_comments(evaluation_id);

CREATE INDEX IF NOT EXISTS idx_evaluation_general_comments_reviewer_employee_id 
ON public.evaluation_general_comments(reviewer_employee_id);
