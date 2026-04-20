# HU30628 - Crear Usuarios del Comercio — Casos Manuales

Estos casos cubren aspectos que requieren verificación humana, dispositivos reales o juicios subjetivos.

1) Responsive en dispositivos reales
   - Dispositivos: Desktop (1366x768), Tablet (768x1024), Mobile (360x800).
   - Verificar que campos, botones y modal sean accesibles y no se superpongan.

2) Revisión visual del modal de confirmación
   - Validar colores, contraste, tamaños y orden de botones "Cancelar" y "Guardar".

3) Experiencia de usuario al ingresar aliases
   - Evaluar usabilidad del selector multi-alias y comportamiento al agregar/eliminar.

4) Accesibilidad (a11y)
   - Navegación por teclado (tab order), foco visible y labels para lectores de pantalla.

5) Exploratorio — Comportamientos no determinísticos
   - Pruebas exploratorias con conexiones lentas y caídas intermitentes del backend.

6) Prueba de localización y mensajes
   - Revisar textos en español, tildes, mayúsculas y puntuación exacta.

7) Revisión de logs y auditoría (humano)
   - Verificar que los registros de auditoría contengan los campos correctos y formato legible.
