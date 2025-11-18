# Diseño de Base de Datos - MARTIN Medical Assistant

## Diagrama ER (Entity Relationship)

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│    User      │────────>│  MedicalProfile  │<────────│  Medication  │
│              │  1:1    │                  │   M:N   │              │
│  id          │         │  id              │         │  id          │
│  email       │         │  userId          │         │  name        │
│  password    │         │  bloodType       │         │  activeComp. │
│  name        │         │  allergies       │         │  description │
│  role        │         │  conditions      │         │              │
│  createdAt   │         │  height          │         └──────────────┘
└──────┬───────┘         │  weight          │
       │                 └──────────────────┘
       │
       │         ┌─────────────────┐
       ├────────>│  ChatSession    │
       │   1:M   │                 │
       │         │  id             │
       │         │  userId         │
       │         │  title          │
       │         │  createdAt      │
       │         │  updatedAt      │
       │         └────────┬────────┘
       │                  │
       │                  │  1:M
       │                  v
       │         ┌─────────────────┐
       │         │    Message      │
       │         │                 │
       │         │  id             │
       │         │  sessionId      │
       │         │  role           │
       │         │  content        │
       │         │  audioUrl       │
       │         │  metadata       │
       │         │  createdAt      │
       │         └─────────────────┘
       │
       │         ┌─────────────────┐
       ├────────>│   ExamResult    │
       │   1:M   │                 │
       │         │  id             │
       │         │  userId         │
       │         │  type           │
       │         │  fileUrl        │
       │         │  interpretation │
       │         │  findings       │
       │         │  recommendations│
       │         │  analyzedAt     │
       │         └─────────────────┘
       │
       │         ┌──────────────────┐
       ├────────>│  VademecumQuery  │
       │   1:M   │                  │
       │         │  id              │
       │         │  userId          │
       │         │  queryType       │
       │         │  input           │
       │         │  imageUrl        │
       │         │  result          │
       │         │  medicationInfo  │
       │         │  createdAt       │
       │         └──────────────────┘
       │
       │         ┌──────────────────┐
       └────────>│    Embedding     │
           1:M   │                  │
                 │  id              │
                 │  userId          │
                 │  content         │
                 │  embedding       │
                 │  metadata        │
                 │  createdAt       │
                 └──────────────────┘
```

## Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================

enum UserRole {
  PATIENT
  ADMIN
  DOCTOR
}

enum TechnicalLevel {
  SIMPLE
  MODERATE
  TECHNICAL
  EXPERT
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  password      String
  name          String?
  image         String?
  role          UserRole  @default(PATIENT)

  // Configuración de usuario
  preferredLanguage String @default("es")
  technicalLevel    TechnicalLevel @default(MODERATE)

  // Control de cuenta
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relaciones
  medicalProfile   MedicalProfile?
  chatSessions     ChatSession[]
  examResults      ExamResult[]
  vademecumQueries VademecumQuery[]
  embeddings       Embedding[]
  accounts         Account[]
  sessions         Session[]

  @@index([email])
  @@index([role])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// PERFIL MÉDICO
// ============================================

enum BloodType {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
  UNKNOWN
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

model MedicalProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Información básica
  dateOfBirth DateTime?
  gender      Gender?
  bloodType   BloodType @default(UNKNOWN)
  height      Float?    // en cm
  weight      Float?    // en kg

  // Condiciones médicas
  chronicConditions String[] // ["diabetes", "hipertensión"]
  allergies         String[] // ["penicilina", "polen"]
  currentMedications String[] // Medicamentos actuales

  // Historial
  surgeries         String[] // ["apendicectomía 2020"]
  familyHistory     String[] // ["cáncer", "diabetes tipo 2"]

  // Estilo de vida
  smoker            Boolean @default(false)
  alcoholConsumption String? // "Nunca", "Ocasional", "Regular"
  exerciseFrequency String? // "Sedentario", "1-2/semana", "3-5/semana"

  // Mental health
  mentalHealthConditions String[] // ["ansiedad", "depresión"]
  mentalHealthMedications String[]

  // Contacto de emergencia
  emergencyContact     String?
  emergencyPhone       String?

  // Metadata
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

// ============================================
// CHAT Y CONVERSACIONES
// ============================================

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

model ChatSession {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title     String   @default("Nueva conversación")

  // Configuración de la sesión
  aiProvider String  @default("openai") // openai, anthropic, lmstudio
  model      String  @default("gpt-4-turbo")

  // Estadísticas
  messageCount Int @default(0)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  messages Message[]

  @@index([userId])
  @@index([createdAt])
}

model Message {
  id        String   @id @default(cuid())
  sessionId String
  session   ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  role      MessageRole
  content   String      @db.Text

  // Audio
  audioUrl  String?
  audioDuration Float? // en segundos

  // Metadata
  metadata  Json?       @db.JsonB // Para guardar contexto adicional

  // Tokens (para tracking de costos)
  inputTokens  Int?
  outputTokens Int?

  createdAt DateTime @default(now())

  @@index([sessionId])
  @@index([createdAt])
}

// ============================================
// EXÁMENES MÉDICOS
// ============================================

enum ExamType {
  BLOOD_TEST
  URINE_TEST
  IMAGING
  ELECTROCARDIOGRAM
  OTHER
}

model ExamResult {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Tipo de examen
  type      ExamType
  name      String   // "Hemograma completo"

  // Archivo
  fileUrl   String
  fileName  String
  fileSize  Int

  // Análisis
  interpretation String  @db.Text
  findings       Json    @db.JsonB // Hallazgos estructurados
  recommendations String[] // Recomendaciones

  // Valores críticos
  hasCriticalValues Boolean @default(false)
  criticalValues    Json?   @db.JsonB

  // Metadata
  examDate    DateTime? // Fecha del examen (puede ser diferente a analyzedAt)
  analyzedAt  DateTime  @default(now())
  analyzedBy  String    @default("AI") // AI, Doctor, etc.

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([type])
  @@index([analyzedAt])
}

// ============================================
// VADEMECUM
// ============================================

enum QueryType {
  TEXT
  VOICE
  IMAGE
  SYMPTOM
}

model VademecumQuery {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Tipo de consulta
  queryType QueryType
  input     String    @db.Text // Texto o descripción
  imageUrl  String?   // URL si es por imagen

  // Resultado
  result    Json      @db.JsonB

  // Info del medicamento identificado
  medicationName   String?
  activeIngredient String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([queryType])
  @@index([createdAt])
}

// Base de datos de medicamentos (puede ser JSON o tabla)
model Medication {
  id        String   @id @default(cuid())

  // Información básica
  tradeName       String   @unique
  activeIngredient String
  category        String   // Analgésico, Antibiótico, etc.

  // Descripción
  description     String   @db.Text
  indications     String[] // Usos
  contraindications String[] // Contraindicaciones
  sideEffects     String[] // Efectos secundarios
  dosage          String   @db.Text

  // Interacciones
  interactions    Json?    @db.JsonB

  // Metadata
  requiresPrescription Boolean @default(true)
  isGeneric           Boolean @default(false)

  // Búsqueda
  searchTerms     String[] // Para búsqueda

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tradeName])
  @@index([activeIngredient])
  @@index([category])
}

// ============================================
// EMBEDDINGS Y RAG
// ============================================

model Embedding {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Contenido
  content   String   @db.Text

  // Vector (se guarda en Pinecone/ChromaDB, aquí solo referencia)
  vectorId  String   @unique // ID en la vector DB

  // Metadata
  metadata  Json     @db.JsonB
  source    String   // "chat", "exam", "profile", etc.
  sourceId  String?  // ID del documento fuente

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([source])
  @@index([vectorId])
}

// ============================================
// AUDITORÍA Y LOGS
// ============================================

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?

  action    String   // "user_login", "exam_uploaded", etc.
  entity    String   // "User", "ExamResult", etc.
  entityId  String?

  details   Json?    @db.JsonB
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

// ============================================
// CONFIGURACIÓN DEL SISTEMA
// ============================================

model SystemConfig {
  id    String @id @default(cuid())
  key   String @unique
  value Json   @db.JsonB

  updatedAt DateTime @updatedAt

  @@index([key])
}
```

## Índices y Optimización

### Índices Compuestos Adicionales
```sql
-- Para búsquedas de conversaciones recientes de un usuario
CREATE INDEX idx_chat_session_user_created
ON "ChatSession" ("userId", "createdAt" DESC);

-- Para búsqueda de mensajes en un rango de tiempo
CREATE INDEX idx_message_session_created
ON "Message" ("sessionId", "createdAt" DESC);

-- Para búsqueda de exámenes por usuario y fecha
CREATE INDEX idx_exam_user_analyzed
ON "ExamResult" ("userId", "analyzedAt" DESC);

-- Para búsqueda de logs de auditoría
CREATE INDEX idx_audit_user_created
ON "AuditLog" ("userId", "createdAt" DESC);
```

### Particionamiento (Para escala futura)
```sql
-- Particionar tabla de mensajes por fecha (si crece mucho)
CREATE TABLE "Message" PARTITION BY RANGE ("createdAt");

CREATE TABLE "Message_2024_q1" PARTITION OF "Message"
FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

## Vector Database Schema (Pinecone)

```typescript
// Estructura de metadata en Pinecone
interface VectorMetadata {
  userId: string;
  source: 'chat' | 'exam' | 'profile' | 'vademecum';
  sourceId?: string;
  content: string;
  timestamp: number;
  category?: string;
}

// Namespaces
// - user_{userId}_clinical: Historial clínico
// - user_{userId}_conversations: Conversaciones
// - vademecum_general: Base de conocimiento de medicamentos
```

## Redis Schema

```typescript
// Estructura de cache en Redis

// Sesiones de usuario
"session:{sessionId}" -> { userId, data, expires }

// Cache de conversaciones activas
"chat:{sessionId}:messages" -> Array<Message>

// Rate limiting
"ratelimit:{userId}:{endpoint}" -> count

// Voice Activity Detection status
"vad:{userId}" -> { isActive, lastActivity }

// Temporary file uploads
"upload:{userId}:{fileId}" -> { url, metadata, expires }
```

## Migraciones Iniciales

```sql
-- Migration: Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda fuzzy

-- Migration: Full text search
CREATE INDEX idx_medication_search
ON "Medication" USING gin(to_tsvector('spanish',
  tradeName || ' ' || activeIngredient || ' ' || description));
```

## Seeds (Datos Iniciales)

```typescript
// prisma/seed.ts

const medications = [
  {
    tradeName: "Ibuprofeno",
    activeIngredient: "Ibuprofeno",
    category: "Analgésico/Antiinflamatorio",
    description: "AINE usado para dolor y fiebre",
    indications: ["Dolor leve a moderado", "Fiebre", "Inflamación"],
    contraindications: ["Úlcera péptica activa", "Alergia a AINEs"],
    sideEffects: ["Malestar estomacal", "Náuseas", "Dolor de cabeza"],
    dosage: "400-600mg cada 6-8 horas",
    requiresPrescription: false,
  },
  // ... más medicamentos
];
```

## Backup y Recuperación

### Estrategia de Backup
```yaml
PostgreSQL:
  Full Backup: Diario a las 2 AM
  Incremental: Cada 6 horas
  Retention: 30 días
  Tool: pg_dump / Supabase automated backups

Vector DB:
  Export: Semanal
  Format: JSON + metadata
  Storage: S3 / R2

Files (S3/R2):
  Versioning: Habilitado
  Lifecycle: Mover a cold storage después de 90 días
  Retention: 1 año
```

## Estimación de Almacenamiento

### Por Usuario (1 año de uso activo)
```yaml
User + MedicalProfile: ~5 KB
ChatSessions (50): ~10 KB
Messages (1000): ~500 KB
ExamResults (20): ~100 MB (con PDFs)
VademecumQueries (100): ~50 KB
Embeddings (1000): ~50 KB (metadata, vector en Pinecone)

Total por usuario/año: ~100 MB
```

### Escalabilidad
```yaml
1,000 usuarios: ~100 GB
10,000 usuarios: ~1 TB
100,000 usuarios: ~10 TB
```

## Consideraciones de Privacidad y Seguridad

### GDPR / HIPAA Compliance
```typescript
// Encriptación de campos sensibles
// Usar @encrypted en Prisma Middleware

const encryptedFields = [
  'User.password',
  'MedicalProfile.chronicConditions',
  'MedicalProfile.allergies',
  'ExamResult.interpretation',
  'Message.content',
];

// Derecho al olvido (GDPR)
async function anonymizeUser(userId: string) {
  // Eliminar PII pero mantener datos agregados
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: `deleted_${userId}@anonymized.local`,
      name: 'Usuario Eliminado',
      password: 'DELETED',
      isActive: false,
    },
  });

  // Eliminar archivos
  // Eliminar embeddings
  // Mantener estadísticas agregadas
}
```

## Scripts de Mantenimiento

```bash
# Limpiar sesiones expiradas
npm run db:cleanup:sessions

# Agregar datos de audit logs
npm run db:cleanup:audit-logs

# Recalcular embeddings
npm run db:reindex:embeddings

# Generar reporte de uso
npm run db:report:usage
```

## Próximos Pasos

1. Inicializar Prisma: `npx prisma init`
2. Aplicar schema: `npx prisma migrate dev --name init`
3. Generar cliente: `npx prisma generate`
4. Seed inicial: `npx prisma db seed`
5. Configurar backups automáticos

Ver `IMPLEMENTATION_ROADMAP.md` para el plan de implementación completo.
