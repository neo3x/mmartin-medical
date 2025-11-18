# 🚀 Guía de Instalación y Configuración - MARTIN Medical Assistant

Esta guía te llevará paso a paso desde cero hasta tener la plataforma MARTIN completamente funcional.

## 📋 Requisitos Previos

### Software Necesario

```bash
Node.js >= 18.0.0
npm >= 9.0.0 (o pnpm >= 8.0.0)
Git
Docker Desktop (opcional pero recomendado)
```

### Cuentas y API Keys Necesarias

1. **OpenAI** (obligatorio)
   - Crear cuenta en https://platform.openai.com
   - Generar API key en https://platform.openai.com/api-keys
   - Costo aproximado: $0.01 - $0.10 por interacción

2. **Anthropic Claude** (opcional)
   - Crear cuenta en https://console.anthropic.com
   - Generar API key
   - Alternativa a OpenAI

3. **Pinecone** (para RAG - opcional)
   - Crear cuenta en https://www.pinecone.io
   - Tier gratis disponible
   - Alternativa: usar ChromaDB local

4. **Supabase** o **PostgreSQL**
   - Opción 1: Supabase (https://supabase.com) - más fácil
   - Opción 2: PostgreSQL local con Docker

5. **Redis** (para cache)
   - Opción 1: Redis Cloud (https://redis.com) - tier gratis
   - Opción 2: Redis local con Docker

6. **Cloudflare R2** o **AWS S3** (para almacenamiento)
   - Opción 1: Cloudflare R2 (más económico)
   - Opción 2: AWS S3
   - Opción 3: MinIO local con Docker

---

## 🛠️ Instalación Paso a Paso

### Paso 1: Clonar el Repositorio

```bash
# Clonar el proyecto
git clone <tu-repositorio-url>
cd mmartin-medical

# Verificar que estás en la rama correcta
git branch
```

### Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias
npm install

# Esto puede tomar 2-3 minutos
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env.local

# Ahora edita .env.local con tus valores reales
```

#### Variables Obligatorias Mínimas

Edita `.env.local` y configura al menos estas variables:

```bash
# Database (usa Supabase o PostgreSQL local)
DATABASE_URL="postgresql://user:password@localhost:5432/martin_medical"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-string-aleatorio-seguro-aqui"

# OpenAI (OBLIGATORIO)
OPENAI_API_KEY="sk-..." # Tu API key de OpenAI

# Proveedor de IA predeterminado
AI_PROVIDER="openai"
```

#### Generar NEXTAUTH_SECRET

```bash
# Opción 1: Con OpenSSL
openssl rand -base64 32

# Opción 2: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copia el resultado y pégalo en NEXTAUTH_SECRET
```

### Paso 4: Configurar Base de Datos

#### Opción A: Usando Docker (Recomendado para desarrollo)

```bash
# Levantar PostgreSQL, Redis y ChromaDB
docker-compose up -d

# Verificar que están corriendo
docker-compose ps

# Deberías ver:
# - martin-postgres (puerto 5432)
# - martin-redis (puerto 6379)
# - martin-chromadb (puerto 8000)
```

Tu `.env.local` debería tener:

```bash
DATABASE_URL="postgresql://martin:martin_dev_password@localhost:5432/martin_medical"
REDIS_URL="redis://localhost:6379"
CHROMA_URL="http://localhost:8000"
```

#### Opción B: Usando Supabase (Recomendado para producción)

1. Ir a https://supabase.com
2. Crear nuevo proyecto
3. Copiar la connection string de PostgreSQL
4. Actualizar `.env.local`:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Paso 5: Ejecutar Migraciones de Base de Datos

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones (crear tablas)
npx prisma migrate dev --name init

# Deberías ver: "Your database is now in sync with your schema."
```

### Paso 6: (Opcional) Poblar Base de Datos

```bash
# Crear datos de prueba
npm run db:seed

# Esto creará:
# - Usuario de prueba
# - Algunos medicamentos en el vademecum
# - Datos de ejemplo
```

### Paso 7: Iniciar Servidor de Desarrollo

```bash
# Iniciar en modo desarrollo
npm run dev

# Deberías ver:
# ✓ Ready in Xms
# ○ Local:        http://localhost:3000
```

### Paso 8: Verificar Instalación

Abre tu navegador en http://localhost:3000 y deberías ver:

1. ✅ Landing page de MARTIN
2. ✅ Botones de "Iniciar Sesión" y "Registrarse"
3. ✅ Sin errores en consola

#### Verificar Health Check

```bash
# Verificar que todos los servicios están funcionando
curl http://localhost:3000/api/health

# Deberías ver:
# {"status":"healthy","checks":{"database":true,"cache":true, ...}}
```

---

## 🧪 Prueba Completa del Sistema

### 1. Registrar Usuario

1. Ir a http://localhost:3000/register
2. Llenar el formulario:
   - Nombre: Test User
   - Email: test@example.com
   - Contraseña: test12345
3. Hacer clic en "Crear Cuenta"
4. Deberías ser redirigido a /login

### 2. Iniciar Sesión

1. Ir a http://localhost:3000/login
2. Ingresar credenciales
3. Hacer clic en "Iniciar Sesión"
4. Deberías ser redirigido al dashboard

### 3. Probar Chat con IA

```bash
# Método 1: Desde la UI
1. Ir a /dashboard/chat
2. Escribir: "Hola MARTIN, ¿cómo estás?"
3. Enviar
4. Deberías recibir una respuesta de la IA

# Método 2: Con cURL
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola MARTIN"}'
```

### 4. Verificar RAG (Memoria Contextual)

1. Hacer una pregunta: "Me llamo Juan y tengo diabetes"
2. Luego preguntar: "¿Cuál es mi nombre?"
3. MARTIN debería recordar que te llamas Juan

---

## 🐳 Comandos Docker Útiles

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f postgres

# Detener todos los servicios
docker-compose down

# Reiniciar un servicio
docker-compose restart redis

# Limpiar todo (¡cuidado! borra datos)
docker-compose down -v
```

---

## 🔧 Configuración Avanzada

### Habilitar Claude (Anthropic)

```bash
# En .env.local, agregar:
ANTHROPIC_API_KEY="sk-ant-..."
AI_PROVIDER="anthropic"

# Reiniciar servidor
npm run dev
```

### Habilitar LMStudio (Modelos Locales)

1. Descargar LMStudio: https://lmstudio.ai
2. Descargar un modelo (ej: Llama-3-8B)
3. Iniciar servidor local en LMStudio
4. Configurar `.env.local`:

```bash
LMSTUDIO_API_URL="http://localhost:1234/v1"
AI_PROVIDER="lmstudio"
```

### Configurar Pinecone (en lugar de ChromaDB)

```bash
# En .env.local:
PINECONE_API_KEY="..."
PINECONE_ENVIRONMENT="us-west1-gcp"
PINECONE_INDEX="martin-medical"

# El sistema usará automáticamente Pinecone
```

### Configurar Cloudflare R2

```bash
# En .env.local:
S3_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="martin-medical"
S3_REGION="auto"
S3_PUBLIC_URL="https://[your-r2-domain]"
```

---

## 📊 Verificar que Todo Funciona

### Checklist Completo

- [ ] `npm run dev` inicia sin errores
- [ ] http://localhost:3000 carga la landing page
- [ ] http://localhost:3000/api/health retorna {"status":"healthy"}
- [ ] Puedo registrar un usuario nuevo
- [ ] Puedo iniciar sesión
- [ ] El chat responde con IA
- [ ] Los mensajes se guardan en la BD
- [ ] Docker containers están corriendo (si usas Docker)

### Verificar Base de Datos

```bash
# Ver las tablas creadas
npx prisma studio

# Esto abre un navegador en http://localhost:5555
# Puedes ver todas las tablas y datos
```

### Verificar Logs

```bash
# Logs del servidor Next.js
# Deberían verse en la terminal donde corriste 'npm run dev'

# Buscar errores:
grep -i error

# Ver logs de Redis (si usas Docker)
docker-compose logs redis
```

---

## ❌ Solución de Problemas Comunes

### Error: "Failed to connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# O si usas Supabase, verificar la connection string
# Asegúrate de que DATABASE_URL es correcta
```

### Error: "OpenAI API key invalid"

```bash
# Verificar que tu API key es correcta
echo $OPENAI_API_KEY

# Asegúrate de que empieza con "sk-"
# Genera una nueva en https://platform.openai.com/api-keys
```

### Error: "Redis connection refused"

```bash
# Si usas Docker:
docker-compose up -d redis

# Si usas Redis Cloud, verificar REDIS_URL
```

### Error: "Port 3000 already in use"

```bash
# Matar el proceso que usa el puerto
lsof -ti:3000 | xargs kill

# O usar otro puerto
PORT=3001 npm run dev
```

### Página en blanco o error 500

```bash
# Limpiar cache de Next.js
rm -rf .next
npm run dev

# Verificar errores en consola del navegador (F12)
```

---

## 🚀 Desplegar a Producción

### Opción 1: Vercel (Más Fácil)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Seguir instrucciones en pantalla
# Configurar variables de entorno en Vercel dashboard
```

### Opción 2: Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Deploy
railway up

# Configurar variables de entorno en Railway dashboard
```

### Opción 3: Docker (Self-hosted)

```bash
# Build imagen
docker build -t martin-medical .

# Run container
docker run -p 3000:3000 --env-file .env.production martin-medical
```

### Variables de Entorno para Producción

```bash
NODE_ENV="production"
NEXTAUTH_URL="https://tu-dominio.com"
DATABASE_URL="postgresql://..." # Tu BD de producción
REDIS_URL="redis://..." # Redis de producción
# ... todas las demás API keys
```

---

## 📚 Recursos Adicionales

- [Documentación Next.js](https://nextjs.org/docs)
- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación OpenAI](https://platform.openai.com/docs)
- [Documentación Anthropic](https://docs.anthropic.com)

---

## 🆘 Obtener Ayuda

Si tienes problemas:

1. Revisa los logs: `npm run dev` (en la terminal)
2. Revisa la consola del navegador (F12)
3. Verifica las variables de entorno
4. Asegúrate de que todos los servicios Docker están corriendo
5. Consulta la documentación en los archivos `.md` del proyecto

---

## ✅ Siguiente Paso

Una vez que todo esté funcionando, puedes:

1. **Personalizar el perfil médico**: Ir a /profile y llenar tu información
2. **Probar el chat**: Hacer preguntas médicas a MARTIN
3. **Subir un examen**: Probar la interpretación de PDFs
4. **Explorar el vademecum**: Buscar medicamentos

¡Felicidades! 🎉 Tienes MARTIN corriendo localmente.
