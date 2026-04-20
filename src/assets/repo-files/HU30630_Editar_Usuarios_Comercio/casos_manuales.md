# HU30630 - Editar Usuarios del Comercio — Casos Manuales

Estos casos manuales cubren aspectos visuales, responsive y exploratorios que no son aptos para automatización confiable.

1) Comprobación responsive (dispositivos reales)
   - Dispositivos: Desktop (1366x768), Tablet (768x1024), Mobile (360x800)
   - Verificar que la pantalla de edición se muestre correctamente y que el modal sea accesible y usable en cada tamaño.

2) Verificación visual del modal y mensajes
   - Revisar el texto exacto del modal de confirmación: "¿Estás seguro que deseas guardar este usuario?"
   - Alineación, color y contraste de botones "Cancelar" y "Guardar".

3) Accesibilidad y teclado
   - Navegación por teclado: tab order, foco en campos, activación del modal con Enter.
   - Screen reader: verificar etiquetas ARIA en campos y botones.

4) Exploratorio — Alias y relaciones
   - Añadir/eliminar alias en diferentes combinaciones y revisar impacto en la UI.
   - Verificar comportamiento al eliminar el último alias (si aplica).

5) Historial y auditoría (revisión humana)
   - Revisar que la interfaz muestre el historial de acciones y que las entradas sean legibles.

6) Localización y traducciones
   - Revisar textos en español, mayúsculas y puntuación.

7) Pruebas de regresión visual
   - Comparar capturas antes/después del cambio de rol para detectar diferencias inesperadas.
