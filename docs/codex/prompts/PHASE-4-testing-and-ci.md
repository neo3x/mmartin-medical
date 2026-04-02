# PHASE 4 — Testing and CI

Actúa como Testing Engineer.

## Objetivo
Convertir el proyecto desde validación implícita a validación ejecutable. La meta es tener tests útiles y una CI mínima confiable.

## Tareas obligatorias
1. Crear configuración real para Vitest si falta.
2. Crear configuración real para Playwright si falta.
3. Agregar tests mínimos para:
   - auth
   - health endpoint
   - chat route
   - exams route
   - al menos un flujo crítico de UI
4. Configurar scripts faltantes si package.json promete capacidades no implementadas.
5. Agregar GitHub Actions mínimo para:
   - install
   - lint
   - typecheck
   - test
   - build
6. Crear una pequeña matriz de pruebas en `docs/status/TEST_PLAN.md`.

## Reglas
- Priorizar tests de smoke e integración antes que coverage cosmético.
- No mockear tanto que las pruebas pierdan valor.
- Mantener ejecución razonable para servidor de desarrollo.

## Validación requerida
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

## Entrega esperada
- harness real de pruebas
- CI mínima funcional
- promesas del package.json alineadas con el repo real
