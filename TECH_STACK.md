# Stack Tecnológico - MARTIN Medical Assistant

## Frontend

### Core Framework
```json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "typescript": "^5.4.0"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.0",
  "@radix-ui/react-*": "latest",
  "shadcn/ui": "latest",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.344.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

### State Management
```json
{
  "zustand": "^4.5.0",
  "react-hook-form": "^7.50.0",
  "zod": "^3.22.0"
}
```

### Real-time & Communication
```json
{
  "socket.io-client": "^4.7.0",
  "@tanstack/react-query": "^5.24.0",
  "axios": "^1.6.0"
}
```

### Audio & Voice
```json
{
  "recordrtc": "^5.6.2",
  "wavesurfer.js": "^7.7.0",
  "@openai/realtime-api-beta": "latest",
  "react-speech-recognition": "^3.10.0"
}
```

### File Handling
```json
{
  "react-dropzone": "^14.2.0",
  "pdf-lib": "^1.17.1",
  "pdfjs-dist": "^4.0.0",
  "react-pdf": "^7.7.0"
}
```

### PWA & Offline
```json
{
  "next-pwa": "^5.6.0",
  "workbox-webpack-plugin": "^7.0.0",
  "idb": "^8.0.0"
}
```

### Internationalization
```json
{
  "next-intl": "^3.9.0"
}
```

## Backend

### Core Framework
```json
{
  "next": "^14.2.0",
  "node": ">=18.0.0"
}
```

### Database & ORM
```json
{
  "prisma": "^5.10.0",
  "@prisma/client": "^5.10.0",
  "pg": "^8.11.0"
}
```

### Authentication
```json
{
  "next-auth": "^5.0.0-beta",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2"
}
```

### AI & LLM Integration
```json
{
  "openai": "^4.28.0",
  "@anthropic-ai/sdk": "^0.17.0",
  "langchain": "^0.1.0",
  "@langchain/openai": "^0.0.18",
  "@langchain/anthropic": "^0.0.3",
  "@langchain/community": "^0.0.32"
}
```

### Vector Database
```json
{
  "@pinecone-database/pinecone": "^2.0.0",
  "chromadb": "^1.8.0"
}
```

### File Processing
```json
{
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.33.0",
  "pdf-parse": "^1.1.1",
  "tesseract.js": "^5.0.0"
}
```

### WebSocket & Real-time
```json
{
  "socket.io": "^4.7.0",
  "ws": "^8.16.0"
}
```

### Cache & Session
```json
{
  "redis": "^4.6.0",
  "ioredis": "^5.3.0"
}
```

### Validation & Security
```json
{
  "zod": "^3.22.0",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0",
  "cors": "^2.8.5"
}
```

### Object Storage
```json
{
  "@aws-sdk/client-s3": "^3.500.0",
  "@cloudflare/workers-types": "^4.20240208.0"
}
```

## DevOps & Infrastructure

### Containerization
```yaml
Docker: "^25.0.0"
Docker Compose: "^2.24.0"
```

### Environment Management
```json
{
  "dotenv": "^16.4.0",
  "dotenv-expand": "^11.0.0"
}
```

### Testing
```json
{
  "vitest": "^1.3.0",
  "@testing-library/react": "^14.2.0",
  "@testing-library/jest-dom": "^6.4.0",
  "playwright": "^1.41.0",
  "cypress": "^13.6.0"
}
```

### Code Quality
```json
{
  "eslint": "^8.56.0",
  "prettier": "^3.2.0",
  "husky": "^9.0.0",
  "lint-staged": "^15.2.0"
}
```

### Monitoring & Analytics
```json
{
  "@sentry/nextjs": "^7.100.0",
  "posthog-js": "^1.103.0",
  "pino": "^8.18.0"
}
```

## External Services & APIs

### AI Services
- **OpenAI**: GPT-4 Turbo, GPT-4o, Whisper, TTS, Embeddings
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **ElevenLabs**: Text-to-Speech premium (opcional)
- **LMStudio**: Modelos locales (Llama 3, Mistral, etc.)

### Database & Storage
- **Supabase**: PostgreSQL + Auth + Storage
- **Pinecone**: Vector database (cloud)
- **ChromaDB**: Vector database (local)
- **Cloudflare R2**: Object storage
- **Redis Cloud**: Cache y sesiones

### Deployment Platforms

#### Opción 1: Vercel (Recomendado para inicio)
```yaml
Platform: Vercel
Database: Supabase
Storage: Cloudflare R2
Cache: Upstash Redis
```

#### Opción 2: Cloudflare
```yaml
Platform: Cloudflare Pages + Workers
Database: Neon PostgreSQL / Supabase
Storage: Cloudflare R2
Cache: Cloudflare KV
```

#### Opción 3: Railway
```yaml
Platform: Railway
Database: Railway PostgreSQL
Storage: Cloudflare R2
Cache: Railway Redis
```

#### Opción 4: Self-hosted
```yaml
Platform: VPS (Digital Ocean, Hetzner)
Database: PostgreSQL (Docker)
Storage: MinIO (S3 compatible)
Cache: Redis (Docker)
Reverse Proxy: Nginx
SSL: Let's Encrypt
```

## Development Tools

### IDE & Extensions
```yaml
IDE: Visual Studio Code
Extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - GitLens
  - Thunder Client (API testing)
```

### API Development
```yaml
Testing: Thunder Client / Insomnia / Postman
Documentation: Swagger / OpenAPI
```

### Version Control
```yaml
Git: Latest
GitHub: Repository + Actions (CI/CD)
```

## Estructura de package.json Completo

```json
{
  "name": "martin-medical-assistant",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "prepare": "husky install"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "@prisma/client": "^5.10.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.24.0",
    "next-auth": "^5.0.0-beta",
    "openai": "^4.28.0",
    "@anthropic-ai/sdk": "^0.17.0",
    "langchain": "^0.1.0",
    "@langchain/openai": "^0.0.18",
    "@pinecone-database/pinecone": "^2.0.0",
    "socket.io": "^4.7.0",
    "socket.io-client": "^4.7.0",
    "zustand": "^4.5.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.50.0",
    "axios": "^1.6.0",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.344.0",
    "framer-motion": "^11.0.0",
    "next-pwa": "^5.6.0",
    "react-dropzone": "^14.2.0",
    "recordrtc": "^5.6.2",
    "wavesurfer.js": "^7.7.0",
    "pdfjs-dist": "^4.0.0",
    "sharp": "^0.33.0",
    "ioredis": "^5.3.0",
    "@sentry/nextjs": "^7.100.0",
    "next-intl": "^3.9.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/bcrypt": "^5.0.0",
    "prisma": "^5.10.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0",
    "vitest": "^1.3.0",
    "@testing-library/react": "^14.2.0",
    "playwright": "^1.41.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.2.0",
    "@types/multer": "^1.4.11"
  }
}
```

## Variables de Entorno (.env.example)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/martin_medical"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI
OPENAI_API_KEY="sk-..."

# Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-..."

# Pinecone
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="us-west1-gcp"
PINECONE_INDEX="martin-medical"

# Redis
REDIS_URL="redis://localhost:6379"

# S3 / Cloudflare R2
S3_ENDPOINT="..."
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
S3_BUCKET="martin-medical"
S3_REGION="auto"

# ElevenLabs (opcional)
ELEVENLABS_API_KEY="..."

# LMStudio (local)
LMSTUDIO_API_URL="http://localhost:1234/v1"

# Modo de ejecución
AI_PROVIDER="openai" # openai | anthropic | lmstudio
ENVIRONMENT="development" # development | production

# Monitoring
SENTRY_DSN="..."
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="..."

# Configuración de aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MAX_FILE_SIZE="10485760" # 10MB
NEXT_PUBLIC_TECHNICAL_LEVEL_DEFAULT="moderate"
```

## Requerimientos de Sistema

### Desarrollo Local
```yaml
Node.js: >= 18.0.0
npm/pnpm: >= 9.0.0 / >= 8.0.0
RAM: >= 8GB (recomendado 16GB)
Disco: >= 10GB libre
OS: Windows 10+, macOS 12+, Linux
```

### Producción (VPS)
```yaml
CPU: >= 2 cores
RAM: >= 4GB (recomendado 8GB)
Disco: >= 20GB SSD
Bandwidth: >= 100 Mbps
```

### Modo LMStudio Local
```yaml
CPU: >= 4 cores (mejor con GPU)
RAM: >= 16GB
GPU: NVIDIA con >= 8GB VRAM (recomendado)
Disco: >= 50GB (para modelos)
```

## Configuración Docker

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: martin_medical
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma

volumes:
  postgres_data:
  redis_data:
  chroma_data:
```

## Herramientas Adicionales Recomendadas

### Desarrollo
- **Postman/Insomnia**: Testing de APIs
- **TablePlus/DBeaver**: Gestión de DB
- **Redis Commander**: Visualización de Redis
- **Docker Desktop**: Contenedores

### Diseño
- **Figma**: Diseño de UI/UX
- **Excalidraw**: Diagramas y wireframes

### Gestión de Proyecto
- **Linear/GitHub Projects**: Task management
- **Notion**: Documentación

### Seguridad
- **OWASP ZAP**: Security testing
- **SonarQube**: Code quality & security

## Próximos Pasos

1. Inicializar proyecto con `create-next-app`
2. Configurar Prisma y database
3. Implementar sistema de autenticación
4. Desarrollar componentes UI base
5. Integrar servicios de IA

Ver `IMPLEMENTATION_ROADMAP.md` para detalles.
