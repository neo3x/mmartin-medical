# Estructura del Proyecto - MARTIN Medical Assistant

## Estructura de Carpetas Completa

```
martin-medical/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # CI pipeline
│   │   ├── deploy.yml                # Deployment
│   │   └── test.yml                  # Tests automáticos
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── app/                              # Next.js App Router (v14+)
│   ├── (auth)/                       # Grupo de rutas de autenticación
│   │   ├── login/
│   │   │   └── page.tsx              # /login
│   │   ├── register/
│   │   │   └── page.tsx              # /register
│   │   └── layout.tsx                # Layout para auth
│   │
│   ├── (dashboard)/                  # Grupo de rutas protegidas
│   │   ├── layout.tsx                # Layout con sidebar
│   │   ├── page.tsx                  # Dashboard principal (/)
│   │   ├── chat/
│   │   │   ├── page.tsx              # /chat
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx          # /chat/[sessionId]
│   │   ├── exams/
│   │   │   ├── page.tsx              # /exams
│   │   │   ├── [examId]/
│   │   │   │   └── page.tsx          # /exams/[examId]
│   │   │   └── upload/
│   │   │       └── page.tsx          # /exams/upload
│   │   ├── vademecum/
│   │   │   ├── page.tsx              # /vademecum
│   │   │   ├── search/
│   │   │   │   └── page.tsx          # /vademecum/search
│   │   │   └── [medicationId]/
│   │   │       └── page.tsx          # /vademecum/[medicationId]
│   │   ├── profile/
│   │   │   ├── page.tsx              # /profile
│   │   │   ├── medical/
│   │   │   │   └── page.tsx          # /profile/medical
│   │   │   └── settings/
│   │   │       └── page.tsx          # /profile/settings
│   │   └── history/
│   │       └── page.tsx              # /history
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth.js config
│   │   ├── chat/
│   │   │   ├── route.ts              # POST /api/chat
│   │   │   └── sessions/
│   │   │       └── route.ts          # GET, POST /api/chat/sessions
│   │   ├── profile/
│   │   │   ├── route.ts              # GET, PUT /api/profile
│   │   │   └── medical/
│   │   │       └── route.ts          # GET, PUT /api/profile/medical
│   │   ├── exams/
│   │   │   ├── route.ts              # GET, POST /api/exams
│   │   │   ├── upload/
│   │   │   │   └── route.ts          # POST /api/exams/upload
│   │   │   └── [examId]/
│   │   │       ├── route.ts          # GET, DELETE /api/exams/[examId]
│   │   │       └── interpret/
│   │   │           └── route.ts      # POST /api/exams/[examId]/interpret
│   │   ├── vademecum/
│   │   │   ├── search/
│   │   │   │   └── route.ts          # GET /api/vademecum/search
│   │   │   ├── identify/
│   │   │   │   └── route.ts          # POST /api/vademecum/identify
│   │   │   └── [medicationId]/
│   │   │       └── route.ts          # GET /api/vademecum/[medicationId]
│   │   ├── speech/
│   │   │   ├── transcribe/
│   │   │   │   └── route.ts          # POST /api/speech/transcribe (STT)
│   │   │   └── synthesize/
│   │   │       └── route.ts          # POST /api/speech/synthesize (TTS)
│   │   ├── embeddings/
│   │   │   ├── create/
│   │   │   │   └── route.ts          # POST /api/embeddings/create
│   │   │   └── search/
│   │   │       └── route.ts          # POST /api/embeddings/search
│   │   └── health/
│   │       └── route.ts              # GET /api/health (healthcheck)
│   │
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page (public)
│   ├── globals.css                   # Global styles
│   ├── error.tsx                     # Error boundary
│   ├── loading.tsx                   # Loading state
│   └── not-found.tsx                 # 404 page
│
├── components/                       # React Components
│   ├── ui/                           # Base UI components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── toast.tsx
│   │   ├── avatar.tsx
│   │   ├── card.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   │
│   ├── chat/                         # Chat components
│   │   ├── ChatInterface.tsx         # Main chat interface
│   │   ├── MessageList.tsx           # List of messages
│   │   ├── MessageItem.tsx           # Individual message
│   │   ├── ChatInput.tsx             # Input field
│   │   ├── ChatSidebar.tsx           # Sessions sidebar
│   │   ├── SessionItem.tsx           # Session list item
│   │   └── TypingIndicator.tsx       # Typing animation
│   │
│   ├── voice/                        # Voice components
│   │   ├── VoiceRecorder.tsx         # Audio recording
│   │   ├── VoiceVisualizer.tsx       # Waveform visualization
│   │   ├── AudioPlayer.tsx           # Audio playback
│   │   └── VADIndicator.tsx          # Voice activity indicator
│   │
│   ├── exams/                        # Exam components
│   │   ├── ExamUpload.tsx            # Upload interface
│   │   ├── ExamList.tsx              # List of exams
│   │   ├── ExamCard.tsx              # Exam card
│   │   ├── ExamViewer.tsx            # PDF viewer
│   │   └── InterpretationView.tsx    # AI interpretation display
│   │
│   ├── vademecum/                    # Vademecum components
│   │   ├── MedicationSearch.tsx      # Search interface
│   │   ├── MedicationCard.tsx        # Medication card
│   │   ├── MedicationDetail.tsx      # Detailed view
│   │   ├── ImageIdentifier.tsx       # Photo identification
│   │   └── InteractionWarning.tsx    # Interaction alerts
│   │
│   ├── profile/                      # Profile components
│   │   ├── ProfileForm.tsx           # Basic profile form
│   │   ├── MedicalProfileForm.tsx    # Medical info form
│   │   ├── SettingsForm.tsx          # Settings form
│   │   └── TechnicalLevelSelector.tsx # Level selector
│   │
│   ├── dashboard/                    # Dashboard components
│   │   ├── DashboardHeader.tsx       # Header
│   │   ├── HealthSummary.tsx         # Health overview
│   │   ├── RecentActivity.tsx        # Recent activities
│   │   ├── UpcomingReminders.tsx     # Reminders widget
│   │   └── QuickActions.tsx          # Quick action buttons
│   │
│   ├── layout/                       # Layout components
│   │   ├── Navbar.tsx                # Top navigation
│   │   ├── Sidebar.tsx               # Side navigation
│   │   ├── Footer.tsx                # Footer
│   │   ├── MobileMenu.tsx            # Mobile menu
│   │   └── UserMenu.tsx              # User dropdown
│   │
│   ├── common/                       # Common/shared components
│   │   ├── Logo.tsx                  # MARTIN logo
│   │   ├── LoadingSpinner.tsx        # Loading indicator
│   │   ├── ErrorMessage.tsx          # Error display
│   │   ├── EmptyState.tsx            # Empty state
│   │   ├── SearchBar.tsx             # Search component
│   │   └── LanguageSelector.tsx      # Language switcher
│   │
│   └── providers/                    # Context providers
│       ├── ThemeProvider.tsx         # Theme context
│       ├── AuthProvider.tsx          # Auth context
│       └── SocketProvider.tsx        # WebSocket context
│
├── lib/                              # Utilities and libraries
│   ├── ai/                           # AI integrations
│   │   ├── providers/
│   │   │   ├── base.ts               # Base provider interface
│   │   │   ├── openai.ts             # OpenAI implementation
│   │   │   ├── claude.ts             # Claude implementation
│   │   │   └── lmstudio.ts           # LMStudio implementation
│   │   ├── prompts.ts                # Prompt templates
│   │   ├── streaming.ts              # Streaming utilities
│   │   └── factory.ts                # Provider factory
│   │
│   ├── db/                           # Database utilities
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── queries/
│   │   │   ├── users.ts              # User queries
│   │   │   ├── chats.ts              # Chat queries
│   │   │   ├── exams.ts              # Exam queries
│   │   │   └── medications.ts        # Medication queries
│   │   └── migrations.ts             # Custom migrations
│   │
│   ├── vector/                       # Vector store
│   │   ├── pinecone.ts               # Pinecone client
│   │   ├── chroma.ts                 # ChromaDB client
│   │   ├── embeddings.ts             # Embedding generation
│   │   └── search.ts                 # Semantic search
│   │
│   ├── storage/                      # File storage
│   │   ├── s3.ts                     # S3/R2 client
│   │   ├── upload.ts                 # Upload utilities
│   │   └── download.ts               # Download utilities
│   │
│   ├── cache/                        # Caching
│   │   ├── redis.ts                  # Redis client
│   │   ├── strategies.ts             # Cache strategies
│   │   └── keys.ts                   # Cache key generation
│   │
│   ├── auth/                         # Authentication
│   │   ├── config.ts                 # NextAuth config
│   │   ├── middleware.ts             # Auth middleware
│   │   └── utils.ts                  # Auth utilities
│   │
│   ├── speech/                       # Speech processing
│   │   ├── stt.ts                    # Speech-to-text
│   │   ├── tts.ts                    # Text-to-speech
│   │   └── vad.ts                    # Voice activity detection
│   │
│   ├── pdf/                          # PDF processing
│   │   ├── parser.ts                 # PDF parsing
│   │   ├── extractor.ts              # Text extraction
│   │   └── analyzer.ts               # Content analysis
│   │
│   ├── validation/                   # Validation schemas
│   │   ├── user.ts                   # User schemas
│   │   ├── chat.ts                   # Chat schemas
│   │   ├── exam.ts                   # Exam schemas
│   │   └── medication.ts             # Medication schemas
│   │
│   ├── utils/                        # General utilities
│   │   ├── date.ts                   # Date utilities
│   │   ├── format.ts                 # Formatting
│   │   ├── validation.ts             # Validation helpers
│   │   ├── crypto.ts                 # Encryption
│   │   └── logger.ts                 # Logging
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useChat.ts                # Chat hook
│   │   ├── useVoice.ts               # Voice recording hook
│   │   ├── useUser.ts                # User data hook
│   │   ├── useSocket.ts              # WebSocket hook
│   │   └── useMediaQuery.ts          # Responsive hook
│   │
│   └── constants/                    # Constants
│       ├── routes.ts                 # App routes
│       ├── config.ts                 # App config
│       ├── prompts.ts                # AI prompts
│       └── medications.ts            # Medication data
│
├── prisma/                           # Prisma ORM
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration files
│   │   └── ...
│   └── seed.ts                       # Seed data
│
├── public/                           # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo.png
│   │   └── icons/
│   ├── fonts/
│   ├── manifest.json                 # PWA manifest
│   ├── robots.txt
│   ├── sitemap.xml
│   └── favicon.ico
│
├── tests/                            # Tests
│   ├── unit/                         # Unit tests
│   │   ├── lib/
│   │   ├── components/
│   │   └── utils/
│   ├── integration/                  # Integration tests
│   │   └── api/
│   ├── e2e/                          # End-to-end tests
│   │   ├── auth.spec.ts
│   │   ├── chat.spec.ts
│   │   ├── exams.spec.ts
│   │   └── vademecum.spec.ts
│   └── helpers/                      # Test helpers
│       ├── setup.ts
│       └── mocks.ts
│
├── docs/                             # Documentation
│   ├── api/                          # API documentation
│   │   ├── endpoints.md
│   │   └── examples.md
│   ├── guides/                       # User guides
│   │   ├── getting-started.md
│   │   ├── deployment.md
│   │   └── troubleshooting.md
│   └── architecture/                 # Architecture docs
│       ├── diagrams/
│       └── decisions/
│
├── scripts/                          # Utility scripts
│   ├── seed.ts                       # Seed database
│   ├── migrate.ts                    # Run migrations
│   ├── backup.ts                     # Backup utilities
│   └── deploy.sh                     # Deployment script
│
├── .env.example                      # Environment variables example
├── .env.local                        # Local environment (gitignored)
├── .gitignore                        # Git ignore rules
├── .eslintrc.json                    # ESLint config
├── .prettierrc                       # Prettier config
├── tsconfig.json                     # TypeScript config
├── next.config.js                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── postcss.config.js                 # PostCSS config
├── vitest.config.ts                  # Vitest config
├── playwright.config.ts              # Playwright config
├── docker-compose.yml                # Docker compose
├── Dockerfile                        # Docker image
├── package.json                      # Dependencies
├── package-lock.json                 # Lock file
├── README.md                         # Main readme
├── LICENSE                           # License
├── ARCHITECTURE.md                   # Architecture doc
├── TECH_STACK.md                     # Tech stack doc
├── DATABASE_DESIGN.md                # Database design
├── IMPROVEMENTS.md                   # Improvements doc
└── IMPLEMENTATION_ROADMAP.md         # Implementation plan
```

## Convenciones de Código

### Nomenclatura de Archivos

```typescript
// Components (PascalCase)
ChatInterface.tsx
MessageList.tsx
VoiceRecorder.tsx

// Utilities (camelCase)
formatDate.ts
validateEmail.ts
parseMarkdown.ts

// Hooks (camelCase con 'use' prefix)
useChat.ts
useVoice.ts
useAuth.ts

// API Routes (route.ts)
app/api/chat/route.ts
app/api/profile/route.ts

// Pages (page.tsx)
app/(dashboard)/chat/page.tsx
app/(auth)/login/page.tsx
```

### Estructura de Componentes

```typescript
// components/chat/ChatInterface.tsx

import { FC } from 'react';
import { cn } from '@/lib/utils';

// 1. Tipos
interface ChatInterfaceProps {
  sessionId: string;
  className?: string;
}

// 2. Componente
export const ChatInterface: FC<ChatInterfaceProps> = ({
  sessionId,
  className,
}) => {
  // 3. Hooks
  const { messages, sendMessage, isLoading } = useChat(sessionId);

  // 4. Handlers
  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  // 5. Render
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <MessageList messages={messages} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

// 6. Display name (opcional)
ChatInterface.displayName = 'ChatInterface';
```

### Estructura de API Routes

```typescript
// app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';

// 1. Schema de validación
const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional(),
});

// 2. Handler POST
export async function POST(req: NextRequest) {
  try {
    // 3. Autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 4. Validación
    const body = await req.json();
    const { message, sessionId } = chatSchema.parse(body);

    // 5. Lógica de negocio
    const response = await processChatMessage(
      session.user.id,
      message,
      sessionId
    );

    // 6. Respuesta
    return NextResponse.json(response);

  } catch (error) {
    // 7. Manejo de errores
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 8. Handler GET (si aplica)
export async function GET(req: NextRequest) {
  // ...
}
```

### Estructura de Hooks

```typescript
// lib/hooks/useChat.ts

import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export function useChat(sessionId: string) {
  // 1. Estado
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 2. Hooks externos
  const socket = useSocket();

  // 3. Funciones
  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, data.userMessage, data.assistantMessage]);

    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // 4. Efectos
  useEffect(() => {
    // Load initial messages
    fetch(`/api/chat/sessions/${sessionId}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages));
  }, [sessionId]);

  // 5. Return
  return {
    messages,
    sendMessage,
    isLoading,
    error,
  };
}
```

## Convenciones de Estilo

### Tailwind CSS

```typescript
// Usar cn() helper para clases condicionales
import { cn } from '@/lib/utils';

<button
  className={cn(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    'bg-primary text-primary-foreground',
    'hover:bg-primary/90',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    isActive && 'ring-2 ring-primary',
    className
  )}
>
  {children}
</button>
```

### Responsive Design

```typescript
// Mobile-first approach
<div className="
  grid grid-cols-1          /* mobile */
  md:grid-cols-2            /* tablet */
  lg:grid-cols-3            /* desktop */
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

## Variables de Entorno

### Estructura de .env

```bash
# .env.local (desarrollo)
# .env.production (producción)

# ====================
# DATABASE
# ====================
DATABASE_URL="postgresql://user:pass@localhost:5432/martin"

# ====================
# AUTH
# ====================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# ====================
# AI PROVIDERS
# ====================
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# ====================
# VECTOR DB
# ====================
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="us-west1-gcp"
PINECONE_INDEX="martin-medical"

# ====================
# STORAGE
# ====================
S3_ENDPOINT="https://..."
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
S3_BUCKET="martin-medical"

# ====================
# CACHE
# ====================
REDIS_URL="redis://localhost:6379"

# ====================
# MONITORING
# ====================
SENTRY_DSN="..."

# ====================
# APP CONFIG
# ====================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AI_PROVIDER="openai" # openai | claude | lmstudio
```

## Scripts NPM

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "type-check": "tsc --noEmit",

    "test": "vitest",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",

    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",

    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",

    "prepare": "husky install",
    "postinstall": "prisma generate"
  }
}
```

## Git Workflow

### Branch Strategy

```bash
main                    # Producción
├── develop            # Desarrollo
│   ├── feature/chat   # Features
│   ├── feature/voice
│   └── fix/auth-bug   # Bugfixes
└── hotfix/critical    # Hotfixes
```

### Commit Convention

```bash
# Formato: <type>(<scope>): <subject>

feat(chat): add streaming responses
fix(auth): resolve session timeout issue
docs(readme): update installation guide
style(ui): improve button spacing
refactor(api): simplify error handling
test(chat): add unit tests for message parsing
chore(deps): update dependencies
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint
npm run type-check
npm run test
```

## Testing Strategy

### Unit Tests
```typescript
// tests/unit/lib/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/utils/date';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-03-15');
    expect(formatDate(date)).toBe('15/03/2024');
  });
});
```

### Integration Tests
```typescript
// tests/integration/api/chat.test.ts
import { describe, it, expect } from 'vitest';

describe('POST /api/chat', () => {
  it('should return AI response', async () => {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });
});
```

### E2E Tests
```typescript
// tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('user can send a chat message', async ({ page }) => {
  await page.goto('/chat');
  await page.fill('[data-testid="chat-input"]', 'Hello MARTIN');
  await page.click('[data-testid="send-button"]');

  await expect(page.locator('.message-user')).toContainText('Hello MARTIN');
  await expect(page.locator('.message-assistant')).toBeVisible();
});
```

## Mejores Prácticas

### 1. TypeScript Strict
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 2. Error Handling
```typescript
// Usar Result pattern para operaciones críticas
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return { success: false, error: new Error('User not found') };
    }
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### 3. Performance
```typescript
// Lazy loading
const ChatInterface = dynamic(() => import('@/components/chat/ChatInterface'), {
  ssr: false,
  loading: () => <Skeleton className="h-96" />
});

// Memoization
const MemoizedMessageList = memo(MessageList);

// Debouncing
const debouncedSearch = useDebouncedCallback(
  (query: string) => performSearch(query),
  300
);
```

### 4. Seguridad
```typescript
// Siempre validar input
const userInput = z.string().min(1).max(5000).parse(input);

// Sanitizar HTML
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(dirty);

// Rate limiting
import { Ratelimit } from '@upstash/ratelimit';
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

## Mantenimiento

### Actualización de Dependencias
```bash
# Revisar dependencias desactualizadas
npm outdated

# Actualizar de forma segura
npm update

# Actualizar major versions (con cuidado)
npx npm-check-updates -u
npm install
```

### Limpieza de Base de Datos
```bash
# Limpiar sesiones expiradas
npm run db:cleanup:sessions

# Archivar datos antiguos
npm run db:archive:old-data
```

## Próximos Pasos

Una vez aprobada esta estructura:

1. **Inicializar proyecto**
   ```bash
   npx create-next-app@latest martin-medical --typescript --tailwind --app
   ```

2. **Crear estructura de carpetas**
   ```bash
   mkdir -p app/(auth) app/(dashboard) app/api components/ui lib/ai prisma
   ```

3. **Configurar herramientas**
   - ESLint
   - Prettier
   - Husky
   - Prisma

4. **Comenzar implementación** según [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)

---

**¿Listo para comenzar la implementación?** 🚀
