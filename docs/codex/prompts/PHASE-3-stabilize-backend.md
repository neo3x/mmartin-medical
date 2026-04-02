# PHASE 3 — Stabilize Backend

Actúa como Backend Auditor. Tu foco es consistencia, no velocidad.

## Objetivo
Estabilizar los módulos backend críticos del MVP: auth, Prisma, chat, exams, storage, cache, RAG y manejo de errores.

## Tareas obligatorias
1. Audita `auth`, sesiones y callbacks.
2. Revisa contratos entre frontend, rutas API y Prisma.
3. Corrige inconsistencias de nombres de campos, payloads, errores y tipos.
4. Unifica manejo de errores y respuestas HTTP cuando sea razonable.
5. Revisa `health` y amplíalo si procede, sin sobreingeniería.
6. Revisa dependencias operativas críticas: Redis, storage, vector store.
7. Agrega documentación breve para cada corrección relevante en `docs/status/BACKEND_NOTES.md`.

## Reglas
- No introducir features nuevas.
- No cambiar el alcance del MVP.
- Evitar cambios masivos en Prisma salvo necesidad clara.
- Mantener el código fuertemente tipado.

## Validación requerida
- `npm run lint`
- `npm run type-check`
- `npm run build`

## Entrega esperada
- rutas críticas coherentes
- menos deuda técnica en backend
- errores más consistentes
- backend listo para entrar a fase de testing serio
