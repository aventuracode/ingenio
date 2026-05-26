# Ingenio - Plataforma HR + Evaluaciones 360°

> Sistema SaaS enterprise de Recursos Humanos con evaluaciones 360° completas.

**Stack:** Next.js 15 + TypeScript + Supabase + TailwindCSS

---

## � Documentación

- 📊 **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Resumen ejecutivo completo
- 🏗️ **[EVALUACIONES_360_ARCHITECTURE.md](./EVALUACIONES_360_ARCHITECTURE.md)** - Arquitectura de evaluaciones
- 🔐 **[ROLES_PERMISSIONS_ARCHITECTURE_GUIDE.md](./ROLES_PERMISSIONS_ARCHITECTURE_GUIDE.md)** - Roles y permisos
- 📚 **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Índice de toda la documentación
- 🐛 **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Solución de problemas

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

Ejecutar scripts SQL en Supabase Dashboard:
```
supabase/policy/*.sql
```

Ver: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 4. Iniciar desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## �️ Scripts Disponibles

```bash
npm run dev          # Servidor desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linter
```

---

## � Estructura Principal

```
app/
├── dashboard/              # Dashboards por role
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
- ✅ **DTOs seguros** por role
- ✅ **Dashboards dinámicos** por role

Ver detalles completos en [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 🆘 Ayuda

- 🐛 **Problemas?** → [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
- 📚 **Documentación completa** → [DOCS_INDEX.md](./DOCS_INDEX.md)
- 🏗️ **Arquitectura** → [EVALUACIONES_360_ARCHITECTURE.md](./EVALUACIONES_360_ARCHITECTURE.md)

---

## 📄 Licencia

Propietario - Todos los derechos reservados
