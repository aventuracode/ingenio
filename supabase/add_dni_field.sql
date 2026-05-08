-- Script para agregar el campo DNI a una tabla employees existente
-- Ejecuta esto SOLO si ya creaste la tabla sin el campo DNI

-- Agregar columna DNI
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS dni TEXT;

-- Crear índice en DNI
CREATE INDEX IF NOT EXISTS idx_employees_dni ON employees(dni);

-- Actualizar registros existentes con DNI temporal (opcional)
-- Puedes personalizar esto según tus necesidades
UPDATE employees 
SET dni = CONCAT('DNI', LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT), 8, '0'))
WHERE dni IS NULL;

-- Hacer el campo obligatorio y único
ALTER TABLE employees 
ALTER COLUMN dni SET NOT NULL;

ALTER TABLE employees 
ADD CONSTRAINT employees_dni_unique UNIQUE (dni);
