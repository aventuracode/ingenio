-- Crear tabla de empleados
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  puesto VARCHAR(100) NOT NULL,
  fecha_ingreso DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índice en email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Crear índice en DNI para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_employees_dni ON employees(dni);

-- Crear índice en created_at para ordenamiento
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios autenticados pueden ver todos los empleados
CREATE POLICY "Usuarios autenticados pueden ver empleados"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Los usuarios autenticados pueden insertar empleados
CREATE POLICY "Usuarios autenticados pueden crear empleados"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Los usuarios autenticados pueden actualizar empleados
CREATE POLICY "Usuarios autenticados pueden actualizar empleados"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (true);

-- Política: Los usuarios autenticados pueden eliminar empleados
CREATE POLICY "Usuarios autenticados pueden eliminar empleados"
  ON employees
  FOR DELETE
  TO authenticated
  USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Datos de ejemplo (opcional)
INSERT INTO employees (nombre, apellido, dni, email, puesto, fecha_ingreso, activo) VALUES
  ('Juan', 'Pérez', '40111222', 'juan.perez@empresa.com', 'Desarrollador Senior', '2023-01-15', true),
  ('María', 'González', '38222333', 'maria.gonzalez@empresa.com', 'Diseñadora UX/UI', '2023-03-20', true),
  ('Carlos', 'Rodríguez', '42333444', 'carlos.rodriguez@empresa.com', 'Project Manager', '2022-11-10', true),
  ('Ana', 'Martínez', '39444555', 'ana.martinez@empresa.com', 'QA Engineer', '2023-05-08', true),
  ('Luis', 'Fernández', '41555666', 'luis.fernandez@empresa.com', 'DevOps Engineer', '2022-09-12', false),
  ('Sofia', 'López', '37666777', 'sofia.lopez@empresa.com', 'Product Owner', '2023-02-28', true),
  ('Diego', 'Sánchez', '43777888', 'diego.sanchez@empresa.com', 'Backend Developer', '2023-06-01', true),
  ('Laura', 'Torres', '40888999', 'laura.torres@empresa.com', 'Frontend Developer', '2023-04-15', false)
ON CONFLICT (email) DO NOTHING;
