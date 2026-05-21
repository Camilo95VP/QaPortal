---
title: Agente Diseñador de Casos QA
author: Equipo QA
date: 29 de abril de 2026
---

**Agente diseñador de casos de prueba**

- Objetivo: automatizar y estandarizar el diseño de casos en Gherkin y la generación de plantillas.

---

# Problema

- Redacción manual de casos toma tiempo y genera inconsistencias.
- Formatos entregables varían y requieren trabajo de edición antes de enviar al cliente.
- Procesos repetitivos (crear Word con tablas, convertir criterios a Gherkin) consumen recursos valiosos.

---

# Nuestra solución (visión general)

- Un **agente especializado** que, a partir de un prompt estructurado, genera:
  - `casos_automatizables.md` (Gherkin en español: Happy Path / Full Error / Casos Borde)
  - `casos_manuales.md` (casos no automatizables)
  - `automation_v1.spec.ts` (Playwright, 1 test por caso automatizable)
- Interfaz `Test Designer` para crear prompts y copiar/ejecutar el flujo.
- Servicio que convierte `casos_manuales.md` en una plantilla Word con la tabla estándar lista para el cliente.

---

# Funcionalidades clave (técnico)

- Reglas de priorización: automatizables vs manuales (implementadas en el agente).
- Parser robusto para extraer CP-MXX y bloques Dado/Cuando/Entonces.
- Generador `.docx` con `docx` + descarga con `file-saver` (tabla con metadatos y pasos).
- Guardado automático de artefactos en `src/assets/repo-files/[HU]/`.

---

# Flujo de trabajo (rápido)

1. Equipo completa pantalla `Test Designer` (Habilitador/Nombre HU, Descripción, Criterios, Contexto).
2. Pulsar `Generar Prompt` → prompt listo para el agente.
3. Agente crea los `.md` y el `automation_v1.spec.ts` en la carpeta de la HU.
4. Desde UI o script, pulsar `Generar plantilla Word` para descargar el `.docx` con tablas.

---

# Demo (pasos para la reunión)

- Abrir [Test Designer](src/app/test-designer/test-designer.component.html#L1) y llenar ejemplo de HU.
- Mostrar prompt generado (copiar al portapapeles).
- Ejecutar el agente (o simular ejecución) y abrir `src/assets/repo-files/HU/` con los archivos generados.
- Abrir `casos_manuales.md` y ejecutar `generarPlantillaWord(...)` para descargar el Word.

---

# Ejemplo de resultado (visual)

- `casos_automatizables.md` → lista ordenada de CP con Gherkin en español.
- `automation_v1.spec.ts` → tests Playwright listos para integrar en CI.
- `HU123_plantilla_ejecucion.docx` → tabla estándar del cliente por cada CP.

---

# Beneficios cuantificables

- Reducción estimada de tiempo por HU: 40–80% en redacción y formateo.
- Menos re-trabajo: formato entregable cliente-ready desde la primera entrega.
- Mayor cobertura de automatización y trazabilidad entre artefactos.

---

# Riesgos y mitigaciones

- Parser sensible a formatos no estándar → Añadir validaciones y editor con preview.
- Automatizaciones con selectores frágiles → Definir convenciones de selectores y pruebas de mantenimiento.
- Cambios automáticos en repo sin control → Workflow: generar → revisar → aplicar (control de permisos).

---

# Mejoras propuestas (prioridad)

- Otro agente que reciba como contexto `automation_v1.spec.ts` y que cree una base de automatizacion.
- Dashboard de métricas (Baja).

---

# ROI y propuesta piloto

- Objetivo: validar ahorro de tiempo, calidad de artefactos y facilidad de integración.
- Poder mejorar la herramienta y irla adaptando a las necesidades del proyecto.

---

# Anexos técnicos

- Agente y reglas: [agents/qa-test-designer.agent.md](agents/qa-test-designer.agent.md#L1)
- Test Designer (TS): [src/app/test-designer/test-designer.component.ts](src/app/test-designer/test-designer.component.ts#L1)
- Generador Word: [src/app/repo-files/plantilla-word.service.ts](src/app/repo-files/plantilla-word.service.ts#L1)
- Carpeta de artefactos: `src/assets/repo-files/[HU]/` 
