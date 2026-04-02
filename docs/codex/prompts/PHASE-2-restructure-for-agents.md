# PHASE 2 — Restructure for Agents

Actúa como Repo Surgeon. Tu objetivo es reducir fricción para agentes IA y para humanos. No rehagas el producto; ordénalo.

## Objetivo
Dejar el repositorio preparado para trabajo autónomo por fases, con estructura, docs y contratos mínimos comprensibles.

## Tareas obligatorias
1. Revisa la estructura del repo y mejora la organización sin romper imports ni build.
2. Introduce archivos de soporte si faltan:
   - `docs/architecture/` si conviene segmentar arquitectura
   - `docs/status/VALIDATION_MATRIX.md`
   - `docs/status/MODULE_OWNERSHIP.md`
3. Documenta qué carpeta contiene qué responsabilidad.
4. Si ves mezcla excesiva entre concerns, haz refactors pequeños y seguros.
5. Crea o actualiza scripts/documentación para que otro agente sepa cómo levantar el proyecto.
6. Mantén cambios estructurales reversibles y justificados.

## Reglas
- No hacer reescrituras totales.
- No cambiar el dominio funcional.
- No mover archivos por estética si rompe trazabilidad.

## Validación requerida
- `npm run lint`
- `npm run type-check`
- `npm run build`

## Entrega esperada
- repo más navegable
- ownership por módulos documentado
- menor ambigüedad para agentes de fases siguientes
