# MARTIN - Medical Assistant Platform

<div align="center">

![MARTIN Logo](https://via.placeholder.com/150x150?text=MARTIN)

**Plataforma de Asistente Médico Inteligente con IA Multimodal**

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-planning-yellow?style=flat-square)]()

[Características](#características) •
[Arquitectura](#arquitectura) •
[Documentación](#documentación) •
[Roadmap](#roadmap) •
[Comenzar](#comenzar)

</div>

---

## Visión General

**MARTIN** es una plataforma médica asistente completa que combina inteligencia artificial, procesamiento de voz, análisis de documentos y un vademecum inteligente para proporcionar asistencia médica personalizada a pacientes.

### Características Principales

- **Chat Médico Inteligente**: Conversaciones con IA especializada en medicina
- **Voz Bidireccional**: Conversación continua sin necesidad de botones
- **Interpretación de Exámenes**: Análisis automático de PDFs de resultados médicos
- **Vademecum Inteligente**: Identificación de medicamentos por foto, texto o voz
- **Memoria Contextual (RAG)**: Historial clínico personalizado con memoria a largo plazo
- **Multimodal**: Texto, voz e imágenes
- **Multi-plataforma**: Web, móvil (PWA), tablet
- **Multi-proveedor**: OpenAI, Claude, LMStudio (local)
- **Nivel Técnico Configurable**: Respuestas adaptadas al conocimiento del usuario

---

## Características

### Para Pacientes

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| 🤖 Chat Inteligente | Asistente médico con memoria contextual | ⏳ Planeado |
| 🎤 Conversación de Voz | Modo hands-free con detección de voz | ⏳ Planeado |
| 📄 Análisis de Exámenes | Interpretación automática de PDFs médicos | ⏳ Planeado |
| 💊 Vademecum | Búsqueda multimodal de medicamentos | ⏳ Planeado |
| 📊 Dashboard de Salud | Vista general de su salud | ⏳ Planeado |
| 🔔 Recordatorios | Medicación, citas, seguimiento | 🔮 Futuro |
| 👨‍👩‍👧‍👦 Modo Familiar | Gestión de salud familiar | 🔮 Futuro |

### Características Técnicas

- **Arquitectura Serverless**: Escalable y de bajo costo
- **PWA**: Instalable en dispositivos móviles
- **Modo Offline**: Funcionalidad básica sin conexión
- **RAG (Retrieval Augmented Generation)**: Memoria contextual personalizada
- **Multi-idioma**: Español, Inglés (extensible)
- **HIPAA/GDPR Ready**: Seguridad y privacidad por diseño
- **API Pública**: Para integraciones futuras

---

## Arquitectura

```
Frontend (Next.js + React)
         ↓
   API Gateway
         ↓
    ┌────┴────┐
    ↓         ↓
  AI Services  Storage
    ↓         ↓
  Vector DB   PostgreSQL
```

**Para más detalles, ver [ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## Documentación

Esta propuesta incluye documentación completa y detallada:

### 📚 Documentos Principales

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura completa del sistema
   - Diagrama de arquitectura
   - Componentes principales
   - Flujos de datos
   - Opciones de despliegue
   - Costos estimados

2. **[TECH_STACK.md](./TECH_STACK.md)** - Stack tecnológico y herramientas
   - Frontend stack
   - Backend stack
   - Servicios externos
   - package.json completo
   - Variables de entorno
   - Docker setup

3. **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)** - Diseño de base de datos
   - Schema completo de Prisma
   - Diagrama ER
   - Índices y optimización
   - Estrategia de backup
   - Compliance (HIPAA/GDPR)

4. **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Propuestas de mejoras
   - Funcionalidades prioritarias (MVP)
   - Funcionalidades avanzadas (Post-MVP)
   - Mejoras técnicas
   - Roadmap de innovación (1-2 años)

5. **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Plan de implementación
   - Fases y sprints detallados
   - Tareas específicas con código
   - Estimación de recursos
   - Costos de desarrollo
   - Métricas de éxito
   - Gestión de riesgos

6. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Estructura de carpetas (próximo)
   - Organización de archivos
   - Convenciones de código
   - Mejores prácticas

---

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+ + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Estado**: Zustand
- **Real-time**: Socket.io

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Cache**: Redis
- **Storage**: Cloudflare R2 / S3

### AI & ML
- **LLMs**: OpenAI GPT-4, Anthropic Claude, LMStudio (local)
- **Vector DB**: Pinecone / ChromaDB
- **Voice**: Whisper (STT), OpenAI TTS / ElevenLabs
- **Vision**: GPT-4 Vision / Claude Vision

### DevOps
- **Hosting**: Vercel / Cloudflare Pages / Railway
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Vercel Analytics
- **Testing**: Vitest + Playwright

---

## Roadmap

### Fase 1: MVP Core (Semana 3-8)
- ✅ Setup y configuración
- ⏳ UI/UX Foundation
- ⏳ Perfil médico
- ⏳ Chat básico con IA
- ⏳ RAG básico
- ⏳ Sistema de voz

### Fase 2: Funcionalidades Avanzadas (Semana 9-14)
- ⏳ Interpretación de PDFs
- ⏳ Vademecum con visión
- ⏳ Configuración de nivel técnico
- ⏳ Conversación continua

### Fase 3: Optimización (Semana 15-18)
- ⏳ Integración con Claude
- ⏳ Modo local (LMStudio)
- ⏳ PWA y optimización
- ⏳ Testing completo
- ⏳ Despliegue

### Fase 4: Lanzamiento (Semana 19-20)
- ⏳ Refinamiento UI/UX
- ⏳ Internacionalización
- ⏳ Documentación final
- ⏳ Launch

**Para ver el roadmap completo con tareas detalladas, consulta [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)**

---

## Comenzar

### Prerequisitos

```bash
Node.js >= 18.0.0
npm >= 9.0.0 o pnpm >= 8.0.0
Git
```

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/martin-medical.git
cd martin-medical

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves

# 4. Setup de base de datos
npx prisma migrate dev --name init
npx prisma generate

# 5. Seed de datos iniciales (opcional)
npm run db:seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Configuración Completa

Para una guía de configuración completa, incluyendo:
- Setup de servicios externos (OpenAI, Supabase, Pinecone)
- Configuración de Docker
- Setup de LMStudio local
- Configuración de despliegue

**Ver [IMPLEMENTATION_ROADMAP.md - Fase 0](./IMPLEMENTATION_ROADMAP.md#fase-0-preparación-y-setup-semana-1-2)**

---

## Estructura del Proyecto

```
martin-medical/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas
│   ├── api/               # API Routes
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   ├── chat/             # Chat components
│   ├── voice/            # Voice components
│   └── ...
├── lib/                   # Utilidades y helpers
│   ├── ai/               # AI providers
│   ├── db/               # Database utilities
│   ├── vector/           # Vector store
│   └── ...
├── prisma/                # Prisma schema y migrations
├── public/                # Assets estáticos
├── docs/                  # Documentación adicional
└── tests/                 # Tests
```

**Para estructura completa, ver [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** (próximo)

---

## Estimación de Costos

### Desarrollo (MVP - 20 semanas)

| Recurso | Costo (US/EU) | Costo (LATAM) |
|---------|---------------|---------------|
| 3 Developers | $120,000 | $45,000 |
| Designer (part-time) | $20,000 | $7,500 |
| DevOps (part-time) | $20,000 | $10,000 |
| **Total Desarrollo** | **$160,000** | **$62,500** |

### Operación (Mensual)

| Concepto | MVP (100 usuarios) | Producción (1K usuarios) |
|----------|-------------------|--------------------------|
| Hosting (Vercel/Railway) | $20 | $50-100 |
| Database (Supabase) | $0-25 | $25-50 |
| Vector DB (Pinecone) | $0-70 | $70 |
| AI APIs (OpenAI) | $50-100 | $300-500 |
| Storage (R2) | $5 | $10-20 |
| Cache (Redis) | $0-10 | $10-20 |
| **Total/mes** | **$75-230** | **$465-760** |

**Para análisis de costos completo, ver [ARCHITECTURE.md - Costos Estimados](./ARCHITECTURE.md#costos-estimados-mensual)**

---

## Opciones de Despliegue

### 1. Vercel (Recomendado para MVP)
```bash
npm install -g vercel
vercel --prod
```
- **Pros**: Deployment automático, serverless, fácil setup
- **Ideal para**: Desarrollo rápido, prototipos

### 2. Cloudflare Pages + Workers
```bash
npx wrangler pages publish
```
- **Pros**: CDN global, económico, R2 storage incluido
- **Ideal para**: Producción económica

### 3. Railway
```bash
railway up
```
- **Pros**: PostgreSQL incluido, WebSocket fácil, full control
- **Ideal para**: Producción con control

### 4. Self-hosted (Docker)
```bash
docker-compose up -d
```
- **Pros**: Control total, privacidad, LMStudio local
- **Ideal para**: Clínicas, redes locales

**Para comparativa completa, ver [ARCHITECTURE.md - Opciones de Despliegue](./ARCHITECTURE.md#opciones-de-despliegue)**

---

## Seguridad y Compliance

### Medidas de Seguridad

- ✅ Encriptación en tránsito (TLS 1.3)
- ✅ Encriptación en reposo (AES-256)
- ✅ Autenticación robusta (NextAuth.js)
- ✅ Rate limiting
- ✅ Validación de entrada (Zod)
- ✅ Sanitización de datos
- ✅ Audit logs

### Compliance

- 🔐 **HIPAA Ready**: Encriptación E2E, BAA con proveedores
- 🇪🇺 **GDPR Compliant**: Derecho al olvido, portabilidad de datos
- 📋 **Audit Trail**: Registro inmutable de acciones

**Para detalles de seguridad, ver [DATABASE_DESIGN.md - Seguridad](./DATABASE_DESIGN.md#consideraciones-de-privacidad-y-seguridad)**

---

## Contribuir

Actualmente el proyecto está en fase de planificación. Contribuciones serán bienvenidas una vez se inicie la implementación.

### Areas de Contribución

- 💻 Desarrollo Frontend/Backend
- 🎨 Diseño UI/UX
- 📝 Documentación
- 🧪 Testing
- 🌐 Traducciones
- 🐛 Reporte de bugs

---

## Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## Contacto

- **Proyecto**: MARTIN Medical Assistant
- **Repositorio**: [GitHub](https://github.com/tu-usuario/martin-medical)
- **Documentación**: Ver carpeta `/docs`

---

## Agradecimientos

- OpenAI por GPT-4 y Whisper
- Anthropic por Claude
- Vercel por Next.js
- La comunidad open source

---

<div align="center">

**Hecho con ❤️ para mejorar el acceso a la información médica**

[⬆ Volver arriba](#martin---medical-assistant-platform)

</div>
