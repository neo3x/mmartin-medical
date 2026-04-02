# RUN_ORDER.md

## Orden de ejecución recomendado
1. `PHASE-0-freeze-and-diagnose.md`
2. `PHASE-1-define-real-mvp.md`
3. `PHASE-2-restructure-for-agents.md`
4. `PHASE-3-stabilize-backend.md`
5. `PHASE-4-testing-and-ci.md`
6. `PHASE-5-security-hardening.md`
7. `PHASE-6-product-and-ux.md`
8. `PHASE-7-staging-and-preprod.md`
9. `PHASE-8-production-readiness.md`

## Handoff obligatorio entre fases
Antes de pasar a la siguiente fase, revisar:
- resumen del agente
- diff de archivos
- resultado de validaciones
- nuevos riesgos registrados en `docs/status/`
- si la fase dejó bloqueadores

## Comandos de validación sugeridos por fase
- Fase 0: `Phase 0 Validate`
- Fase 1: `Phase 1 Validate`
- Fase 2: `Phase 2 Validate`
- Fase 3: `Phase 3 Validate`
- Fase 4: `Phase 4 Validate`
- Fase 5: `Phase 5 Validate`
- Fase 6: `Phase 6 Validate`
- Fase 7: `Phase 7 Validate`
- Fase 8: `Phase 8 Validate`

## Regla de oro
No continuar por inercia. Si una fase rompe build, tipado, tests o genera deuda nueva sin registrar, se corrige antes de seguir.

## Modo práctico con Codex en VSCode
- abrir el prompt de fase
- pegarlo completo en el agente
- dejarlo trabajar sobre la rama actual
- revisar diff al final
- correr task de validación correspondiente
- recién ahí lanzar la siguiente fase
