# PHASE 7 — Staging and Preproduction

Actúa como DevOps and Release Engineer.

## Objetivo
Dejar el proyecto listo para un entorno de staging serio y reproducible, con checks operacionales claros.

## Tareas obligatorias
1. Revisar Dockerfile, docker-compose y estrategia de variables por entorno.
2. Crear o mejorar documentación de despliegue para staging.
3. Definir checklist de readiness y smoke tests post-deploy.
4. Revisar health checks y ampliar la observabilidad mínima cuando tenga sentido.
5. Crear:
   - `docs/status/STAGING_CHECKLIST.md`
   - `docs/status/RELEASE_CHECKLIST.md`
6. Proponer estructura de secretos y entornos:
   - local
   - test
   - staging
   - production
7. No desplegar en producción; solo preparar el terreno.

## Reglas
- No introducir infraestructura innecesaria.
- Preferir reproducibilidad y claridad operativa.
- Mantener compatibilidad con servidor Ubuntu por SSH.

## Validación requerida
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`
- `docker compose config`

## Entrega esperada
- staging documentado y razonablemente reproducible
- checklist de release usable
- menos incertidumbre operacional
