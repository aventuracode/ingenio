# Ingenio - HR Platform

Sistema de Recursos Humanos con Evaluaciones 360°, gestión de roles y permisos basado en Next.js 14, Supabase y TypeScript.

**Stack:** Next.js 14 + TypeScript + Supabase + TailwindCSS

---

## 📚 Documentación

- 📖 **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura completa del sistema
- 🔧 **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solución de problemas

---

## ⚡ Quick Start

### 1. Clonar e instalar

```bash
npm install
```

### 2. Configurar entorno

```bash
# Crear .env.local
NEXT_PUBLIC_SUPABASE_URL=tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Aplicar RLS Policies

```bash
# En Supabase SQL Editor
\i supabase/policy/apply_all_policies.sql
```

### 4. Iniciar desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linter
```

---

## 📁 Estructura Principal

```
app/
├── dashboard/              # Dashboards por rol
│   ├── empleados/          # Gestión empleados
│   ├── evaluaciones/       # Evaluaciones 360°
│   ├── mi-feedback/        # Feedback anónimo
│   └── analytics/          # Analytics
└── auth/                   # Autenticación

lib/
├── auth/                   # Roles y permisos
├── services/               # Service Layer
└── supabase/               # Cliente Supabase

types/                      # TypeScript DTOs
components/                 # React components
supabase/policy/            # RLS Policies SQL
```

---

## 🎯 Características Clave

- ✅ **Evaluaciones 360°** con feedback anónimo
- ✅ **4 Roles** (admin, rrhh, manager, employee)
- ✅ **RLS Policies** en Supabase
- ✅ **DTOs seguros** por rol
- ✅ **Dashboards dinámicos** por rol
- ✅ **Modal moderno** para confirmaciones
- ✅ **Navegación adaptada** por rol

Ver detalles completos en [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🆘 Ayuda

- 🐛 **Problemas?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- 📖 **Arquitectura completa** → [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 📄 Licencia

Propietario - Todos los derechos reservados
