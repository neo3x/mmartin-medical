# 🚀 Guía de Deployment - MARTIN Medical Assistant

## Resumen Ejecutivo

Este documento cubre todas las opciones de deployment para la plataforma MARTIN, desde desarrollo local hasta producción enterprise.

---

## 📊 Comparativa de Opciones de Deployment

| Plataforma | Dificultad | Costo/mes | Mejor para | Setup Time |
|------------|------------|-----------|------------|------------|
| **Vercel** | ⭐ Fácil | $0-$20 | MVP, Demos | 5 min |
| **Railway** | ⭐⭐ Media | $5-$50 | Desarrollo | 10 min |
| **Cloudflare** | ⭐⭐ Media | $0-$25 | Producción barata | 15 min |
| **Render** | ⭐⭐ Media | $7-$50 | Startups | 10 min |
| **AWS/GCP** | ⭐⭐⭐⭐ Difícil | $50-$500+ | Enterprise | 2-3 días |
| **Self-hosted** | ⭐⭐⭐ Media-Alta | $10-$100 | Control total | 1 día |

---

## 🎯 Opción 1: Vercel (RECOMENDADO PARA MVP)

### Ventajas
- ✅ Deploy automático desde Git
- ✅ Serverless (escalado automático)
- ✅ CDN global incluido
- ✅ SSL gratis
- ✅ Preview deployments

### Desventajas
- ❌ Límites en funciones serverless (10s timeout)
- ❌ No incluye base de datos
- ❌ Costo aumenta con tráfico

### Paso a Paso

#### 1. Preparar el Proyecto

```bash
# Verificar que build funciona
npm run build

# Debería completar sin errores
```

#### 2. Conectar con Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

#### 3. Configurar Variables de Entorno

En Vercel Dashboard (https://vercel.com/dashboard):

1. Ir a tu proyecto → Settings → Environment Variables
2. Agregar todas las variables de `.env.example`:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=...
OPENAI_API_KEY=sk-...
REDIS_URL=redis://...
# etc...
```

#### 4. Configurar Servicios Externos

**Base de Datos**: Supabase
```bash
1. Crear proyecto en https://supabase.com
2. Copiar connection string
3. Agregar como DATABASE_URL en Vercel
```

**Redis**: Upstash
```bash
1. Crear BD en https://upstash.com
2. Copiar REDIS_URL
3. Agregar en Vercel
```

**Storage**: Cloudflare R2
```bash
1. Crear bucket en Cloudflare
2. Generar API keys
3. Configurar en Vercel
```

#### 5. Deploy

```bash
# Production deploy
vercel --prod

# Tu app estará en https://tu-app.vercel.app
```

### Costos Estimados (Vercel)

- **Hobby (Gratis)**:
  - 100GB bandwidth
  - Serverless functions
  - Ilimitado sites

- **Pro ($20/mes)**:
  - 1TB bandwidth
  - Sin tiempo límite en builds
  - Analytics avanzado

---

## 🚂 Opción 2: Railway

### Ventajas
- ✅ PostgreSQL incluido
- ✅ Redis incluido
- ✅ No es serverless (más flexible)
- ✅ WebSockets soportados nativamente

### Desventajas
- ❌ Más caro que Vercel
- ❌ Menos ubicaciones de servidor

### Paso a Paso

```bash
# 1. Instalar CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar
railway init

# 4. Agregar servicios
railway add --plugin postgresql
railway add --plugin redis

# 5. Deploy
railway up

# 6. Configurar variables
railway variables set OPENAI_API_KEY=sk-...
```

### Costos (Railway)

- **Starter ($5/mes)**: $5 crédito incluido
- **Developer ($10/mes)**: $10 crédito incluido
- **Team ($20/mes)**: $20 crédito incluido

---

## ☁️ Opción 3: Cloudflare Pages + Workers

### Ventajas
- ✅ Muy económico
- ✅ CDN global ultra-rápido
- ✅ R2 storage incluido
- ✅ Sin cold starts

### Desventajas
- ❌ Workers tienen límites de CPU (50ms)
- ❌ No es ideal para operaciones pesadas

### Paso a Paso

```bash
# 1. Instalar Wrangler
npm install -g wrangler

# 2. Login
wrangler login

# 3. Configurar wrangler.toml
# (crear archivo en raíz)

# 4. Build
npm run build

# 5. Deploy
wrangler pages publish .next
```

### wrangler.toml

```toml
name = "martin-medical"
compatibility_date = "2024-01-01"

[env.production]
vars = { NODE_ENV = "production" }

[[env.production.r2_buckets]]
binding = "STORAGE"
bucket_name = "martin-medical"
```

---

## 🐳 Opción 4: Docker (Self-hosted)

### Ventajas
- ✅ Control total
- ✅ Privacidad completa
- ✅ Sin vendor lock-in
- ✅ Ideal para on-premise

### Desventajas
- ❌ Requiere mantenimiento
- ❌ Necesitas servidor/VPS
- ❌ Tú manejas escalado

### Paso a Paso

#### 1. Build Imagen

```bash
# Build
docker build -t martin-medical:latest .

# Test local
docker run -p 3000:3000 --env-file .env.production martin-medical:latest
```

#### 2. Deploy con Docker Compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  app:
    image: martin-medical:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: martin_medical
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### 3. Configurar Nginx

```nginx
# nginx.conf
upstream app {
    server app:3000;
}

server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4. Deploy

```bash
# En tu servidor (VPS)
docker-compose -f docker-compose.production.yml up -d

# Verificar
docker-compose ps
```

---

## 🔒 Configuración de SSL/HTTPS

### Con Let's Encrypt (Gratis)

```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación
sudo certbot renew --dry-run
```

---

## 🌍 Configuración de Dominio

### 1. Comprar Dominio

Opciones recomendadas:
- Namecheap ($10-15/año)
- Google Domains ($12/año)
- Cloudflare Registrar ($9/año)

### 2. Configurar DNS

#### Para Vercel:

```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

#### Para Servidor Propio:

```
A     @       TU.IP.DEL.SERVIDOR
CNAME www     tu-dominio.com
```

---

## 📊 Monitoreo y Analytics

### Sentry (Errores)

```bash
# Instalar
npm install @sentry/nextjs

# Configurar
npx @sentry/wizard@latest -i nextjs

# En producción, los errores se reportarán automáticamente
```

### Vercel Analytics

```typescript
// Ya está configurado en next.config.js
// Solo habilitar en Vercel dashboard
```

### Uptime Monitoring

Opciones gratuitas:
- UptimeRobot (https://uptimerobot.com)
- Better Uptime (https://betteruptime.com)
- Pingdom (https://pingdom.com)

---

## 🔐 Seguridad en Producción

### Checklist

- [ ] HTTPS habilitado (SSL)
- [ ] Variables de entorno seguras (no en código)
- [ ] Rate limiting activo
- [ ] CORS configurado correctamente
- [ ] Headers de seguridad (ya en next.config.js)
- [ ] Database backups automáticos
- [ ] Logs centralizados
- [ ] Monitoreo de uptime

### Backups Automáticos

#### PostgreSQL (Supabase)
```bash
# Ya incluido en Supabase
# Backups automáticos diarios
```

#### PostgreSQL (Self-hosted)
```bash
# Cron job para backups diarios
0 2 * * * pg_dump -U postgres martin_medical > /backups/db_$(date +\%Y\%m\%d).sql

# Subir a S3
aws s3 cp /backups/db_$(date +\%Y\%m\%d).sql s3://your-bucket/backups/
```

---

## 💰 Estimación de Costos (Producción)

### Configuración Económica (100-500 usuarios)

```
Vercel (Hobby):           $0
Supabase (Free):          $0
Upstash Redis (Free):     $0
Cloudflare R2:            ~$5
OpenAI API:               ~$50-100
------------------------
Total:                    ~$55-105/mes
```

### Configuración Media (1K-5K usuarios)

```
Vercel (Pro):             $20
Supabase (Pro):           $25
Upstash Redis:            $10
Cloudflare R2:            ~$10
OpenAI API:               ~$200-400
Pinecone:                 $70
------------------------
Total:                    ~$335-535/mes
```

### Configuración Enterprise (10K+ usuarios)

```
AWS/GCP Infrastructure:   $200-500
RDS PostgreSQL:           $100-200
ElastiCache Redis:        $50-100
S3 Storage:               $20-50
OpenAI API:               $1000-2000
Pinecone:                 $70-200
Load Balancer:            $20
CDN (CloudFront):         $50-100
------------------------
Total:                    ~$1510-3170/mes
```

---

## 🚨 Troubleshooting Deployment

### Build Fails

```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

```bash
# Verificar connection string
echo $DATABASE_URL

# Test conexión
npx prisma db pull
```

### API Keys Not Working

```bash
# Verificar que están en Vercel/Railway
vercel env ls

# Asegurarse que están en production
vercel env add OPENAI_API_KEY production
```

### Out of Memory

```bash
# En package.json
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

---

## ✅ Checklist Pre-Deploy

- [ ] `npm run build` completa sin errores
- [ ] Todas las variables de entorno configuradas
- [ ] Base de datos accesible desde el servidor
- [ ] Migraciones de Prisma ejecutadas
- [ ] API keys válidas y con fondos
- [ ] Dominio apuntando correctamente
- [ ] SSL configurado
- [ ] Health check pasa: `/api/health`
- [ ] Logs y monitoreo configurados
- [ ] Backups automáticos activos

---

## 🎉 Post-Deploy

1. **Verificar funcionalidad**:
   - Registrar usuario
   - Chat con IA
   - Upload de examen
   - Búsqueda en vademecum

2. **Configurar monitoreo**:
   - UptimeRobot para uptime
   - Sentry para errores
   - Analytics habilitado

3. **Documentar**:
   - URL de producción
   - Credenciales de admin
   - Procedimientos de backup
   - Contactos de emergencia

---

## 📚 Recursos

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)

---

**¡Tu plataforma MARTIN está lista para el mundo!** 🚀
