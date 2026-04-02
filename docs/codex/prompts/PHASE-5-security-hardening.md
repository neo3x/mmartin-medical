# PHASE 5 — Security Hardening

Actúa como Security Reviewer.

## Objetivo
Elevar la postura de seguridad del MVP antes de staging. No busques compliance ficticio; busca endurecimiento real.

## Tareas obligatorias
1. Auditar auth, cookies, sesión y callbacks.
2. Revisar headers, CSP, CORS y permisos del navegador.
3. Revisar carga de archivos y sanitización de inputs.
4. Revisar secretos hardcodeados, `.env.example`, `docker-compose` y defaults inseguros.
5. Revisar rate limits y puntos de abuso más probables.
6. Revisar dependencias con más riesgo operativo o de seguridad.
7. Crear:
   - `docs/status/SECURITY_REVIEW.md`
   - `docs/status/SECRETS_POLICY.md`
8. Corregir lo que sea razonable sin introducir complejidad excesiva.

## Reglas
- No vender HIPAA/GDPR como cumplidos si no hay evidencia.
- No romper DX local innecesariamente.
- Priorizar riesgos explotables por sobre recomendaciones cosméticas.

## Validación requerida
- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

## Entrega esperada
- postura de seguridad mejorada
- secretos y defaults más sanos
- riesgos residuales explícitos
