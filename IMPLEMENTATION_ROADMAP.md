# Roadmap de Implementación - MARTIN Medical Assistant

## Resumen Ejecutivo

Este roadmap detalla la implementación completa de la plataforma MARTIN en 4 fases principales, con una duración estimada de 16-24 semanas para el MVP funcional.

## Fase 0: Preparación y Setup (Semana 1-2)

### Sprint 0.1: Configuración del Entorno (3-5 días)

#### Tareas:
- [ ] Configurar repositorio Git
  ```bash
  git init
  git branch main
  git remote add origin <url>
  ```

- [ ] Inicializar proyecto Next.js
  ```bash
  npx create-next-app@latest martin-medical --typescript --tailwind --app
  cd martin-medical
  ```

- [ ] Configurar ESLint + Prettier
  ```bash
  npm install -D prettier eslint-config-prettier
  ```

- [ ] Setup Husky para git hooks
  ```bash
  npx husky-init && npm install
  npx husky add .husky/pre-commit "npx lint-staged"
  ```

- [ ] Configurar variables de entorno
  ```bash
  cp .env.example .env.local
  # Configurar claves API básicas
  ```

- [ ] Setup Docker (opcional para desarrollo local)
  ```bash
  docker-compose up -d
  ```

**Entregables**:
- Proyecto inicializado
- Git configurado con CI básico
- Entorno de desarrollo funcionando
- Documentación de setup

### Sprint 0.2: Base de Datos y Auth (4-6 días)

#### Tareas:
- [ ] Configurar Supabase / PostgreSQL
  ```bash
  npm install @prisma/client prisma
  npx prisma init
  ```

- [ ] Implementar schema de Prisma (ver DATABASE_DESIGN.md)
  ```bash
  npx prisma migrate dev --name init
  npx prisma generate
  ```

- [ ] Configurar NextAuth.js
  ```bash
  npm install next-auth@beta
  ```

- [ ] Implementar registro y login
  - Página de registro (/auth/register)
  - Página de login (/auth/login)
  - Middleware de autenticación

- [ ] Setup Redis para sesiones
  ```bash
  npm install ioredis
  ```

**Entregables**:
- Base de datos funcionando
- Sistema de autenticación completo
- Usuarios pueden registrarse y loguearse
- Session management

---

## Fase 1: MVP Core (Semana 3-8)

### Sprint 1.1: UI/UX Foundation (5-7 días)

#### Tareas:
- [ ] Instalar shadcn/ui
  ```bash
  npx shadcn-ui@latest init
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add form
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add toast
  ```

- [ ] Crear sistema de diseño base
  - Colores y tipografía
  - Componentes reutilizables
  - Layout principal

- [ ] Implementar navegación
  - Navbar
  - Sidebar
  - Footer
  - Mobile menu

- [ ] Páginas principales (estructura)
  - Dashboard (/)
  - Chat (/chat)
  - Exámenes (/exams)
  - Vademecum (/vademecum)
  - Perfil (/profile)

**Entregables**:
- UI consistente y responsiva
- Navegación funcional
- Todas las páginas principales creadas
- PWA manifest configurado

### Sprint 1.2: Perfil Médico (4-5 días)

#### Tareas:
- [ ] Crear formulario de perfil médico
  - Información personal
  - Condiciones médicas
  - Alergias
  - Medicamentos actuales
  - Historial familiar

- [ ] Implementar API de perfil
  ```typescript
  // app/api/profile/route.ts
  GET /api/profile
  PUT /api/profile
  ```

- [ ] Validación con Zod
  ```typescript
  const medicalProfileSchema = z.object({
    bloodType: z.enum([...]),
    allergies: z.array(z.string()),
    // ...
  });
  ```

- [ ] Guardar en BD con Prisma
  ```typescript
  await prisma.medicalProfile.upsert({...});
  ```

**Entregables**:
- Formulario de perfil funcional
- Datos guardados correctamente
- Validación completa
- Edición de perfil

### Sprint 1.3: Chat Básico con IA (7-10 días)

#### Tareas:
- [ ] Configurar OpenAI SDK
  ```bash
  npm install openai
  ```

- [ ] Crear interfaz de chat
  - Input de mensajes
  - Lista de mensajes
  - Estados de carga
  - Manejo de errores

- [ ] Implementar API de chat
  ```typescript
  // app/api/chat/route.ts
  POST /api/chat
  ```

- [ ] Streaming de respuestas
  ```typescript
  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [...],
    stream: true,
  });
  ```

- [ ] Guardar historial en BD
  ```typescript
  await prisma.message.create({
    sessionId,
    role,
    content,
  });
  ```

- [ ] Implementar sesiones de chat
  - Crear nueva sesión
  - Listar sesiones
  - Eliminar sesión

**Entregables**:
- Chat funcional con IA
- Streaming en tiempo real
- Historial guardado
- Gestión de sesiones

### Sprint 1.4: RAG Básico (7-10 días)

#### Tareas:
- [ ] Configurar Pinecone o ChromaDB
  ```bash
  npm install @pinecone-database/pinecone
  # o
  npm install chromadb
  ```

- [ ] Implementar generación de embeddings
  ```typescript
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  ```

- [ ] Crear servicio de vectorización
  ```typescript
  // lib/vector-store.ts
  async function addDocument(userId, content, metadata)
  async function search(userId, query, topK)
  ```

- [ ] Integrar RAG en chat
  ```typescript
  // Buscar contexto relevante
  const context = await vectorStore.search(userId, query);

  // Agregar al prompt
  const systemPrompt = `
    Contexto del paciente:
    ${context}

    Pregunta: ${query}
  `;
  ```

- [ ] Vectorizar perfil médico al crearlo/actualizarlo

**Entregables**:
- Vector database configurada
- Embeddings generándose correctamente
- Chat usa contexto del usuario
- Memoria a largo plazo funcional

### Sprint 1.5: Sistema de Voz (7-10 días)

#### Tareas:
- [ ] Instalar dependencias de audio
  ```bash
  npm install recordrtc wavesurfer.js
  ```

- [ ] Implementar grabación de audio
  ```typescript
  // components/VoiceRecorder.tsx
  - Botón de grabar/detener
  - Visualización de onda
  - Reproducción
  ```

- [ ] Configurar Whisper API (Speech-to-Text)
  ```typescript
  // app/api/speech/transcribe/route.ts
  POST /api/speech/transcribe

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });
  ```

- [ ] Configurar TTS (Text-to-Speech)
  ```typescript
  // app/api/speech/synthesize/route.ts
  POST /api/speech/synthesize

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: text,
  });
  ```

- [ ] Implementar VAD (Voice Activity Detection)
  ```typescript
  // Para conversación continua
  const vad = await import('@ricky0123/vad-web');
  ```

- [ ] Integrar voz con chat
  - Grabar → Transcribir → Enviar al chat
  - Recibir respuesta → Sintetizar → Reproducir

**Entregables**:
- Grabación de voz funcional
- Speech-to-Text operativo
- Text-to-Speech operativo
- Conversación de voz básica

---

## Fase 2: Funcionalidades Avanzadas (Semana 9-14)

### Sprint 2.1: Interpretación de PDFs (7-10 días)

#### Tareas:
- [ ] Configurar subida de archivos
  ```bash
  npm install multer
  ```

- [ ] Implementar API de upload
  ```typescript
  // app/api/exams/upload/route.ts
  POST /api/exams/upload

  // Guardar en S3/R2
  await uploadToStorage(file, userId);
  ```

- [ ] Configurar Cloudflare R2 o S3
  ```bash
  npm install @aws-sdk/client-s3
  ```

- [ ] Implementar extracción de texto
  ```bash
  npm install pdf-parse pdfjs-dist
  ```

- [ ] Usar GPT-4 Vision para PDFs con imágenes
  ```typescript
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Analiza este examen médico" },
        { type: "image_url", image_url: { url: pdfImageUrl } }
      ]
    }]
  });
  ```

- [ ] Crear página de exámenes
  - Lista de exámenes
  - Upload
  - Visualización de PDF
  - Interpretación

- [ ] Almacenar resultados con RAG
  ```typescript
  // Guardar interpretación en vector DB
  await vectorStore.addDocument(
    userId,
    interpretation,
    { type: 'exam', examId, date }
  );
  ```

**Entregables**:
- Upload de PDFs funcional
- Extracción de texto
- Interpretación con IA
- Resultados almacenados y consultables

### Sprint 2.2: Vademecum con Visión (7-10 días)

#### Tareas:
- [ ] Crear base de datos de medicamentos
  ```typescript
  // prisma/seed.ts
  const medications = [
    { tradeName: "Ibuprofeno", ... },
    // ... más medicamentos
  ];
  ```

- [ ] Implementar búsqueda de medicamentos
  ```typescript
  // app/api/vademecum/search/route.ts
  GET /api/vademecum/search?q=ibuprofeno
  ```

- [ ] Implementar reconocimiento por imagen
  ```typescript
  // app/api/vademecum/identify/route.ts
  POST /api/vademecum/identify

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        {
          type: "text",
          text: "Identifica este medicamento y extrae su nombre comercial"
        },
        {
          type: "image_url",
          image_url: { url: medicationImageUrl }
        }
      ]
    }]
  });
  ```

- [ ] Crear interfaz de vademecum
  - Búsqueda por texto
  - Búsqueda por voz
  - Búsqueda por foto
  - Detalle de medicamento

- [ ] Implementar detección de interacciones
  ```typescript
  function checkInteractions(
    newMedication: Medication,
    currentMedications: Medication[]
  ): Interaction[] {
    // Lógica de interacciones
  }
  ```

- [ ] Integrar con perfil médico
  - Verificar alergias
  - Verificar contraindicaciones
  - Alertas personalizadas

**Entregables**:
- Vademecum funcional
- Búsqueda multimodal
- Reconocimiento de medicamentos por foto
- Detección de interacciones

### Sprint 2.3: Configuración de Nivel Técnico (3-5 días)

#### Tareas:
- [ ] Crear sistema de prompts dinámicos
  ```typescript
  // lib/prompts.ts
  const technicalLevelPrompts = {
    SIMPLE: "Explica de forma muy simple, como a un niño",
    MODERATE: "Explica de forma clara pero precisa",
    TECHNICAL: "Usa terminología médica apropiada",
    EXPERT: "Respuesta técnica detallada con evidencia"
  };
  ```

- [ ] Implementar selector de nivel
  ```typescript
  // components/TechnicalLevelSelector.tsx
  <Select value={level} onChange={setLevel}>
    <option value="SIMPLE">Simple</option>
    <option value="MODERATE">Moderado</option>
    <option value="TECHNICAL">Técnico</option>
    <option value="EXPERT">Experto</option>
  </Select>
  ```

- [ ] Modificar prompts según nivel
  ```typescript
  const systemPrompt = `
    ${technicalLevelPrompts[userLevel]}

    Contexto: ${context}
    Pregunta: ${query}
  `;
  ```

- [ ] Guardar preferencia en perfil

**Entregables**:
- Niveles de tecnicismo configurables
- Respuestas adaptadas al nivel
- Preferencia guardada

### Sprint 2.4: WebSocket y Conversación Continua (5-7 días)

#### Tareas:
- [ ] Configurar Socket.io
  ```bash
  npm install socket.io socket.io-client
  ```

- [ ] Crear servidor WebSocket
  ```typescript
  // app/api/socket/route.ts
  import { Server } from 'socket.io';

  io.on('connection', (socket) => {
    socket.on('voice-start', handleVoiceStart);
    socket.on('voice-data', handleVoiceData);
    socket.on('voice-end', handleVoiceEnd);
  });
  ```

- [ ] Implementar VAD para conversación continua
  ```typescript
  // Detectar cuando el usuario empieza/para de hablar
  const vad = useVAD({
    onSpeechStart: () => socket.emit('voice-start'),
    onSpeechEnd: (audio) => socket.emit('voice-end', audio),
  });
  ```

- [ ] Streaming bidireccional
  - Usuario habla → STT → IA → TTS → Usuario escucha
  - Sin necesidad de botones

- [ ] Implementar estados de conversación
  ```typescript
  type ConversationState =
    | 'idle'
    | 'listening'
    | 'processing'
    | 'speaking';
  ```

**Entregables**:
- WebSocket funcionando
- Conversación continua sin botones
- Audio bidireccional
- Estados visuales claros

---

## Fase 3: Optimización y Despliegue (Semana 15-18)

### Sprint 3.1: Integración con Claude (3-4 días)

#### Tareas:
- [ ] Instalar Anthropic SDK
  ```bash
  npm install @anthropic-ai/sdk
  ```

- [ ] Crear adapter pattern para múltiples providers
  ```typescript
  // lib/ai-provider.ts
  interface AIProvider {
    chat(messages: Message[]): Promise<string>;
    vision(image: string, prompt: string): Promise<string>;
  }

  class OpenAIProvider implements AIProvider { }
  class ClaudeProvider implements AIProvider { }
  class LocalProvider implements AIProvider { }

  const provider = createProvider(env.AI_PROVIDER);
  ```

- [ ] Implementar selector de provider en UI
  ```typescript
  <Select>
    <option value="openai">OpenAI</option>
    <option value="claude">Claude</option>
    <option value="local">Local (LMStudio)</option>
  </Select>
  ```

- [ ] Migrar prompts para compatibilidad

**Entregables**:
- Múltiples providers soportados
- Selector de provider funcional
- Adapter pattern implementado

### Sprint 3.2: Modo Local con LMStudio (4-5 días)

#### Tareas:
- [ ] Crear cliente para LMStudio
  ```typescript
  // lib/lmstudio-client.ts
  const response = await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    body: JSON.stringify({
      model: "local-model",
      messages: messages,
    })
  });
  ```

- [ ] Implementar detección de disponibilidad
  ```typescript
  async function checkLocalModel() {
    try {
      await fetch('http://localhost:1234/v1/models');
      return true;
    } catch {
      return false;
    }
  }
  ```

- [ ] Crear modo offline con Service Workers
  ```typescript
  // service-worker.ts
  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/chat')) {
      event.respondWith(handleChatOffline(event.request));
    }
  });
  ```

- [ ] Documentar setup de LMStudio
  ```markdown
  # Setup LMStudio Local

  1. Descargar LMStudio
  2. Descargar modelo (ej: Llama-3-8B-Instruct)
  3. Iniciar servidor local
  4. Configurar MARTIN para usar modo local
  ```

**Entregables**:
- Integración con LMStudio
- Detección automática de disponibilidad
- Modo offline básico
- Documentación de setup

### Sprint 3.3: PWA y Optimización (5-7 días)

#### Tareas:
- [ ] Configurar next-pwa
  ```bash
  npm install next-pwa
  ```

- [ ] Crear manifest.json
  ```json
  {
    "name": "MARTIN Medical Assistant",
    "short_name": "MARTIN",
    "icons": [...],
    "theme_color": "#4F46E5",
    "background_color": "#FFFFFF",
    "display": "standalone",
    "start_url": "/"
  }
  ```

- [ ] Implementar Service Worker
  - Cache de assets estáticos
  - Cache de API responses
  - Sincronización en background

- [ ] Optimizar performance
  ```typescript
  // next.config.js
  module.exports = {
    images: {
      formats: ['image/avif', 'image/webp'],
    },
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
  };
  ```

- [ ] Code splitting y lazy loading
  ```typescript
  const VoiceRecorder = dynamic(() => import('./VoiceRecorder'), {
    ssr: false,
    loading: () => <Skeleton />
  });
  ```

- [ ] Implementar caching con Redis
  ```typescript
  async function getCachedResponse(key: string) {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);

    const response = await generateResponse();
    await redis.set(key, JSON.stringify(response), 'EX', 3600);
    return response;
  }
  ```

**Entregables**:
- PWA instalable
- Performance optimizado
- Caching implementado
- Lighthouse score >90

### Sprint 3.4: Testing (5-7 días)

#### Tareas:
- [ ] Setup Vitest
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom
  ```

- [ ] Tests unitarios
  ```typescript
  // __tests__/lib/vector-store.test.ts
  describe('VectorStore', () => {
    it('should add document', async () => {
      const id = await vectorStore.addDocument(userId, content);
      expect(id).toBeDefined();
    });
  });
  ```

- [ ] Tests de integración
  ```typescript
  // __tests__/api/chat.test.ts
  describe('POST /api/chat', () => {
    it('should return AI response', async () => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' })
      });
      expect(response.status).toBe(200);
    });
  });
  ```

- [ ] Setup Playwright
  ```bash
  npm install -D @playwright/test
  npx playwright install
  ```

- [ ] Tests E2E
  ```typescript
  // e2e/chat.spec.ts
  test('user can chat with AI', async ({ page }) => {
    await page.goto('/chat');
    await page.fill('[data-testid="chat-input"]', 'Hello');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('.message-response')).toBeVisible();
  });
  ```

- [ ] Configurar CI/CD con GitHub Actions
  ```yaml
  # .github/workflows/test.yml
  name: Tests
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - run: npm install
        - run: npm test
        - run: npx playwright test
  ```

**Entregables**:
- Suite de tests completa
- Cobertura >70%
- CI/CD configurado
- Tests E2E principales

### Sprint 3.5: Despliegue (3-5 días)

#### Tareas:
- [ ] Preparar para producción
  - Verificar variables de entorno
  - Configurar secrets
  - Build de producción
  ```bash
  npm run build
  ```

- [ ] Deploy en Vercel (Opción 1)
  ```bash
  npm install -g vercel
  vercel --prod
  ```

- [ ] Deploy en Cloudflare Pages (Opción 2)
  ```bash
  npx wrangler pages publish .next
  ```

- [ ] Configurar dominio personalizado
  - DNS settings
  - SSL certificate
  - Redirect rules

- [ ] Setup monitoring
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

- [ ] Configurar backups automáticos
  - Database backups (Supabase)
  - File backups (R2/S3)

- [ ] Documentar proceso de deployment
  ```markdown
  # Deployment Guide

  ## Prerequisites
  - Node.js 18+
  - Vercel/Cloudflare account
  - Supabase project

  ## Steps
  1. Clone repository
  2. Install dependencies
  3. Configure environment variables
  4. Deploy
  ```

**Entregables**:
- Aplicación desplegada en producción
- Dominio configurado
- Monitoring activo
- Documentación de deployment

---

## Fase 4: Pulido y Lanzamiento (Semana 19-20)

### Sprint 4.1: UI/UX Refinamiento (3-5 días)

#### Tareas:
- [ ] Revisión completa de UI
  - Consistencia de diseño
  - Espaciados y alineaciones
  - Colores y contraste
  - Iconografía

- [ ] Mejorar animaciones
  ```typescript
  // Usar framer-motion
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {content}
  </motion.div>
  ```

- [ ] Estados de carga mejorados
  - Skeleton screens
  - Progress indicators
  - Optimistic UI updates

- [ ] Mensajes de error amigables
  ```typescript
  const errorMessages = {
    'network-error': 'No pudimos conectar. Verifica tu conexión.',
    'ai-error': 'MARTIN está teniendo dificultades. Intenta de nuevo.',
    'file-too-large': 'El archivo es muy grande. Máximo 10MB.',
  };
  ```

- [ ] Responsive final
  - Mobile (320px-480px)
  - Tablet (481px-768px)
  - Desktop (769px+)

**Entregables**:
- UI pulida y profesional
- Animaciones suaves
- Estados de carga claros
- 100% responsivo

### Sprint 4.2: Internacionalización (2-3 días)

#### Tareas:
- [ ] Configurar next-intl
  ```bash
  npm install next-intl
  ```

- [ ] Crear archivos de traducción
  ```typescript
  // messages/es.json
  {
    "common": {
      "welcome": "Bienvenido a MARTIN",
      "chat": "Chat",
      "exams": "Exámenes"
    }
  }

  // messages/en.json
  {
    "common": {
      "welcome": "Welcome to MARTIN",
      "chat": "Chat",
      "exams": "Exams"
    }
  }
  ```

- [ ] Implementar selector de idioma
  ```typescript
  <LanguageSelector>
    <option value="es">Español</option>
    <option value="en">English</option>
  </LanguageSelector>
  ```

- [ ] Traducir textos principales
  - UI labels
  - Mensajes de error
  - Emails de sistema

**Entregables**:
- Soporte multi-idioma
- Español e inglés completamente traducidos
- Selector de idioma funcional

### Sprint 4.3: Documentación Final (2-3 días)

#### Tareas:
- [ ] Crear README.md completo
  ```markdown
  # MARTIN Medical Assistant

  ## Features
  ## Getting Started
  ## Configuration
  ## API Documentation
  ## Contributing
  ```

- [ ] Documentar APIs
  - Endpoints disponibles
  - Request/Response examples
  - Authentication
  - Rate limits

- [ ] Crear guía de usuario
  - Cómo registrarse
  - Cómo usar el chat
  - Cómo subir exámenes
  - Cómo buscar medicamentos
  - FAQ

- [ ] Video tutorial (opcional)
  - Screen recording
  - Voz en off explicativa
  - Casos de uso principales

**Entregables**:
- README completo
- Documentación de API
- Guía de usuario
- Video tutorial (opcional)

### Sprint 4.4: Launch Preparation (1-2 días)

#### Tareas:
- [ ] Testing final completo
  - Todos los flujos principales
  - Edge cases
  - Performance
  - Security

- [ ] Load testing
  ```bash
  npm install -D artillery
  artillery quick --count 100 --num 10 https://your-app.com/api/chat
  ```

- [ ] Security audit
  - OWASP Top 10 checklist
  - Dependency vulnerabilities
  ```bash
  npm audit
  ```

- [ ] Configurar analytics
  ```typescript
  // Google Analytics, PostHog, etc.
  analytics.track('page_view', { page: '/chat' });
  ```

- [ ] Plan de marketing (opcional)
  - Landing page
  - Social media
  - Product Hunt launch

**Entregables**:
- Aplicación probada exhaustivamente
- Analytics configurado
- Plan de lanzamiento
- Todo listo para producción

---

## Estimación de Recursos

### Equipo Recomendado
```yaml
Para MVP (20 semanas):
  - 1 Frontend Developer (React/Next.js expert)
  - 1 Backend Developer (Node.js/PostgreSQL)
  - 1 Full-stack Developer (puede ayudar en ambos)
  - 1 UI/UX Designer (part-time o consultor)
  - 1 DevOps/Cloud Engineer (part-time)
  - 1 Project Manager/Product Owner

Equipo Mínimo (viable pero más lento):
  - 1 Full-stack Developer Senior
  - 1 Full-stack Developer Junior
  - Duración: 24-30 semanas
```

### Costos Estimados (Desarrollo)

#### Personal (20 semanas)
```yaml
Salarios (depende de ubicación):
  US/Europe:
    - 3 developers × $8,000/mes × 5 meses = $120,000
    - 1 designer (part-time) × $4,000/mes × 5 meses = $20,000
    - 1 devops (part-time) × $4,000/mes × 5 meses = $20,000
    Total: ~$160,000

  Latinoamérica:
    - 3 developers × $3,000/mes × 5 meses = $45,000
    - 1 designer (part-time) × $1,500/mes × 5 meses = $7,500
    - 1 devops (part-time) × $2,000/mes × 5 meses = $10,000
    Total: ~$62,500
```

#### Infraestructura (Mensual - MVP)
```yaml
Development:
  - Vercel: $0 (hobby)
  - Supabase: $0 (free tier)
  - Pinecone: $0 (free tier)
  - OpenAI API: ~$100-200/mes (testing)
  - Cloudflare R2: ~$5
  Total: ~$105-205/mes

Production (100 usuarios):
  - Vercel: $20
  - Supabase: $25
  - Pinecone: $70
  - OpenAI API: ~$300-500
  - Cloudflare R2: ~$10
  - Redis: $10
  - Monitoring: $0 (free tiers)
  Total: ~$435-635/mes
```

#### Herramientas y Licencias
```yaml
- GitHub: $0 (public repo)
- Figma: $15/mes (profesional)
- Testing tools: $0 (open source)
- Domain: $12/año
- SSL: $0 (Let's Encrypt / Cloudflare)
Total: ~$27/mes
```

### Total MVP Budget
```yaml
Conservative (Equipo US/EU):
  - Personal: $160,000
  - Infraestructura (5 meses): $1,000
  - Herramientas: $135
  - Contingencia (20%): $32,227
  Total: ~$193,362

Economical (Equipo LATAM):
  - Personal: $62,500
  - Infraestructura (5 meses): $1,000
  - Herramientas: $135
  - Contingencia (20%): $12,727
  Total: ~$76,362
```

---

## Métricas de Éxito por Fase

### Fase 0: Setup
- [x] Proyecto compilable
- [x] Tests corren
- [x] CI/CD funcional

### Fase 1: MVP Core
- [ ] Usuario puede registrarse y loguearse
- [ ] Chat con IA funcional
- [ ] Memoria básica (RAG) operativa
- [ ] Voz bidireccional funcional
- [ ] >80% de respuestas satisfactorias en testing manual

### Fase 2: Funcionalidades Avanzadas
- [ ] PDFs se interpretan correctamente
- [ ] Vademecum identifica medicamentos
- [ ] Nivel técnico afecta respuestas
- [ ] Conversación continua sin botones
- [ ] >85% de satisfacción en user testing

### Fase 3: Optimización
- [ ] Lighthouse score >90
- [ ] Instalable como PWA
- [ ] Funciona en modo local
- [ ] Tests E2E pasan al 100%
- [ ] Deployed y accesible públicamente

### Fase 4: Launch
- [ ] UI pulida y profesional
- [ ] Documentación completa
- [ ] Video tutorial creado
- [ ] Analytics configurado
- [ ] Ready para usuarios reales

---

## Riesgos y Mitigación

### Riesgo 1: Costos de IA API
**Probabilidad**: Alta
**Impacto**: Medio
**Mitigación**:
- Implementar caching agresivo
- Rate limiting por usuario
- Usar modelos más baratos para queries simples
- Implementar modo local como alternativa

### Riesgo 2: Precisión de Interpretaciones Médicas
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**:
- Disclaimers claros
- "Este no es un diagnóstico médico"
- Sugerir consulta con profesional
- Testing exhaustivo con casos reales
- Considerar validación humana para casos críticos

### Riesgo 3: Problemas de Performance
**Probabilidad**: Media
**Impacto**: Medio
**Mitigación**:
- Load testing temprano
- Caching en múltiples niveles
- CDN para assets
- Optimización de queries de BD
- Monitoring proactivo

### Riesgo 4: Compliance (HIPAA, GDPR)
**Probabilidad**: Media
**Impacto**: Alto
**Mitigación**:
- Consultoría legal temprana
- Encriptación end-to-end
- Audit logs completos
- Data retention policies
- BAA con proveedores cloud

### Riesgo 5: Scope Creep
**Probabilidad**: Alta
**Impacto**: Medio
**Mitigación**:
- MVP bien definido
- Priorización estricta (RICE score)
- Reuniones de revisión semanales
- Backlog ordenado
- Decir "no" a features no esenciales

---

## Siguiente Paso Inmediato

**¿Estás listo para comenzar?**

Si apruebas esta propuesta, el siguiente paso es:

```bash
# 1. Inicializar el proyecto
npx create-next-app@latest martin-medical --typescript --tailwind --app

# 2. Configurar el repositorio
git init
git remote add origin <tu-repo>

# 3. Instalar dependencias iniciales
npm install prisma @prisma/client next-auth@beta

# 4. Comenzar con Sprint 0.1
```

**¿Quieres que proceda con la implementación?**

Opciones:
1. ✅ Sí, comienza con la implementación completa (recomendado)
2. 🔧 Sí, pero hagamos ajustes a la arquitectura primero
3. 📋 Quiero enfocarnos solo en ciertas funcionalidades
4. ❓ Tengo preguntas sobre la propuesta

**Déjame saber y empezamos de inmediato!** 🚀
