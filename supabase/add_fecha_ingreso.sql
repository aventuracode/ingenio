-- Script para agregar el campo fecha_ingreso a una tabla existente
-- Ejecuta esto SOLO si ya creaste la tabla sin el campo fecha_ingreso

-- Agregar columna fecha_ingreso
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;

-- Actualizar registros existentes con una fecha por defecto
UPDATE employees 
SET fecha_ingreso = created_at::DATE 
WHERE fecha_ingreso IS NULL;

-- Hacer el campo obligatorio
ALTER TABLE employees 
ALTER COLUMN fecha_ingreso SET NOT NULL;
