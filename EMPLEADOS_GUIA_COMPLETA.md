# Guía Completa: Sistema de Empleados

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
3. [Crear Empleados](#crear-empleados)
4. [Listado de Empleados](#listado-de-empleados)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Funcionalidades Implementadas

✅ **Listado de empleados** - Tabla moderna con búsqueda y filtros
✅ **Crear empleados** - Formulario completo con validación
✅ **Campos completos** - Nombre, Apellido, DNI, Email, Puesto, Fecha de Ingreso, Estado
✅ **Validación** - Campos obligatorios y únicos (DNI, Email)
✅ **UI moderna** - Diseño estilo SaaS con Tailwind CSS v4
✅ **Integración Supabase** - Row Level Security (RLS) configurado
✅ **TypeScript** - Completamente tipado

---

## 📁 Estructura de Archivos

```
ingenio-app/
├── app/
│   └── dashboard/
│       └── empleados/
│           ├── page.tsx              # Listado (Server Component)
│           └── new/
│               └── page.tsx          # Crear empleado
├── components/
│   ├── EmployeeTable.tsx             # Tabla de empleados
│   └── EmployeeForm.tsx              # Formulario de creación
├── types/
│   └── employee.ts                   # Tipos TypeScript
└── supabase/
    ├── schema.sql                    # Schema completo
    ├── add_dni_field.sql             # Migración DNI
    └── add_fecha_ingreso.sql         # Migración fecha
```

---

## 🗄️ Configuración Inicial

### 1. Crear la Tabla en Supabase

#### Opción A: Tabla Nueva (Recomendado)

Ve al **SQL Editor** en Supabase y ejecuta:

```sql
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_dni ON employees(dni);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden ver empleados"
  ON employees FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden crear empleados"
  ON employees FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar empleados"
  ON employees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden eliminar empleados"
  ON employees FOR DELETE TO authenticated USING (true);

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
```

#### Opción B: Actualizar Tabla Existente

Si ya tienes una tabla `employees` sin los campos nuevos:

```sql
-- Agregar campo DNI
ALTER TABLE employees ADD COLUMN IF NOT EXISTS dni TEXT;
CREATE INDEX IF NOT EXISTS idx_employees_dni ON employees(dni);
UPDATE employees 
SET dni = CONCAT('DNI', LPAD(CAST(ROW_NUMBER() OVER (ORDER BY created_at) AS TEXT), 8, '0'))
WHERE dni IS NULL;
ALTER TABLE employees ALTER COLUMN dni SET NOT NULL;
ALTER TABLE employees ADD CONSTRAINT employees_dni_unique UNIQUE (dni);

-- Agregar campo fecha_ingreso
ALTER TABLE employees ADD COLUMN IF NOT EXISTS fecha_ingreso DATE;
UPDATE employees SET fecha_ingreso = created_at::DATE WHERE fecha_ingreso IS NULL;
ALTER TABLE employees ALTER COLUMN fecha_ingreso SET NOT NULL;
```

### 2. Verificar la Instalación

```sql
-- Ver estructura de la tabla
\d employees

-- Ver empleados
SELECT * FROM employees ORDER BY created_at DESC;
```

---

## 📊 Estructura de la Base de Datos

### Columnas

| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| `id` | UUID | PRIMARY KEY | ID único generado automáticamente |
| `nombre` | VARCHAR(100) | NOT NULL | Nombre del empleado |
| `apellido` | VARCHAR(100) | NOT NULL | Apellido del empleado |
| `dni` | TEXT | NOT NULL, UNIQUE | Documento de identidad |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email corporativo |
| `puesto` | VARCHAR(100) | NOT NULL | Cargo o posición |
| `fecha_ingreso` | DATE | NOT NULL | Fecha de inicio en la empresa |
| `activo` | BOOLEAN | DEFAULT true | Estado del empleado |
| `avatar_url` | TEXT | NULLABLE | URL de la foto de perfil |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Fecha de creación del registro |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Última actualización |

### Índices

- `idx_employees_email` - Búsqueda por email
- `idx_employees_dni` - Búsqueda por DNI
- `idx_employees_created_at` - Ordenamiento por fecha

### Row Level Security (RLS)

Políticas configuradas para usuarios autenticados:
- ✅ SELECT - Ver todos los empleados
- ✅ INSERT - Crear empleados
- ✅ UPDATE - Actualizar empleados
- ✅ DELETE - Eliminar empleados

---

## 👥 Crear Empleados

### Acceso al Formulario

1. Ve a `/dashboard/empleados`
2. Click en el botón **"Nuevo Empleado"** (esquina superior derecha)
3. O navega directamente a `/dashboard/empleados/new`

### Campos del Formulario

| Campo | Tipo | Requerido | Validación | Ejemplo |
|-------|------|-----------|------------|---------|
| **Nombre** | text | ✅ | - | Juan |
| **Apellido** | text | ✅ | - | Pérez |
| **DNI** | text | ✅ | Único | 40111222 |
| **Email** | email | ✅ | Único, formato email | juan.perez@empresa.com |
| **Puesto** | text | ✅ | - | Desarrollador Full Stack |
| **Fecha de Ingreso** | date | ✅ | - | 2024-01-15 |
| **Activo** | checkbox | - | Default: true | ☑ |

### Layout del Formulario

```
┌─────────────────────────────────────────────┐
│  Crear Empleado                             │
├─────────────────────────────────────────────┤
│  Nombre *          │  Apellido *            │
│  DNI *             │  Email *               │
│  Puesto *          │  Fecha de Ingreso *    │
│  ☑ Empleado activo                          │
│                                              │
│              [Cancelar]  [Guardar Empleado] │
└─────────────────────────────────────────────┘
```

### Flujo de Creación

1. **Completar formulario** con todos los campos requeridos
2. **Click en "Guardar Empleado"**
3. **Validación automática** (HTML5 + Supabase)
4. **Inserción en base de datos**
5. **Redirección** al listado de empleados

### Ejemplo de Uso

```typescript
// Datos de ejemplo
{
  nombre: "Juan",
  apellido: "Pérez",
  dni: "40111222",
  email: "juan.perez@empresa.com",
  puesto: "Desarrollador Full Stack",
  fecha_ingreso: "2024-01-15",
  activo: true
}
```

---

## 📋 Listado de Empleados

### Vista de la Tabla

```
┌──────────────────┬───────────┬─────────────────────┬────────┐
│ Empleado         │ DNI       │ Puesto              │ Estado │
├──────────────────┼───────────┼─────────────────────┼────────┤
│ 👤 Juan Pérez    │ 40111222  │ Desarrollador Sr    │ Activo │
│    juan@...      │           │                     │        │
├──────────────────┼───────────┼─────────────────────┼────────┤
│ 👤 María González│ 38222333  │ Diseñadora UX/UI    │ Activo │
│    maria@...     │           │                     │        │
└──────────────────┴───────────┴─────────────────────┴────────┘
```

### Características

- **Avatares**: Imagen circular o iniciales con gradiente
- **Hover effects**: Fila se resalta al pasar el mouse
- **Badges de estado**: Verde (Activo) / Rojo (Inactivo)
- **Responsive**: Scroll horizontal en móviles
- **Empty state**: Mensaje cuando no hay empleados

### Acceso

- URL: `/dashboard/empleados`
- Requiere autenticación
- Server Component (datos frescos en cada carga)

---

## 🎨 Avatares (Opcional)

### Opción 1: URLs Externas

```sql
-- Usar servicio de avatares aleatorios
UPDATE employees 
SET avatar_url = 'https://i.pravatar.cc/150?u=' || email
WHERE email = 'juan.perez@empresa.com';
```

### Opción 2: Supabase Storage

1. Crea un bucket `avatars` en **Storage**
2. Configúralo como público
3. Sube imágenes
4. Actualiza `avatar_url` con la URL pública:

```sql
UPDATE employees 
SET avatar_url = 'https://tu-proyecto.supabase.co/storage/v1/object/public/avatars/juan.jpg'
WHERE email = 'juan.perez@empresa.com';
```

---

## 🐛 Troubleshooting

### Error: "column 'dni' does not exist"
**Causa**: La tabla no tiene el campo DNI
**Solución**: Ejecuta el script de migración `supabase/add_dni_field.sql`

### Error: "column 'fecha_ingreso' does not exist"
**Causa**: La tabla no tiene el campo fecha_ingreso
**Solución**: Ejecuta el script de migración `supabase/add_fecha_ingreso.sql`

### Error: "duplicate key value violates unique constraint"
**Causa**: El DNI o email ya existe en la base de datos
**Solución**: Usa un DNI/email diferente o actualiza el registro existente

### Error: "new row violates row-level security policy"
**Causa**: Las políticas RLS no están configuradas correctamente
**Solución**: Ejecuta las políticas del schema completo:

```sql
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear empleados" ON employees;

CREATE POLICY "Usuarios autenticados pueden crear empleados"
  ON employees FOR INSERT TO authenticated WITH CHECK (true);
```

### Error: "Failed to fetch"
**Causa**: Variables de entorno no configuradas
**Solución**: Verifica que `.env.local` tenga:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
```

### El formulario no redirige
**Causa**: Error en la inserción no capturado
**Solución**: Abre la consola del navegador (F12) y revisa los errores

### La tabla no muestra empleados
**Causa**: No hay datos o error en la query
**Solución**: 
1. Verifica en Supabase que hay empleados: `SELECT * FROM employees`
2. Revisa la consola del servidor para errores
3. Verifica que el usuario esté autenticado

### Imágenes de avatar no cargan
**Causa**: Dominio no configurado en `next.config.ts`
**Solución**: Agrega el dominio a `remotePatterns`:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'i.pravatar.cc' },
    { protocol: 'https', hostname: '*.supabase.co' },
  ],
}
```

---

## ✅ Checklist de Verificación

### Base de Datos
- [ ] Tabla `employees` creada
- [ ] Todos los campos presentes (nombre, apellido, dni, email, puesto, fecha_ingreso, activo)
- [ ] Índices creados (email, dni, created_at)
- [ ] RLS habilitado
- [ ] Políticas configuradas (SELECT, INSERT, UPDATE, DELETE)
- [ ] Trigger `update_updated_at` funcionando

### Frontend
- [ ] Página de listado funciona (`/dashboard/empleados`)
- [ ] Tabla muestra todas las columnas
- [ ] Botón "Nuevo Empleado" visible
- [ ] Formulario de creación funciona (`/dashboard/empleados/new`)
- [ ] Todos los campos presentes en el formulario
- [ ] Validación funciona (campos requeridos)
- [ ] Redirección después de guardar
- [ ] Avatares se muestran correctamente

### Funcionalidad
- [ ] Se puede crear un empleado nuevo
- [ ] No se puede duplicar DNI
- [ ] No se puede duplicar email
- [ ] Los empleados aparecen en el listado
- [ ] El estado (activo/inactivo) se muestra correctamente
- [ ] La fecha de ingreso se guarda correctamente

---

## 📚 Recursos Adicionales

### Archivos de Referencia
- `supabase/schema.sql` - Schema completo de la base de datos
- `supabase/add_dni_field.sql` - Migración para agregar DNI
- `supabase/add_fecha_ingreso.sql` - Migración para agregar fecha de ingreso

### Componentes
- `components/EmployeeTable.tsx` - Tabla de empleados
- `components/EmployeeForm.tsx` - Formulario de creación
- `types/employee.ts` - Tipos TypeScript

### Documentación
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Próximas Mejoras (Roadmap)

- [ ] Editar empleados
- [ ] Eliminar empleados (con confirmación)
- [ ] Búsqueda y filtros
- [ ] Paginación
- [ ] Ordenamiento por columnas
- [ ] Exportar a CSV/Excel
- [ ] Upload de avatares
- [ ] Historial de cambios
- [ ] Validación de DNI en tiempo real
- [ ] Autocompletado de puestos

---

**¿Necesitas ayuda?** Revisa la sección de [Troubleshooting](#troubleshooting) o consulta los logs del servidor.
