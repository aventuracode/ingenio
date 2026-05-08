-- Script para agregar campos de auditoría a la tabla employees existente
-- Ejecuta esto si ya tienes la tabla sin estos campos

-- Agregar columnas de auditoría
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Nota: Los registros existentes tendrán NULL en estos campos
-- Puedes actualizarlos manualmente si es necesario
