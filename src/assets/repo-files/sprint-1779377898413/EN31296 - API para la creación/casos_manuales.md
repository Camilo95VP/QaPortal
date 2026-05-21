### Resumen de casos
| Categoría | Cantidad |
|---|---:|
| Manual / Exploratorio | 2 |

### Precondiciones
- Acceso a la UI de administración del comercio.
- Dispositivos reales para pruebas responsive si aplica.

---

CP-M01: Verificación visual del formulario de alias
Escenario: Comprobación visual y de usabilidad del formulario

Dado que el usuario abre la pantalla de creación/edición de alias
Cuando inspecciona los campos, ayudas y validaciones visuales
Entonces la UI debe mostrar mensajes de ayuda y estado de error coherentes

CP-M02: Pruebas exploratorias de flujo multi-sistema
Escenario: Coordinación entre front, API builder y repositorio externo

Dado que el flujo implica sistemas externos no controlados
Cuando se ejecutan pruebas manuales investigando fallos intermitentes
Entonces se documentan pasos y artefactos para reproducir el fallo

<!-- TRAZA: CA-12=CP-M02 | CA-10=CP-M02 | CA-08=CP-M01 -->
