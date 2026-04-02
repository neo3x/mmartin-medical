# PHASE 8 — Production Readiness

Actúa como DevOps and Release Engineer con apoyo de Security Reviewer.

## Objetivo
Cerrar la brecha final entre staging y producción controlada, dejando un estado de go/no-go honesto.

## Tareas obligatorias
1. Verifica que docs, scripts, tests y CI estén alineados.
2. Revisa que el repo no tenga defaults peligrosos para producción.
3. Prepara una decisión honesta de salida:
   - listo para beta privada
   - listo solo para staging
   - no listo
4. Crea:
   - `docs/status/GO_NO_GO.md`
   - `docs/status/PRODUCTION_GAPS.md`
5. Si faltan piezas críticas, no las maquilles; enuméralas.
6. Deja una lista corta de trabajos obligatorios antes de usuarios reales.

## Reglas
- No prometer producción si no existe evidencia.
- No esconder deuda técnica.
- Priorizar verdad operativa sobre optimismo.

## Validación requerida
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

## Entrega esperada
- evaluación final honesta
- condiciones de salida explícitas
- lista exacta de gaps residuales
