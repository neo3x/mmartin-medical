# Arquitectura - Plataforma Médica MARTIN

## Visión General

MARTIN es una plataforma médica asistente inteligente con capacidades multimodales (voz, texto, imágenes) que proporciona asistencia médica personalizada, interpretación de exámenes, vademecum inteligente y gestión de historial clínico.

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Cliente)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile PWA  │  │  Tablet PWA  │          │
│  │  (React/Next)│  │  (Responsive)│  │  (Responsive)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                     WebSocket + REST API                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      API GATEWAY / BFF                           │
│                    (Next.js API Routes)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     Auth     │  │   Rate Limit │  │  API Router  │          │
│  │  Middleware  │  │  & Security  │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                     CAPA DE SERVICIOS                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Servicio de IA Principal                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐        │  │
│  │  │  OpenAI    │  │  Anthropic │  │  LMStudio   │        │  │
│  │  │   API      │  │   Claude   │  │   (Local)   │        │  │
│  │  └────────────┘  └────────────┘  └─────────────┘        │  │
│  │                 Adapter Pattern (Intercambiable)         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Servicio   │  │   Servicio   │  │   Servicio   │          │
│  │     RAG      │  │   Vademecum  │  │  Intérprete  │          │
│  │   (Vector    │  │  (OCR + IA)  │  │     PDF      │          │
│  │     DB)      │  │              │  │  (Vision AI) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Servicio   │  │   Servicio   │  │   Servicio   │          │
│  │     Voz      │  │   Usuarios   │  │   Historial  │          │
│  │ (STT + TTS)  │  │   & Auth     │  │   Clínico    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                     CAPA DE DATOS                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │   Pinecone   │  │     S3 /     │          │
│  │  (Usuarios,  │  │     (o)      │  │  Cloudflare  │          │
│  │  Historial,  │  │  Chroma DB   │  │   R2 (PDFs,  │          │
│  │   Sesiones)  │  │  (Embeddings)│  │   Imágenes)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │    Redis     │  │  Vademecum   │                             │
│  │  (Cache &    │  │     DB       │                             │
│  │   Sessions)  │  │  (JSON/SQL)  │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Frontend (Cliente)
- **Framework**: Next.js 14+ con App Router
- **UI Library**: React 18+ con TypeScript
- **Diseño**: TailwindCSS + shadcn/ui
- **Estado Global**: Zustand o Jotai (ligero)
- **Comunicación Tiempo Real**: WebSocket (Socket.io)
- **PWA**: Soporte completo para instalación en móviles

### 2. Backend (API)
- **Framework**: Next.js API Routes + Node.js
- **Arquitectura**: Serverless-ready o tradicional
- **WebSocket Server**: Socket.io para chat en tiempo real
- **File Upload**: Multer o Next.js API con FormData
- **Validación**: Zod para schemas

### 3. Servicios de IA

#### 3.1 Servicio de Conversación
- **Providers Soportados**:
  - OpenAI GPT-4 Turbo / GPT-4o
  - Anthropic Claude 3.5 Sonnet
  - LMStudio (Local) - Llama 3, Mistral, etc.
- **Pattern**: Adapter Pattern para intercambiar providers
- **Streaming**: Soporte de respuestas en streaming

#### 3.2 Servicio RAG (Retrieval Augmented Generation)
- **Vector Database**: Pinecone (cloud) o ChromaDB (local)
- **Embeddings**: OpenAI text-embedding-3 o similares
- **Chunking**: LangChain para procesamiento de documentos
- **Contexto**: Recuperación semántica de historial clínico

#### 3.3 Servicio de Voz
- **Speech-to-Text**:
  - OpenAI Whisper API (cloud)
  - Whisper local (opcional)
  - Web Speech API (navegador)
- **Text-to-Speech**:
  - OpenAI TTS
  - ElevenLabs (mejor calidad)
  - Web Speech API (fallback)
- **Conversación Continua**: VAD (Voice Activity Detection)

#### 3.4 Servicio de Visión (PDFs y Medicamentos)
- **PDF Processing**:
  - PDF.js para extracción de texto
  - GPT-4 Vision o Claude 3.5 Sonnet para imágenes
  - Tesseract OCR como fallback
- **Reconocimiento de Medicamentos**:
  - GPT-4 Vision / Claude Vision
  - Base de datos de medicamentos estructurada

### 4. Base de Datos

#### 4.1 PostgreSQL (Principal)
```sql
- users (id, email, password_hash, profile_data)
- medical_profiles (user_id, conditions, allergies, medications)
- chat_sessions (id, user_id, created_at, title)
- messages (id, session_id, role, content, metadata)
- exam_results (id, user_id, file_url, interpretation, date)
- vademecum_queries (id, user_id, query_type, result)
```

#### 4.2 Vector Database (Pinecone/ChromaDB)
- Embeddings de historial clínico
- Embeddings de documentos médicos
- Embeddings de vademecum

#### 4.3 Object Storage (S3/R2)
- PDFs de exámenes
- Imágenes de medicamentos
- Archivos multimedia

#### 4.4 Redis
- Cache de sesiones
- Rate limiting
- Conversaciones temporales

### 5. Seguridad y Autenticación
- **Auth**: NextAuth.js v5 (Auth.js)
- **JWT**: Tokens seguros
- **Encriptación**: bcrypt para passwords
- **HIPAA Compliance**: Encriptación end-to-end de datos médicos
- **Rate Limiting**: Protección contra abuso

## Flujos Principales

### Flujo 1: Conversación de Voz Continua
```
Usuario habla → VAD detecta → Whisper STT → IA procesa →
TTS genera → Usuario escucha → Ciclo continua
```

### Flujo 2: Interpretación de Exámenes
```
Usuario sube PDF → Extracción de texto/imágenes →
Vision AI analiza → RAG busca contexto del usuario →
IA genera interpretación personalizada → Almacena en historial
```

### Flujo 3: Vademecum por Foto
```
Usuario toma foto → Upload → Vision AI identifica →
Consulta DB vademecum → IA genera explicación →
Verifica interacciones con medicamentos del usuario
```

### Flujo 4: RAG para Historial Clínico
```
Cada interacción → Genera embeddings → Almacena en Vector DB →
Próximas consultas recuperan contexto relevante →
IA responde con memoria del paciente
```

## Opciones de Despliegue

### Opción 1: Vercel (Recomendado para MVP)
- **Pros**: Deploy automático, serverless, edge functions
- **Contras**: Límites en serverless, costo en escala
- **Ideal para**: Desarrollo rápido, pruebas

### Opción 2: Cloudflare Pages + Workers
- **Pros**: Global CDN, R2 storage, barato
- **Contras**: Límites en Workers (CPU time)
- **Ideal para**: Producción económica

### Opción 3: Railway / Render
- **Pros**: Full control, PostgreSQL incluido, WebSocket fácil
- **Contras**: Menos edge locations
- **Ideal para**: Producción con control

### Opción 4: HuggingFace Spaces
- **Pros**: Gratis, bueno para demos
- **Contras**: No ideal para producción, límites
- **Ideal para**: Demos públicas

### Opción 5: AWS / GCP / Azure
- **Pros**: Máximo control, escalabilidad
- **Contras**: Complejidad, costo inicial
- **Ideal para**: Producción enterprise

### Opción 6: Auto-Hospedado (Local)
- **Pros**: Control total, privacidad, LMStudio
- **Contras**: Mantenimiento, escalabilidad
- **Ideal para**: Redes locales, clínicas

## Configuración Híbrida (Recomendada)

**Frontend + API**: Vercel o Cloudflare Pages
**Base de Datos**: Supabase (PostgreSQL + Auth)
**Vector DB**: Pinecone (tier gratis)
**Storage**: Cloudflare R2 o Supabase Storage
**AI APIs**: OpenAI + Claude (intercambiables)
**Modo Local**: Docker Compose con LMStudio

## Características Especiales

### 1. Modo Offline (PWA)
- Cache de conversaciones recientes
- Funcionalidad limitada sin conexión
- Sincronización automática al reconectar

### 2. Niveles de Tecnicismo Configurables
```typescript
type TechnicalLevel = 'simple' | 'moderate' | 'technical' | 'expert';
```
- Sistema de prompts dinámicos según nivel
- Ajuste en tiempo real por el usuario

### 3. Multi-idioma
- Soporte para español (principal)
- Inglés y otros idiomas
- i18n con next-intl

### 4. Accesibilidad
- WCAG 2.1 AA compliance
- Navegación por teclado
- Screen reader friendly
- Alto contraste

## Escalabilidad

### Fase 1: MVP (1-1000 usuarios)
- Vercel + Supabase + Pinecone free tier
- OpenAI API

### Fase 2: Growth (1K-10K usuarios)
- Upgrade a planes pagos
- Redis cache
- CDN para assets

### Fase 3: Scale (10K+ usuarios)
- Infraestructura dedicada
- Load balancing
- Microservicios si necesario
- Multi-región

## Monitoreo y Observabilidad

- **Error Tracking**: Sentry
- **Analytics**: Vercel Analytics + PostHog
- **Logs**: Papertrail o similar
- **Uptime**: UptimeRobot
- **Performance**: Lighthouse CI

## Costos Estimados (Mensual)

### MVP (100 usuarios activos)
- Vercel: $0 (hobby) - $20 (pro)
- Supabase: $0 (free tier)
- Pinecone: $0 (free tier)
- OpenAI API: ~$50-100 (depende del uso)
- Cloudflare R2: ~$5
- **Total: ~$55-125/mes**

### Producción (1000 usuarios activos)
- Vercel/Railway: ~$50-100
- Supabase: $25
- Pinecone: $70
- OpenAI API: ~$300-500
- Cloudflare R2: ~$20
- **Total: ~$465-715/mes**

## Próximos Pasos

Ver `IMPLEMENTATION_ROADMAP.md` para el plan de implementación detallado.
