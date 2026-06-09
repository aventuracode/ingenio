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

## 🚀 Despliegue en Vercel

### Requisitos previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com) con la base de datos configurada
- Variables de entorno listas (ver `.env.example`)

### 1. Conectar repositorio

- Ve a [vercel.com](https://vercel.com) e inicia sesión
- Click en "Add New Project"
- Importa tu repositorio de GitHub/GitLab/Bitbucket
- Selecciona el framework preset: **Next.js**

### 2. Configurar variables de entorno

En el dashboard de Vercel, ve a **Settings → Environment Variables** y agrega:

| Variable | Descripción | Tipo |
|----------|-------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | Production, Preview, Development |

> Obtén estos valores desde [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

### 3. Verificar configuración de build

El proyecto ya está configurado con:

- `output: 'standalone'` en `next.config.ts` para optimizar el despliegue
- `eslint.ignoreDuringBuilds: true` para evitar fallos por warnings de lint
- `.env.example` con las variables requeridas

### 4. Configurar dominio de imágenes (ya incluido)

El `next.config.ts` ya incluye los patrones de imágenes remotas:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'i.pravatar.cc' },
    { protocol: 'https', hostname: '*.supabase.co' },
  ],
}
```

### 5. Desplegar

```bash
# Opción A: Desde Vercel Dashboard
# Click en "Deploy"

# Opción B: Desde CLI
npm i -g vercel
vercel --prod
```

### Post-despliegue

1. **Verificar Supabase RLS Policies**: Asegúrate de que las políticas RLS estén aplicadas en Supabase
2. **Crear usuario admin**: Registra el primer usuario y asígnale el rol `admin` directamente en Supabase
3. **Configurar ciclos de evaluación**: Crea al menos un ciclo de evaluación activo desde el dashboard

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
