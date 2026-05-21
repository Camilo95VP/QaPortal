# QA Portal — Agente Diseñador de Casos de Prueba

Aplicación Angular que facilita la generación, edición y exportación de casos de prueba (Gherkin) mediante un agente especializado. Incluye:

- Un diseñador de prompts (Test Designer) para crear entradas estructuradas que el agente usa para generar artefactos.
- Generación automática de `casos_automatizables.md`, `casos_manuales.md` y `automation_v1.spec.ts` (Playwright).
- Generador de plantillas Word (`.docx`) a partir de `casos_manuales.md` con el formato de tabla estándar.

## Requisitos

- Node.js 18+ y npm
- Angular CLI (recomendado globalmente)

## Servidor de desarrollo

Instala dependencias y arranca el servidor de desarrollo:

```bash
npm install
ng serve
```

Abre `http://localhost:4200/` en tu navegador. La aplicación se recargará automáticamente al cambiar archivos fuente.

## Uso: Test Designer

La interfaz `Test Designer` (ver [src/app/test-designer/test-designer.component.ts](src/app/test-designer/test-designer.component.ts#L1) y [src/app/test-designer/test-designer.component.html](src/app/test-designer/test-designer.component.html#L1)) permite crear prompts estructurados con:

- Habilitador o Nombre HU
- Descripción
- Criterios de aceptación
- Contexto / consideraciones clave

Pulsa `⚡ Generar Prompt` para obtener el prompt listo para enviar al agente o copiar al portapapeles.

## Dónde se guardan los artefactos

Los artefactos generados por el agente se colocan en:

`src/assets/repo-files/[NOMBRE_HU]/`

Ficheros esperados por HU:

- `casos_automatizables.md`
- `casos_manuales.md`
- `automation_v1.spec.ts`

## Generar plantilla Word

El servicio que genera el `.docx` está en [src/app/repo-files/plantilla-word.service.ts](src/app/repo-files/plantilla-word.service.ts#L1). Desde la UI o invocando la función `generarPlantillaWord(md, ejecutadoPor, folderName)` se crea y descarga un documento con la tabla estándar por cada caso manual.

Ejemplo rápido (desde consola del navegador o integrar en UI):

```js
// md: contenido del casos_manuales.md
// ejecutadoPor: nombre del ejecutor
// folderName: nombre de la HU
generarPlantillaWord(md, 'Nombre QA', 'HU30628');
```

## Tests y CI

- Tests unitarios: `ng test` (Karma).
- E2E: `ng e2e` (configurar la herramienta de e2e que prefieras; se recomienda Playwright para integrar con `automation_v1.spec.ts`).

## Agente y reglas

El comportamiento del agente y las reglas de priorización se definen en `agents/qa-test-designer.agent.md` — revisa ese archivo para entender el formato de entrada y las restricciones del flujo de generación.

## Contribuir

- Añade nuevas HUs en `src/assets/repo-files/` siguiendo la estructura y el formato Gherkin.
- Para cambios en el generador Word o en el Test Designer, crea PRs pequeñas para revisión.

---

Si necesitas que prepare la versión en PDF o PPTX lista para la reunión, dime y la genero a partir de `docs/presentacion_agente_qa.md`.
