# PHASE 0 — Freeze and Diagnose

Trabaja sobre este repositorio como un agente senior de saneamiento. Tu objetivo es dejar una línea base seria para desarrollo asistido por IA. No agregues features nuevas.

## Objetivo
Congelar el estado del proyecto, corregir contradicciones evidentes entre código y documentación, y preparar un baseline confiable para las fases posteriores.

## Tareas obligatorias
1. Audita la estructura actual del repo.
2. Identifica contradicciones entre README, docs y estado real del código.
3. Corrige claims inflados como "production-ready" si no tienen respaldo técnico.
4. Crea documentación mínima de estado:
   - `docs/status/PROJECT_STATUS.md`
   - `docs/status/TECH_DEBT.md`
   - `docs/status/KNOWN_RISKS.md`
5. Normaliza la narrativa del proyecto hacia un MVP realista.
6. Si existe referencia a ramas incorrectas o ausencia de `main`, documenta la convención de ramas recomendada.
7. No borres features; solo documenta, ordena y corrige inconsistencias de base.

## Reglas
- No afirmar nada no comprobado.
- No reestructurar masivamente carpetas todavía.
- No tocar lógica clínica ni modelos de negocio.
- No inventar archivos de CI o tests todavía.

## Validación requerida
Ejecuta al final, si es viable:
- `npm run lint`
- `npm run type-check`

## Entrega esperada
- baseline documental claro
- contradicciones resueltas o registradas
- riesgos explícitos
- siguiente fase lista para comenzar
