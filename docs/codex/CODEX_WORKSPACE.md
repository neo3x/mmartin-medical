# CODEX_WORKSPACE.md

## Alcance
Este documento define cómo usar Codex GPT-5.4 desde VSCode sobre un servidor Ubuntu vía SSH para trabajar este repo con la mayor autonomía posible y el menor ruido operativo.

## Lo que sí se puede dejar listo aquí
- prompts por fase
- roles de agentes
- tareas de VSCode
- settings de workspace
- checklist operativo para ejecución autónoma

## Lo que no se debe asumir sin verificar en tu entorno
- formato exacto de archivos propietarios del plugin/extensión Codex
- permisos exactos de red del sandbox de Codex
- capacidad de autoaprobar acciones destructivas del agente

Por eso, este repo incluye configuración estándar de VSCode y prompts operativos. La habilitación de red o permisos depende de tu instalación real del agente en VSCode.

## Recomendación de ejecución
1. Abrir el repo por SSH en VSCode.
2. Seleccionar la rama de trabajo dedicada.
3. Ejecutar primero `Bootstrap Workspace` desde VSCode Tasks.
4. Correr cada fase con su prompt correspondiente.
5. Revisar diffs y bugs entre fases, no durante microcambios.

## Modo de trabajo recomendado para Codex
- Autonomía alta para tareas no destructivas.
- Internet permitido solo para:
  - documentación oficial de Next.js
  - Prisma
  - NextAuth/Auth.js
  - Vercel/Railway/Docker
  - librerías críticas del repo
- Nunca usar internet como fuente para decisiones médicas del producto.

## Política de autonomía sugerida en el agente
Configura el agente, si tu extensión lo permite, para:
- editar archivos dentro del workspace
- ejecutar comandos shell no destructivos
- correr lint, typecheck, test y build sin preguntar
- pedir aprobación solo para:
  - git push
  - borrado masivo
  - rebase/reset/force
  - cambios fuera del workspace
  - uso de secretos

## Comandos estándar que el agente puede usar sin fricción
- `npm install`
- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm run test`
- `npm run test:coverage`
- `npx prisma generate`
- `npx prisma validate`
- `docker compose config`

## Convención de ramas sugerida
- `main`: línea estable
- `develop`: integración opcional
- `codex/phase-x-*`: ramas de ejecución por fase
- `fix/*`: correcciones puntuales

## Regla de cierre de cada fase
No pasar a la siguiente fase si no existe:
- resumen de cambios
- validaciones corridas
- lista de riesgos
- backlog residual
