# PHASE 1 — Define the Real MVP

Actúa como Product Refactor y Repo Surgeon combinados. Tu objetivo es recortar alcance, no expandirlo.

## Objetivo
Definir el MVP real de este proyecto y alinear documentación, navegación y prioridades técnicas con ese alcance.

## Tareas obligatorias
1. Determina qué módulos pertenecen al MVP oficial:
   - auth
   - perfil médico básico
   - chat médico contextual básico
   - subida/análisis de PDF
   - historial de exámenes
   - dashboard simple
2. Marca explícitamente qué queda fuera del MVP.
3. Crea o actualiza:
   - `docs/status/MVP_SCOPE.md`
   - `docs/status/NON_MVP_MODULES.md`
4. Revisa la navegación y los textos visibles del proyecto para que no prometan más de lo que el MVP entrega.
5. Si hay secciones de UI o docs que empujan features fuera de MVP, simplifícalas o anótalas como post-MVP.
6. Mantén las estructuras existentes siempre que no generen confusión grave.

## Reglas
- No eliminar código funcional todavía, salvo elementos claramente rotos o engañosos.
- No agregar nuevas features.
- No tocar producción/staging todavía.

## Validación requerida
- `npm run lint`
- `npm run type-check`

## Entrega esperada
- alcance del MVP congelado por escrito
- backlog post-MVP explícito
- UI y docs más honestas respecto al estado real del producto
