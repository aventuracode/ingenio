# Guía: Editar Empleados

## 🎯 Funcionalidad Implementada

Se ha implementado un sistema completo para editar empleados con:

✅ **Ruta dinámica** - `/dashboard/empleados/[id]/edit`
✅ **Reutilización de componente** - `EmployeeForm` sirve para crear y editar
✅ **Carga de datos** - Obtiene empleado por ID desde Supabase
✅ **Validación completa** - Campos obligatorios y únicos
✅ **Auditoría** - Campos `created_by` y `updated_by`
✅ **Actualización automática** - `updated_at` se actualiza automáticamente
✅ **UI moderna** - Botón "Editar" en cada fila de la tabla
✅ **Manejo de errores** - Página 404 si el empleado no existe

---

## 📁 Archivos Creados/Modificados

### Páginas
- `app/dashboard/empleados/[id]/edit/page.tsx` - Página de edición (Server Component)
- `app/dashboard/empleados/[id]/edit/not-found.tsx` - Página 404 personalizada

### Componentes Modificados
- `components/EmployeeForm.tsx` - Ahora soporta modo crear y editar
- `components/EmployeeTable.tsx` - Agregado botón "Editar" en cada fila

### Base de Datos
- `supabase/schema.sql` - Actualizado con campos `created_by` y `updated_by`
- `supabase/add_audit_fields.sql` - Script para agregar campos de auditoría

---

## 🗄️ Actualizar la Base de Datos

### Si ya tienes la tabla `employees`:

Ejecuta este script en el SQL Editor de Supabase:

```sql
-- Agregar columnas de auditoría
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
```

O usa el archivo: `supabase/add_audit_fields.sql`

### Si estás creando la tabla desde cero:

Ejecuta el script completo: `supabase/schema.sql`

---

## 🎨 Cambios en la UI

### Tabla de Empleados

Ahora cada fila tiene un botón "Editar":

```
┌─────────────┬──────────┬────────────┬────────┬──────────┐
│ Empleado    │ DNI      │ Puesto     │ Estado │ Acciones │
├─────────────┼──────────┼────────────┼────────┼──────────┤
│ Juan Pérez  │ 40111222 │ Developer  │ Activo │ [Editar] │ ← Nuevo
└─────────────┴──────────┴────────────┴────────┴──────────┘
```

### Formulario de Edición

El mismo formulario que para crear, pero:
- **Título**: "Editar Empleado"
- **Subtítulo**: "Actualiza la información de [Nombre Apellido]"
- **Botón**: "Actualizar Empleado" (en lugar de "Guardar Empleado")
- **Datos precargados**: Todos los campos vienen con los valores actuales

---

## 🚀 Cómo Usar

### 1. Acceder a la Edición

Desde el listado de empleados:
- Click en el botón **"Editar"** en la fila del empleado
- O navega directamente a: `/dashboard/empleados/[id]/edit`

### 2. Modificar los Datos

Todos los campos son editables:
- Nombre
- Apellido
- DNI
- Email
- Puesto
- Fecha de Ingreso
- Estado (Activo/Inactivo)

### 3. Guardar Cambios

- Click en **"Actualizar Empleado"**
- El botón mostrará "Guardando..." mientras procesa
- Si hay error, se muestra un mensaje
- Si es exitoso, redirige a `/dashboard/empleados`

---

## 🔧 Flujo Técnico

### Server Component (Página de Edición)

```typescript
// app/dashboard/empleados/[id]/edit/page.tsx
export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener empleado por ID
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  // Si no existe, mostrar 404
  if (error || !employee) {
    notFound()
  }

  // Preparar datos iniciales
  const initialData: EmployeeFormData = {
    nombre: employee.nombre,
    apellido: employee.apellido,
    dni: employee.dni,
    email: employee.email,
    puesto: employee.puesto,
    fecha_ingreso: employee.fecha_ingreso,
    activo: employee.activo,
  }

  // Renderizar formulario con datos
  return <EmployeeForm employeeId={id} initialData={initialData} />
}
```

### Client Component (Formulario)

```typescript
// components/EmployeeForm.tsx
export default function EmployeeForm({ employeeId, initialData }: EmployeeFormProps) {
  // Si hay employeeId, es modo edición
  const isEditMode = !!employeeId

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()

    if (isEditMode) {
      // UPDATE
      await supabase
        .from('employees')
        .update({
          ...formData,
          updated_by: user?.id,
        })
        .eq('id', employeeId)
    } else {
      // INSERT
      await supabase
        .from('employees')
        .insert([{
          ...formData,
          created_by: user?.id,
          updated_by: user?.id,
        }])
    }

    router.push('/dashboard/empleados')
    router.refresh()
  }
}
```

---

## 📊 Campos de Auditoría

### Estructura

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `created_by` | UUID | ID del usuario que creó el registro |
| `updated_by` | UUID | ID del usuario que hizo la última actualización |
| `created_at` | TIMESTAMPTZ | Fecha de creación (automático) |
| `updated_at` | TIMESTAMPTZ | Fecha de última actualización (automático con trigger) |

### Trigger Automático

El campo `updated_at` se actualiza automáticamente gracias a un trigger:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Consultar Auditoría

```sql
-- Ver quién creó y modificó cada empleado
SELECT 
  e.nombre,
  e.apellido,
  e.created_at,
  e.updated_at,
  creator.email as created_by_email,
  updater.email as updated_by_email
FROM employees e
LEFT JOIN auth.users creator ON e.created_by = creator.id
LEFT JOIN auth.users updater ON e.updated_by = updater.id
ORDER BY e.updated_at DESC;
```

---

## 🐛 Troubleshooting

### Error: "Empleado no encontrado"
**Causa**: El ID no existe en la base de datos
**Solución**: Verifica que el ID sea correcto o que el empleado no haya sido eliminado

### Error: "column 'created_by' does not exist"
**Causa**: La tabla no tiene los campos de auditoría
**Solución**: Ejecuta el script `supabase/add_audit_fields.sql`

### Error: "duplicate key value violates unique constraint"
**Causa**: Intentas cambiar el DNI o email a uno que ya existe
**Solución**: Usa un DNI/email diferente

### El formulario no carga los datos
**Causa**: Error al obtener el empleado desde Supabase
**Solución**: 
1. Verifica la consola del servidor para errores
2. Confirma que las políticas RLS permiten SELECT
3. Verifica que el usuario esté autenticado

### Los cambios no se guardan
**Causa**: Error en la actualización
**Solución**: 
1. Abre la consola del navegador (F12)
2. Revisa los errores
3. Verifica las políticas RLS para UPDATE

---

## ✅ Checklist de Verificación

### Base de Datos
- [ ] Campos `created_by` y `updated_by` agregados
- [ ] Trigger `update_updated_at` funcionando
- [ ] Políticas RLS permiten UPDATE

### Frontend
- [ ] Botón "Editar" visible en cada fila
- [ ] Página de edición carga correctamente
- [ ] Formulario muestra datos precargados
- [ ] Botón dice "Actualizar Empleado"
- [ ] Redirección después de guardar funciona

### Funcionalidad
- [ ] Se puede editar un empleado
- [ ] Los cambios se guardan correctamente
- [ ] `updated_at` se actualiza automáticamente
- [ ] `updated_by` guarda el ID del usuario
- [ ] Validación de campos únicos funciona
- [ ] Página 404 se muestra si el empleado no existe

---

## 🎯 Diferencias: Crear vs Editar

| Aspecto | Crear | Editar |
|---------|-------|--------|
| **Ruta** | `/dashboard/empleados/new` | `/dashboard/empleados/[id]/edit` |
| **Título** | "Crear Empleado" | "Editar Empleado" |
| **Botón** | "Guardar Empleado" | "Actualizar Empleado" |
| **Datos iniciales** | Vacíos (fecha actual) | Precargados desde DB |
| **Operación SQL** | INSERT | UPDATE |
| **Campo created_by** | Se guarda | No se modifica |
| **Campo updated_by** | Se guarda | Se actualiza |
| **Campo created_at** | Automático | No se modifica |
| **Campo updated_at** | Automático | Se actualiza (trigger) |

---

## 💡 Mejoras Futuras (Opcional)

- [ ] Historial de cambios (log de auditoría)
- [ ] Comparación de cambios (antes/después)
- [ ] Confirmación antes de guardar cambios
- [ ] Deshacer cambios (reset form)
- [ ] Validación de cambios (detectar si hubo modificaciones)
- [ ] Mostrar quién y cuándo fue la última modificación
- [ ] Bloqueo de edición concurrente
- [ ] Notificación de cambios guardados (toast)

---

## 📚 Recursos

### Archivos de Referencia
- `components/EmployeeForm.tsx` - Formulario reutilizable
- `app/dashboard/empleados/[id]/edit/page.tsx` - Página de edición
- `supabase/schema.sql` - Schema con campos de auditoría
- `supabase/add_audit_fields.sql` - Migración de auditoría

### Documentación
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Supabase Update](https://supabase.com/docs/reference/javascript/update)
- [Supabase Auth](https://supabase.com/docs/reference/javascript/auth-getuser)

---

**¿Necesitas ayuda?** Revisa la sección de [Troubleshooting](#troubleshooting) o consulta los logs del servidor.
