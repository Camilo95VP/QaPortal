# HU30633 - Casos manuales (no automatizables)

Resumen de casos por categoría:

| Categoría | Cantidad |
|---|---:|
| Visual / Responsive | 1 |
| Exploratorio | 1 |

Tabla de precondiciones:

| Precondición | Detalle |
|---|---|
| Pantallas y dispositivos | Acceso a dispositivos físicos (móviles, tablets, distintos navegadores) |
| Estado visual | Datos representativos en la lista de usuarios |

### Visual / Responsive

CP-M-001: Verificación responsive y visual en dispositivos reales
Escenario: Validar que la pantalla de gestión de usuarios sea responsiva y accesible

Dado que la pantalla de gestión de usuarios debe adaptarse a distintos tamaños
Cuando se prueba en varios dispositivos físicos (iPhone, Android, tablets, pantallas pequeñas/medianas)
Entonces La disposición, tipografía y elementos interactivos mantienen usabilidad y accesibilidad

Motivo manual: Requiere validación visual en hardware real y validación manual de toques/gestos.

### Exploratorio

CP-M-002: Comportamiento visual del modal de confirmación
Escenario: Revisar estilos, foco, y experiencia visual del modal de eliminación

Dado que el modal debe mostrar el mensaje "Estás seguro que deseas eliminar este usuario"
Cuando se abre el modal en distintos contextos (pantalla llena, en modal superpuesto, con scroll)
Entonces El modal muestra correctamente el mensaje, botones claramente visibles y el foco se maneja adecuadamente

Motivo manual: Jugadas visuales, contraste, y UX subjetiva que no son 100% determinísticas para automatizar.
