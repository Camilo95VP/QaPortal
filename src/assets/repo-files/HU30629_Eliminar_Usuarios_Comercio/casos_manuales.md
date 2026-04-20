# HU30629 - Eliminar Usuarios del Comercio — Casos Manuales

Estos casos manuales cubren verificación visual, responsive y aspectos humanos no determinísticos.

1) Responsive y verificación visual del modal
   - Dispositivos: Desktop, Tablet, Mobile. Verificar que el modal y el texto "Estás seguro que deseas eliminar este usuario" se muestren correctamente.

2) Usabilidad y flujo de confirmación
   - Evaluar la claridad del mensaje, disposición de botones y posibilidad de arrepentimiento por parte del administrador.

3) Pruebas con sesiones reales
   - Validar que al eliminar un usuario con sesión activa, dicha sesión se termine en tiempo real en diferentes navegadores/dispositivos.

4) Exploratorio sobre implicaciones en reportes
   - Revisar reportes que incluyan al usuario eliminado y comprobar que el histórico permanece en reportes y no desaparece.

5) Accesibilidad (a11y)
   - Lectores de pantalla: confirmar que el modal y los botones están correctamente etiquetados.

6) Seguridad y logs de auditoría (revisión humana)
   - Revisión de que los logs de auditoría contengan todos los campos esperados y no revelen datos sensibles. 
