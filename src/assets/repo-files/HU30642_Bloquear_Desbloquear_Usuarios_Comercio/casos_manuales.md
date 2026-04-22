# HU30642 - Gestión de usuarios - Bloquear o Desbloquear Usuarios del Comercio - Portal Kuara
## Casos de Prueba Manuales

## Resumen de Casos por Categoría

| Categoría           | Cantidad |
|---------------------|----------|
| Visual / Responsive | 4        |
| **Total**           | **4**    |

## Tabla de Precondiciones

| # | Precondición |
|---|-------------|
| 1 | Acceso a dispositivos físicos reales (smartphone, tablet, desktop) para pruebas responsive |
| 2 | El usuario autenticado debe tener rol de administrador del comercio |
| 3 | Debe existir al menos un usuario registrado en el comercio en diferentes estados |

---

## Visual / Responsive

### CP-M01: PRUEBA

**Escenario:** Validar que la pantalla de gestión de usuarios se adapta correctamente en dispositivos físicos de diferentes tamaños

Dado que el evaluador tiene acceso a dispositivos físicos reales como smartphone y tablet
Y el usuario administrador está autenticado en el Portal Kuara
Cuando accede a la pantalla de gestión de usuarios en cada dispositivo
Entonces los elementos de la pantalla se visualizan correctamente sin desbordamientos ni superposición de contenido
Y el botón de estado es accesible y operable desde pantallas de tamaño reducido

---

### CP-M02: Verificar apariencia visual del botón de estado en diferentes estados

**Escenario:** Validar que el botón de bloqueo y desbloqueo presenta un diseño visual claro que diferencia el estado activo del bloqueado

Dado que el evaluador se encuentra en la pantalla de gestión de usuarios
Cuando revisa visualmente el botón de estado de diferentes usuarios con estado activo y bloqueado
Entonces el botón refleja de forma visual diferenciada e intuitiva cada estado
Y los colores, íconos o etiquetas utilizados son coherentes con el diseño del sistema

---

### CP-M03: Verificar indicador visual de estado bloqueado en la lista de usuarios

**Escenario:** Validar que la lista de usuarios muestra claramente cuáles usuarios están bloqueados y cuáles activos

Dado que el evaluador se encuentra en la pantalla de gestión de usuarios
Y existen usuarios en estado activo y usuarios en estado bloqueado
Cuando revisa la lista de usuarios
Entonces se distingue visualmente de forma clara el estado de cada usuario entre bloqueado y activo
Y la diferenciación visual es comprensible sin necesidad de instrucciones adicionales para el administrador

---

### CP-M04: Exploración de usabilidad en flujo completo de bloqueo y desbloqueo

**Escenario:** Explorar el flujo completo de bloqueo y desbloqueo de usuarios evaluando la experiencia de usuario

Dado que el evaluador actúa como administrador del comercio en el Portal Kuara
Cuando realiza el flujo completo de bloqueo y posterior desbloqueo de un usuario
Then la experiencia resulta intuitiva y sin ambigüedades en los controles utilizados
Y los mensajes de confirmación o advertencia son comprensibles y adecuados para un sistema del ámbito bancario
