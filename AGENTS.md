# AGENTS.md

## Objetivo
Este repositorio se trabajará con agentes de IA orientados a llevar `neo3x/mmartin-medical` desde su estado actual a un estado cercano a producción. Los agentes no deben expandir el alcance sin autorización explícita. Primero estabilizar, luego endurecer, luego optimizar.

## Principios operativos
1. No inventar features nuevas fuera del MVP definido.
2. No afirmar "production-ready" sin evidencia verificable en código, tests y CI.
3. Cada cambio debe incluir validación ejecutable: lint, typecheck, tests o smoke checks.
4. Todo cambio debe dejar trazabilidad en `docs/status/` o en el PR description.
5. Si un agente detecta inconsistencia documental o técnica, debe corregirla o dejarla registrada.
6. No romper auth, Prisma schema ni rutas críticas sin actualizar tests y documentación.
7. Si una tarea requiere internet para confirmar APIs, librerías o breaking changes, usar fuentes oficiales y reflejar el cambio en comentarios o docs.
8. No pedir confirmación para tareas rutinarias de bajo riesgo. Ejecutar. Pedir intervención humana solo ante cambios destructivos, ambigüedad crítica o decisiones de producto/regulatorias.

## Definición de MVP real
El MVP oficial para este repo incluye únicamente:
- autenticación
- perfil médico básico
- chat médico con contexto básico
- subida y análisis de PDF
- historial de exámenes
- dashboard simple

Quedan fuera del MVP inicial, salvo tarea explícita:
- modo familiar
- educación
- voz continua avanzada
- telemedicina
- reportes complejos
- vademécum multimodal por imagen
- integraciones enterprise

## Agentes y responsabilidades

### 1. Repo Surgeon
Responsable de saneamiento estructural.
**Hace:**
- normalización de ramas, docs, nombres, scripts, carpetas
- eliminación de contradicciones entre README, docs y código
- creación de `docs/status/*`, `CHANGELOG`, backlog técnico inicial
- preparación del repo para trabajo iterativo seguro
**No hace:**
- lógica de negocio nueva compleja
- cambios regulatorios o clínicos sin apoyo del Security Reviewer

### 2. Backend Auditor
Responsable de backend crítico.
**Hace:**
- revisión de auth, sesiones, Prisma, API routes, storage, cache, RAG
- detección de inconsistencias de modelos y payloads
- unificación de errores, validaciones y contratos
**No hace:**
- rediseño visual
- copywriting

### 3. Testing Engineer
Responsable de calidad ejecutable.
**Hace:**
- vitest, playwright, test fixtures, smoke tests, mocks, coverage thresholds
- pruebas sobre auth, chat, exams, dashboard y health
- hardening de scripts de validación local y CI
**No hace:**
- modificar funcionalidad sin justificar el impacto en pruebas

### 4. Security Reviewer
Responsable de seguridad y postura de producción.
**Hace:**
- auth/cookies/session
- headers, CSP, CORS, uploads, secretos, rate limits, logs
- revisión de dependencias y superficie de ataque
- recomendaciones para manejo de datos sensibles
**No hace:**
- inventar claims regulatorios sin soporte real

### 5. Product Refactor
Responsable de UX y alcance.
**Hace:**
- simplificación de journeys
- reducción de alcance al MVP oficial
- mejoras de layout, estados vacíos, errores, mensajes de riesgo
**No hace:**
- introducir features fuera de MVP

### 6. DevOps and Release Engineer
Responsable de operabilidad.
**Hace:**
- CI/CD, Docker, staging, env strategy, health checks, observabilidad, release checklist
- scripts reproducibles para servidor Ubuntu vía SSH
**No hace:**
- introducir servicios que no tengan justificación operacional clara

## Secuencia recomendada de ejecución
1. Repo Surgeon
2. Backend Auditor
3. Testing Engineer
4. Security Reviewer
5. Product Refactor
6. DevOps and Release Engineer
7. repetir ciclo corto con bugs detectados

## Regla de salida por fase
Ninguna fase se considera cerrada si falta al menos uno de estos puntos:
- código consistente
- documentación actualizada
- validación ejecutada
- lista explícita de pendientes

## Formato de reporte obligatorio por agente
Cada agente debe entregar al final:
- Resumen ejecutivo
- Cambios realizados
- Riesgos detectados
- Validaciones ejecutadas
- Pendientes siguientes

## Criterios de detención obligatoria
El agente debe detenerse y pedir revisión humana solo si:
- necesita borrar datos o reescribir historial Git
- requiere rotar o exponer secretos
- hay decisión clínica/regulatoria no resuelta
- encuentra contradicción grave en producto que cambia el alcance
- detecta migración destructiva no reversible
