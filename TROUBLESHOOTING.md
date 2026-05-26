# Guía de Solución de Problemas

## 🔍 Problemas Comunes

### **1. Error: duplicate key value violates unique constraint "unique_reviewer_question"**

**Error:**
```
duplicate key value violates unique constraint "unique_reviewer_question"
```

**Causa:**
- Intentar guardar borrador múltiples veces
- El código intentaba INSERT en lugar de UPSERT
- Ya existen respuestas para ese reviewer + pregunta

**Solución:**
✅ **Ya corregido** - El código ahora usa `upsert()` en lugar de `delete() + insert()`

Si aún ves este error:
1. Recargar la página (Cmd/Ctrl + Shift + R)
2. Verificar que el código use `upsert()` en `EvaluationAnswerForm.tsx`

---

### **2. Error: RLS Policy en evaluation_cycles / evaluation_reviewers / evaluation_answers**

**Errores:**
```
Error: new row violates row-level security policy for table "evaluation_cycles"
Error: new row violates row-level security policy for table "evaluation_reviewers"
Error: new row violates row-level security policy for table "evaluation_answers"
```

**Causa:**
- Las políticas RLS no permiten al usuario crear/modificar datos
- El usuario no tiene el role correcto asignado
- Las funciones `is_admin()` y `is_rrhh()` no existen en Supabase

**Solución:**

#### **Opción A: Aplicar Políticas RLS (RECOMENDADO)**

1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar los scripts en orden:
   - `supabase/policy/evaluation_cycles.policy.sql`
   - `supabase/policy/evaluation.policy.sql`
   - `supabase/policy/evaluation_reviewers.policy.sql`
   - `supabase/policy/evaluation_answers.policy.sql`
3. Verificar que las políticas se crearon correctamente

#### **Opción B: Verificar Role del Usuario**

```sql
-- Verificar role del usuario actual
SELECT 
  p.id,
  p.email,
  r.name as role
FROM auth.users u
JOIN profiles p ON u.id = p.id
JOIN roles r ON p.role_id = r.id
WHERE u.email = 'tu-email@ejemplo.com';
```

Si el role no es `admin` o `rrhh`, actualizar:

```sql
-- Actualizar role a admin
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE id = 'user-uuid-aqui';
```

---

### **2. Error: TypeError: Load failed (Fetch Role)**

**Error:**
```
Error fetching user role: { code: '', details: '', hint: '', message: 'TypeError: Load failed' }
```

**Causas Posibles:**
1. Problema de red/conectividad con Supabase
2. Variables de entorno incorrectas
3. RLS policies bloqueando acceso a `profiles` o `roles`

**Solución:**

#### **A. Verificar Variables de Entorno**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

#### **B. Verificar RLS en profiles y roles**

```sql
-- Verificar políticas en profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Verificar políticas en roles
SELECT * FROM pg_policies WHERE tablename = 'roles';
```

Debe existir una política que permita a usuarios autenticados leer su propio profile:

```sql
-- Policy para leer profiles
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy para leer roles
CREATE POLICY "Users can view roles"
ON roles
FOR SELECT
TO authenticated
USING (true);
```

#### **C. Verificar Conectividad**

```bash
# Probar conexión a Supabase
curl https://tu-proyecto.supabase.co/rest/v1/
```

---

### **3. Error: 404 en /dashboard/analytics**

**Error:**
```
GET /dashboard/analytics 404
```

**Causa:**
- La página no existía

**Solución:**
- ✅ Ya creada: `app/dashboard/analytics/page.tsx`

---

### **4. Error: Failed to fetch RSC payload**

**Error:**
```
Failed to fetch RSC payload for http://localhost:3000/dashboard/evaluaciones
```

**Causas Posibles:**
1. Error en Server Component
2. Timeout en query de Supabase
3. Error en transformación de datos

**Solución:**

#### **A. Revisar Logs del Server Component**

Buscar en terminal errores específicos de la página:
```
GET /dashboard/evaluaciones 200 in 1188ms
```

Si hay error 500, revisar el código del componente.

#### **B. Verificar Query de Supabase**

En `lib/services/evaluations.service.ts`, verificar que el query no tenga errores:

```typescript
const { data, error } = await supabase
  .from('evaluations')
  .select(`...`)

if (error) {
  console.error('Error fetching evaluations:', error)
}
```

#### **C. Reducir Timeout**

Si las queries son muy lentas, optimizar:

```typescript
// Agregar límite
.limit(50)

// Agregar índices en Supabase
CREATE INDEX idx_evaluations_employee_id ON evaluations(employee_id);
CREATE INDEX idx_evaluations_cycle_id ON evaluations(cycle_id);
```

---

## 🔧 Comandos Útiles

### **Verificar Estado de Supabase**

```sql
-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver políticas RLS
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';

-- Ver roles disponibles
SELECT * FROM roles;

-- Ver profiles con roles
SELECT 
  p.id,
  p.email,
  r.name as role
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id;
```

### **Limpiar Caché de Next.js**

```bash
# Eliminar .next y reinstalar
rm -rf .next
npm run dev
```

### **Reiniciar Supabase Local (si usas local)**

```bash
supabase stop
supabase start
```

---

## 🎯 Checklist de Verificación

### **Antes de Crear Ciclo:**

- [ ] Usuario tiene role `admin` o `rrhh`
- [ ] RLS policies permiten INSERT en `evaluation_cycles`
- [ ] Variables de entorno configuradas correctamente
- [ ] Conexión a Supabase funciona

### **Verificar:**

```sql
-- 1. Verificar tu role
SELECT 
  u.email,
  r.name as role
FROM auth.users u
JOIN profiles p ON u.id = p.id
JOIN roles r ON p.role_id = r.id
WHERE u.id = auth.uid();

-- 2. Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'evaluation_cycles';

-- 3. Probar INSERT manual
INSERT INTO evaluation_cycles (title, description, start_date, end_date, status)
VALUES ('Test Cycle', 'Test', NOW(), NOW() + INTERVAL '30 days', 'draft');
```

---

## 🚨 Errores Comunes y Soluciones

### **Error: "User not authenticated"**

**Solución:**
```typescript
// Verificar que el usuario esté logueado
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  redirect('/login')
}
```

### **Error: "Role is null"**

**Solución:**
```sql
-- Asignar role al usuario
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE id = 'user-uuid';
```

### **Error: "RLS policy violation"**

**Solución:**
1. Verificar que las políticas existen
2. Verificar que el usuario tiene el role correcto
3. Aplicar migration SQL de fix

---

## 📊 Logs Útiles

### **Agregar Logs en useCurrentRole:**

```typescript
useEffect(() => {
  // ...
  console.log('🔍 Fetching user role...')
  console.log('👤 User:', user?.email)
  console.log('🎭 Role:', userRole)
}, [])
```

### **Agregar Logs en Middleware:**

```typescript
console.log('🛡️ Middleware:', pathname)
console.log('👤 User:', user?.email)
console.log('🎭 Role:', userRole)
console.log('✅ Allowed:', allowedRoles)
```

---

## ✅ Solución Rápida

Si tienes múltiples errores, ejecuta en orden:

1. **Verificar variables de entorno**
   ```bash
   cat .env.local
   ```

2. **Aplicar migration RLS**
   - Ejecutar `fix_evaluation_cycles_rls.sql` en Supabase

3. **Verificar role del usuario**
   ```sql
   SELECT * FROM profiles WHERE id = auth.uid();
   ```

4. **Limpiar caché**
   ```bash
   rm -rf .next
   npm run dev
   ```

5. **Probar crear ciclo nuevamente**

---

**Si los problemas persisten, revisar los logs específicos en la consola del navegador y en el terminal de Next.js.**
